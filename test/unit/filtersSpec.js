'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('swiftBrowser.filters'));

  describe('humanReadable', function() {
    it('should add bytes to small numbers', inject(function(humanReadableFilter) {
      expect(humanReadableFilter(100)).toEqual('100.0 B');
      expect(humanReadableFilter(1500)).toEqual('1.5 KB');
      expect(humanReadableFilter(2500000)).toEqual('2.5 MB');
    }));
  });
});
