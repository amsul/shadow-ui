/*jshint node: true*/

'use strict';

module.exports = {
    src: [
        'js/shadow.js'
    ],
    options: {
        specs: 'js/tests/spec/**/*.js',
        vendor: [
            'js/tests/jquery/jquery.1.7.0.js'
        ]
    }
}