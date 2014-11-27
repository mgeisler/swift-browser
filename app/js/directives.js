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

mod.directive('sbOnChange', function () {
    return {
        restrict: 'A',
        scope: {
            sbOnChange: '='
        },
        link: function (scope, element) {
            element.on('change', function (event) {
                var target = this;
                // This is called from a non-Angular event handler, so
                // we invoke the callback with $apply to inform the
                // scope about the update. Otherwise the update won't
                // be noticed until the next digest cycle.
                scope.$apply(function () {
                    scope.sbOnChange.call(target, event);
                });
            });
        }
    };
});
