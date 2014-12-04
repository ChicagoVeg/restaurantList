'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {				
			},
			files: ['./Scripts/Veg/**/*.js']
		},
		htmlhint: {
			templates: {
				options: {
				},
				src: ['./*.html']
			}	
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-htmlhint');


	grunt.registerTask('default', ['jshint', 'htmlhint']);
}