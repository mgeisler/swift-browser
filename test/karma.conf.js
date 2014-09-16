'use strict';

module.exports = function(config){
  config.set({

    basePath: '../',

    files: [
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    // Files created by Emacs FlyCheck
    exclude : ['**/flycheck_*.js'],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    urlRoot: '/v1/AUTH_abc/container/',

    plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            ],

    reporters : ['progress'],

  });
};
