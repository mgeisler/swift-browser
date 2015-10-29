'use strict';

exports.config = {
    allScriptsTimeout: 300,

    specs: [
        'e2e/*.js'
    ],

    capabilities: {
        browserName: 'firefox'
    },

    directConnect: true,

    baseUrl: 'http://localhost:8000/app/',

    onPrepare: function () {
        var width = 800;
        var height = 600;
        browser.driver.manage().window().setSize(width, height);

        var SwiftMock = require('./swift-mock.js');
        beforeEach(SwiftMock.loadAngularMocks);
    },

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
