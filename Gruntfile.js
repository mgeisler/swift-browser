/* eslint-env node */
module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: ['app/js', 'test'],
            options: {
                config: '.eslintrc'
            }
        },
        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            unit: {},
            single: {
                singleRun: true
            },
            coverage: {
                configFile: 'test/karma-coverage.conf.js'
            },
            travis: {
                configFile: 'test/karma-travis.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-karma');
};
