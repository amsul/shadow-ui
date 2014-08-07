/*jshint node: true*/

'use strict';

module.exports = function(grunt) {

    grunt.registerTask('develop', ['uglify:develop', 'jekyll:develop', 'connect:develop', 'watch:develop'])
    grunt.registerTask('test', ['jshint', 'jasmine'])
    grunt.registerTask('build', ['uglify:build'])

}