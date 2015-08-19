'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
var replace = tars.packages.replace;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var patterns = [];
var staticFolderName = tars.config.fs.staticFolderName;
var scssFilesToConcatinate = [
        './markup/' + staticFolderName + '/scss/normalize.scss',
        './markup/' + staticFolderName + '/scss/libraries/**/*.scss',
        './markup/' + staticFolderName + '/scss/libraries/**/*.css',
        './markup/' + staticFolderName + '/scss/mixins.scss',
        './markup/' + staticFolderName + '/scss/sprites-scss/sprite_96.scss'
    ];

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        './markup/' + staticFolderName + '/scss/sprites-scss/svg-fallback-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    './markup/' + staticFolderName + '/scss/sprites-scss/sprite-ie.scss',
    './markup/' + staticFolderName + '/scss/fonts.scss',
    './markup/' + staticFolderName + '/scss/vars.scss',
    './markup/' + staticFolderName + '/scss/GUI.scss',
    './markup/' + staticFolderName + '/scss/common.scss',
    './markup/' + staticFolderName + '/scss/plugins/**/*.scss',
    './markup/' + staticFolderName + '/scss/plugins/**/*.css',
    './markup/modules/*/*.scss',
    './markup/modules/*/ie/ie8.scss',
    './markup/' + staticFolderName + '/scss/etc/**/*.scss'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Scss compilation for ie8
 */
module.exports = function () {
    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8) {
            return gulp.src(scssFilesToConcatinate)
                .pipe(concat('main_ie8' + tars.options.build.hash + '.css'))
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
                .pipe(autoprefixer('ie 8', { cascade: true }))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + staticFolderName + '/css/'))
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