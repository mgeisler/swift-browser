'use strict';

function byProperty(prop) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return -1;
        } else if (a[prop] > b[prop]) {
            return 1;
        }
        return 0;
    };
}

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

    angular.forEach(objects, function (object, name) {
        if (name.indexOf(prefix) == 0) {
            var idx = name.indexOf(delimiter, prefix.length);
            if (idx > -1) {
                var subdir = name.slice(0, idx + 1);
                if (!subdirs[subdir]) {
                    results.push({subdir: subdir});
                    subdirs[subdir] = true;
                }
            } else {
                var lastModified = new Date(object.headers['Last-Modified']);
                results.push({
                    'hash': object.headers.ETag,
                    'content_type': object.headers['Content-Type'],
                    'last_modified': lastModified.toISOString(),
                    'bytes': object.headers['Content-Length'],
                    'name': name
                });
            }
        }
    });
    results.sort(byProperty('name'));
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

    if (name in objects) {
        delete objects[name];
        return [204, null];
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

    var object = objects[name];
    if (object) {
        return [200, null, object.headers];
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

    var object = objects[name];
    if (object) {
        var d = new Date();
        // Convert from local timezone to UTC timezone
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        object.headers['Last-Modified'] = d.toUTCString();
        if (contentType) {
            object.headers['Content-Type'] = contentType;
        } else {
            delete object.headers['Content-Type'];
        }
        return [202, null];
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
    var object = {headers: {'ETag': '',
                            'Last-Modified': lastModified,
                            'Content-Length': data.size,
                            'Content-Type': 'application/octet-stream'}};
    objects[name] = object;
    return [201, null];
};


SwiftSimulator.prototype.setContainers = function(containers) {
    this.containers = containers;
};

SwiftSimulator.prototype.setObjects = function(container, objects) {
    var converted = {};
    angular.forEach(objects, function (object) {
        var lastModified = new Date(object.last_modified);
        var headers = {'ETag': object.hash,
                       'Last-Modified': lastModified.toUTCString(),
                       'Content-Length': object.bytes,
                       'Content-Type': object.content_type};
        converted[object.name] = {headers: headers};
    });
    this.objects[container] = converted;
};

angular.module('swiftBrowserE2E', ['ngMockE2E'])
    .service('swiftSim', SwiftSimulator);
