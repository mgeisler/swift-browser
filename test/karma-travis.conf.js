'use strict';

var coverage = require('./karma-coverage.conf.js');

module.exports = function (config){
  coverage(config);

  config.set({
      singleRun: true,
      browsers: ['Firefox'],
      coverageReporter: {
          type: 'lcovonly',
          subdir: '.',
      },
      reporters: ['dots', 'coverage'],
  });
};
