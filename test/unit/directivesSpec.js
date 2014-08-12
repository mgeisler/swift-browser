'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  beforeEach(module('swiftBrowser.directives'));

  describe('sb-version', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', '0.123');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span sb-version></span>')($rootScope);
        expect(element.text()).toEqual('0.123');
      });
    });
  });
});

