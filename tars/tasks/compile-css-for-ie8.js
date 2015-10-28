'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var plumber = tars.packages.plumber;
var importify = tars.packages.importify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var scssFilesToConcatinate = [
        scssFolderPath + '/normalize.{scss,sass}',
        scssFolderPath + '/libraries/**/*.{scss,sass,css}',
        scssFolderPath + '/mixins.{scss,sass}',
        scssFolderPath + '/sprites-scss/sprite_96.{scss,sass}'
    ];
var patterns = [];
var processors = [];

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
    });
}

processors.push(autoprefixer({browsers: ['ie 8']}));

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        scssFolderPath + '/sprites-scss/svg-fallback-sprite.{scss,sass}'
    );
}

scssFilesToConcatinate.push(
    scssFolderPath + '/sprites-scss/sprite-ie.{scss,sass}',
    scssFolderPath + '/fonts.{scss,sass}',
    scssFolderPath + '/vars.{scss,sass}',
    scssFolderPath + '/GUI.{scss,sass}',
    scssFolderPath + '/common.{scss,sass,css}',
    scssFolderPath + '/plugins/**/*.{scss,sass,css}',
    './markup/modules/*/*.{scss,sass}',
    './markup/modules/*/ie/ie8.{scss,sass}',
    scssFolderPath + '/etc/**/*.{scss,sass,css}',
    '!./**/_*.{scss,sass,css}'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);


/**
 * Scss compilation for IE8
 */
module.exports = function () {
    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8 || tars.flags.ie) {
            return gulp.src(scssFilesToConcatinate, { base: process.cwd() })
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while compiling css for IE8.', error);
                        this.emit('end');
                    }
                }))
                .pipe(importify('main_ie8.scss', {
                    cssPreproc: 'scss'
                }))
                .pipe(sass({
                    outputStyle: 'expanded',
                    includePaths: process.cwd()
                }))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(postcss(processors))
                .pipe(concat('main_ie8' + tars.options.build.hash + '.css'))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier.success('Scss-files for IE8 have been compiled')
                );
        } else {
            gutil.log('!Stylies for IE8 are not used!');
            cb(null);
        }
    });
};
