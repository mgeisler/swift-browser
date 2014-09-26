'use strict';

function SwiftClient($http) {
    this._$http = $http;
    this._swiftUrl = this.defaultSwiftUrl();
    this._headers = {};
}

SwiftClient.prototype.defaultSwiftUrl = function () {
    var path = window.location.pathname;
    return path.split('/').slice(0, 3).join('/');
};

SwiftClient.prototype.auth = function (swiftAuth) {
    var self = this;
    var headers = {
        'X-Auth-User': swiftAuth.authUser,
        'X-Auth-Key': swiftAuth.authKey
    };
    var req = this._$http({method: 'GET',
                           url: swiftAuth.authURL, headers: headers});
    req.success(function (data, status, headers, config) {
        self._headers['X-Auth-Token'] = headers('X-Auth-Token');
        self._swiftUrl = headers('X-Storage-Url');
    });
    return req;
};

SwiftClient.prototype.listContainers = function () {
    return this._$http.get(this._swiftUrl + '?format=json',
                           {headers: this._headers});
};

SwiftClient.prototype.listObjects = function (container, params) {
    if (!params) {
        params = {};
    }
    params.format = 'json';
    var url = this._swiftUrl + '/' + container + '?' + $.param(params);
    return this._$http.get(url, {headers: this._headers});
};

SwiftClient.prototype.deleteObject = function (container, object) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    return this._$http.delete(url, {headers: this._headers});
};

SwiftClient.prototype.uploadObject = function (container, object, data) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    return this._$http.put(url, data, {headers: this._headers});
};

angular.module('swiftBrowser.swift', [])
    .service('$swift', ['$http', SwiftClient]);
