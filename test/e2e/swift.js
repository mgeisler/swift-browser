'use strict';

var SwiftMock = require('../swift-mock.js');

function callSwiftMethod(method) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        // Object hashes passed as arguments to executeAsyncScript are
        // unserialized correctly in the browser. This results in
        //
        //   Permission denied to access property '$$hashKey'
        //
        // being thrown by angular.setHashKey if angular.extend or
        // angular.copy is called on an object passed here. Converting
        // to and from JSON helps.
        args = JSON.stringify(args);
        function script(method, args, callback) {
            args = JSON.parse(args);
            function handler(result) {
                callback({status: result.status,
                          headers: result.headers(),
                          data: result.data});
            }
            var $swift = window.getFromInjector('$swift');
            var req = $swift[method].apply($swift, args);
            req.then(handler, handler);
        }
        return browser.driver.executeAsyncScript(script, method, args);
    };
}

function select(prop) {
    return function (result) {
        return result[prop];
    };
}

describe('Test isolation', function() {
    beforeEach(function () {
        SwiftMock.loadAngularMocks();
    });

    it('should show foo container', function () {
        SwiftMock.addContainer('foo');
        browser.get('index.html#/');
        expect($('td:nth-child(2)').getText()).toEqual('foo');
    });

    it('should show no containers', function () {
        browser.get('index.html#/');
        expect($('td:nth-child(2)').isPresent()).toEqual(false);
    });
});

describe('listObjects', function () {
    beforeEach(SwiftMock.loadAngularMocks);
    var callListObjects = callSwiftMethod('listObjects');

    it('should return 200 for an existing container', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
        var data = callListObjects('foo').then(function (result) {
            return [result.status, result.data];
        });
        expect(data).toEqual([200, objects]);
    });

    it('should return 404 for a non-existing container', function () {
        browser.get('index.html#/');
        var result = callListObjects('no-such-container');
        expect(result.then(select('status'))).toBe(404);
    });
});

describe('deleteObject', function () {
    beforeEach(SwiftMock.loadAngularMocks);
    var callDeleteObject = callSwiftMethod('deleteObject');

    it('should return 204 for an existing object', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
        var status = callDeleteObject('foo', 'a.txt').then(select('status'));
        expect(status).toEqual(204);
    });

    it('should return 404 for a non-existing object', function () {
        SwiftMock.setObjects('foo', []);
        browser.get('index.html#/');
        var data = callDeleteObject('foo', 'no-such-object');
        expect(data.then(select('status'))).toEqual(404);
    });

    it('should return 404 for a non-existing container', function () {
        browser.get('index.html#/');
        var data = callDeleteObject('no-such-container', 'a.txt');
        expect(data.then(select('status'))).toEqual(404);
    });
});

describe('deleteDirectory', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    it('should return an array with deletion results', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "bar/a.txt",
                        'content_type': "text/plain"},
                       {hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "bar/b.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
        var data = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.deleteDirectory('foo', 'bar/');
            req.then(function (results) {
                var statuses = results.map(function (result) {
                    return result.status;
                });
                callback(statuses);
            });
        });
        expect(data).toEqual([204, 204]);
    });
});

describe('headObject', function () {
    beforeEach(SwiftMock.loadAngularMocks);
    beforeEach(function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
    });
    var callHeadObject = callSwiftMethod('headObject');

    it('should return 200 for an existing object', function () {
        var status = callHeadObject('foo', 'a.txt').then(select('status'));
        expect(status).toEqual(200);
    });

    it('should return 404 for a non-existing object', function () {
        var status = callHeadObject('foo', 'b.txt').then(select('status'));
        expect(status).toEqual(404);
    });

    it('should return object metadata as headers', function () {
        var headers = callHeadObject('foo', 'a.txt').then(select('headers'));
        expect(headers).toEqual({
            'content-type': 'text/plain',
            'etag': '401b30e3b8b5d629635a5c613cdb7919',
            'last-modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
            'content-length': '20'
        });
    });
});

describe('postObject', function () {
    beforeEach(SwiftMock.loadAngularMocks);
    beforeEach(function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.000Z",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
    });
    var callPostObject = callSwiftMethod('postObject');
    var callHeadObject = callSwiftMethod('headObject');

    it('should return 202 for an existing object', function () {
        var status = callPostObject('foo', 'a.txt', {}).then(select('status'));
        expect(status).toEqual(202);
    });

    it('should return 404 for a non-existing object', function () {
        var status = callPostObject('foo', 'b.txt', {}).then(select('status'));
        expect(status).toEqual(404);
    });

    it('should return 404 for a non-existing container', function () {
        browser.get('index.html#/');
        var data = callPostObject('no-such-container', 'a.txt', {});
        expect(data.then(select('status'))).toEqual(404);
    });

    it('should update headers case-insensitively', function () {
        callPostObject('foo', 'a.txt', {'content-TYPE': 'foo/bar'});
        var headers = callHeadObject('foo', 'a.txt').then(select('headers'));
        expect(headers.then(select('content-type'))).toEqual('foo/bar');
    });
});
