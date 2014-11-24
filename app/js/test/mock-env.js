/* extra stuff */

'use strict';

window.addEventListener('DOMContentLoaded', function () {
    angular.module('swiftBrowserE2E').run(function (swiftSim) {
        var text = [
            'Hey, this is some text. Have fun editing it!',
            '',
            '--Sincerely, the Swift Browser developers'
        ];
        var python = [
            'import math',
            '',
            'def primes(n):',
            '    """',
            '    Find all primes less than n.',
            '',
            '    >>> primes(3)',
            '    [2]',
            '    >>> primes(15)',
            '    [2, 3, 5, 7, 11, 13]',
            '    """',
            '    candidates = [True] * n',
            '    candidates[0] = candidates[1] = False',
            '    stop = int(math.sqrt(n))',
            '    for i in range(2, stop + 1):',
            '        if candidates[i]:',
            '            for j in range(2 * i, n, i):',
            '                candidates[j] = False',
            '    return [i for (i, c) in enumerate(candidates) if c]',
            '',
            'print "Primes below 20:", ", ".join(map(str, primes(20)))'
        ];
        var html = [
            '<!DOCTYPE html>',
            '<html>',
            '  <head>',
            '    <meta charset="utf-8">',
            '    <title>Test Page</title>',
            '  </head>',
            '',
            '  <body>',
            '    <h1>Welcome!</h1>',
            '    <p><i>Pretty</i> <a href="other.html">cool</a>!</p>',
            '  </body>',
            '</html>'
        ];

        swiftSim.addContainer('empty container');
        swiftSim.setObjects('foo', {
            'x.txt': {content: text.join('\n')},
            'primes.py': {content: python.join('\n')},
            'nested/z.html': {content: html.join('\n')}
        });

        /* Simple linear congruential random generator */
        var rand = (function () {
            var state = 1;
            var a = 31;
            var c = 11;
            var m = 50;
            return function () {
                state = (a * state + c) % m;
                return state;
            };
        })();

        var large = {};
        for (var i = 0; i < 1234; i++) {
            var r = rand();
            var xs = new Array(r + 1).join('x');
            var content = [
                'This is object ' + i + '.',
                '',
                'Here are: ' + r + " x's: " + xs + '.'
            ];
            large['o-' + i] = {content: content.join('\n')};
        }
        swiftSim.setObjects('large', large);

        swiftSim.setObjects('deep', {
            'this/is/a/deeply/nested/object.txt': {
                content: 'Maybe we could short-circuit the directories?\n'
            }
        });

        swiftSim.setObjects('funny names', {
            '   leading spaces': {content: ''},
            'trailing spaces   ': {content: ''},
            'Danish word: blåbærgrød': {
                content: 'This word means "blueberry porridge".\n'
            },
            'Japanese word: ブルーベリー': {
                content: 'Google Translate says this means "blueberry".\n'
            }
        });
    });
    angular.resumeBootstrap(['swiftBrowserE2E']);
});
