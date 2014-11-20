'use strict';

/* Directives */

var mod = angular.module('swiftBrowser.directives', ['swiftBrowser.auth']);

mod.directive('sbVersion', function (version) {
    return function (scope, elm) {
        elm.text(version);
    };
});

mod.directive('sbFormatBytes', function (bytesFilter) {
    return {
        restrict: 'AE',
        scope: {
            count: '='
        },
        link: function (scope) {
            var formatted = bytesFilter(scope.count);
            var parts = formatted.split(' ');
            scope.number = parts[0];
            scope.unit = parts[1];
        },
        template: '{{number}} <span class="unit">{{unit}}</span>'
    };
});
