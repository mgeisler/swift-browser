/* eslint-env node */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build: {
            base: 'build',
            name: '<%= pkg.name %>-<%= pkg.version %>',
            dir: '<%= build.base %>/<%= build.name %>'
        },

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
        compress: {
            options: {
                pretty: true,
                level: 6
            },
            'build-tar': {
                options: {
                    archive: '<%= build.dir %>.tar.gz'
                },
                files: [{
                    expand: true,
                    cwd: '<%= build.base %>',
                    src: '<%= build.name %>/**'
                }]
            },
            'build-zip': {
                options: {
                    archive: '<%= build.dir %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= build.base %>',
                    src: '<%= build.name %>/**'
                }]
            }
        },
        exec: {
            webdriver: {
                cmd: "node_modules/.bin/webdriver-manager update"
            }
        },

        concat: {
            coverage: {
                src: ['coverage/lcov.info', 'coverage/e2e/lcov.info'],
                dest: 'coverage/merged.info'
            }
        },

        coveralls: {
            target: {
                src: 'coverage/merged.info'
            }
        },

        clean: {
            build: {
                src: ['<%= build.dir %>']
            }
        },

        copy: {
            e2e: {
                src: ['app/**/*', '!**/*.orig', '!**/*~'],
                dest: 'coverage/instrumented/'
            },
            build: {
                files: [
                    {expand: true,
                     src: [
                         'README.md',
                         'LICENSE'
                     ],
                     dest: '<%= build.dir %>'},
                    {expand: true,
                     cwd: 'app',
                     src: [
                         'index.html',
                         'partials/*.html'
                     ],
                     dest: '<%= build.dir %>'},
                    {expand: true,
                     cwd: 'app/bower_components',
                     src: [
                         'bootstrap/dist/fonts/*',
                         'codemirror/mode/**/*.js',
                         '!codemirror/mode/**/test.js'
                     ],
                     dest: '<%= build.dir %>/bower_components'}
                ]
            }
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
                dir: 'coverage/e2e'
            }
        },

        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: '<%= build.dir %>'
            }
        },
        filerev: {
            build: {
                src: [
                    '<%= build.dir %>/js/*.js',
                    '<%= build.dir %>/css/*.css'
                ]
            }
        },
        usemin: {
            html: '<%= build.dir %>/index.html'
        }
    });

    grunt.registerTask('update-webdriver', ['exec:webdriver']);
    grunt.registerTask('start', ['connect:server']);
    grunt.registerTask('coverage', [
        'copy:e2e', 'instrument', 'protractor_coverage', 'makeReport'
    ]);
    grunt.registerTask('build', [
        'clean:build',
        'copy:build',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev:build',
        'usemin',
        'compress'
    ]);
    grunt.registerTask('e2e-build', 'Run E2E tests on build', function () {
        var base = 'http://localhost:8000/<%= build.dir %>/';
        grunt.config.merge({
            protractor: {
                options: {
                    args: {
                        baseUrl: base
                    }
                }
            },
            copy: {
                extra: {
                    files: [{
                        expand: true,
                        cwd: 'app',
                        src: [
                            'bower_components/angular-mocks/angular-mocks.js',
                            'bower_components/spark-md5/spark-md5.js',
                            'js/test/swift-simulator.js'
                        ],
                        dest: '<%= build.dir %>'
                    }]
                }
            }
        });

        grunt.task.run('build');
        grunt.task.run('copy:extra');
        grunt.task.run('protractor');
    });
};
