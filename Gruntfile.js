
/**
 * Build the project files.
 */
module.exports = function( grunt ) {


    // Read the package manifest.
    var packageJSON = grunt.file.readJSON( 'package.json' )


    // Add the “curly” template delimiters.
    grunt.template.addDelimiters( 'curly', '{%', '%}' )


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


    // Setup the initial configurations.
    grunt.initConfig({


        // Add the package data.
        pkg: packageJSON,


        // Set up the directories.
        dirs: {
            src: {
                raw: '_raw',
                lib: '_raw/lib'
            },
            dest: {
                lib: 'dest/lib'
            }
        },


        // Clean the destination files and directories.
        clean: {
            pkg: [ '<%= dirs.dest.lib %>', '<%= pkg.name %>.jquery.json', '*.md' ]
        },


        // Generate static HTML templates.
        htmlify: {
            demos: {
                expand: true,
                cwd: '<%= dirs.src.raw %>',
                src: [ '/!(base|hero)*.htm' ],
                dest: '',
                base: '/base.htm'
            }
        },


        // Copy over files to destination directions.
        copy: {
            pkg: {
                options: {
                    processContent: function( content ) {
                        return grunt.template.process( content, { delimiters: 'curly' } )
                    }
                },
                files: [
                    { '<%= pkg.name %>.jquery.json': 'package.json' },
                    { 'README.md': '<%= dirs.src.raw %>/README.md' },
                    { 'LICENSE.md': '<%= dirs.src.raw %>/LICENSE.md' },
                    { 'CHANGELOG.md': '<%= dirs.src.raw %>/CHANGELOG.md' },
                    { 'CONTRIBUTING.md': '<%= dirs.src.raw %>/CONTRIBUTING.md' }
                ]
            }
        },


        // Compile LESS into CSS.
        less: {
            options: {
                style: 'expanded'
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


        // Lint the files.
        jshint: {
            gruntfile: 'Gruntfile.js'
        },


        // Minify all the things!
        uglify: {
            options: {
                preserveComments: 'some'
            }
        },
        cssmin: {
        },


        // Unit test the files.
        qunit: {
        },


        // Watch the project files.
        watch: {
            gruntfile: {
                files: [ 'Gruntfile.js' ],
                tasks: [ 'jshint:gruntfile', 'default' ]
            }
        },


        // Any extra data needed in rendering static files.
        meta: {

            // The sanitized github repo url.
            gitrepo_url: packageJSON.repository.url.replace( /.git$/, '' ),

            // Get the min & gzip size of a text file.
            fileSize: function( content ) {
                return {
                    min: content.length || 0,
                    gzip: content ? require( 'zlib-browserify' ).gzipSync( content ).length : 0
                }
            }
        }
    }) //grunt.initConfig


    // Register the tasks.
    grunt.registerTask( 'default', [ 'clean', 'copy' ] )
    // grunt.registerTask( 'travis', [ 'jshint:pickers', 'qunit:pickers' ] )



    // // Create and register the task to build out the static HTML files.
    // grunt.registerMultiTask( 'htmlify', 'Build static HTML files', function() {

    //     var task = this,

    //         // Process the base file using the source file content.
    //         processFile = function( fileSource ) {

    //             var processedContent = ''

    //             // Process the base template using the file source content.
    //             grunt.verbose.writeln( 'Processing ' + fileSource )
    //             processedContent = grunt.template.process( grunt.file.read( task.data.cwd + task.data.base ), {
    //                 delimiters: 'curly',
    //                 data: {
    //                     pkg: packageJSON,
    //                     page: fileSource.match( /[\w-]+(?=\.htm$)/ )[ 0 ],
    //                     content: grunt.file.read( fileSource ),
    //                     meta: grunt.config.data.meta,
    //                     dirs: grunt.config.data.dirs
    //                 }
    //             })

    //             // Write the destination file by cleaning the file name.
    //             grunt.log.writeln( 'Writing ' + fileSource.cyan )
    //             grunt.file.write( task.data.dest + fileSource.match( /[\w-]+\.htm$/ )[ 0 ], processedContent )
    //         }


    //     // Map through the task directory and process the HTML files.
    //     grunt.log.writeln( 'Expanding ' + task.data.cwd.cyan )
    //     grunt.file.expand( task.data.cwd + task.data.src ).map( processFile )
    // })

} //module.exports


