var gulp = require('gulp');
var bundle = require('aurelia-bundler').bundle;

var config = {
  force: true,
  packagePath: './',
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
           "github:aurelia/binding@0.10.2",
      "github:aurelia/binding@0.10.2/aurelia-binding",
      "github:aurelia/bootstrapper@0.18.0",
      "github:aurelia/bootstrapper@0.18.0/aurelia-bootstrapper",
      "github:aurelia/dependency-injection@0.11.2",
      "github:aurelia/dependency-injection@0.11.2/aurelia-dependency-injection",
      "github:aurelia/event-aggregator@0.9.0",
      "github:aurelia/event-aggregator@0.9.0/aurelia-event-aggregator",
      "github:aurelia/fetch-client@0.3.0",
      "github:aurelia/fetch-client@0.3.0/aurelia-fetch-client",
      "github:aurelia/framework@0.17.0",
      "github:aurelia/framework@0.17.0/aurelia-framework",
      "github:aurelia/history-browser@0.9.0",
      "github:aurelia/history-browser@0.9.0/aurelia-history-browser",
      "github:aurelia/history@0.8.0",
      "github:aurelia/history@0.8.0/aurelia-history",
      "github:aurelia/loader-default@0.11.2",
      "github:aurelia/loader-default@0.11.2/aurelia-loader-default",
      "github:aurelia/loader@0.10.0",
      "github:aurelia/loader@0.10.0/aurelia-loader",
      "github:aurelia/logging-console@0.8.0",
      "github:aurelia/logging-console@0.8.0/aurelia-logging-console",
      "github:aurelia/logging@0.8.0",
      "github:aurelia/logging@0.8.0/aurelia-logging",
      "github:aurelia/metadata@0.9.0",
      "github:aurelia/metadata@0.9.0/aurelia-metadata",
      "github:aurelia/pal-browser@0.2.0",
      "github:aurelia/pal-browser@0.2.0/aurelia-pal-browser",
      "github:aurelia/pal@0.2.0",
      "github:aurelia/pal@0.2.0/aurelia-pal",
      "github:aurelia/path@0.10.0",
      "github:aurelia/path@0.10.0/aurelia-path",
      "github:aurelia/route-recognizer@0.8.0",
      "github:aurelia/route-recognizer@0.8.0/aurelia-route-recognizer",
      "github:aurelia/router@0.13.0",
      "github:aurelia/router@0.13.0/aurelia-router",
      "github:aurelia/task-queue@0.8.0",
      "github:aurelia/task-queue@0.8.0/aurelia-task-queue",
      "github:aurelia/templating-binding@0.16.1",
      "github:aurelia/templating-binding@0.16.1/aurelia-templating-binding",
      "github:aurelia/templating-resources@0.16.1",
      "github:aurelia/templating-resources@0.16.1/aurelia-templating-resources",
      "github:aurelia/templating-resources@0.16.1/compile-spy",
      "github:aurelia/templating-resources@0.16.1/compose",
      "github:aurelia/templating-resources@0.16.1/css-resource",
      "github:aurelia/templating-resources@0.16.1/dynamic-element",
      "github:aurelia/templating-resources@0.16.1/focus",
      "github:aurelia/templating-resources@0.16.1/global-behavior",
      "github:aurelia/templating-resources@0.16.1/html-sanitizer",
      "github:aurelia/templating-resources@0.16.1/if",
      "github:aurelia/templating-resources@0.16.1/repeat",
      "github:aurelia/templating-resources@0.16.1/replaceable",
      "github:aurelia/templating-resources@0.16.1/sanitize-html",
      "github:aurelia/templating-resources@0.16.1/show",
      "github:aurelia/templating-resources@0.16.1/view-spy",
      "github:aurelia/templating-resources@0.16.1/with",
      "github:aurelia/templating-router@0.17.0",
      "github:aurelia/templating-router@0.17.0/aurelia-templating-router",
      "github:aurelia/templating-router@0.17.0/route-href",
      "github:aurelia/templating-router@0.17.0/route-loader",
      "github:aurelia/templating-router@0.17.0/router-view",
      "github:aurelia/templating@0.16.0",
      "github:aurelia/templating@0.16.0/aurelia-templating",
      "github:components/jquery@2.1.4",
      "github:components/jquery@2.1.4/jquery",
      "github:jspm/nodelibs-process@0.1.2",
      "github:jspm/nodelibs-process@0.1.2/index",
      "bootstrap/css/bootstrap.css!text",
      //"bootstrap/js/bootstrap.js!text",
      //"github:twbs/bootstrap@3.3.6",
      //"github:twbs/bootstrap@3.3.6/css/bootstrap.css",
      //"github:twbs/bootstrap@3.3.6/js/bootstrap",
      "npm:aurelia-animator-css@1.0.0-beta.1.0.2",
      "aurelia-animator-css",
      "npm:aurelia-binding@1.0.0-beta.1.0.3",
      "npm:aurelia-binding@1.0.0-beta.1.0.3/aurelia-binding",
      "npm:aurelia-dependency-injection@1.0.0-beta.1",
      "npm:aurelia-dependency-injection@1.0.0-beta.1/aurelia-dependency-injection",
      "npm:aurelia-templating@1.0.0-beta.1.0.2",
      "npm:aurelia-templating@1.0.0-beta.1.0.2/aurelia-templating",
     
      "npm:process@0.11.2",
      "npm:process@0.11.2/browser"
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

gulp.task('unbundle', function() {
 return bundler.unbundle(config);
});