'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var gulpif = tars.packages.gulpif;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
var addsrc = tars.packages.addsrc;
var replace = tars.packages.replace;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var useAutoprefixer = false;
var helperStream;
var mainStream;
var ie9Stream;
var staticFolderName = tars.config.fs.staticFolderName;
var patterns = [];

if (tars.config.autoprefixerConfig) {
    useAutoprefixer = true;
}

var scssFilesToConcatinate = [
        './markup/' + staticFolderName + '/scss/normalize.scss',
        './markup/' + staticFolderName + '/scss/libraries/**/*.scss',
        './markup/' + staticFolderName + '/scss/libraries/**/*.css',
        './markup/' + staticFolderName + '/scss/mixins.scss',
        './markup/' + staticFolderName + '/scss/sprites-scss/sprite_96.scss'
    ];

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        './markup/' + staticFolderName + '/scss/sprites-scss/svg-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    './markup/' + staticFolderName + '/scss/fonts.scss',
    './markup/' + staticFolderName + '/scss/vars.scss',
    './markup/' + staticFolderName + '/scss/GUI.scss',
    './markup/' + staticFolderName + '/scss/common.scss',
    './markup/' + staticFolderName + '/scss/plugins/**/*.scss',
    './markup/' + staticFolderName + '/scss/plugins/**/*.css',
    './markup/modules/*/*.scss'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Scss compilation
 */
module.exports = function () {
    return gulp.task('css:compile-css', function () {
        helperStream = gulp.src(scssFilesToConcatinate);
        mainStream = helperStream.pipe(addsrc.append('./markup/' + staticFolderName + '/scss/etc/**/*.scss'));
        ie9Stream = helperStream.pipe(
                                addsrc.append([
                                        './markup/modules/*/ie/ie9.scss',
                                        './markup/' + staticFolderName + '/scss/etc/**/*.scss'
                                    ])
                            );

        mainStream
            .pipe(concat('main' + tars.options.build.hash + '.css'))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(sass({
                    errLogToConsole: false,
                    onError: function (error) {
                        notify().write('\nAn error occurred while compiling css.\nLook in the console for details.\n');
                        return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                    }
                }))
            .pipe(
                gulpif(useAutoprefixer,
                    autoprefixer(
                        {
                            browsers: tars.config.autoprefixerConfig,
                            cascade: true
                        }
                    )
                )
            )
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest('./dev/' + staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier('Scss-files\'ve been compiled')
            );

        return ie9Stream
            .pipe(concat('main_ie9' + tars.options.build.hash + '.css'))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(sass({
                errLogToConsole: false,
                onError: function (error) {
                    notify().write('\nAn error occurred while compiling css for ie9.\nLook in the console for details.\n');
                    return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                }
            }))
            .pipe(autoprefixer('ie 9', { cascade: true }))
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest('./dev/' + staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier('Css-files for ie9 have been compiled')
            );
    });
};