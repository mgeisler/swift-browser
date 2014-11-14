'use strict';

/* jasmine specs for controllers go here */

describe('RootCtrl', function (){
    beforeEach(module('swiftBrowser.controllers'));

    beforeEach(inject(function ($controller) {
        this.scope = {};
        $controller('RootCtrl', {$scope: this.scope});
    }));

    it('should list containers', inject(function ($httpBackend) {
        var containers = [
            {count: 10, bytes: 1234, name: 'foo'},
            {count: 20, bytes: 2345, name: 'bar'},
        ];
        $httpBackend.whenGET('/v1/AUTH_abc')
            .respond(200, containers);

        expect(this.scope.containers).toEqual([]);
        $httpBackend.flush();
        expect(this.scope.containers).toEqual(containers);
    }));

    it('should set sort order', function () {
        expect(this.scope.orderProp).toEqual('name');
    });
});


describe('ContainerCtrl', function (){
    beforeEach(module('swiftBrowser.controllers'));

    function setupCtrl(params) {
        inject(function ($controller) {
            this.scope = {};
            $controller('ContainerCtrl',
                        {$scope: this.scope, $stateParams: params});
        });
    }

    it('should set sort order', function () {
        setupCtrl({container: 'cont'});
        expect(this.scope.orderProp).toEqual('name');
    });

    it('should set container', function () {
        setupCtrl({container: 'cont'});
        expect(this.scope.container).toEqual('cont');
    });

    it('should create breadcrumbs', function () {
        setupCtrl({container: 'cont',
                   prefix: 'foo/bar/'});
        expect(this.scope.breadcrumbs).toEqual([
            {name: '', title: 'Root'},
            {name: 'cont/', title: 'cont'},
            {name: 'cont/foo/', title: 'foo'},
            {name: 'cont/foo/bar/', title: 'bar'},
        ]);
    });

    it('should query container', inject(function ($httpBackend) {
        setupCtrl({container: 'cont',
                   prefix: 'foo/'});

        var reply = [
            {hash: '401b30e3b8b5d629635a5c613cdb7919',
             'last_modified': '2014-08-16T13:33:21.848400',
             bytes: 10,
             name: 'foo/x.txt',
             'content_type': 'text/plain'},
            {subdir: 'foo/bar/'},
        ];

        var items = [
            {hash: '401b30e3b8b5d629635a5c613cdb7919',
             'last_modified': '2014-08-16T13:33:21.848400',
             bytes: 10,
             name: 'foo/x.txt',
             title: 'x.txt',
             'content_type': 'text/plain'},
            {name: 'foo/bar/',
             title: 'bar/',
             bytes: '\u2014',
             subdir: true},
        ];

        var url = '/v1/AUTH_abc/cont?delimiter=%2F&prefix=foo%2F';
        $httpBackend.whenGET(url).respond(200, reply);

        expect(this.scope.items).toEqual([]);
        $httpBackend.flush();
        expect(this.scope.items).toEqual(items);
    }));
});

describe('ObjectCtrl', function () {
    beforeEach(module('swiftBrowser.controllers'));

    beforeEach(inject(function ($controller, $httpBackend) {
        this.scope = {};
        var stateParams = {container: 'cont',
                           name: 'foo/bar.txt'};
        var listUrl = '/v1/AUTH_abc/cont?delimiter=%2F&prefix=foo%2Fbar.txt';
        var objUrl = '/v1/AUTH_abc/cont/foo/bar.txt';
        $httpBackend.expectGET(listUrl).respond(200, [{
            hash: 'b1946ac92492d2347c6235b4d2611184',
            'last_modified': '2014-10-07T13:19:45',
            bytes: 10,
            name: 'foo/bar.txt',
            'content_type': 'text/plain'
        }]);
        $httpBackend.expect('HEAD', objUrl).respond(202, null, {
            'Accept-Ranges': 'bytes',
            'Content-Length': '10',
            'Content-Type': 'text/plain',
            'Date': 'Tue, 07 Oct 2014 13:53:24 GMT',
            'Etag': 'b1946ac92492d2347c6235b4d2611184',
            'Last-Modified': 'Tue, 07 Oct 2014 13:19:45 GMT',
            'X-Object-Meta-Mtime': '1412687972.660354',
            'X-Timestamp': '1412687984.94758',
            'X-Trans-Id': 'tx6365caee4e924460b526f-005433f054'
        });

        $controller('ObjectCtrl', {$scope: this.scope,
                                   $stateParams: stateParams});
        $httpBackend.flush();
    }));

    it('should set container', function () {
        expect(this.scope.container).toEqual('cont');
    });

    it('should set name', function () {
        expect(this.scope.name).toEqual('foo/bar.txt');
    });

    it('should set system headers', function () {
        expect(this.scope.headers.sys).toEqual([
            {name: 'content-length', value: '10'},
            {name: 'content-type', value: 'text/plain', editable: true},
            {name: 'etag', value: 'b1946ac92492d2347c6235b4d2611184'},
            {name: 'last-modified', value: 'Tue, 07 Oct 2014 13:19:45 GMT'}
        ]);
    });

    it('should set custom headers', function () {
        expect(this.scope.headers.meta).toEqual([
            {name: 'x-object-meta-mtime', value: '1412687972.660354'}
        ]);
    });
});
