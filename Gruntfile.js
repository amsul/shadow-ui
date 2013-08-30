
module.exports = function( grunt ) {


    // Read the configuration file.
    var config = grunt.file.readYAML( '_config.yml' )


    // Add the “curly” template delimiters.
    grunt.template.addDelimiters( 'curly', '{%', '%}' )


    // Setup the initial configurations.
    grunt.initConfig({


        // Add the package data.
        pkg: config,


        // Copy over files to destination directions.
        copy: {
            pkg: {
                options: {
                    processContent: function() {
                        return grunt.template.process( JSON.stringify( config ) )
                    }
                },
                files: [
                    { 'shadow.jquery.json': '_config.yml' },
                    { 'package.json': '_config.yml' }
                ]
            },
            main: {
                options: {
                    processContent: function( content ) {
                        return grunt.template.process( content, { delimiters: 'curly' } )
                    }
                },
                files: [
                    { 'README.md': 'README.source.md' },
                    { 'js/shadow.js': 'js/shadow.source.js' }
                ]
            }
        },


        // Compile LESS into CSS.
        less: {
            options: {
                style: 'expanded'
            },
            themes: {
                expand: true,
                cwd: 'less',
                src: [ '*.less', '!_*.less' ],
                dest: 'css',
                ext: '.css'
            },
            assets: {
                files: {
                    'assets/css/main.css': 'assets/less/main.less'
                }
            }
        },


        // Concatenate the files and add the banner.
        concat: {
            options: {
                process: function( content ) {
                    return grunt.template.process( content, { delimiters: 'curly' } )
                }
            }
        },


        // Minify all the things!
        uglify: {
            options: {
                preserveComments: 'some'
            }
        },
        cssmin: {
        },


        // Lint the files.
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: 'Gruntfile.js',
            main: [ 'js/shadow.js' ],
            extensions: [ 'js/extensions/*.js' ],
            tests: [ 'js/tests/units/*.js' ]
        },


        // Unit test the files.
        qunit: {
            all: [ 'js/tests/units/index.html' ]
        },


        // Watch the project files.
        watch: {
            main: {
                files: [ 'js/*.source.js', '*.source.md' ],
                tasks: [ 'copy:main' ]
            },
            themes: {
                files: [ 'less/*.less' ],
                tasks: [ 'less:themes' ]
            },
            tests: {
                files: [ 'js/tests/**/*' ],
                tasks: [ 'qunit' ]
            }
        },


        // Any extra data needed in rendering static files.
        meta: {

            // Get the min & gzip size of a text file.
            fileSize: function( content ) {
                return {
                    min: content.length || 0,
                    gzip: content ? require( 'zlib-browserify' ).gzipSync( content ).length : 0
                }
            }
        }
    }) //grunt.initConfig


    // Load the NPM tasks.
    grunt.loadNpmTasks( 'grunt-contrib-concat' )
    grunt.loadNpmTasks( 'grunt-contrib-watch' )
    grunt.loadNpmTasks( 'grunt-contrib-jshint' )
    grunt.loadNpmTasks( 'grunt-contrib-qunit' )
    grunt.loadNpmTasks( 'grunt-contrib-copy' )
    grunt.loadNpmTasks( 'grunt-contrib-less' )
    grunt.loadNpmTasks( 'grunt-contrib-clean' )
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' )
    grunt.loadNpmTasks( 'grunt-contrib-uglify' )


    // Register the tasks.
    grunt.registerTask( 'default', [ 'copy', 'less' ] )
    grunt.registerTask( 'strict', [ 'copy', 'less', 'jshint', 'qunit' ] )
    grunt.registerTask( 'travis', [ 'jshint', 'qunit' ] )

} //module.exports

