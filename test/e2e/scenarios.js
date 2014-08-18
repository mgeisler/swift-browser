'use strict';

describe('my app', function() {

  browser.get('index.html');

  it('should redirect to /#/ when fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("#/");
  });

});


describe('Container listing', function () {

    beforeEach(function () {
        browser.addMockModule('swiftBrowserE2E', function () {
            if (!window.e2e_angular_mocks_loaded) {
                var script = document.createElement('script');
                script.src = 'bower_components/angular-mocks/angular-mocks.js';
                document.body.appendChild(script);
                window.e2e_angular_mocks_loaded = true;
            }
            angular.module('swiftBrowserE2E', ['ngMockE2E']);
        });
    });

    it('should be sortable', function () {
        browser.addMockModule('swiftBrowserE2E', function () {
            angular.module('swiftBrowserE2E').run(function($httpBackend) {
                $httpBackend.whenGET('/app/index.html?format=json').respond([
                        {name: "bar", count: 20, bytes: 1234},
                        {name: "foo", count: 10, bytes: 2345}
                    ]);
                    $httpBackend.whenGET(/.*/).passThrough();
            });
        });

        function mapGetText(locator) {
            return element.all(locator).map(function (el) {
                return el.getText()
            });
        }

        browser.get('index.html#/');
        var rows = by.repeater('container in containers');
        var names = rows.column('{{ container.name }}');

        // Initial sort order is by name
        expect(mapGetText(names)).toEqual(['bar', 'foo']);

        // Clicking the name header sorts reverses the order
        element(by.css('th')).click();
        expect(mapGetText(names)).toEqual(['foo', 'bar']);
    });

});
