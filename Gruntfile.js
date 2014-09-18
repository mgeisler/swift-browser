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
        },
        protractor: {
            all: {
                options :{
                    configFile: 'test/protractor-conf.js'
                }
            }
        },
        coveralls: {
            target: {
                src: 'coverage/lcov.info'
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-coveralls');
};
