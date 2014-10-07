'use strict';


// Declare app level module which depends on filters, and services
angular.module('swiftBrowser', [
  'ui.router',
  'swiftBrowser.filters',
  'swiftBrowser.services',
  'swiftBrowser.directives',
  'swiftBrowser.controllers',
  'swiftBrowser.auth'
]).
config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('root', {
        url: '/',
        templateUrl: 'partials/root.html',
        controller: 'RootCtrl'
    });
    $stateProvider.state('container', {
        url: '/{container}/',
        templateUrl: 'partials/container.html',
        controller: 'ContainerCtrl'
    });
    $stateProvider.state('directory', {
        url: '/{container}/{path:.*/}',
        templateUrl: 'partials/container.html',
        controller: 'ContainerCtrl'
    });
    $stateProvider.state('object', {
        url: '/{container}/{name:.*}',
        controller: 'ObjectCtrl'
    });
    $urlRouterProvider.otherwise('/');
}])
.factory('sessionRecoverer', ['$injector', function($injector) {
    return {
        responseError: function(response) {
            if (response.status == 401) {
                var $auth = $injector.get('$auth');
                return $auth.requestAuth(response.config);
            }
            throw response;
        }
    };
}])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('sessionRecoverer');
}]);
