'use strict';

/* Directives */

angular.module('swiftBrowser.directives', []).
    directive('sbVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }]);
