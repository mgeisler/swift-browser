/* eslint-env node */

'use strict';

var path = require('path');

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    // Generate a configuration that simply runs ngAnnotate on all
    // input files.
    var ngAnnotateStep = {
        name: 'ngAnnotate',
        createConfig: function (context) {
            var cfg = {files: []};
            context.inFiles.forEach(function (file) {
                context.outFiles.push(file);
                var src = path.join(context.inDir, file);
                var dest = path.join(context.outDir, file);
                cfg.files.push({src: [src], dest: dest});
            });
            return cfg;
        }
    };

    // The same as defaultBlockReplacements.js in
    // grunt-usemin/lib/fileprocessor
    function ngAnnotateReplacement (block) {
        var defer = block.defer ? 'defer ' : '';
        var async = block.async ? 'async ' : '';
        return ('<script ' + defer + async +
                'src="' + block.dest + '"><\/script>');
    }

    // Simply return the raw block, removing the extra whitespace
    // inserted in front of it.
    function passThrough (block) {
        return block.raw.join('\n').trim();
    }

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
            target: ['*.js', 'app/js', 'test'],
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
                options: {
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
                cmd: 'node_modules/.bin/webdriver-manager update'
            }
        },

        clean: {
            build: {
                src: ['<%= build.dir %>']
            }
        },

        preprocess: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: ['index.html'],
                    dest: '<%= build.dir %>'
                }]
            },
            mock: {
                src: 'app/index.html',
                dest: 'app/mock.html',
                options: {
                    context: {
                        MOCK: true
                    }
                }
            }
        },

        /* The useminPrepare:html task will trigger expansion of the
           message template below, and this fails if we don't define a
           dummy value. */
        gitinfo: {local: {branch: {current: {shortSHA: 'unknown'}}}},

        'gh-pages': {
            options: {
                base: '<%= build.dir %>',
                clone: '.tmp/gh-pages',
                message: ('Auto-generated commit based on ' +
                          '<%= gitinfo.local.branch.current.shortSHA %>')
            },
            src: '**/*'
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
                     cwd: 'app/bower_components',
                     src: [
                         'codemirror/mode/**/*.js',
                         '!codemirror/mode/**/test.js'
                     ],
                     dest: '<%= build.dir %>/bower_components'},
                    /* The Bootstrap CSS references the fonts as
                     * ../fonts, so put them in the correct place
                     * relative to the concatenated CSS. */
                    {expand: true,
                     flatten: true,
                     src: 'app/bower_components/bootstrap/dist/fonts/*',
                     dest: '<%= build.dir %>/fonts'}
                ]
            },
            mock: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: [
                        'bower_components/angular-mocks/angular-mocks.js',
                        'bower_components/spark-md5/spark-md5.js',
                        'js/test/*.js'
                    ],
                    dest: '<%= build.dir %>'
                }]
            },
            partials: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: 'partials/*.html',
                    dest: '<%= build.dir %>'
                }]
            }
        },
        instrument: {
            files: 'app/js/**/*.js',
            options: {
                basePath: 'coverage/instrumented'
            }
        },
        'protractor_coverage': {
            e2e: {
                options: {
                    coverageDir: 'coverage',
                    args: {
                        baseUrl: ('http://localhost:8000/' +
                                  'coverage/instrumented/app/'),
                        specs: ['test/e2e/*.js']
                    },
                    configFile: 'test/protractor-conf.js'
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

        ngAnnotate: {
            options: {
                singleQuotes: true
            }
        },

        angularTemplateCache: {
            options: {
                module: 'swiftBrowser'
            },
            build: {
                src: 'partials/*.html',
                dest: path.join('<%= useminPrepare.options.staging %>',
                                ngAnnotateStep.name, 'js/partials.js'),
                cwd: 'app'
            }
        },

        useminPrepare: {
            html: 'app/index.html',
            options: {
                flow: {
                    steps: {
                        js: ['concat', 'uglifyjs'],
                        css: ['concat', 'cssmin'],
                        ngannotate: [ngAnnotateStep, 'concat', 'uglifyjs']
                    },
                    post: []
                },
                dest: '<%= build.dir %>',
                staging: '.tmp'
            }
        },
        filerev: {
            build: {
                src: [
                    '<%= build.dir %>/js/*.js',
                    '<%= build.dir %>/css/*.css'
                ]
            },
            mock: {
                src: '<%= build.dir %>/js/bower_components.js'
            }
        },
        usemin: {
            html: '<%= build.dir %>/index.html',
            options: {
                blockReplacements: {
                    ngannotate: ngAnnotateReplacement
                }
            }
        }
    });

    grunt.registerTask('update-webdriver', ['exec:webdriver']);
    grunt.registerTask('start', ['connect:server']);
    grunt.registerTask('coverage', [
        'copy:e2e', 'instrument', 'protractor_coverage', 'makeReport'
    ]);
    grunt.registerTask('build', [
        'clean:build',
        'preprocess:build',
        'copy:build',
        'useminPrepare',
        'ngAnnotate:generated',
        'angularTemplateCache:build',
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
            }
        });

        grunt.task.run('build');
        grunt.task.run('copy:mock');
        grunt.task.run('protractor');
    });

    grunt.registerTask('mock', ['preprocess:mock']);

    grunt.registerTask('publish-gh-pages', 'Publish mock version', function () {
        // Copy files instead of annotating them
        ngAnnotateStep.name = 'copy';
        grunt.config.set('build.name', 'mock');
        grunt.config.set('preprocess.mock.dest', '<%= build.dir %>/index.html');
        grunt.config.set('useminPrepare.html', 'app/mock.html');
        grunt.config.set('usemin.options.blockReplacements',
                         {ngannotate: passThrough});
        grunt.config.set('useminPrepare.options.flow.steps.ngannotate',
                         [ngAnnotateStep]);

        grunt.task.run('gitinfo');
        grunt.task.run('clean:build');
        grunt.task.run('preprocess:mock');
        grunt.task.run('copy:build');
        grunt.task.run('copy:mock');
        grunt.task.run('copy:partials');
        grunt.task.run('useminPrepare');
        grunt.task.run('copy:generated');
        grunt.task.run('concat:generated');
        grunt.task.run('cssmin:generated');
        grunt.task.run('uglify:generated');
        grunt.task.run('filerev:mock');
        grunt.task.run('usemin');
        grunt.task.run('gh-pages');
    });
};
