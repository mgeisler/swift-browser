
exports.loadAngularMocks = function () {
    browser.addMockModule('swiftBrowserE2E', function () {
        if (!window.e2eAngularMocksLoaded) {
            var script = document.createElement('script');
            script.src = 'bower_components/angular-mocks/angular-mocks.js';
            document.body.appendChild(script);
            window.e2eAngularMocksLoaded = true;
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
        });
    }, JSON.stringify(containers));
};

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

        var fixed = '/app/index.html/' + container;
        var listRegex = new RegExp(escape(fixed + '?') + '(.*)');
        var deleteRegex = new RegExp(escape(fixed + '/') + '(.*)');

        function listObjects(method, url, data) {
            var match = url.match(listRegex);
            var params = parseQueryString(match[1]);
            var results = [];
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                if (object.name.indexOf(params.prefix) == 0) {
                    var rest = object.name.slice(params.prefix.length);
                    var idx = rest.indexOf(params.delimiter);
                    if (idx > -1) {
                        results.push({subdir: rest.slice(0, idx + 1)});
                    } else {
                        results.push(object);
                    }
                }
            }
            return [200, results];
        }

        function deleteObject(method, url, data) {
            var match = url.match(deleteRegex);
            var name = match[1];
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].name == name) {
                    objects.splice(i, 1);
                    return [204, null];
                }
            }
            return [404, 'Not Found'];
        }

        angular.module('swiftBrowserE2E').run(function($httpBackend) {
            $httpBackend.whenGET(listRegex).respond(listObjects);
            $httpBackend.whenDELETE(deleteRegex).respond(deleteObject);
        });
    }, container, JSON.stringify(objects));
};
