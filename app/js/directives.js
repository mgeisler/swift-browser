'use strict';

/* Directives */

angular.module('swiftBrowser.directives', []).
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
    }]);
