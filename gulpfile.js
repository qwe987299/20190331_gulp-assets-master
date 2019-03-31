//  套件定義
//  在package.json內引用的套件
//  npm install gulp --global

//  gulp / yarn run gulp


const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const connect = require('gulp-connect');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const del = require('del');

//  ============================================================
//          定義路徑
//  ============================================================

const paths = {
    html: {
        src: './*.html',
    },
    styles: {
        src: 'src/scss/*.scss',
        watch: './src/scss/*.scss',
        dest: 'build/css'
    },
    images: {
        src: './src/images/*',
        dest: 'build/images'
    },
    csssprite: {
        src: 'src/icons/*.png',
        dest: 'build'
    },
    script: {
        src: 'src/app/*.js',
        dest: 'build/js'
    },
    venders: {
        script: {
            src: [
                'src/js/jquery-3.3.1.js',
                'src/js/jquery.magnific-popup.js',
                'src/js/jquery.sliderPro.js',
            ],
            dest: 'build/js'
        },
        styles: {
            src: [
                'src/css/magnific-popup.css',
                'src/css/slider-pro.css',
            ],
            dest: 'build/css'
        },
        images: {
            src: [
                'src/img/blank.gif',
                'src/img/closedhand.cur',
                'src/img/openhand.cur'
            ],
            dest: 'build/images'
        }
    }
};

const clean = () => del(['assets']);

//  ============================================================
//          工作
//  ============================================================

const buildHtml = async function (cb) {
    console.log('buildHtml');
    gulp.src(paths.html.src)
        .pipe(connect.reload());
    cb();
}


const buildSass = function (cb) {
    console.log('buildSass');
    gulp.src(paths.styles.src)
        .pipe(gulpSass())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(connect.reload());
    cb();
}

const compressImage = async function (cb) {
    console.log('compressImage');
    gulp.src(paths.images.src)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(connect.reload());
    cb();
}

const CSSSprite = async function (cb) {
    console.log('CSSSprite');
    gulp.src('src/icons/*.png').pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css'
        }))
        .pipe(gulp.dest('build'));
    cb();
}

const buildScript = async function (cb) {
    console.log('buildScript');
    gulp.src(paths.script.src)
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.script.dest))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.script.dest))
        .pipe(connect.reload());
    cb();
}

const venderJS = async function (cb) {
    console.log('venderJS');
    gulp.src(paths.venders.script.src)
        .pipe(concat('vender.js'))
        .pipe(gulp.dest(paths.venders.script.dest))
        .pipe(rename('vender.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.venders.script.dest))
        .pipe(connect.reload());
    cb();
}

const venderCSS = async function (cb) {
    console.log('venderCSS');
    gulp.src(paths.venders.styles.src)
        .pipe(concat('vender.css'))
        .pipe(gulp.dest(paths.venders.styles.dest))
        .pipe(rename('vender.min.css'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(paths.venders.styles.dest))
        .pipe(connect.reload());
}

const venderImage = async function (cb) {
    console.log('venderImage');
    gulp.src(paths.venders.images.src)
        .pipe(gulp.dest(paths.venders.images.dest))
        .pipe(connect.reload());
}

//  ============================================================
//          組合工作
//  ============================================================

const buildAssets = gulp.series(buildHtml, buildScript, buildSass, gulp.parallel(compressImage, CSSSprite));
const buildVenders = gulp.series(venderJS, gulp.parallel(venderCSS, venderImage));

//  ============================================================
//          監看
//  ============================================================

const watchfiles = async function () {
    gulp.watch(paths.html.src, buildHtml); //build SASS
    gulp.watch(paths.styles.watch, buildSass); //build SASS
    gulp.watch(paths.images.src, compressImage);
   // gulp.watch(paths.webfonts.src, webFonts);
    gulp.watch(paths.csssprite.src, CSSSprite);
    gulp.watch(paths.script.src, buildScript);
    gulp.watch(paths.venders.script.src, venderJS);
    gulp.watch(paths.venders.styles.src, venderCSS);
    gulp.watch(paths.venders.images.src, venderImage);
}

//  ============================================================
//          伺服器
//  ============================================================

const webServer = async function () {
    console.log('reload');
    connect.server({
        livereload: true
    });
}

//  ============================================================
//          最終輸出
//  ============================================================

exports.default = gulp.series(buildAssets, buildVenders, webServer, watchfiles);