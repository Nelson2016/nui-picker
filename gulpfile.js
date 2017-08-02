/*
 * Javascript Document
 * Creat by Nelson on 2017/5/11
 * 
 * Website:https://segmentfault.com/u/nelson2016
 * 
 * QQ:616859570
 * Email:Nelson_Lee@outlook.com
 * */

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cssMin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    LessAutoprefix = require('less-plugin-autoprefix');


gulp.task('minJs', function () {
    return gulp.src(['./src/js/nui-data-picker-es5.js'])
        .pipe(uglify())
        .pipe(rename('nui-data-picker.min.js'))
        .pipe(gulp.dest('./demo/'));
});

gulp.task('buildLess', function () {
    return gulp.src('./src/less/nui-data-picker.less')
        .pipe(less({plugins: [new LessAutoprefix({browsers: ['last 2 versions']})]}))
        .pipe(cssMin())
        .pipe(rename('nui-data-picker.min.css'))
        .pipe(gulp.dest('./demo/'));
});

gulp.task('buildES5', ['buildLess', 'minJs'], function () {
    console.log('Build ES5 success');
});

