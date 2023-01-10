'use strict';

const gulp = require('gulp'),
  rename = require('gulp-rename'),
  browserify = require('gulp-browserify'),
  uglify = require('gulp-uglify'),
  babelify = require('babelify'),
  shell = require('gulp-shell'),
  jshint = require('gulp-jshint'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  outputClientDir = '../../your-project-build';


gulp.task('create-build-production-doc', shell.task('node update-package-json'));

gulp.task('remove-updated-package-json', shell.task('rm -rf package-build.json'));

gulp.task('move-updated-package-json', function() {
  return gulp.src('package-build.json')
    .pipe(rename({
      'basename': 'package',
    }))
    .pipe(gulp.dest(outputClientDir));
});

gulp.task('move-package-json', gulp.series('remove-updated-package-json', 'create-build-production-doc', 'move-updated-package-json', 'remove-updated-package-json'));

gulp.task('js', function() {

  return gulp.src('./app.js', {
      'read': false
    })
    .pipe(browserify({
      'browserField': false,
      'bundleExternal': false,
      'detectGlobals': false,
      'transform': [
        [babelify.configure({
          'presets': ['es2015']
        })],
      ]
    }))
    .pipe(uglify().on('error', require('gulp-util').log))
    .pipe(rename({
      'basename': 'app',
      'suffix': '.min'
    }))
    .pipe(gulp.dest(outputClientDir));
});

gulp.task('copy-public-folder', function() {
  return gulp.src('public/**/*')
    .pipe(gulp.dest(outputClientDir + '/public'));
});

gulp.task('copy-env-file', function() {
  return gulp.src('.env')
    .pipe(gulp.dest(outputClientDir + '/'));
});

gulp.task('copy-docs-folder', function() {
  return gulp.src('docs/**/*')
    .pipe(gulp.dest(outputClientDir + '/docs'));
});

gulp.task('copy-views-folder', function() {
  return gulp.src('views/**/*')
    .pipe(gulp.dest(outputClientDir + '/views'));
});

gulp.task('copy-certificates-folder', function() {
  return gulp.src('certificates/**/*')
    .pipe(gulp.dest(outputClientDir + '/certificates'));
});

gulp.task('move-check-sh', function() {
  return gulp.src('check.sh')
    .pipe(gulp.dest(outputClientDir + '/'));
});

gulp.task('default', gulp.series(
  'move-package-json',
  'copy-env-file',
  'copy-docs-folder',
  'copy-public-folder',
  'copy-views-folder',
  'copy-certificates-folder',
  'move-check-sh',
  'js'
));

var onError = function(err) {
  notify.onError({
    title: 'Gulp',
    subtitle: 'Failure!',
    message: 'Error: <%= error.message %>',
    sound: 'Beep'
  })(err);

  this.emit('end');
};

gulp.task('lint', function() {
  return gulp.src([
      './config/**/*.js',
      './db/**/*.js',
      './controllers/**/*.js',
      './services/**/*.js',
      './modules/**/*.js',
      './tests/**/*.js',
      './utilities/**/*.js',
      './*.js'
    ])
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('watch', function() {
  gulp.watch([
    './config/**/*.js',
    './db/**/*.js',
    './controllers/**/*.js',
    './services/**/*.js',
    './modules/**/*.js',
    './tests/**/*.js',
    './utilities/**/*.js',
    './*.js'
  ], ['lint']);
});

gulp.task('lintWatch', gulp.series('lint', 'watch'));