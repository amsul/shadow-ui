/*jshint node: true*/

'use strict';

module.exports = function(grunt) {

    grunt.registerTask('default', ['uglify', 'less'])
    grunt.registerTask('strict', ['uglify', 'less', 'jshint', 'jasmine'])
    grunt.registerTask('travis', ['jshint', 'jasmine'])

}