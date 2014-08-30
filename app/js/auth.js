'use strict';

/* Service for tracking authentication status. The `state` property
 * shows the currently known status.
 *
 * Initial status is 'auth-done'.
 */
function AuthService($q, $swift, $http) {
    this.$q = $q;
    this.$swift = $swift;
    this.$http = $http;
    this.state = 'auth-done';
    this.deferreds = [];
    this.configs = [];
}

/* Request authentication for the HTTP request with configuration
 * `config`. The configuration will be used later to resend the
 * request when `authenticate` is called.
 *
 * Changes state to "auth-request".
 */
AuthService.prototype.requestAuth = function (config) {
    var result = this.$q.defer();
    this.deferreds.push(result);
    this.configs.push(config);
    this.state = 'auth-requested';
    return result.promise;
};

/* Authenticate to Swift and resolve pending HTTP requests.
 *
 * Changes state to 'auth-started' immediately and to 'auth-done' when
 * successfully authenticated.
 */
AuthService.prototype.authenticate = function(credentials) {
    this.state = 'auth-started';
    var that = this;
    var authPromise = this.$swift.auth(credentials);
    authPromise.then(function () {
        while (that.deferreds.length > 0) {
            var deferred = that.deferreds.pop();
            var config = that.configs.pop();
            deferred.resolve(that.$http(config));
        }
        that.state = 'auth-done';
    });
    return authPromise;
};

angular.module('swiftBrowser.auth', ['swiftBrowser.swift'])
    .service('$auth', ['$q', '$swift', '$http', AuthService]);
