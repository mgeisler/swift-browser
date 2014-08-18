
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
    browser.addMockModule('swiftBrowserE2E', function () {
        var containers = JSON.parse(arguments[0]);
        angular.module('swiftBrowserE2E').run(function($httpBackend) {
            $httpBackend.whenGET('/app/index.html?format=json')
                .respond(containers);
            $httpBackend.whenGET(/.*/).passThrough();
        });
    }, JSON.stringify(containers));
}
