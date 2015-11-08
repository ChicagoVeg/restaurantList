var gulp = require('gulp');
var bundler = require('aurelia-bundler');

var config = {  
  force: true,
  packagePath: '.',
  bundles: {
    "dist/app-build": {
      includes: [
        '*',
        '*.html!text',
        '*.css!text',
        'bootstrap/css/bootstrap.css!text'
      ],
      options: {
        inject: true,
        minify: true
      }
    },
    "dist/aurelia": {
      includes: [
        'aurelia-bootstrapper',
        'aurelia-fetch-client',
        'aurelia-router',
        'aurelia-framework',
        'aurelia-http-client',
        'aurelia-event-aggregator'
      ],
      options: {
        inject: true,
        minify: true
      }
    }
  }
};

gulp.task('bundle', function() {  
 return bundler.bundle(config);
});

gulp.task('unbundle', function() {  
 return bundler.unbundle(config);
});