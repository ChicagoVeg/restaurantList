var gulp = require('gulp');
var bundle = require('aurelia-bundler').bundle;

var config = {
  force: true,
  packagePath: '.',
  bundles: {
    "dist/app-build": {
      includes: [
        '[*]',
        '*.html!text',
        '*.css!text',        
      ],
      options: {
        inject: true,
        minify: true
      }
    },
    "dist/vendor-build": {
      includes: [
        'aurelia-bootstrapper',
        'aurelia-fetch-client',
        'aurelia-router',
        'aurelia-animator-css',
        'github:aurelia/templating-binding',
        'github:aurelia/templating-resources',
        'github:aurelia/templating-router',
        'github:aurelia/loader-default',
        'github:aurelia/history-browser',
        'github:aurelia/logging-console',
        'bootstrap/css/bootstrap.css!text'
      ],
      options: {
        inject: true,
        minify: true
      }
    }
  }
};

gulp.task('bundle', function() {
  return bundle(config);
});