'use strict';

/* jasmine specs for controllers go here */

describe('RootCtrl', function(){
    var scope;

    beforeEach(module('swiftBrowser.controllers'));

    beforeEach(inject(function($controller) {
        scope = {};
        $controller('RootCtrl', {$scope: scope});
    }));

    it('should list containers', inject(function($httpBackend) {
        var containers = [
            {"count": 10, "bytes": 1234, "name": "foo"},
            {"count": 20, "bytes": 2345, "name": "bar"},
        ];
        $httpBackend.whenGET('/v1/AUTH_abc?format=json')
            .respond(200, containers);

        expect(scope.containers).toEqual([]);
        $httpBackend.flush();
        expect(scope.containers).toEqual(containers);
    }));

    it('should set sort order', function() {
        expect(scope.orderProp).toEqual('name');
    });

});
