/*jshint node: true*/

'use strict';

module.exports = {
    options: {
        style: 'expanded'
    },
    themes: {
        expand: true,
        cwd: 'less',
        src: ['*.less', '!_*.less'],
        dest: 'css',
        ext: '.css'
    },
    assets: {
        files: {
            'assets/css/main.css': 'assets/less/main.less'
        }
    }
}