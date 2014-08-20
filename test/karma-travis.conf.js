base = require('./karma.conf.js');

module.exports = function(config){
  base(config);

  config.set({
      singleRun : true,
      reporters : ['dots'],
      browsers : ['Firefox']
  });
};
