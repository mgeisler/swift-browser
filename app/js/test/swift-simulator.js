'use strict';

window.commit = function() {
    angular.module('swiftBrowserE2E').run(function($httpBackend) {
        $httpBackend.whenGET(/.*/).passThrough();
    });
};

window.setContainers = function(containers) {
    angular.module('swiftBrowserE2E').run(function($httpBackend) {
        var path = window.location.pathname;
        var accountUrl = path.split('/').slice(0, 3).join('/');

        $httpBackend.whenGET(accountUrl + '?format=json')
            .respond(containers);
    });
};

window.setObjects = function(container, objects) {
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

    var path = window.location.pathname;
    var accountUrl = path.split('/').slice(0, 3).join('/');
    var fixed = accountUrl + '/' + container;
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
};
