'use strict';

/* Controllers */

function mkUpdateOrderBy($scope) {
    return function(column) {
        var rev = column == $scope.orderProp;
        $scope.sortCls = {};
        $scope.sortCls[column] = 'sort-' + (rev ? 'desc' : 'asc');
        if (rev) {
            column = '-' + column;
        }
        $scope.orderProp = column;
    };
}

function mkAllSelected($scope, key) {
    return function () {
        var collection = $scope[key];
        for (var i = 0; i < collection.length; i++) {
            if (!collection[i].selected) {
                return false;
            }
        }
        return true;
    };
}

function mkToggleAll($scope, key, allSelected) {
    return function() {
        var collection = $scope[key];
        var newValue = !allSelected();
        for (var i = 0; i < collection.length; i++) {
            collection[i].selected = newValue;
        }
    };
}

angular.module('swiftBrowser.controllers', ['swiftBrowser.swift'])
    .controller('RootCtrl', ['$scope', '$swift', function($scope, $swift) {
        $scope.containers = [];
        $scope.updateOrderBy = mkUpdateOrderBy($scope);
        $scope.updateOrderBy('name');

        $scope.allSelected = mkAllSelected($scope, 'containers');
        $scope.toggleAll = mkToggleAll($scope, 'containers',
                                       $scope.allSelected);

        $swift.listContainers().then(function (result) {
            $scope.containers = result.data;
        });
    }])
    .controller('ContainerCtrl', [
        '$scope', '$swift', '$routeParams', '$location',
        function($scope, $swift, $routeParams, $location) {
            var container = $routeParams.container;
            var path = $routeParams.path || '';
            $scope.container = container;
            $scope.updateOrderBy = mkUpdateOrderBy($scope);
            $scope.updateOrderBy('name');

            $scope.breadcrumbs = [{name: '', title: 'Root'}];

            var parts = path.split('/');
            parts.unshift(container);
            for (var i = 0; i < parts.length - 1; i++) {
                var crumb = {name: parts.slice(0, i + 1).join('/') + '/',
                             title: parts[i]};
                $scope.breadcrumbs.push(crumb);
            }

            var params = {prefix: path, delimiter: '/'};
            $swift.listObjects(container, params).then(function (result) {
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
                                bytes: '\u2014'}; // em dash
                    } else {
                        item.title = parts[parts.length - 1];
                        return item;
                    }
                });
            });
        }
    ]);
