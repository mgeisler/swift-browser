'use strict';

/* Directives */

angular.module('swiftBrowser.directives', ['swiftBrowser.auth']).
    directive('sbVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }]).
    directive('sbFormatBytes', ['bytesFilter', function(bytesFilter) {
        return {
            restrict: 'AE',
            scope: {
                count: '='
            },
            link: function (scope, element, attrs) {
                var formatted = bytesFilter(scope.count);
                var parts = formatted.split(' ');
                scope.number = parts[0];
                scope.unit = parts[1];
            },
            template: '{{number}} <span class="unit">{{unit}}</span>'
        };
    }]).
    directive('sbAuthDialog', ['$auth', function ($auth) {
        return {
            restrict: 'E',
            scope: {},
            link: function (scope, element, attrs) {
                scope.authURL = '/auth/v1.0';
                scope.$watch(
                    function () {
                        return $auth.state;
                    },
                    function (newValue) {
                        scope.authState = newValue;
                    }
                );
                scope.submit = function () {
                    var credentials = {
                        authURL: scope.authURL,
                        authUser: scope.authUser,
                        authKey: scope.authKey
                    };
                    $auth.authenticate(credentials);
                };
            },
            templateUrl: 'partials/auth-dialog.html'
        };
    }]);
