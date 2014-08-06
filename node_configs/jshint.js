/*jshint node: true*/

'use strict';

module.exports = {
    options: {
        jshintrc: '.jshintrc'
    },
    gruntfile: 'Gruntfile.js',
    main: ['js/shadow.js'],
    tests: ['js/tests/spec/**/*.js']
}