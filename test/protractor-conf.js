'use strict';

exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/*.js'
    ],

    capabilities: {
        'browserName': 'firefox'
    },

    baseUrl: 'http://localhost:8000/app/',

    onPrepare: function () {
        var width = 640;
        var height = 480;
        browser.driver.manage().window().setSize(width, height);
    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
