/*jshint node: true*/

'use strict';

module.exports = {
    develop: {
        files: ['js/source/**/*.js'],
        tasks: ['uglify:develop']
    },
    library: {
        files: ['js/source/**/*.js', 'docs-theme/**/*.css', 'docs-theme/**/*.handlebars'],
        tasks: ['yuidoc:library']
    }
}