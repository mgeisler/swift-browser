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
        SwiftMock.commit();
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
        SwiftMock.commit();
        browser.get('index.html#/foo/bar/');
        expect($('td:nth-child(2)').getText()).toEqual('b.txt');
    });
});
