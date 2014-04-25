module.exports = function( grunt ) {

    // Read the package file.
    var packageJSON = grunt.file.readJSON('package.json')

    // Setup the initial configurations.
    grunt.initConfig({

        // Add the package data.
        pkg: packageJSON,

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

        // Concatenate and minify all the things!
        uglify: {
            main: {
                options: {
                    sourceMap: true,
                    mangle: false,
                    compress: false,
                    beautify: true,
                    preserveComments: 'all',
                    banner: grunt.file.read('js/source/_header.js'),
                    footer: grunt.file.read('js/source/_footer.js')
                },
                files: {
                    'js/shadow.js': [
                        'js/source/core.js',
                        'js/source/build.js',
                        'js/source/helpers.js',
                        'js/source/objects/Object.js',
                        'js/source/objects/Element.js',
                        'js/source/objects/Input.js'
                    ]
                }
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
            tests: [ 'js/tests/spec/**/*.js' ]
        },

        // Unit test the library.
        jasmine: {
            src: 'js/shadow.js',
            options: {
                specs: 'js/tests/spec/**/*.js',
                vendor: [
                    'js/tests/jquery/jquery.1.7.0.js'
                ]
            }
        },

        // Watch the project files.
        watch: {
            main: {
                files: [ 'js/source/**/*.js', 'less/*.less' ],
                tasks: [ 'uglify:main', 'less:themes' ]
            },
            themes: {
                files: [ 'less/*.less' ],
                tasks: [ 'less:themes' ]
            }
        },

        // Any extra data needed in rendering static files.
        meta: {

            // Get the min & gzip size of a text file.
            fileSize: function(content) {
                return {
                    min: content.length || 0,
                    gzip: content ? require('zlib-browserify').gzipSync(content).length : 0
                }
            }
        }

    }) //grunt.initConfig


    // Load the NPM tasks.
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-jasmine')


    // Register the tasks.
    grunt.registerTask('default', [ 'uglify', 'less' ])
    grunt.registerTask('strict', [ 'uglify', 'less', 'jshint', 'jasmine' ])
    grunt.registerTask('travis', [ 'jshint', 'jasmine' ])

} //module.exports
