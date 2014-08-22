base = require('./karma.conf.js');
coverage = require('./karma-coverage.conf.js');

module.exports = function(config){
  base(config);
  coverage(config);

  config.set({
      singleRun : true,
      browsers : ['Firefox'],
      coverageReporter : {
          type: 'lcovonly',
          subdir: '.',
      },
  });
};
