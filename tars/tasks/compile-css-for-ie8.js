var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var autoprefix = require('gulp-autoprefixer');
var replace = require('gulp-replace-task');
var notify = require('gulp-notify');
var tarsConfig = require('../../../tars-config');
var notifier = require('../../helpers/notifier');
var browserSync = require('browser-sync');

var scssFilesToConcatinate = [
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/normalize.scss',
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/libraries/**/*.scss',
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/libraries/**/*.css',
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/mixins.scss',
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/sprites-scss/sprite_96.scss'
    ];

if (tarsConfig.useSVG) {
    scssFilesToConcatinate.push(
        './markup/' + tarsConfig.fs.staticFolderName + '/scss/sprites-scss/svg-fallback-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/sprites-scss/sprite-ie.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/fonts.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/vars.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/GUI.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/common.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/plugins/**/*.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/plugins/**/*.css',
    './markup/modules/*/*.scss',
    './markup/modules/*/ie/ie8.scss',
    './markup/' + tarsConfig.fs.staticFolderName + '/scss/etc/**/*.scss'
);

/**
 * Scss compilation for ie8
 * @param  {object} buildOptions
 */
module.exports = function (buildOptions) {

    var patterns = [];

    patterns.push(
        {
            match: '%=staticPrefixForCss=%',
            replacement: tarsConfig.staticPrefixForCss()
        }
    );

    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (gutil.env.ie8) {
            return gulp.src(scssFilesToConcatinate)
                .pipe(concat('main_ie8' + buildOptions.hash + '.css'))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass({
                    errLogToConsole: false,
                    onError: function (error) {
                        notify().write('\nAn error occurred while compiling css for ie8.\nLook in the console for details.\n');
                        return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                    }
                }))
                .pipe(autoprefix('ie 8', { cascade: true }))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Css-files for ie8 have been compiled')
                );
        } else {
            gutil.log('!Stylies for ie8 are not used!');
            cb(null);
        }
    });
};