'use strict';

module.exports = function(config){
  config.set({

    basePath: '../',

    files: [
      'app/bower_components/codemirror/lib/codemirror.js',
      'app/bower_components/codemirror/mode/meta.js',
      'app/bower_components/codemirror/addon/mode/loadmode.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/ng-file-upload/angular-file-upload-html5-shim.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/ng-file-upload/angular-file-upload.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/angular-ui-codemirror/ui-codemirror.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    // Files created by Emacs FlyCheck
    exclude: ['**/flycheck_*.js'],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    urlRoot: '/v1/AUTH_abc/container/',

    plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            ],

    reporters: ['progress'],

  });
};
