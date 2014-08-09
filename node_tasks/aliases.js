/*jshint node: true*/

'use strict';

module.exports = function(grunt) {

    grunt.registerTask('develop', ['uglify:develop', 'jekyll:develop', 'connect:develop', 'watch:develop'])
    grunt.registerTask('test', ['jshint', 'jasmine'])
    grunt.registerTask('build', ['uglify:develop', 'uglify:build'])
    grunt.registerTask('release', function(version) {
        if ( !version ) {
            grunt.fail.fatal('A release version must be specified.')
        }
        ['package.json', 'bower.json', 'shadow.jquery.json'].forEach(function(path) {
            var config = grunt.file.readJSON(path);
            config.version = version;
            grunt.file.write(path, JSON.stringify(config, null, '  '));
            grunt.log.ok('Updated ' + path + ' to version ' + version);
            if ( path == 'package.json' ) {
                grunt.config.set('pkg', config);
            }
        });
        grunt.task.run('build')
    })

}