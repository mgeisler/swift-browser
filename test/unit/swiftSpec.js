'use strict';


describe('Swift LiteAuth authentication', function() {
    var credentials = {
        authUrl: '/auth/url',
        authUser: 'user',
        authKey: 'key'
    };

    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function ($httpBackend, $swift) {
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

        this.$httpBackend.expectGET('http://swift?format=json', check)
            .respond(200, []);
        this.$swift.listContainers();
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
        this.$httpBackend.expectGET('/v1/AUTH_abc/cont?format=json')
            .respond(200, []);
        this.$swift.listObjects('cont');
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
