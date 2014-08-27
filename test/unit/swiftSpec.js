'use strict';


describe('Swift', function() {
    var $httpBackend;
    var credentials = {
        authURL: '/auth/url',
        authUser: 'user',
        authKey: 'key'
    };

    beforeEach(module('swiftBrowser.swift'));
    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should not be logged in', inject(function($swift) {
        expect($swift._headers).toEqual({});
    }));

    describe('when logging in', function () {
        it('should send X-Auth-User and X-Auth-Key', inject(function($swift) {
            function check(headers) {
                return (headers['X-Auth-User'] == 'user' &&
                        headers['X-Auth-Key'] == 'key');
            }

            $httpBackend.expectGET('/auth/url', check)
                .respond(200);
            $swift.auth(credentials);
        }));

        it('should set X-Auth-Token', inject(function($swift) {
            var headers = {'X-Auth-Token': 'a token',
                           'X-Storage-Url': 'http://swift'};

            $httpBackend.expectGET('/auth/url')
                .respond(200, null, headers);
            $swift.auth(credentials);
            $httpBackend.flush();

            expect($swift._headers['X-Auth-Token']).toEqual('a token');
            expect($swift._swiftUrl).toEqual('http://swift');
        }));
    });

    it('should send X-Auth-Token with requests', inject(function($swift) {
        var headers = {'X-Auth-Token': 'a token',
                       'X-Storage-Url': 'http://swift'};

        function check(headers) {
            return headers['X-Auth-Token'] == 'a token';
        }

        $httpBackend.expectGET('/auth/url')
            .respond(200, null, headers);
        $swift.auth(credentials);
        $httpBackend.flush();

        $httpBackend.expectGET('http://swift?format=json', check)
            .respond(200, []);
        $swift.listContainers();
    }));
});
