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
    }]);
