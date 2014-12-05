module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            files: ['client/javascripts/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'lib/**/*.js', 'test/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                latedef: true,
                noarg: true,
                trailing: true,
                ignores: ['public/**/*.js']
            },
            client: {
                options: {
                    browser: true,
                    globals: {
                        jQuery: true
                    }
                },
                files: {
                    src: ['client/javascripts/**/*.js']
                }
            },
            server: {
                options: {
                    node: true
                },
                files: {
                    src: [
                        'Gruntfile.js',
                        'bin/*',
                        'lib/*.js',
                        'models/*.js',
                        'routes/*.js'
                    ]
                }
            }
        },
        browserify: {
            build: {
                dest: 'public/javascripts/site.js',
                src: ['client/javascripts/index.js'],
                options: {
                    alias: ['./client/javascripts/index.js:s7n']
                }
            }
        },
        sass: {
            options: {
                includePaths: [
                    'bower_components/foundation/scss',
                    'bower_components/font-awesome/scss'
                ]
            },
            dest: {
                options: {
                    outputStyle: 'compressed'
                },
                files: {
                    '/tmp/styles.css': 'client/scss/styles.scss'
                }
            }
        },
        concat: {
            css: {
                src: [
                    'client/vendor/stylesheets/**/*.css',
                    '/tmp/styles.css'
                ],
                dest: 'public/stylesheets/styles.css'
            },
            vendor: {
                options: {
                    separator: ';' + grunt.util.linefeed
                },
                src: [
                    'bower_components/underscore/underscore.js',
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/foundation/js/foundation.js',
                    'bower_components/moment/moment.js',
                    'bower_components/moment/locale/nb.js',
                    'client/vendor/javascripts/*.js'
                ],
                dest: 'public/javascripts/vendor.js'
            }
        },
        copy: {
            js: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: ['bower_components/modernizr/modernizr.js'],
                dest: 'public/javascripts/'
            },
            font: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: [
                    'bower_components/font-awesome/fonts/*',
                    'client/fonts/*'
                ],
                dest: 'public/fonts/'
            },
            img: {
                expand: true,
                cwd: 'client/images',
                src: ['**'],
                dest: 'public/images'
            }
        },
        uglify: {
            options: {
                mangle: false,
                compress: true
            },
            vendor: {
                files: {
                    'public/javascripts/vendor.js': ['public/javascripts/vendor.js']
                }
            },
            client: {
                files: {
                    'public/javascripts/site.js': ['public/javascripts/site.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'browserify', 'sass', 'concat', 'copy']);
    grunt.registerTask('build', ['default', 'uglify']);
};
