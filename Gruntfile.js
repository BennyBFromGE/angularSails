/**
 * Grunt automation.
 */
module.exports = function(grunt) {

  grunt.initConfig({

    angularSails: {
      src: 'src/*.js',
      example: 'example/assets/js/deps/'
    },

    copy: {
      dev: {
        src: '<%= angularSails.src %>',
        dest: '<%= angularSails.example %>'
      }
    },

    watch: {
      files: '<%= angularSails.src %>',
      tasks: ['copy'],
      karma: {
        files: ['src/*.js', 'tests/**/*.spec.js'],
        tasks: ['karma:unit:run'] //NOTE the :run flag
  }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
  }
}
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');


  grunt.registerTask('default', ['dev']);

  // Dev enviroment for copying over changes from src to example project.
  grunt.registerTask('dev', ['watch']);


}
