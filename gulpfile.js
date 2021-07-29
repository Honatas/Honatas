const { series, parallel, src, dest, watch } = require('gulp');
const { Cake } = require('cake-ssg');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));

const target = 'docs';

const cakeOptions = {
  outputFolder: target,
}

function clean () {
  return del(target);
};

function buildHtml() {
  new Cake(cakeOptions).bake();
  return src('templates/*').pipe(connect.reload());
}

function buildStyles() {
  return src('css/**/*.scss')
    .pipe(sass({ includePaths: 'node_modules' }).on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(dest(target))
    .pipe(connect.reload());
};

function copyBoostrapJs() {
  return src(['node_modules/bootstrap/dist/js/bootstrap.min.js'])
    .pipe(dest(target))
}

function copyStatic() {
  return src('img/**')
    .pipe(dest(target))
    .pipe(connect.reload());
}

function serverConnect(cb) {
  connect.server({
    root: target,
    livereload: true
  });
  cb();
};

function watchFiles(cb) {
  watch('css/**/*.scss', buildStyles);
  watch(['templates/**/*.hbs', 'content/**/*.json'], buildHtml);
  watch('img/**', copyStatic);
  cb();
};

const build = series(
  clean, 
  copyStatic, 
  copyBoostrapJs,
  parallel(
    buildHtml,
    buildStyles,
  )
);

const server = series(
  build,
  parallel(
    serverConnect,
    watchFiles,
  )
);  

exports.default = server;
exports.build = build;
