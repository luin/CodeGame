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

// Image
gulp.task('image', function() {
  return gulp.src('client/images/**/*')
    .pipe(gulp.dest('public/images'));
});

gulp.task('watch-image', function() {
  return gulp.watch('client/images/**/*', ['image']);
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

gulp.task('build', ['css', 'js', 'image']);
gulp.task('watch', ['watch-css', 'watch-js', 'watch-image']);
