const { series, parallel, src, dest, watch } = require('gulp');
const { Cake } = require('cake-ssg');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const del = require('del');
const merge = require('merge2');
const sass = require('gulp-sass')(require('sass'));

const target = 'docs';

const cssLib = [
  'node_modules/bootstrap-icons/font/bootstrap-icons.css',
];

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
  let stream = src('css/**/*.scss')
    .pipe(sass({ includePaths: 'node_modules' }).on('error', sass.logError));
  
  stream = merge(stream, src(cssLib))
    .pipe(concat('main.css'));
  
  return stream
    .pipe(dest(target))
    .pipe(connect.reload());
};

function copyBoostrapJs() {
  return src(['node_modules/bootstrap/dist/js/bootstrap.min.js'])
    .pipe(dest(target))
}

function copyStatic() {
  src('node_modules/bootstrap-icons/font/fonts/**')
    .pipe(dest(target + '/fonts'));
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
