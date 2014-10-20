'use strict';

exports.loadAngularMocks = function () {
    browser.clearMockModules();
    browser.addMockModule('swiftBrowserE2E', function () {
        var ngMocks = document.createElement('script');
        ngMocks.src = 'bower_components/angular-mocks/angular-mocks.js';
        document.body.appendChild(ngMocks);

        var swiftSim = document.createElement('script');
        swiftSim.src = 'js/test/swift-simulator.js';
        document.body.appendChild(swiftSim);
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
