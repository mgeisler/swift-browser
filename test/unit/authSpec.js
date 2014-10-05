'use strict';

var credentials = {
    authUrl: '/auth/url',
    authUser: 'user',
    authKey: 'key'
};

describe('Authentication state', function() {
    var $httpBackend, $auth;

    beforeEach(module('swiftBrowser.auth'));
    beforeEach(inject(function (_$httpBackend_, _$auth_) {
        $httpBackend = _$httpBackend_;
        $auth = _$auth_;
    }));

    it('should start as "auth-done"', function() {
        expect($auth.state).toEqual('auth-done');
    });

    it('should switch to "auth-requested"', function() {
        $auth.requestAuth({});
        expect($auth.state).toEqual('auth-requested');
    });

    it('should switch to "auth-started"', function() {
        $httpBackend.whenGET('/auth/url').respond(200);

        $auth.authenticate('liteauth', credentials);
        expect($auth.state).toEqual('auth-started');
        $httpBackend.flush();
        expect($auth.state).toEqual('auth-done');
    });

});


describe('Request headers', function() {
    var $httpBackend, $auth, $q;

    beforeEach(module('swiftBrowser.auth'));
    beforeEach(inject(function (_$httpBackend_, _$auth_, _$q_) {
        $httpBackend = _$httpBackend_;
        $auth = _$auth_;
        $q = _$q_;
    }));
    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should be updated to include X-Auth-Token', function() {
        $httpBackend.expectGET('/auth/url')
            .respond(200, null, {'X-Auth-Token': 'a token'});
        $httpBackend.expectGET('/foo')
            .respond(200);

        var pending = $q.defer();
        $auth.deferreds.push(pending);
        $auth.configs.push({url: '/foo', headers: {'X-Foo': '123'}});
        $auth.authenticate('liteauth', credentials);
        $httpBackend.flush();

        pending.promise.then(function (result) {
            // Existing request header
            expect(result.config.headers['X-Foo']).toBe('123');
            // New header
            expect(result.config.headers['X-Auth-Token']).toBe('a token');
        });
    });
});
