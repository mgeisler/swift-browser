'use strict';


describe('Authentication state', function() {
    var $httpBackend, $auth;
    var credentials = {
        authURL: '/auth/url',
        authUser: 'user',
        authKey: 'key'
    };

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

        $auth.authenticate(credentials);
        expect($auth.state).toEqual('auth-started');
        $httpBackend.flush();
        expect($auth.state).toEqual('auth-done');
    });
});
