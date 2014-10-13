'use strict';

function SwiftClient($http, $q, $upload) {
    this._$http = $http;
    this._$q = $q;
    this._$upload = $upload;
    this._swiftUrl = this.defaultSwiftUrl();
    this._headers = {};
}

SwiftClient.prototype.defaultSwiftUrl = function () {
    var path = window.location.pathname;
    return path.split('/').slice(0, 3).join('/');
};

SwiftClient.prototype.auth = function (type, credentials) {
    switch (type) {
    case 'keystone':
        return this.keystone(credentials);
    case 'liteauth':
    default:
        return this.liteauth(credentials);
    }
};

SwiftClient.prototype.liteauth = function (swiftAuth) {
    var self = this;
    var headers = {
        'X-Auth-User': swiftAuth.authUser,
        'X-Auth-Key': swiftAuth.authKey
    };
    var req = this._$http.get(swiftAuth.authUrl, {headers: headers});
    return req.then(function (result) {
        var headers = result.headers;
        self._headers['X-Auth-Token'] = headers('X-Auth-Token');
        self._swiftUrl = headers('X-Storage-Url');
        return self._headers;
    });
};

SwiftClient.prototype.keystone = function (swiftAuth) {
    var self = this;
    var payload = {'auth':
                   {'tenantName': swiftAuth.authTenant,
                    'passwordCredentials':
                    {'username': swiftAuth.authUsername,
                     'password': swiftAuth.authPassword}}};
    var req = this._$http.post(swiftAuth.authUrl, payload);
    return req.then(function (result) {
        self._headers['X-Auth-Token'] = result.data.access.token.id;
        result.data.access.serviceCatalog.some(function (service) {
            if (service.name == 'swift') {
                self._swiftUrl = service.endpoints[0].publicURL;
                return true;  // break loop
            }
        });
        return self._headers;
    });
};

SwiftClient.prototype.listContainers = function () {
    return this._$http.get(this._swiftUrl, {headers: this._headers});
};

SwiftClient.prototype.listObjects = function (container, params) {
    var url = this._swiftUrl + '/' + container;
    return this._$http.get(url, {params: params, headers: this._headers});
};

SwiftClient.prototype.headObject = function (container, object) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    return this._$http.head(url, {headers: this._headers});
};

SwiftClient.prototype.postObject = function (container, object, headers) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    angular.extend(headers, this._headers);
    return this._$http.post(url, null, {headers: headers});
};

SwiftClient.prototype.deleteObject = function (container, object) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    return this._$http.delete(url, {headers: this._headers});
};

SwiftClient.prototype.deleteDirectory = function (container, subdir) {
    var $q = this._$q;
    var deleteObject = this.deleteObject.bind(this, container);
    var result = this.listObjects(container, {prefix: subdir});
    return result.then(function (result) {
        var deletions = result.data.map(function (object) {
            return deleteObject(object.name);
        });
        return $q.all(deletions);
    });
};

SwiftClient.prototype.uploadObject = function (container, object, data) {
    var url = this._swiftUrl + '/' + container + '/' + object;
    var config = {method: 'put',
                  url: url,
                  data: data,
                  headers: this._headers};
    return this._$upload.http(config);
};

angular.module('swiftBrowser.swift', ['angularFileUpload'])
    .service('$swift', ['$http', '$q', '$upload', SwiftClient]);
