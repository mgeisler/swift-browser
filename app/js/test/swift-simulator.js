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
    this.reset();

    var prefix = escape(accountUrl() + '/');
    this.listRegex = new RegExp(prefix + '(.*?)(?:' + escape('?') + '(.*)|$)');
    this.objRegex = new RegExp(prefix + '(.*?)' + escape('/') + '(.*)');

    $httpBackend.whenGET(accountUrl())
        .respond(this.listContainers.bind(this));
    $httpBackend.whenGET(this.listRegex)
        .respond(this.listObjects.bind(this));

    $httpBackend.when('HEAD', this.objRegex)
        .respond(this.headObject.bind(this));
    $httpBackend.whenPOST(this.objRegex)
        .respond(this.postObject.bind(this));
    $httpBackend.whenDELETE(this.objRegex)
        .respond(this.deleteObject.bind(this));
    $httpBackend.whenPUT(this.objRegex)
        .respond(this.putObject.bind(this));

    $httpBackend.whenGET(/.*/).passThrough();
}

SwiftSimulator.prototype.reset = function() {
    this.containers = [];
    this.objects = {};
};

SwiftSimulator.prototype.listContainers = function(method, url, data) {
    return [200, this.containers];
};

SwiftSimulator.prototype.listObjects = function(method, url, data) {
    var params = {prefix: '', delimiter: null};
    var match = url.match(this.listRegex);
    var container = match[1];
    var qs = match[2];
    if (qs) {
        angular.extend(params, parseQueryString(qs));
    }
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
};

SwiftSimulator.prototype.deleteObject = function(method, url, data) {
    var match = url.match(this.objRegex);
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
};

SwiftSimulator.prototype.headObject = function(method, url, data) {
    var match = url.match(this.objRegex);
    var container = match[1];
    var name = match[2];

    var objects = this.objects[container];
    if (objects == undefined) {
        return [404, 'Container "' + container + '" not found'];
    }

    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == name) {
            var object = objects[i];
            var d = new Date(object.last_modified);
            var headers = {'ETag': object.hash,
                           'Last-Modified': d.toUTCString(),
                           'Content-Length': object.bytes};
            if (object.content_type) {
                headers['Content-Type'] = object.content_type;
            }
            return [200, null, headers];
        }
    }
    return [404, 'Not Found'];
};

SwiftSimulator.prototype.postObject = function(method, url, data, headers) {
    var match = url.match(this.objRegex);
    var container = match[1];
    var name = match[2];
    var contentType;
    angular.forEach(headers, function (value, name) {
        if (name.toLowerCase() == 'content-type') {
            contentType = value;
        }
    });

    var objects = this.objects[container];
    if (objects == undefined) {
        return [404, 'Container "' + container + '" not found'];
    }

    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == name) {
            var object = objects[i];
            var d = new Date();
            // Convert from local timezone to UTC timezone
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            /* eslint-disable camelcase */
            object.last_modified = d.toISOString();
            object.content_type = contentType;
            /* eslint-enable */
            return [202, null];
        }
    }
    return [404, 'Not Found'];
};

SwiftSimulator.prototype.putObject = function(method, url, data) {
    var match = url.match(this.objRegex);
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
};


SwiftSimulator.prototype.setContainers = function(containers) {
    this.containers = containers;
};

SwiftSimulator.prototype.setObjects = function(container, objects) {
    this.objects[container] = objects;
};

angular.module('swiftBrowserE2E', ['ngMockE2E'])
    .service('swiftSim', SwiftSimulator);
