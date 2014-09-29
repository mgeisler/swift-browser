'use strict';

var SwiftMock = require('../swift-mock.js');

describe('Test isolation', function() {
    beforeEach(function () {
        SwiftMock.loadAngularMocks();
        SwiftMock.setContainers([
            {name: "foo", count: 1, bytes: 20}
        ]);
    });

    it('should just a.txt', function () {
	SwiftMock.setObjects('foo', [
            {hash: "401b30e3b8b5d629635a5c613cdb7919",
             'last_modified': "2014-08-16T13:33:21.848400",
             bytes: 20,
             name: "bar/a.txt",
             'content_type': "text/plain"}
	]);
        browser.get('index.html#/foo/bar/');
        expect($('td:nth-child(2)').getText()).toEqual('a.txt');
    });

    it('should should just b.txt', function () {
	SwiftMock.setObjects('foo', [
            {hash: "401b30e3b8b5d629635a5c613cdb7919",
             'last_modified': "2014-08-16T13:33:21.848400",
             bytes: 20,
             name: "bar/b.txt",
             'content_type': "text/plain"}
	]);
        browser.get('index.html#/foo/bar/');
        expect($('td:nth-child(2)').getText()).toEqual('b.txt');
    });
});

describe('listObjects', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    it('should return 200 for an existing container', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.848400",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setContainers([{name: "foo", count: 1, bytes: 20}]);
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
        var data = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.listObjects('foo');
            req.then(function (result) {
                callback([result.status, result.data]);
            });
        });
        expect(data).toEqual([200, objects]);
    });

    it('should return 404 for a non-existing container', function () {
        SwiftMock.setContainers([]);
        browser.get('index.html#/');
        var status = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.listObjects('no-such-container');
            req.then(null, function (result) {
                callback(result.status);
            });
        });
        expect(status).toBe(404);
    });
});

describe('deleteObject', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    it('should return 204 for an existing object', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.848400",
                        bytes: 20,
                        name: "a.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setContainers([{name: "foo", count: 1, bytes: 20}]);
        SwiftMock.setObjects('foo', objects);
        browser.get('index.html#/');
        var data = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.deleteObject('foo', 'a.txt');
            req.then(function (result) {
                callback(result.status);
            });
        });
        expect(data).toEqual(204);
    });

    it('should return 404 for a non-existing object', function () {
        SwiftMock.setContainers([{name: "foo", count: 1, bytes: 20}]);
        SwiftMock.setObjects('foo', []);
        browser.get('index.html#/');
        var data = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.deleteObject('foo', 'no-such-object');
            req.then(null, function (result) {
                callback(result.status);
            });
        });
        expect(data).toEqual(404);
    });

    it('should return 404 for a non-existing container', function () {
        SwiftMock.setContainers([]);
        browser.get('index.html#/');
        var data = browser.driver.executeAsyncScript(function (callback) {
            var $swift = window.getFromInjector('$swift');
            var req = $swift.deleteObject('no-such-container', 'a.txt');
            req.then(null, function (result) {
                callback(result.status);
            });
        });
        expect(data).toEqual(404);
    });
});

describe('deleteDirectory', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    it('should return an array with deletion results', function () {
        var objects = [{hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.848400",
                        bytes: 20,
                        name: "bar/a.txt",
                        'content_type': "text/plain"},
                       {hash: "401b30e3b8b5d629635a5c613cdb7919",
                        'last_modified': "2014-08-16T13:33:21.848400",
                        bytes: 20,
                        name: "bar/b.txt",
                        'content_type': "text/plain"}];
        SwiftMock.setContainers([{name: "foo", count: 1, bytes: 20}]);
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
