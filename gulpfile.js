var gulp = require('gulp'),
    plumber   = require('gulp-plumber'),
    mocha = require('gulp-mocha'),
    watch = require('gulp-watch'),
    notify = require('gulp-notify'),
    jshint = require("gulp-jshint"),
    stylish   = require('jshint-stylish'),
    taskListing = require('gulp-task-listing');

gulp.task('test', function() {
    return gulp.src(['test/*.js'], { read: false })
        .pipe(plumber())
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', notify.onError());
});

gulp.task("lint", function() {
    gulp.src(['lib/*.js'])
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .on('error', notify.onError());
});

gulp.task('help', taskListing);

gulp.task('default', ['lint'], function() {
    gulp.watch(['lib/**', 'test/**'], ['mocha']);
    gulp.watch(['lib/**'], ['lint']);
})
