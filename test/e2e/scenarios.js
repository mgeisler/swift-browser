'use strict';

var SwiftSimulator = require('../swift-simulator.js');

describe('my app', function() {

  browser.get('index.html');

  it('should redirect to /#/ when fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("#/");
  });

});


function mapGetText(locator) {
    return element.all(locator).map(function (el) {
        return el.getText()
    });
}


describe('Container listing', function () {

    beforeEach(SwiftSimulator.loadAngularMocks);

    describe('should be sortable', function () {

        beforeEach(function () {
            SwiftSimulator.setContainers([
                {name: "bar", count: 20, bytes: 1234},
                {name: "foo", count: 10, bytes: 2345}
            ]);
            browser.get('index.html#/');
        });

        it('by name', function () {
            var rows = by.repeater('container in containers');
            var names = rows.column('{{ container.name }}');

            // Initial sort order is by name
            expect(mapGetText(names)).toEqual(['bar', 'foo']);
            // Clicking the name header sorts reverses the order
            element(by.css('th:first-child')).click();
            expect(mapGetText(names)).toEqual(['foo', 'bar']);
        });

        it('by size', function () {
            var sizes = by.css('td:nth-child(2)');

            // Initial sort
            expect(mapGetText(sizes)).toEqual(['1.2 KB', '2.3 KB']);
            // Sorting by size makes no change
            element.all(by.css('th')).get(1).click();
            expect(mapGetText(sizes)).toEqual(['1.2 KB', '2.3 KB']);
            // Clicking again reverses
            element.all(by.css('th')).get(1).click();
            expect(mapGetText(sizes)).toEqual(['2.3 KB', '1.2 KB']);
        });

        it('by count', function () {
            var rows = by.repeater('container in containers');
            var counts = rows.column('{{ container.count | number }}');

            // Initial sort order is by name
            expect(mapGetText(counts)).toEqual(['20 objects', '10 objects']);
            // Clicking the header sorts
            element.all(by.css('th')).get(2).click();
            expect(mapGetText(counts)).toEqual(['10 objects', '20 objects']);
            // Clicking the header sorts reverses the order
            element.all(by.css('th')).get(2).click();
            expect(mapGetText(counts)).toEqual(['20 objects', '10 objects']);
        });

    });

});
