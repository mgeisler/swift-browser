'use strict';

var SwiftMock = require('../swift-mock.js');
var path = require('path');
var tmp = require('tmp');
var Q = require('q');

var mktemp = Q.nfbind(tmp.file);

describe('my app', function() {
    it('should redirect to /#/ when fragment is empty', function() {
        browser.get('index.html');
        expect(browser.getLocationAbsUrl()).toEqual("/");
    });
});

function uploadFile(path) {
    browser.executeScript(function () {
        $('#file-1').removeClass('hidden');
    }).then(function () {
        $('#file-1').sendKeys(path);
    });
}

describe('Container listing', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    describe('should be sortable', function () {
        beforeEach(function () {
            SwiftMock.setObjects('foo', {
                'x.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 1000,
                    'Content-Type': 'text/plain'
                }},
                'y.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 234,
                    'Content-Type': 'text/plain'
                }}
            });
            SwiftMock.setObjects('bar', {
                'x.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 2345,
                    'Content-Type': 'text/plain'
                }}
            });
            browser.get('index.html#/');
        });

        it('by name', function () {
            var rows = by.repeater('container in containers');
            var names = element.all(rows.column('container.name'));

            // Initial sort order is by name
            expect(names.getText()).toEqual(['bar', 'foo']);
            // Clicking the name header sorts reverses the order
            $('th:nth-child(2)').click();
            expect(names.getText()).toEqual(['foo', 'bar']);
        });

        it('by size', function () {
            var sizes = $$('td:nth-child(3)');

            // Initial sort is by name
            expect(sizes.getText()).toEqual(['2.3 KB', '1.2 KB']);
            // Clicking the header sorts
            $$('th').get(2).click();
            expect(sizes.getText()).toEqual(['1.2 KB', '2.3 KB']);
            // Clicking again reverses
            $$('th').get(2).click();
            expect(sizes.getText()).toEqual(['2.3 KB', '1.2 KB']);
        });

        it('by count', function () {
            var rows = by.repeater('container in containers');
            var counts = element.all(rows.column('container.count | number'));

            // Initial sort order is by name
            expect(counts.getText()).toEqual(['1 objects', '2 objects']);
            // Clicking the header sorts (no change)
            $$('th').get(3).click();
            expect(counts.getText()).toEqual(['1 objects', '2 objects']);
            // Clicking the header sorts reverses the order
            $$('th').get(3).click();
            expect(counts.getText()).toEqual(['2 objects', '1 objects']);
        });
    });

    describe('selection', function () {
        beforeEach(function () {
            SwiftMock.addContainer('foo');
            SwiftMock.addContainer('bar');
            browser.get('index.html#/');
        });

        var toggle = $('th.toggle input');
        var checkboxes = $$('td:nth-child(1) input');

        it('should be deselected by default', function () {
            expect(toggle.isSelected()).toBe(false);
            expect(checkboxes.isSelected()).toEqual([false, false]);
        });

        it('should allow toggle all', function () {
            toggle.click();
            expect(checkboxes.isSelected()).toEqual([true, true]);
        });

        it('should notice manually selecting all', function () {
            checkboxes.click();
            expect(toggle.isSelected()).toBe(true);
        });
    });

    describe('with no containers', function () {
        it('should not show all containers selected', function () {
            browser.get('index.html#/');

            var toggle = $('th.toggle input');
            expect(toggle.isSelected()).toBe(false);
        });
    });
});


