'use strict';

var base = require('./karma.conf.js');

module.exports = function(config){
  base(config);
  config.plugins.push('karma-coverage');
  config.reporters.push('coverage');
  config.preprocessors = {'app/js/**/*.js': 'coverage'};
};
