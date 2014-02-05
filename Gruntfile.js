module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    copy: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': 'js/<%= pkg.name %>.js'
        }
      },
      assets: {
        files: [{
          expand: true,
          flatten: true,
          src: [
            'bower_components/bootstrap/js/affix.js',
            'bower_components/bootstrap/js/scrollspy.js',
            'bower_components/typeahead.js/dist/typeahead.js'
          ],
          dest: 'docs-assets/js/'
        }]
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
        }
      },
      docs: {
        files: {
          'docs-assets/js/docs.min.js': 'docs-assets/js/docs.js'
        }
      }
    },

    less: {
      compile: {
        files: {
          'dist/css/<%= pkg.name %>.css': 'less/<%= pkg.name %>.less',
          'dist/css/tokenfield-typeahead.css': 'less/tokenfield-typeahead.less'
        }
      },
      minify: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css',
          'dist/css/tokenfield-typeahead.min.css': 'dist/css/tokenfield-typeahead.css'
        }
      }
    },

    jekyll: {
      docs: {}
    },

    watch: {
      copy: {
        files: 'js/**/*',
        tasks: ['copy']
      },
      less: {
        files: 'less/**/*',
        tasks: ['less']
      },
      jekyll: {
        files: ['dist/**/*', 'index.html'],
        tasks: ['jekyll']
      },
      livereload: {
        options: { livereload: true },
        files: ['dist/**/*'],
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-sed');

  // Build task
  grunt.registerTask('build', ['copy', 'uglify', 'less']);
}