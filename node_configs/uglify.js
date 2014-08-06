/*jshint node: true*/

'use strict';

var grunt = require('grunt')

module.exports = {
    main: {
        options: {
            sourceMap: true,
            mangle: false,
            compress: false,
            beautify: true,
            preserveComments: 'all',
            banner: grunt.file.read('js/source/_header.js'),
            footer: grunt.file.read('js/source/_footer.js')
        },
        files: {
            'js/shadow.js': [
                'js/source/core.js',
                'js/source/build.js',
                'js/source/helpers.js',
                'js/source/objects/Object.js',
                'js/source/objects/Date.js',
                'js/source/objects/Element.js',
                'js/source/objects/DataElement.js'
            ]
        }
    }
}