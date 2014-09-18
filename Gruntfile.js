/* eslint-env node */
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    debug: true,
                    keepalive: true
                }
            }
        },
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
        exec: {
            webdriver: {
                cmd: "node_modules/.bin/webdriver-manager update"
            }
        },
        coveralls: {
            target: {
                src: 'coverage/lcov.info'
            }
        },

        copy: {
            e2e: {
                src: ['app/**/*', '!**/*.orig', '!**/*~'],
                dest: 'coverage/instrumented/'
            },
        },
        instrument: {
            files: 'app/js/**/*.js',
            options: {
                basePath: "coverage/instrumented"
            }
        },
        protractor_coverage: {
            e2e: {
                options: {
                    coverageDir: 'coverage',
                    args: {
                        baseUrl: 'http://localhost:8000/coverage/instrumented/app/',
                        specs: ['test/e2e/*.js']
                    },
                    configFile: 'test/protractor-conf.js',
                }
            }
        },
        makeReport: {
            src: 'coverage/coverage.json',
            options: {
                type: 'lcov',
                dir: 'coverage/e2e',
                print: 'detail'
            }
        },

    });

    grunt.registerTask('update-webdriver', ['exec:webdriver']);
    grunt.registerTask('start', ['connect:server']);
    grunt.registerTask('coverage', [
        'copy', 'instrument', 'protractor_coverage', 'makeReport'
    ]);

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-protractor-coverage');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-istanbul');
};
