'use strict';

exports.loadAngularMocks = function () {
    browser.addMockModule('swiftBrowserE2E', function () {
        if (!window.e2eAngularMocksLoaded) {
            var ngMocks = document.createElement('script');
            ngMocks.src = 'bower_components/angular-mocks/angular-mocks.js';
            document.body.appendChild(ngMocks);
            var swiftSim = document.createElement('script');
            swiftSim.src = 'js/test/swift-simulator.js';
            document.body.appendChild(swiftSim);

            window.e2eAngularMocksLoaded = true;
        }
        angular.module('swiftBrowserE2E', ['ngMockE2E']);
    });
};

exports.commit = function () {
    browser.addMockModule('swiftBrowserE2E', 'window.commit()');
};

exports.setContainers = function(containers) {
    /* Testing with Firefox revealed that the array passed in
       arguments[0] loses its "own properties" when passed into the
       browser. That is, running

         Object.getOwnPropertyNames(arguments[0])
         Object.getOwnPropertyNames(arguments[0][0])

       both return empty arrays in the function below. We can convert
       arguments[0] to an array, but the objects in the array (the
       data about individual containers) will be empty since their
       properties are no longer defined. Converting to and from JSON
       is a work-around for this.
    */
    browser.addMockModule('swiftBrowserE2E',
                          'window.setContainers(arguments[0])',
                          JSON.stringify(containers));
};

exports.setObjects = function(container, objects) {
    browser.addMockModule('swiftBrowserE2E',
                          'window.setObjects(arguments[0], arguments[1])',
                          container, JSON.stringify(objects));

};
