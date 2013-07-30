
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
                tests: '_raw/tests'
            },
            dest: {
                lib: 'dest/lib',
                tests: '_raw/tests'
            }
        },


        // Clean the destination files and directories.
        clean: {
            pkg: [ '<%= dirs.dest.lib %>', '<%= pkg.name %>.jquery.json', '*.md' ]
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
            tests: {
                expand: true,
                cwd: '<%= dirs.src.tests %>',
                src: [ '*' ],
                dest: '<%= dirs.dest.tests %>'
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
            all: []
        },


        // Unit test the files.
        qunit: {
            all: [ '<%= dirs.src.tests %>/units/all.htm' ]
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
    grunt.registerTask( 'travis', [ 'jshint', 'qunit' ] )

} //module.exports


