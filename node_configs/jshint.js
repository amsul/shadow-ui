/*jshint node: true*/

'use strict';

module.exports = {
    options: {
        jshintrc: '.jshintrc'
    },
    configuration: [
        'Gruntfile.js',
        'node_configs',
        'node_tasks'
    ],
    library: [
        'js/**/*.js'
    ],
    specs: [
        'js/tests/spec/**/*.js'
    ]
}