/* eslint-env node */
module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: ['app/js', 'test'],
            options: {
                config: '.eslintrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-eslint');
};
