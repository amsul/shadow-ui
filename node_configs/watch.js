/*jshint node: true*/

'use strict';

module.exports = {
    main: {
        files: ['js/source/**/*.js', 'js/ui-*.js', 'less/*.less'],
        tasks: ['uglify:main', 'less:themes']
    },
    themes: {
        files: ['less/*.less'],
        tasks: ['less:themes']
    }
}