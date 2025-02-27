/* global require, module */

var path = require("path");

module.exports = function (grunt) {
  "use strict";

  // These plugins provide necessary tasks.
  /* [Build plugin & task ] ------------------------------------*/
  grunt.loadNpmTasks("grunt-module-dependence");
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-browser-sync");
  grunt.loadNpmTasks("grunt-contrib-watch");

  var pkg = grunt.file.readJSON("package.json");

  var expose = "\nuse('expose-kityminder');\n";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: pkg,

    clean: {
      last: "dist",
    },

    // watch
    watch: {
      files: "src/**",
      tasks: ["build"],
    },
    // browser sync for dev
    browserSync: {
      bsFiles: {
        dist: "dist/css/*.css",
        src: "src/**",
      },
      options: {
        server: {
          baseDir: "./",
          index: "dev.html",
          watchTask: true,
        },
      },
    },

    // resolve dependence
    dependence: {
      options: {
        base: "src",
        entrance: "expose-kityminder",
      },
      merge: {
        files: [
          {
            src: "src/**/*.js",
            dest: "dist/kityminder.core.js",
          },
        ],
      },
    },

    // concat, just add closure
    concat: {
      options: {
        banner: "(function () {\n",
        footer: expose + "})();",
      },
      build: {
        files: {
          "dist/kityminder.core.js": ["dist/kityminder.core.js"],
        },
      },
    },

    uglify: {
      minimize: {
        src: "dist/kityminder.core.js",
        dest: "dist/kityminder.core.min.js",
      },
    },

    copy: {
      dist: {
        src: "src/kityminder.css",
        dest: "dist/kityminder.core.css",
      },
    },
  });

  // Build task(s).
  grunt.registerTask("build", [
    "clean",
    "dependence",
    "concat:build",
    "uglify:minimize",
    "copy",
  ]);
  grunt.registerTask("dev", ["browserSync", "watch"]);
};
