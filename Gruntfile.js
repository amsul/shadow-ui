
module.exports = function( grunt ) {


    // Read the package file.
    var packageJSON = grunt.file.readJSON( 'package.json' )


    // Add the “curly” template delimiters.
    grunt.template.addDelimiters( 'curly', '{%', '%}' )


    // Setup the initial configurations.
    grunt.initConfig({


        // Add the package data.
        pkg: packageJSON,


        // Copy over files to destination directions.
        copy: {
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
                files: [ 'js/*.source.js', '*.source.md', 'less/*.less' ],
                tasks: [ 'copy:main', 'less:themes' ]
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

    // Register the task to create our config files since there’s currently
    // nothing better: https://github.com/bower/bower/pull/62#issuecomment-8625287
    grunt.registerTask( 'confile', 'Build configuration files', function() {

        var files = {},
            config = grunt.file.readYAML( 'Confile.yml' ),
            configKeys = Object.keys( config ),
            YAML = require( 'yamljs' )

        // Grab all the unique file names.
        configKeys.forEach( function( filesKey ) {
            if ( filesKey != 'all' ) {
                filesKey.split(/ /g).forEach( function( name ) {
                    files[name] = files[name] || {}
                })
            }
        })

        // Add all the data to the files.
        for ( var fileName in files ) {

            grunt.util._.extend( files[fileName], config.all )

            /*jshint loopfunc: true*/
            configKeys.forEach( function( configKey ) {
                if ( configKey == 'all' || configKey.split(/ /g).indexOf( fileName ) > -1 ) {
                    grunt.util._.extend( files[fileName], config[configKey] )
                }
            })
            /*jshint loopfunc: false*/

            grunt.log.writeln( 'Writing ' + fileName.cyan )
            grunt.file.write( fileName,
                fileName.split('.').pop() == 'yml' ?
                    YAML.stringify( files[fileName], 2, 4 ) :
                    JSON.stringify( files[fileName], null, '\t' )
            )
        }
    })

} //module.exports

