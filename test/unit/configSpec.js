'use strict';

describe('$config', function () {
    beforeEach(module('swiftBrowser.config'));
    beforeEach(inject(function (_$httpBackend_, _$config_) {
        this.$httpBackend = _$httpBackend_;
        this.$config = _$config_;
    }));
    afterEach(function () {
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

    it('should handle 404 for config.json', function () {
        this.$httpBackend.expectGET('config.json')
            .respond(404);
        this.$config.get(function (conf) {
            expect(conf.auth.type).toBe('liteauth');
            expect(conf.auth.url).toBe('/auth/v1.0');
        });
        this.$httpBackend.flush();
    });

    it('should merge config.json with defaults', function () {
        this.$httpBackend.expectGET('config.json')
            .respond(200, {auth: {url: '/auth/lite'}});
        this.$config.get(function (conf) {
            expect(conf.auth.type).toBe('liteauth');
            expect(conf.auth.url).toBe('/auth/lite');
        });
        this.$httpBackend.flush();
    });
});
