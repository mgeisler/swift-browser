'use strict';

/* jasmine specs for controllers go here */

describe('RootCtrl', function(){
    beforeEach(module('swiftBrowser.controllers'));

    beforeEach(inject(function($controller) {
        this.scope = {};
        $controller('RootCtrl', {$scope: this.scope});
    }));

    it('should list containers', inject(function($httpBackend) {
        var containers = [
            {"count": 10, "bytes": 1234, "name": "foo"},
            {"count": 20, "bytes": 2345, "name": "bar"},
        ];
        $httpBackend.whenGET('/v1/AUTH_abc?format=json')
            .respond(200, containers);

        expect(this.scope.containers).toEqual([]);
        $httpBackend.flush();
        expect(this.scope.containers).toEqual(containers);
    }));

    it('should set sort order', function() {
        expect(this.scope.orderProp).toEqual('name');
    });

});


describe('ContainerCtrl', function(){
    beforeEach(module('swiftBrowser.controllers'));

    function setupCtrl(params) {
        inject(function($controller) {
            this.scope = {};
            $controller('ContainerCtrl',
                        {$scope: this.scope, $routeParams: params});
        });
    }

    it('should set sort order', function() {
        setupCtrl({container: 'cont'});
        expect(this.scope.orderProp).toEqual('name');
    });

    it('should set container', function() {
        setupCtrl({container: 'cont'});
        expect(this.scope.container).toEqual('cont');
    });

    it('should create breadcrumbs', function() {
        setupCtrl({container: 'cont',
                   path: 'foo/bar/'});
        expect(this.scope.breadcrumbs).toEqual([
            {name: '', title: 'Root'},
            {name: 'cont/', title: 'cont'},
            {name: 'cont/foo/', title: 'foo'},
            {name: 'cont/foo/bar/', title: 'bar'},
        ]);
    });

    it('should query container', inject(function($httpBackend) {
        setupCtrl({container: 'cont',
                   path: 'foo/'});

        var reply = [
            {hash: "401b30e3b8b5d629635a5c613cdb7919",
             'last_modified': "2014-08-16T13:33:21.848400",
             bytes: 10,
             name: "foo/x.txt",
             'content_type': "text/plain"},
            {subdir: "foo/bar/"},
        ];

        var items = [
            {hash: "401b30e3b8b5d629635a5c613cdb7919",
             'last_modified': "2014-08-16T13:33:21.848400",
             bytes: 10,
             name: "foo/x.txt",
             title: "x.txt",
             'content_type': "text/plain"},
            {name: "foo/bar/",
             title: "bar/",
             bytes: "\u2014"},
        ];

        var url = '/v1/AUTH_abc/cont?prefix=foo%2F&delimiter=%2F&format=json';
        $httpBackend.whenGET(url).respond(200, reply);

        expect(this.scope.items).toBeUndefined();
        $httpBackend.flush();
        expect(this.scope.items).toEqual(items);
    }));


});
