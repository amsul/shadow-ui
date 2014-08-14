/*jshint node: true*/

'use strict';

module.exports = {
    library: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
            paths: 'js/source/',
            outdir: 'js/docs/',
            parseOnly: true
        }
    }
}