'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('swiftBrowser.filters'));

  describe('bytes', function() {
    it('should add bytes to small numbers', inject(function(bytesFilter) {
      expect(bytesFilter(100)).toEqual('100.0 B');
      expect(bytesFilter(1500)).toEqual('1.5 KB');
      expect(bytesFilter(2500000)).toEqual('2.5 MB');
    }));

    it('should use powers of 1000, not 1024', inject(function(bytesFilter) {
      expect(bytesFilter(4000)).toEqual('4.0 KB');
      expect(bytesFilter(4096)).toEqual('4.1 KB');
    }));

    it('should ignore non-numbers', inject(function(bytesFilter) {
        expect(bytesFilter(null)).toEqual(null);
        expect(bytesFilter('hey')).toEqual('hey');
    }));

    it('should parse strings as numbers', inject(function(bytesFilter) {
        expect(bytesFilter("123")).toEqual("123.0 B");
    }));
  });
});
