'use strict';


describe('Swift LiteAuth authentication', function() {
    var credentials = {
        authUrl: '/auth/url',
        authUser: 'user',
        authKey: 'key'
    };

    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function ($httpBackend, $swift) {
        $httpBackend.whenGET('config.json').respond(404);
        this.$httpBackend = $httpBackend;
        this.$swift = $swift;
    }));
    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

    it('should not be logged in', function() {
        expect(this.$swift._headers).toEqual({});
    });

    describe('when logging in', function () {
        it('should send X-Auth-User and X-Auth-Key', function() {
            function check(headers) {
                return (headers['X-Auth-User'] == 'user' &&
                        headers['X-Auth-Key'] == 'key');
            }

            this.$httpBackend.expectGET('/auth/url', check)
                .respond(200);
            this.$swift.auth('liteauth', credentials);
        });

        it('should set X-Auth-Token', function() {
            var headers = {'X-Auth-Token': 'a token',
                           'X-Storage-Url': 'http://swift'};

            this.$httpBackend.expectGET('/auth/url')
                .respond(200, null, headers);
            this.$swift.auth('liteauth', credentials);
            this.$httpBackend.flush();

            expect(this.$swift._headers['X-Auth-Token']).toEqual('a token');
            expect(this.$swift._swiftUrl).toEqual('http://swift');
        });
    });

    it('should send X-Auth-Token with requests', function() {
        var headers = {'X-Auth-Token': 'a token',
                       'X-Storage-Url': 'http://swift'};

        function check(headers) {
            return headers['X-Auth-Token'] == 'a token';
        }

        this.$httpBackend.expectGET('/auth/url')
            .respond(200, null, headers);
        this.$swift.auth('liteauth', credentials);
        this.$httpBackend.flush();

        this.$httpBackend.expectGET('http://swift', check)
            .respond(200, []);
        this.$swift.listContainers();
    });
});

describe('Swift Keystone authentication', function() {
    var credentials = {
        authUrl: '/tokens',
        authTenant: 'tenant',
        authUsername: 'user',
        authPassword: 'pass'
    };

    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function ($httpBackend, $swift) {
        this.$httpBackend = $httpBackend;
        this.$swift = $swift;
    }));
    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

    describe('when logging in', function () {
        var loginResponse = {
            access: {
                token: {id: 'a token'},
                serviceCatalog: [
                    {name: 'swift',
                     endpoints: [{publicURL: 'http://swift'}]}
                ]
            }
        };

        it('should POST tenant, username, and password', function() {
            var loginRequest = {auth: {tenantName: 'tenant',
                                       passwordCredentials:
                                       {username: 'user',
                                        password: 'pass'}}};
            this.$httpBackend.expectPOST('/tokens', loginRequest)
                .respond(200, loginResponse);
            this.$swift.auth('keystone', credentials);
        });

        it('should set X-Auth-Token', function() {
            this.$httpBackend.expectPOST('/tokens')
                .respond(200, loginResponse);
            this.$swift.auth('keystone', credentials);
            this.$httpBackend.flush();

            expect(this.$swift._headers['X-Auth-Token']).toEqual('a token');
            expect(this.$swift._swiftUrl).toEqual('http://swift');
        });
    });
});


describe('Swift request types', function() {
    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function ($httpBackend, $swift) {
        this.$httpBackend = $httpBackend;
        this.$swift = $swift;
    }));
    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

    it('should send GET request when listing objects', function() {
        this.$httpBackend.expectGET('/v1/AUTH_abc/cont')
            .respond(200, []);
        this.$swift.listObjects('cont');
        this.$httpBackend.flush();
    });

    it('should send HEAD request when getting metadata', function() {
        this.$httpBackend.expect('HEAD', '/v1/AUTH_abc/cont/foo/bar')
            .respond(202, null);
        this.$swift.headObject('cont', 'foo/bar');
        this.$httpBackend.flush();
    });

    it('should send POST request when setting metadata', function() {
        this.$httpBackend.expect('POST', '/v1/AUTH_abc/cont/foo/bar')
            .respond(202, null);
        var headers = {'Content-Type': 'text/plain'};
        this.$swift.postObject('cont', 'foo/bar', headers);
        this.$httpBackend.flush();
    });

    it('should send DELETE request when deleting an objct', function() {
        this.$httpBackend.expectDELETE('/v1/AUTH_abc/cont/foo/bar')
            .respond(204, null);
        this.$swift.deleteObject('cont', 'foo/bar');
        this.$httpBackend.flush();
    });

    it('should send PUT request when uploading an objct', function() {
        this.$httpBackend.expectPUT('/v1/AUTH_abc/cont/foo/bar', 'data')
            .respond(201, null);
        this.$swift.uploadObject('cont', 'foo/bar', 'data');
        this.$httpBackend.flush();
    });
});

describe('postObject', function () {
    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function ($httpBackend, $swift) {
        this.$httpBackend = $httpBackend;
        this.$swift = $swift;
    }));
    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

    it('should send custom headers', function () {
        var headers = {'Content-Type': 'text/plain',
                       'X-Foo': 'some value'};
        function check(allHeaders) {
            return (allHeaders['Content-Type'] == 'text/plain' &&
                    allHeaders['X-Foo'] == 'some value');
        }
        this.$httpBackend.expect('POST', '/v1/AUTH_abc/cont/foo', null, check)
            .respond(202, null);
        this.$swift.postObject('cont', 'foo', headers);
        this.$httpBackend.flush();
    });

    it('should merge in $swift headers', function () {
        function check(allHeaders) {
            return allHeaders['X-Auth-Token'] == 'a token';
        }
        this.$httpBackend.expect('POST', '/v1/AUTH_abc/cont/foo', null, check)
            .respond(202, null);
        this.$swift._headers['X-Auth-Token'] = 'a token';
        this.$swift.postObject('cont', 'foo', {});
        this.$httpBackend.flush();
    });

    it('should not send a default Content-Type header', function () {
        function check(allHeaders) {
            var names = Object.keys(allHeaders);
            return names.some(function (name) {
                return name.toLowerCase() == 'content-type';
            });
        }
        this.$httpBackend.expect('POST', '/v1/AUTH_abc/cont/foo', null, check)
            .respond(202, null);
        this.$swift.postObject('cont', 'foo', {});
    });
});
