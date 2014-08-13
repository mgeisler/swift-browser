'use strict';


// Declare app level module which depends on filters, and services
angular.module('swiftBrowser', [
  'ngRoute',
  'swiftBrowser.filters',
  'swiftBrowser.services',
  'swiftBrowser.directives',
  'swiftBrowser.controllers'
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
    $routeProvider.when('/:container/:object*', {
        templateUrl: 'partials/object.html',
        controller: 'ObjectCtrl'
    });
    $routeProvider.otherwise({redirectTo: '/'});
}]);
