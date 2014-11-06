/* eslint-env node */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build: {
            dir: 'build',
            name: '<%= pkg.name %>-<%= pkg.version %>'
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
                    archive: '<%= build.dir %>/<%= build.name %>.tar.gz'
                },
                files: [{
                    expand: true,
                    cwd: '<%= build.dir %>',
                    src: '<%= build.name %>/**'
                }]
            },
            'build-zip': {
                options: {
                    archive: '<%= build.dir %>/<%= build.name %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= build.dir %>',
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
            },
            post_build: {
                src: ['.tmp']
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
                     dest: '<%= build.dir %>/<%= build.name %>'},
                    {expand: true,
                     cwd: 'app',
                     src: [
                         'index.html',
                         'partials/*.html',
                         'css/*.css'
                     ],
                     dest: '<%= build.dir %>/<%= build.name %>'},
                    {expand: true,
                     cwd: 'app/bower_components',
                     src: [
                         'bootstrap/dist/css/bootstrap.css',
                         'bootstrap/dist/fonts/*',
                         'codemirror/lib/codemirror.css',
                         'codemirror/lib/codemirror.js',
                         'codemirror/mode/**/*.js',
                         '!codemirror/mode/**/test.js',
                         'codemirror/addon/mode/loadmode.js',
                         'ng-file-upload/angular-file-upload-html5-shim.js',
                         'angular/angular.js',
                         'ng-file-upload/angular-file-upload.js',
                         'angular-ui-router/release/angular-ui-router.js',
                         'angular-ui-codemirror/ui-codemirror.js',
                         'angular-bootstrap/ui-bootstrap-tpls.js'
                     ],
                     dest: '<%= build.dir %>/<%= build.name %>/bower_components'}
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
                dest: '<%= build.dir %>/<%= build.name %>'
            }
        },
        filerev: {
            build: {
                src: '<%= build.dir %>/<%= build.name %>/js/*.js'
            }
        },
        usemin: {
            html: '<%= build.dir %>/<%= build.name %>/index.html'
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
        'uglify:generated',
        'filerev:build',
        'usemin',
        'compress',
        'clean:post_build'
    ]);
};
