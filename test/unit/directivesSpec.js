'use strict';

/* jasmine specs for directives go here */

describe('directives', function () {
    beforeEach(module('swiftBrowser.directives'));

    describe('sb-version', function () {
        it('should print current version', function () {
            module(function ($provide) {
                $provide.value('version', '0.123');
            });
            inject(function ($compile, $rootScope) {
                var element = $compile('<span sb-version></span>')($rootScope);
                expect(element.text()).toEqual('0.123');
            });
        });
    });

    describe('sb-breadcrumbs', function () {
        beforeEach(module('partials/breadcrumbs.html'));

        beforeEach(inject(function ($compile, $rootScope) {
            this.$compile = $compile;
            this.$rootScope = $rootScope;
        }));

        function getCrumbs(path) {
            var html = ('<sb-breadcrumbs path="' + path + '">' +
                        '</sb-breadcrumbs>');
            var element = this.$compile(html)(this.$rootScope);
            this.$rootScope.$digest();
            var scope = element.isolateScope();
            // Strip $$hashKey fields
            return angular.copy(scope.crumbs);
        }

        var home = {path: '/', icon: 'glyphicon glyphicon-home'};
        var blah = {path: '/blah/', title: 'blah'};
        var atxt = {path: '/blah/a.txt', title: 'a.txt'};

        it('should handle root', function () {
            var crumbs = getCrumbs.call(this, '/');
            expect(crumbs).toEqual([home]);
        });

        it('should handle container', function () {
            var crumbs = getCrumbs.call(this, '/blah/');
            expect(crumbs).toEqual([home, blah]);
        });

        it('should handle objects', function () {
            var crumbs = getCrumbs.call(this, '/blah/a.txt');
            expect(crumbs).toEqual([home, blah, atxt]);
        });
    });
});
