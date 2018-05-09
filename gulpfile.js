var gulp = require('gulp')
, minifyCss = require("gulp-minify-css")
, concat = require('gulp-concat')
, stripDebug = require('gulp-strip-debug')
, uglify = require('gulp-uglify');
 
// task
gulp.task('minify-css', function () {
    gulp.src([
    	'/css/skins/square/grey.css',
    	'public/css/bootstrap.min.css',
    	'public/css/style.css',
    	'public/css/vendors.css',
    	'/css/icon_fonts/css/all_icons.min.css',
    	'/vendor/prism/prism.css',
    	'/css/blog.css'
    	])
    .pipe(concat('styles.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/build/css'));
});


gulp.task('minify-js', function() {

  gulp.src([
  	'public/js/jquery-2.2.4.min.js',
  	'public/js/main.js',
  	'public/js/common_scripts.js',
  	'public/vendor/prism/prism.js',
  	'public/assets/validate.js',
  	])
    .pipe(concat('scripts.js')) 
    .pipe(stripDebug())                    
    .pipe(uglify())                             
    .pipe(gulp.dest('public/build/js')); 

});


gulp.task('default', ['minify-css','minify-js'], function() {});