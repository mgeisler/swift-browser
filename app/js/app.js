'use strict';


// Declare app level module which depends on filters, and services
angular.module('swiftBrowser', [
  'ngRoute',
  'swiftBrowser.filters',
  'swiftBrowser.services',
  'swiftBrowser.directives',
  'swiftBrowser.controllers',
  'swiftBrowser.auth'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/root.html',
        controller: 'RootCtrl'
    });
    $routeProvider.when('/:container/', {
        templateUrl: 'partials/container.html',
        controller: 'ContainerCtrl'
    });
    $routeProvider.when('/:container/:path*', {
        templateUrl: 'partials/container.html',
        controller: 'ContainerCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/'});
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
