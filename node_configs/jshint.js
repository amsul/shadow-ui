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
        'js/shadow.js'
    ],
    specs: [
        'tests/spec/**/*.js'
    ]
}