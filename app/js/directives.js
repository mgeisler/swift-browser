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
                count: '=',
            },
            link: function (scope, element, attrs) {
                var formatted = bytesFilter(scope.count);
                var parts = formatted.split(' ');

                element.text(parts[0] + ' ');
                element.append($('<span>').addClass('unit').text(parts[1]));
            },
        };
    }]);
