/*jshint node: true*/

'use strict';

var grunt = require('grunt')

module.exports = {
    develop: {
        options: {
            port: grunt.option('port') || 4001
        }
    }
}