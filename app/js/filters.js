'use strict';

/* Filters */

angular.module('swiftBrowser.filters', []).
  filter('bytes', function() {
      return function(input) {
          var number = parseInt(input);
          if (isNaN(number))
              return input;
          var units = ['B', 'KB', 'MB', 'GB'];
          var unit = units.shift();

          while (number > 1000) {
              number /= 1000;
              unit = units.shift();
          }

          return number.toFixed(1) + ' ' + unit;
      };
  });
