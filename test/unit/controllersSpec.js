'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
    beforeEach(module('swiftBrowser.controllers'));

    it('should ....', inject(function($controller) {
        var scope = {};
        var routeParams = {container: 'foo',
                           object: 'bar'};
        var objectCtrl = $controller('ObjectCtrl',
                                     {$scope: scope,
                                      $http: null,
                                      $routeParams: routeParams});
        expect(scope.container).toEqual('foo');
        expect(scope.object).toEqual('bar');
    }));
});
