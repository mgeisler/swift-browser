'use strict';

exports.loadAngularMocks = function () {
    browser.clearMockModules();
    browser.addMockModule('swiftBrowserE2E', function () {
        var srcs = [
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/spark-md5/spark-md5.js',
            'js/test/swift-simulator.js'
        ];
        srcs.forEach(function (src) {
            var script = document.createElement('script');
            script.async = false;
            script.src = src;
            document.body.appendChild(script);
        });
    });
    browser.addMockModule('swiftBrowserE2E', function() {
        angular.module('swiftBrowserE2E').run(function(swiftSim) {
            swiftSim.reset();
        });
    });
};

exports.addContainer = function(name) {
    browser.addMockModule('swiftBrowserE2E', function(name) {
        angular.module('swiftBrowserE2E').run(function(swiftSim) {
            swiftSim.addContainer(name);
        });
    }, name);
};

exports.setObjects = function(container, objects) {
    browser.addMockModule('swiftBrowserE2E', function(container, jsonObjects) {
        angular.module('swiftBrowserE2E').run(function(swiftSim) {
            swiftSim.setObjects(container, JSON.parse(jsonObjects));
        });
    }, container, JSON.stringify(objects));
};
