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

mod.directive('sbBreadcrumbs', function () {
    return {
        restruct: 'E',
        scope: {
            path: '@'
        },
        link: function (scope) {
            scope.crumbs = [{path: '/', title: 'Root'}];
            var lastIdx = 0;
            var idx;
            while (lastIdx + 1 < scope.path.length) {
                idx = scope.path.indexOf('/', lastIdx + 1);
                if (idx == -1) {
                    // Last path segment: slice to end of string.
                    idx = scope.path.length;
                }
                var crumb = {path: scope.path.slice(0, idx + 1),
                             title: scope.path.slice(lastIdx + 1, idx)};
                scope.crumbs.push(crumb);
                lastIdx = idx;
            }
        },
        templateUrl: 'partials/breadcrumbs.html'
    };
});
