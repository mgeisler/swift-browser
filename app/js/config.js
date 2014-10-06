'use strict';

/* Service for fetching application config.
 */
function ConfigService($http) {
    this.defaults = {auth: {"type": 'liteauth',
                            url: '/auth/v1.0'}};
    this.conf = $http.get('config.json');
}

ConfigService.prototype.get = function (callback) {
    var defaults = this.defaults;
    function success(result) {
        function merge(dst, src) {
            angular.forEach(src, function (value, key) {
                if (angular.isObject(value) && angular.isObject(dst[key])) {
                    merge(dst[key], value);
                } else {
                    dst[key] = value;
                }
            });
            return dst;
        }

        var merged = merge(angular.copy(defaults), result.data);
        callback(merged);
    }
    function error() {
        callback(defaults);
    }
    this.conf.then(success, error);
};

angular.module('swiftBrowser.config', [])
    .service('$config', ['$http', ConfigService]);
