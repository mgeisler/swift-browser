/* eslint-env node */
module.exports = function(grunt) {
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
        exec: {
            webdriver: {
                cmd: "node_modules/.bin/webdriver-manager update"
            },
            'build-tar': {
                cwd: '<%= build.dir %>',
                cmd: 'tar -czf <%= build.name %>.tar.gz <%= build.name %>'
            },
            'build-zip': {
                cwd: '<%= build.dir %>',
                cmd: 'zip -qr <%= build.name %>.zip <%= build.name %>'
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
                     dest: '<%= build.dir %>/<%= build.name %>'},
                    {expand: true,
                     cwd: 'app',
                     src: [
                         'index.html',
                         'partials/*.html',
                         'js/*.js',
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

    });

    grunt.registerTask('update-webdriver', ['exec:webdriver']);
    grunt.registerTask('start', ['connect:server']);
    grunt.registerTask('coverage', [
        'copy:e2e', 'instrument', 'protractor_coverage', 'makeReport'
    ]);
    grunt.registerTask('build', [
        'clean:build', 'copy:build', 'exec:build-tar', 'exec:build-zip'
    ]);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-coverage');
    grunt.loadNpmTasks('grunt-protractor-runner');
};
