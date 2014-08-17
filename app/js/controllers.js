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
        '$scope', '$http', '$routeParams',
        function($scope, $http, $routeParams) {
            var container = $routeParams.container;
            $scope.container = container;
            $scope.orderProp = 'name';

            $scope.updateOrderBy = function(column) {
                if (column == $scope.orderProp)
                    column = '-' + column;
                $scope.orderProp = column;
            }

            var client = new SwiftClient($http);
            client.listObjects(container).then(function (result) {
                $scope.objects = result.data;
            });
        }])
    .controller('ObjectCtrl', [
        '$scope', '$http', '$routeParams',
        function($scope, $http, $routeParams) {
            $scope.container = $routeParams.container;
            $scope.object = $routeParams.object;
        }]);
