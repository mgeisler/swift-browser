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
}]);
