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
        if (collection.length == 0) {
            return false;
        }
        return collection.every(function (item) {
            return item.selected;
        });
    };
}

function mkNothingSelected($scope, key) {
    return function() {
        var collection = $scope[key];
        return !collection.some(function (item) {
            return item.selected;
        });
    };
}

function mkToggleAll($scope, key, allSelected) {
    return function() {
        var collection = $scope[key];
        var newValue = !allSelected();
        collection.forEach(function (item) {
            item.selected = newValue;
        });
    };
}

function mkDownloadLink($scope, key) {
    return function() {
        var collection = $scope[key];
        var name = null;
        collection.some(function (item) {
            if (item.selected) {
                name = item.name;
            }
            return item.selected;
        });
        return name;
    };
}

angular.module('swiftBrowser.controllers',
               ['swiftBrowser.swift', 'ui.bootstrap'])
    .controller('RootCtrl', ['$scope', '$swift', function($scope, $swift) {
        $scope.containers = [];
        $scope.updateOrderBy = mkUpdateOrderBy($scope);
        $scope.updateOrderBy('name');

        $scope.allSelected = mkAllSelected($scope, 'containers');
        $scope.toggleAll = mkToggleAll($scope, 'containers',
                                       $scope.allSelected);
        $scope.nothingSelected = mkNothingSelected($scope, 'containers');

        $swift.listContainers().then(function (result) {
            $scope.containers = result.data;
        });
    }])
    .controller('ContainerCtrl', [
        '$scope', '$swift', '$routeParams', '$location', '$modal',
        function($scope, $swift, $routeParams, $location, $modal) {
            var container = $routeParams.container;
            var path = $routeParams.path || '';
            $scope.container = container;
            $scope.updateOrderBy = mkUpdateOrderBy($scope);
            $scope.updateOrderBy('name');

            $scope.items = [];
            $scope.allSelected = mkAllSelected($scope, 'items');
            $scope.toggleAll = mkToggleAll($scope, 'items', $scope.allSelected);
            $scope.nothingSelected = mkNothingSelected($scope, 'items');
            $scope.downloadLink = mkDownloadLink($scope, 'items');

            $scope.delete = function () {
                var scope = $scope.$new(true);
                scope.items = [];
                $scope.items.forEach(function (item, idx) {
                    if (item.selected) {
                        var copy = angular.copy(item);
                        copy.idx = idx;
                        scope.items.push(copy);
                    }
                });
                scope.updateOrderBy = mkUpdateOrderBy(scope);
                scope.updateOrderBy('name');
                scope.allSelected = mkAllSelected(scope, 'items');
                scope.toggleAll = mkToggleAll(scope, 'items',
                                              scope.allSelected);
                scope.nothingSelected = mkNothingSelected(scope, 'items');

                var opt = {templateUrl: 'partials/delete-modal.html',
                           scope: scope};
                var inst = $modal.open(opt);
                inst.result.then(function () {
                    scope.items.forEach(function (item) {
                        if (item.selected) {
                            var req;
                            if (item.subdir) {
                                req = $swift.deleteDirectory(container,
                                                             item.name);
                            } else {
                                req = $swift.deleteObject(container,
                                                          item.name);
                            }
                            req.success(function (result) {
                                delete $scope.items[item.idx];
                            });
                        }
                    });
                });
            };

            $scope.upload = function () {
                var scope = $scope.$new(true);
                scope.selectedFile = null;
                scope.path = container + '/' + path;
                scope.fileSelected = function(elm) {
                    scope.selectedFile = elm.files[0];
                };

                var opt = {templateUrl: 'partials/upload-modal.html',
                           scope: scope};
                var inst = $modal.open(opt);
                inst.result.then(function () {
                    var file = scope.selectedFile;
                    var name = path + file.name;
                    var item = {name: name,
                                title: file.name,
                                bytes: file.size};
                    var upload = $swift.uploadObject(container, name, file);
                    upload.success(function () {
                        $scope.items.push(item);
                    });
                });
            };

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
                                bytes: '\u2014', // em dash
                                subdir: true};
                    } else {
                        item.title = parts[parts.length - 1];
                        return item;
                    }
                });
            });
        }
    ]);
