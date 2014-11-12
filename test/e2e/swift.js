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

describe('listContainers', function () {
    var callListContainers = callSwiftMethod('listContainers');
    var callUploadObject = callSwiftMethod('uploadObject');

    it('should correctly update byte count after putObject', function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 1000,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/');

        callUploadObject('foo', 'a.txt', 'new length', {});
        var containers = callListContainers().then(select('data'));
        var container = containers.then(select(0));
        var bytes = container.then(select('bytes'));
        expect(bytes).toEqual(10);
    });
});

describe('createContainer', function () {
    var callCreateContainer = callSwiftMethod('createContainer');

    it('should return 201 for a new container', function () {
        browser.get('index.html#/');
        var result = callCreateContainer('foo');
        expect(result.then(select('status'))).toBe(201);
    });

    it('should return 202 for an existing container', function () {
        SwiftMock.addContainer('foo');
        browser.get('index.html#/');
        var result = callCreateContainer('foo');
        expect(result.then(select('status'))).toBe(202);
    });
});

describe('deleteContainer', function () {
    beforeEach(function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/');
    });
    var callDeleteContainer = callSwiftMethod('deleteContainer');

    it('should return 204 for an existing container', function () {
        browser.get('index.html#/');
        var data = callDeleteContainer('foo');
        expect(data.then(select('status'))).toEqual(204);
    });

    it('should return 404 for a non-existing container', function () {
        browser.get('index.html#/');
        var data = callDeleteContainer('no-such-container');
        expect(data.then(select('status'))).toEqual(404);
    });
});

describe('listObjects', function () {
    var callListObjects = callSwiftMethod('listObjects');

    it('should return 200 for an existing container', function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });


        browser.get('index.html#/');
        var data = callListObjects('foo').then(function (result) {
            return [result.status, result.data];
        });
        expect(data).toEqual([200, [{
            hash: "401b30e3b8b5d629635a5c613cdb7919",
            'last_modified': "2014-08-16T13:33:21.000Z",
            bytes: 20,
            name: "a.txt",
            'content_type': "text/plain"
        }]]);
    });

    it('should return 404 for a non-existing container', function () {
        browser.get('index.html#/');
        var result = callListObjects('no-such-container');
        expect(result.then(select('status'))).toBe(404);
    });
});

describe('deleteObject', function () {
    var callDeleteObject = callSwiftMethod('deleteObject');

    it('should return 204 for an existing object', function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/');
        var status = callDeleteObject('foo', 'a.txt').then(select('status'));
        expect(status).toEqual(204);
    });

    it('should return 404 for a non-existing object', function () {
        SwiftMock.setObjects('foo', {});
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
    it('should return an array with deletion results', function () {
        SwiftMock.setObjects('foo', {
            'bar/a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }},
            'bar/b.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
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
    beforeEach(function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
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

describe('getObject', function () {
    beforeEach(function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {
                headers: {
                    'ETag': 'e59ff97941044f85df5297e1c302d260',
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 12,
                    'Content-Type': 'text/plain'
                },
                content: 'Hello World\n'
            }
        });
        browser.get('index.html#/');
    });
    var callGetObject = callSwiftMethod('getObject');

    it('should return 200 for an existing object', function () {
        var status = callGetObject('foo', 'a.txt').then(select('status'));
        expect(status).toEqual(200);
    });

    it('should return 404 for a non-existing object', function () {
        var status = callGetObject('foo', 'b.txt').then(select('status'));
        expect(status).toEqual(404);
    });

    it('should return object content', function () {
        var data = callGetObject('foo', 'a.txt').then(select('data'));
        expect(data).toEqual('Hello World\n');
    });

    it('should return object metadata as headers', function () {
        var headers = callGetObject('foo', 'a.txt').then(select('headers'));
        expect(headers).toEqual({
            'content-type': 'text/plain',
            'etag': 'e59ff97941044f85df5297e1c302d260',
            'last-modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
            'content-length': '12'
        });
    });
});

describe('postObject', function () {
    beforeEach(function () {
        SwiftMock.setObjects('foo', {
            'a.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
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

    it('should keep Content-Type header unchanged', function () {
        callPostObject('foo', 'a.txt', {'content-encoding': 'gzip'});
        var headers = callHeadObject('foo', 'a.txt').then(select('headers'));
        expect(headers.then(select('content-type'))).toEqual('text/plain');
    });
});

describe('copyObject', function () {
    beforeEach(function () {
        SwiftMock.setObjects('src', {
            'foo': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment',
                'Content-Encoding': 'gzip',
                'X-Object-Meta-Key': 'custom metadata'
            }}
        });
        SwiftMock.addContainer('dst');
        browser.get('index.html#/');
    });
    var callCopyObject = callSwiftMethod('copyObject');
    var callHeadObject = callSwiftMethod('headObject');
    var callListObjects = callSwiftMethod('listObjects');

    it('should return 201 for an existing source object', function () {
        var result = callCopyObject('src', 'foo', 'dst', 'bar');
        expect(result.then(select('status'))).toEqual(201);
    });

    it('should return 404 for a non-existing source object', function () {
        var result = callCopyObject('src', 'no-such-object', 'dst', 'bar');
        expect(result.then(select('status'))).toEqual(404);
    });

    it('should return 404 for a non-existing source container', function () {
        var result = callCopyObject('no-such-container', 'foo', 'dst', 'bar');
        expect(result.then(select('status'))).toEqual(404);
    });

    it('should return 404 for a non-existing destination', function () {
        var result = callCopyObject('src', 'foo', 'no-such-container', 'bar');
        expect(result.then(select('status'))).toEqual(404);
    });

    it('should insert object in container', function () {
        callCopyObject('src', 'foo', 'dst', 'bar');
        var result = callListObjects('dst');
        expect(result.then(select('data'))).toEqual([{
            'last_modified': '2014-08-16T13:33:21.000Z',
            bytes: 20,
            hash: '401b30e3b8b5d629635a5c613cdb7919',
            name: 'bar',
            'content_type': 'image/png'
        }]);
    });

    it('should preserve custom metadata', function () {
        callCopyObject('src', 'foo', 'dst', 'bar');
        var headers = callHeadObject('dst', 'bar').then(select('headers'));
        var metadata = headers.then(select('x-object-meta-key'));
        expect(metadata).toEqual('custom metadata');
    });

    it('should keep Content-Type header unchanged', function () {
        callCopyObject('src', 'foo', 'dst', 'bar');
        var headers = callHeadObject('dst', 'bar').then(select('headers'));
        expect(headers.then(select('content-type'))).toEqual('image/png');
    });

    it('should remove Content-Disposition and Content-Encoding', function () {
        callCopyObject('src', 'foo', 'dst', 'bar');
        var headers = callHeadObject('dst', 'bar').then(select('headers'));
        expect(headers.then(select('content-disposition'))).toBeUndefined();
        expect(headers.then(select('content-encoding'))).toBeUndefined();
    });
});
