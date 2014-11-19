'use strict';

/* Filters */

var mod = angular.module('swiftBrowser.filters', []);

mod.filter('bytes', function () {
      return function (input) {
          var number = parseInt(input);
          if (isNaN(number)) {
              return input;
          }
          var units = ['B', 'KB', 'MB', 'GB'];
          var unit = units.shift();

          while (number > 1000) {
              number /= 1000;
              unit = units.shift();
          }

          return number.toFixed(1) + ' ' + unit;
      };
});

mod.filter('notUndefined', function () {
      return function (items) {
          return items.filter(function (item) {
              return item !== undefined;
          });
      };
});

mod.filter('selected', function () {
      return function (items) {
          return items.filter(function (item) {
              // item can be undefined if it is deleted
              return item && item.selected;
          });
      };
});

mod.filter('length', function () {
      return function (items) {
          return items.length;
      };
});
