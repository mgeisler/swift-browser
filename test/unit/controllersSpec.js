'use strict';

/* jasmine specs for controllers go here */

describe('RootCtrl', function(){
    beforeEach(module('swiftBrowser.controllers'));

    it('should list containers', inject(function($controller, $httpBackend) {
        var containers = [
            {"count": 10, "bytes": 1234, "name": "foo"},
            {"count": 20, "bytes": 2345, "name": "bar"},
        ];
        var scope = {};
        $httpBackend.whenGET('/v1/AUTH_abc?format=json')
            .respond(200, containers);

        $controller('RootCtrl', {$scope: scope});
        expect(scope.containers).toEqual([]);
        $httpBackend.flush();
        expect(scope.containers).toEqual(containers);
    }));

    it('should set sort order', inject(function($controller) {
        var scope = {};
        $controller('RootCtrl', {$scope: scope});
        expect(scope.orderProp).toEqual('name');
    }));

});
