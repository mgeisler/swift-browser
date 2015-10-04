'use strict';

var path = require('path');

module.exports = function (config) {
    function prefix(str, files) {
        return files.map(function (f) {
            return path.join(str, f);
        });
    }

    config.set({
        basePath: '../',
        files: prefix('app/bower_components', [
            'codemirror/lib/codemirror.js',
            'codemirror/mode/meta.js',
            'codemirror/addon/mode/loadmode.js',
            'ng-file-upload/angular-file-upload-html5-shim.js',
            'angular/angular.js',
            'ng-file-upload/angular-file-upload.js',
            'angular-ui-router/release/angular-ui-router.js',
            'angular-ui-codemirror/ui-codemirror.js',
            'angular-mocks/angular-mocks.js',
            'angular-bootstrap/ui-bootstrap-tpls.js',
        ]).concat([
            'app/js/*.js',
            'app/partials/*.html',
            'test/unit/**/*.js'
        ]),

        preprocessors: {
            'app/partials/*.html': ['ng-html2js']
        },
        ngHtml2JsPreprocessor: {
            stripPrefix: 'app/',
        },

        // Files created by Emacs FlyCheck
        exclude: ['**/flycheck_*.js'],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: ['Chrome', 'Firefox'],
        urlRoot: '/v1/AUTH_abc/container/',
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-ng-html2js-preprocessor'
        ],

        reporters: ['progress'],
    });
};
