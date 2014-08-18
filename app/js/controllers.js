'use strict';

/* Controllers */

angular.module('swiftBrowser.controllers', [])
    .controller('RootCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.containers = [];
        $scope.orderProp = 'name';

        $scope.updateOrderBy = function(column) {
            if (column == $scope.orderProp)
                column = '-' + column;
            $scope.orderProp = column;
        }

        var client = new SwiftClient($http);
        client.listContainers().then(function (result) {
            $scope.containers = result.data;
        });
    }])
    .controller('ContainerCtrl', [
        '$scope', '$http', '$routeParams', '$location',
        function($scope, $http, $routeParams, $location) {
            var container = $routeParams.container;
            var path = $routeParams.path || '';
            $scope.container = container;
            $scope.orderProp = 'name';

            $scope.updateOrderBy = function(column) {
                if (column == $scope.orderProp)
                    column = '-' + column;
                $scope.orderProp = column;
            }

            $scope.breadcrumbs = [{name: '', title: 'Root'}];

            var parts = path.split('/');
            parts.unshift(container);
            for (var i = 0; i < parts.length - 1; i++) {
                var crumb = {name: parts.slice(0, i+1).join('/') + '/',
                             title: parts[i]};
                $scope.breadcrumbs.push(crumb);
            }

            var client = new SwiftClient($http);
            var params = {prefix: path, delimiter: '/'};
            client.listObjects(container, params).then(function (result) {
                var items = result.data;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].subdir == path + '/') {
                        // Add trailing slash for pseudo-directory
                        $location.path($location.path() + '/');
                        return;
                    }
                }

                $scope.items = $.map(items, function (item) {
                    var parts = (item.subdir || item.name).split('/');

                    if (item.subdir) {
                        return {name: item.subdir,
                                title: parts[parts.length - 2] + '/',
                                bytes: '\u2014'} // em dash
                    } else {
                        item.title = parts[parts.length - 1];
                        return item;
                    }
                });
            });
        }]);
