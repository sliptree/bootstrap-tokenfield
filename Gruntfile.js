module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      dist: {
        'js/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js'        
      }
    },
    uglify: {
      dist: {
        'js/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.min.js'
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('build', ['copy', 'uglify', 'less']);
}