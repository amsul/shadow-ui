/*jshint node: true*/

'use strict';

module.exports = {
    src: [
        'js/shadow.js'
    ],
    options: {
        specs: 'tests/spec/**/*.js',
        vendor: [
            'tests/jquery/jquery.1.7.0.js'
        ]
    }
}