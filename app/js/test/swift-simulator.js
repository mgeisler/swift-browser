'use strict';

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

function accountUrl() {
    var path = window.location.pathname;
    return path.split('/').slice(0, 3).join('/');
}

window.getFromInjector = function(service) {
    var html = document.querySelector("html");
    var injector = angular.element(html).injector();
    return injector.get(service);
};


function SwiftSimulator($httpBackend) {
    this.containers = [];
    this.objects = {};

    var prefix = escape(accountUrl() + '/');
    var listRegex = new RegExp(prefix + '(.*?)' + escape('?') + '(.*)');
    var objRegex = new RegExp(prefix + '(.*?)' + escape('/') + '(.*)');

    function listContainers(method, url, data) {
        return [200, this.containers];
    }

    $httpBackend.whenGET(accountUrl() + '?format=json')
        .respond(listContainers.bind(this));

    /* setObjects */
    function listObjects(method, url, data) {
        var defaults = {prefix: '', delimiter: null};
        var match = url.match(listRegex);
        var container = match[1];
        var qs = match[2];
        var params = angular.extend(defaults, parseQueryString(qs));
        var prefix = params.prefix;
        var delimiter = params.delimiter;
        var results = [];
        var subdirs = {};
        var objects = this.objects[container];
        if (objects == undefined) {
            return [404, 'Container "' + match[1] + '" not found'];
        }

        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            var name = object.name;
            if (name.indexOf(prefix) == 0) {
                var idx = name.indexOf(delimiter, prefix.length);
                if (idx > -1) {
                    var subdir = name.slice(0, idx + 1);
                    if (!subdirs[subdir]) {
                        results.push({subdir: subdir});
                        subdirs[subdir] = true;
                    }
                } else {
                    results.push(object);
                }
            }
        }
        return [200, results];
    }

    function deleteObject(method, url, data) {
        var match = url.match(objRegex);
        var container = match[1];
        var name = match[2];

        var objects = this.objects[container];
        if (objects == undefined) {
            return [404, 'Container "' + container + '" not found'];
        }

        for (var i = 0; i < objects.length; i++) {
            if (objects[i].name == name) {
                objects.splice(i, 1);
                return [204, null];
            }
        }
        return [404, 'Not Found'];
    }

    function putObject(method, url, data) {
        var match = url.match(objRegex);
        var container = match[1];
        var name = match[2];

        var objects = this.objects[container];
        if (objects == undefined) {
            return [404, 'Container "' + container + '" not found'];
        }

        var lastModified = data.lastModifiedDate.toISOString();
        var object = {name: name,
                      bytes: data.size,
                      'last_modified': lastModified,
                      'content_type': 'application/octet-stream',
                      hash: ''};
        // Remove object if it's already there
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].name == name) {
                objects.splice(i, 1);
            }
        }
        objects.push(object);
        return [201, null];
    }

    $httpBackend.whenGET(listRegex).respond(listObjects.bind(this));
    $httpBackend.whenDELETE(objRegex).respond(deleteObject.bind(this));
    $httpBackend.whenPUT(objRegex).respond(putObject.bind(this));
    $httpBackend.whenGET(/.*/).passThrough();
}

SwiftSimulator.prototype.setContainers = function(containers) {
    this.containers = containers;
};

SwiftSimulator.prototype.setObjects = function(container, objects) {
    this.objects[container] = objects;
};

angular.module('swiftBrowserE2E', ['ngMockE2E'])
    .service('swiftSim', SwiftSimulator);