describe('Object listing', function () {
    beforeEach(SwiftMock.loadAngularMocks);

    describe('should be sortable', function () {
        beforeEach(function () {
            SwiftMock.setObjects('foo', {
                'x.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 20,
                    'Content-Type': 'text/plain'
                }},
                'y.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 10,
                    'Content-Type': 'text/plain'
                }}
            });
            browser.get('index.html#/foo/');
        });

        it('by name', function () {
            var rows = by.repeater('item in items');
            var names = element.all(rows.column('item.title'));

            // Initial sort order is by name
            expect(names.getText()).toEqual(['x.txt', 'y.txt']);
            // Clicking the name header sorts reverses the order
            $$('th').get(1).click();
            expect(names.getText()).toEqual(['y.txt', 'x.txt']);
        });

        it('by size', function () {
            var sizes = $$('td:last-child');

            // Initial sort order is by name
            expect(sizes.getText()).toEqual(['20.0 B', '10.0 B']);
            // Clicking the header sorts
            $('th:last-child').click();
            expect(sizes.getText()).toEqual(['10.0 B', '20.0 B']);
        });
    });

    it('should understand pseudo-directories', function () {
        SwiftMock.setObjects('foo', {
            'x.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 13,
                'Content-Type': 'text/plain'
            }},
            'dir/y.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }},
        });
        browser.get('index.html#/foo/');

        var names = $$('td:nth-child(2)');
        expect(names.getText()).toEqual(['dir/', 'x.txt']);
    });

    it('should understand deep pseudo-directories', function () {
        SwiftMock.setObjects('foo', {
            'x.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 13,
                'Content-Type': 'text/plain'
            }},
            'deeply/y.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }},
            'deeply/nested/z.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/foo/');

        var links = $$('td:nth-child(2) a');
        expect(links.getText()).toEqual(['deeply/', 'x.txt']);
        links.first().click();

        expect(links.getText()).toEqual(['nested/', 'y.txt']);
        links.first().click();

        expect(links.getText()).toEqual(['z.txt']);
    });

    describe('selection', function () {
        beforeEach(function () {
            SwiftMock.setObjects('foo', {
                'x.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 20,
                    'Content-Type': 'text/plain'
                }},
                'y.txt': {headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Length': 10,
                    'Content-Type': 'text/plain'
                }}
            });
            browser.get('index.html#/foo/');
        });

        var toggle = $('th.toggle input');
        var checkboxes = $$('td:nth-child(1) input');

        it('should be deselected by default', function () {
            expect(toggle.isSelected()).toBe(false);
            expect(checkboxes.isSelected()).toEqual([false, false]);
        });

        it('should allow toggle all', function () {
            toggle.click();
            expect(checkboxes.isSelected()).toEqual([true, true]);
        });

        it('should notice manually selecting all', function () {
            checkboxes.click();
            expect(toggle.isSelected()).toBe(true);
        });
    });

    describe('with no objects', function () {
        it('should not show all objects selected', function () {
            SwiftMock.addContainer('foo');
            browser.get('index.html#/foo/');

            var toggle = $('th.toggle input');
            expect(toggle.isSelected()).toBe(false);
        });
    });

    it('should allow deletion', function () {
        SwiftMock.setObjects('foo', {
            'x.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }},
            'y.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }},
            'z.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/foo/');
        var names = $$('td:nth-child(2)');
        var checkboxes = $$('td:nth-child(1) input');
        var deleteBtn = $('.btn[ng-click="delete()"]');

        checkboxes.get(0).click();
        checkboxes.get(2).click();
        deleteBtn.click();

        var modalNames = $$('div.modal td:nth-child(2)');
        var modalCheckboxes = $$('div.modal td:nth-child(1) input');
        var modalTitle = $('div.modal h3');
        var closeBtn = $('div.modal .btn[ng-click="$close()"]');

        expect(modalTitle.getText()).toMatch('Deleting 2 objects');
        expect(modalNames.getText()).toEqual(['x.txt', 'z.txt']);
        expect(modalCheckboxes.isSelected()).toEqual([true, true]);

        $('div.modal th:nth-child(1) input').click();
        expect(modalCheckboxes.isSelected()).toEqual([false, false]);
        expect(closeBtn.isEnabled()).toBe(false);

        modalCheckboxes.last().click();
        expect(modalTitle.getText()).toMatch('Deleting 1 objects');

        closeBtn.click();
        expect(modalTitle.isPresent()).toBe(false);

        expect(checkboxes.isSelected()).toEqual([true, false]);
        expect(names.getText()).toEqual(['x.txt', 'y.txt']);
    });

    it('should allow deleting pseudo-directories', function () {
        SwiftMock.setObjects('foo', {
            'x.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }},
            'bar/y.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }},
            'bar/z.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 10,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/foo/');

        var names = $$('td:nth-child(2)');
        var modalNames = $$('div.modal td:nth-child(2)');
        var deleteBtn = $('.btn[ng-click="delete()"]');
        var closeBtn = $('div.modal .btn[ng-click="$close()"]');

        $$('td:nth-child(1) input').first().click();
        deleteBtn.click();
        expect(modalNames.getText()).toEqual(['bar/']);

        closeBtn.click();
        expect(names.getText()).toEqual(['x.txt']);
    });

    it('should allow uploading files', function () {
        SwiftMock.setObjects('foo', {
            'nested/x.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/foo/nested/');

        var uploadBtn = $('.btn[ng-click="upload()"]');
        var names = $$('td:nth-child(2)');
        expect(names.getText()).toEqual(['x.txt']);

        uploadBtn.click();
        expect($('div.modal h3').getText()).toMatch('to foo/nested/');

        // Test with two paths where the first sort after the second
        var p1 = mktemp({prefix: 'b'});
        var p2 = mktemp({prefix: 'a'});
        Q.all([p1, p2]).spread(function (res1, res2) {
            var paths = [res1[0], res2[0]];
            paths.forEach(uploadFile);

            var uploadBtn = $('.btn[ng-click="uploadFiles()"]');
            var rows = by.repeater('file in files');
            var uploads = element.all(rows.column('file.name'));
            var newNames = paths.map(path.basename);
            expect(uploads.getText()).toEqual(newNames);

            expect(uploadBtn.isEnabled()).toBe(true);
            uploadBtn.click();
            var progBar = $$('div.progress-bar').first();
            expect(progBar.getAttribute('aria-valuenow')).toBe('100');
            expect(uploadBtn.isEnabled()).toBe(false);

            $('.btn[ng-click="$dismiss()"]').click();
            expect($('div.modal h3').isPresent()).toBe(false);

            var expected = paths.map(path.basename);
            expected.push('x.txt');
            expected.sort();
            expect(names.getText()).toEqual(expected);
        });
    });

    it('should allow unscheduling files for upload', function () {
        SwiftMock.addContainer('foo');
        browser.get('index.html#/foo/');

        var names = $$('td:nth-child(2)');
        $('.btn[ng-click="upload()"]').click();

        Q.all([mktemp(), mktemp()]).spread(function (res1, res2) {
            var paths = [res1[0], res2[0]];
            var rows = by.repeater('file in files');
            var uploads = element.all(rows.column('file.name'));
            var base = path.basename(paths[1]);
            paths.forEach(uploadFile);

            // Remove the first file, expect that the second is still
            // there and that it's the only one.
            $$('a[ng-click="remove($index)"]').first().click();
            expect(uploads.getText()).toEqual([base]);

            $('.btn[ng-click="uploadFiles()"]').click();
            $('.btn[ng-click="$dismiss()"]').click();
            expect(names.getText()).toEqual([base]);
        });
    });

});

describe('Listing a pseudo-directory', function () {
    it('should add traling slash', function() {
        SwiftMock.loadAngularMocks();
        SwiftMock.setObjects('foo', {
            'bar/baz.txt': {headers: {
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain'
            }}
        });
        browser.get('index.html#/foo/bar');

        var url = browser.getLocationAbsUrl();
        expect(url).toEqual("/foo/bar/");
    });
});

describe('Object metadata', function () {
    beforeEach(function () {
        SwiftMock.loadAngularMocks();
        SwiftMock.setObjects('foo', {
            'bar/baz.txt': {headers: {
                'ETag': '401b30e3b8b5d629635a5c613cdb7919',
                'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                'Content-Length': 20,
                'Content-Type': 'text/plain',
                'Content-Encoding': 'gzip'
            }}
        });
        browser.get('index.html#/foo/bar/baz.txt');
    });

    function td(rows, row, col) {
        col += 1; // css child selectors are 1-based
        return element(rows.row(row)).$('td:nth-child(' + col + ')');
    }
    function getText(el) {
        return el.getText();
    }
    function textInRow(rows, idx) {
        return element(rows.row(idx)).$$('td').map(getText);
    }

    it('should show metadata', function () {
        var rows = by.repeater('header in headers.sys');
        expect(element.all(rows).count()).toEqual(5);

        expect(textInRow(rows, 0)).toEqual([
            'etag', '401b30e3b8b5d629635a5c613cdb7919', ''
        ]);
        expect(textInRow(rows, 1)).toEqual([
            'last-modified', 'Sat, 16 Aug 2014 13:33:21 GMT', ''
        ]);
        expect(textInRow(rows, 2)).toEqual([
            'content-length', '20', ''
        ]);
        var input = td(rows, 3, 1).$('input');
        expect(td(rows, 3, 0).getText()).toEqual('content-type');
        expect(input.getAttribute('value')).toEqual('text/plain');
    });

    it('should allow editing metadata', function () {
        var rows = by.repeater('header in headers.sys');
        var contentType = td(rows, 3, 1).$('input');
        var saveBtn = $('.btn[ng-click="save()"]');

        expect(saveBtn.isEnabled()).toBe(false);
        contentType.clear();
        contentType.sendKeys('image/png');
        expect(saveBtn.isEnabled()).toBe(true);
        saveBtn.click();

        // Reload data from simulator
        $$('.breadcrumb a').last().click();
        $('td a').click();

        expect(contentType.getAttribute('value')).toEqual('image/png');
    });

    it('should allow adding system headers', function () {
        var rows = by.repeater('header in headers.sys');
        var saveBtn = $('.btn[ng-click="save()"]');
        var addBtn = $('.btn[ng-click="add(\'sys\')"]');
        var options = element.all(
            by.options('name for name in removableHeaders')
        );
        var input = td(rows, 5, 1).$('input');
        var p = td(rows, 5, 0).$('p');

        addBtn.click();
        expect(options.getText()).toEqual([
            'content-encoding', 'content-disposition', 'x-delete-at'
        ]);
        expect(options.get(0).isSelected()).toBe(true);
        options.get(1).click();
        input.sendKeys('attachement');

        saveBtn.click();
        expect(options.count()).toBe(0);
        expect(p.getText()).toEqual('content-disposition');

        // Reload data from simulator
        $$('.breadcrumb a').last().click();
        $('td a').click();

        expect(p.getText()).toEqual('content-disposition');
    });

    it('should allow adding metadata', function () {
        var rows = by.repeater('header in headers.meta');
        var saveBtn = $('.btn[ng-click="save()"]');
        var addBtn = $('.btn[ng-click="add(\'meta\')"]');
        var input = td(rows, 0, 0).$('input');
        var p = td(rows, 0, 0).$('p');

        addBtn.click();
        expect(input.getAttribute('value')).toEqual('x-object-meta-');

        input.sendKeys('foobar');
        saveBtn.click();
        expect(input.isPresent()).toBe(false);
        expect(p.getText()).toEqual('x-object-meta-foobar');

        // Reload data from simulator
        $$('.breadcrumb a').last().click();
        $('td a').click();

        expect(p.getText()).toEqual('x-object-meta-foobar');
    });

    it('should allow removing headers', function () {
        var rows = by.repeater('header in headers.sys');
        var names = element.all(rows.column('header.name'));
        var trashLink = td(rows, 4, 2).$('a');
        var saveBtn = $('.btn[ng-click="save()"]');

        expect(names.getText()).toEqual([
            'etag',
            'last-modified',
            'content-length',
            'content-type',
            'content-encoding'
        ]);
        trashLink.click();
        expect(names.getText()).toEqual([
            'etag',
            'last-modified',
            'content-length',
            'content-type'
        ]);
        saveBtn.click();

        // Reload data from simulator
        $$('.breadcrumb a').last().click();
        $('td a').click();
        expect(names.getText()).toEqual([
            'etag',
            'last-modified',
            'content-length',
            'content-type'
        ]);
    });

    it('should not allow removing the Content-Type header', function () {
        var rows = by.repeater('header in headers.sys');
        expect(td(rows, 3, 0).getText()).toEqual('content-type');
        expect(td(rows, 3, 2).$('a').isPresent()).toBe(false);
    });
});

describe('Object content', function () {
    beforeEach(function () {
        SwiftMock.loadAngularMocks();
        SwiftMock.setObjects('foo', {
            'bar.html': {
                headers: {
                    'Last-Modified': 'Sat, 16 Aug 2014 13:33:21 GMT',
                    'Content-Type': 'text/html'
                },
                content: 'Hello <i>World</i>\n'
            }
        });
        browser.get('index.html#/foo/bar.html');
    });

    it('should allow showing object content', function () {
        var showBtn = $('a[ng-click="show()"]');
        var content = $('.CodeMirror-code');
        showBtn.click();
        expect(content.getText()).toEqual('Hello <i>World</i>');
    });
});
