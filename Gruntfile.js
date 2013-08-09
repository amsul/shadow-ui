
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
                lib: '_raw/lib',
                themes: '_raw/lib/themes',
                tests: '_raw/tests',
                demos: '_raw/demos',
                docs: '_raw/docs'
            },
            dest: {
                lib: 'lib',
                themes: 'lib/themes',
                tests: 'tests',
                demos: 'demos',
                docs: 'docs'
            }
        },


        // Clean the destination files and directories.
        clean: {
            lib: [ '<%= dirs.dest.lib %>' ],
            themes: [ '<%= dirs.dest.themes %>' ],
            tests: [ '<%= dirs.dest.tests %>' ],
            demos: [ '<%= dirs.dest.demos %>' ],
            docs: [ '<%= dirs.dest.docs %>' ],
            pkg: [ '<%= pkg.name %>.jquery.json', '*.md' ]
        },


        // Copy over files to destination directions.
        copy: {
            options: {
                processContent: function( content ) {
                    return grunt.template.process( content, { delimiters: 'curly' } )
                }
            },
            pkg: {
                files: [
                    { '<%= pkg.name %>.jquery.json': 'package.json' },
                    { 'README.md': '<%= dirs.src.raw %>/README.md' },
                    { 'LICENSE.md': '<%= dirs.src.raw %>/LICENSE.md' },
                    { 'CHANGELOG.md': '<%= dirs.src.raw %>/CHANGELOG.md' },
                    { 'CONTRIBUTING.md': '<%= dirs.src.raw %>/CONTRIBUTING.md' }
                ]
            },
            lib: {
                expand: true,
                cwd: '<%= dirs.src.lib %>',
                src: [ '*.js' ],
                dest: '<%= dirs.dest.lib %>'
            },
            tests: {
                expand: true,
                cwd: '<%= dirs.src.tests %>',
                src: [ '*', '*/**' ],
                dest: '<%= dirs.dest.tests %>'
            },
            demos: {
                expand: true,
                cwd: '<%= dirs.src.demos %>',
                src: [ '*.css', '*.js' ],
                dest: '<%= dirs.dest.demos %>'
            }
        },
        htmlify: {
            // pkg: {
            //     // todo..
            // },
            demos: {
                expand: true,
                cwd: '<%= dirs.src.demos %>',
                src: [ '*.htm' ],
                dest: '<%= dirs.dest.demos %>',
                base: '../base.htm'
            },
            docs: {
                expand: true,
                cwd: '<%= dirs.src.docs %>',
                src: [ '*.htm' ],
                dest: '<%= dirs.dest.docs %>',
                base: '../base.htm'
            }
        },


        // Compile LESS into CSS.
        less: {
            options: {
                style: 'expanded'
            },
            themes: {
                files: {
                    '<%= dirs.dest.themes %>/<%= pkg.name %>.base.css': '<%= dirs.src.themes %>/base.less',
                    '<%= dirs.dest.themes %>/<%= pkg.name %>.box.css': '<%= dirs.src.themes %>/box.less',
                    '<%= dirs.dest.themes %>/<%= pkg.name %>.drop.css': '<%= dirs.src.themes %>/drop.less',
                    '<%= dirs.dest.themes %>/<%= pkg.name %>.modal.css': '<%= dirs.src.themes %>/modal.less'
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
            lib: [ '<%= dirs.dest.lib %>/*.js' ]
        },


        // Unit test the files.
        qunit: {
            all: [ '<%= dirs.dest.tests %>/units/all.htm' ]
        },


        // Watch the project files.
        watch: {
            pkg: {
                files: [ '<%= dirs.src.raw %>/*md', '<%= dirs.src.raw %>/*.htm' ],
                tasks: [ 'copy:pkg', 'htmlify' ]
            },
            lib: {
                files: [ '<%= dirs.src.lib %>/*.js' ],
                tasks: [ 'copy:lib', 'jshint:lib' ]
            },
            themes: {
                files: [ '<%= dirs.src.themes %>/*.less' ],
                tasks: [ 'less:themes' ]
            },
            tests: {
                files: [ '<%= dirs.src.tests %>' ],
                tasks: [ 'copy:tests' ]
            },
            demos: {
                files: [ '<%= dirs.src.demos %>/*.htm' ],
                tasks: [ 'htmlify:demos' ]
            },
            docs: {
                files: [ '<%= dirs.src.docs %>/*.htm' ],
                tasks: [ 'htmlify:docs' ]
            },
            gruntfile: {
                files: [ 'Gruntfile.js' ],
                tasks: [ 'jshint:gruntfile', 'default' ]
            }
        },


        // Any extra data needed in rendering static files.
        meta: {

            // The clean github repo url.
            repo_url: packageJSON.repository.url.replace( /.git$/, '' ),

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
    grunt.registerTask( 'default', [ 'clean', 'copy', 'htmlify', 'less' ] )
    grunt.registerTask( 'strict', [ 'clean', 'copy', 'htmlify', 'less', 'jshint', 'qunit' ] )
    grunt.registerTask( 'travis', [ 'jshint', 'qunit' ] )


    // Create and register the task to build out the static HTML files.
    grunt.registerMultiTask( 'htmlify', 'Recursively build static HTML files', function() {

        var task = this,

            // Process the base file using the source file content.
            processFile = function( fileSource ) {

                var processedContent = ''

                // Recursively process the base template using the file source content.
                grunt.verbose.writeln( 'Processing ' + fileSource )
                processedContent = grunt.template.process( grunt.file.read( task.data.cwd + '/' + task.data.base ), {
                    delimiters: 'curly',
                    data: {
                        pkg: packageJSON,
                        page: fileSource.match( /[\w-]+(?=\.htm$)/ )[ 0 ],
                        content: grunt.file.read( fileSource ),
                        meta: grunt.config.data.meta,
                        dirs: grunt.config.data.dirs
                    }
                })

                // Write the destination file by cleaning the file name.
                grunt.log.writeln( 'Writing ' + fileSource.cyan )
                grunt.file.write( task.data.dest + '/' + fileSource.match( /[\w-]+\.htm$/ )[ 0 ], processedContent )
            }


        // Map through the task directory and process the HTML files.
        grunt.log.writeln( 'Expanding ' + task.data.cwd.cyan )
        grunt.file.expand( task.data.cwd + '/' + task.data.src ).map( processFile )
    })

} //module.exports


