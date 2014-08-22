
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

exports.commit = function () {
    browser.addMockModule('swiftBrowserE2E', function () {
        angular.module('swiftBrowserE2E').run(function($httpBackend) {
            $httpBackend.whenGET(/.*/).passThrough();
        });
    });
}

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
        });
    }, JSON.stringify(containers));
}

exports.setObjects = function(container, objects) {
    browser.addMockModule('swiftBrowserE2E', function () {
        var container = arguments[0];
        var objects = JSON.parse(arguments[1]);

        function escape(string) {
            return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
        }

        function parseQueryString(qs) {
            var params = {};
            var parts = qs.split('&');
            for (var i = 0; i < parts.length; i++) {
                var keyvalue = parts[i].split('=');
                var key = decodeURIComponent(keyvalue[0]);
                var value = decodeURIComponent(keyvalue[1]);
                params[key] = value;
            }
            return params;
        }

        var fixed = '/app/index.html/' + container + '?';
        var regex = new RegExp(escape(fixed) + '(.*)');

        function listObjects(method, url, data) {
            var match = url.match(regex);
            var params = parseQueryString(match[1]);
            var results = [];
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                if (object.name.indexOf(params.prefix) == 0) {
                    results.push(object);
                }
            }
            return [200, results];
        }

        angular.module('swiftBrowserE2E').run(function($httpBackend) {
            $httpBackend.whenGET(regex).respond(listObjects);
        });
    }, container, JSON.stringify(objects));
}
