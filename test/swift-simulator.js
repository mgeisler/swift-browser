
exports.loadAngularMocks = function () {
    browser.addMockModule('swiftBrowserE2E', function () {
        if (!window.e2e_angular_mocks_loaded) {
            var script = document.createElement('script');
            script.src = 'bower_components/angular-mocks/angular-mocks.js';
            document.body.appendChild(script);
            window.e2e_angular_mocks_loaded = true;
        }
        angular.module('swiftBrowserE2E', ['ngMockE2E']);
    });
};
