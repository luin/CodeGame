var gulp = require('gulp');

// CSS
var myth = require('gulp-myth');

gulp.task('css', function() {
  return gulp.src('client/css/app.css')
    .pipe(myth({
      source: 'client/css'
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch-css', function() {
  return gulp.watch('client/css/**/*.css', ['css']);
});

// Sketch
var sketch = require('gulp-sketch');

var sketchSrc = 'client/images/**/*.sketch';
gulp.task('sketch', function() {
  return gulp.src(sketchSrc)
    .pipe(sketch({
      export: 'artboards',
      formats: 'png',
      trimmed: false
    }))
    .pipe(gulp.dest('public/images'));
});

gulp.task('watch-sketch', function() {
  return gulp.watch('client/images/**/*.sketch', ['sketch']);
});

// JavaScript
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

gulp.task('js', function() {
  return gulp.src('client/js/*.js')
    .pipe(browserify())
    // .pipe(require('gulp-uglify')())
    .pipe(gulp.dest('public/js'));
});

gulp.task('watch-js', function() {
  return gulp.watch('client/js/**/*.js', ['js']);
});

gulp.task('build', ['css', 'js', 'sketch']);
gulp.task('watch', ['watch-css', 'watch-js', 'watch-sketch']);
