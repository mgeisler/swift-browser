'use strict';
var requestPromise = require('request-promise');
var Q = require('q');

var defaults = {
    baseUrl: 'http://localhost:8000/',
    transform: function () {
        return true;
    }
};
var rp = requestPromise.defaults(defaults);

exports.loadAngularMocks = function () {
    browser.driver.wait(function () {
        return rp.post('/reset');
    });
};

exports.addContainer = function (name) {
    browser.driver.wait(function () {
        return rp.put('/swift/' + name);
    });
};

exports.setObjects = function (container, objects) {
    exports.addContainer(container);

    browser.driver.wait(function () {
        var promisses = [];
        for (var name in objects) {
            var object = objects[name];
            var options = {url: '/swift/' + container + '/' + name,
                           body: object.content || '',
                           headers: object.headers || {}};
            promisses.push(rp.put(options));
        }
        return Q.all(promisses);
    });
};
