var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var autoprefix = require('gulp-autoprefixer');
var replace = require('gulp-replace-task');
var notify = require('gulp-notify');
var projectConfig = require('../../../projectConfig');
var notifyConfig = projectConfig.notifyConfig;
var modifyDate = require('../../helpers/modifyDateFormatter');
var browserSync = require('browser-sync');

var scssFilesToConcatinate = [
        './markup/' + projectConfig.fs.staticFolderName + '/scss/normalize.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/mixins.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/spritesScss/sprite96.scss'
    ];

    if (projectConfig.useSVG) {
        scssFilesToConcatinate.push(
            './markup/' + projectConfig.fs.staticFolderName + '/scss/spritesScss/svg-fallback-sprite.scss',
            './markup/' + projectConfig.fs.staticFolderName + '/scss/spritesScss/svg-sprite.scss'
        );
    }

    scssFilesToConcatinate.push(
        './markup/' + projectConfig.fs.staticFolderName + '/scss/fonts.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/vars.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/GUI.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/common.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/plugins/**/*.scss',
        './markup/modules/*/*.scss',
        './markup/modules/*/ie/ie9.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/etc/**/*.scss'
    );

/**
 * Scss compilation for ie9
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    var patterns = [];

    patterns.push(
        {
            match: '%=staticPrefix=%',
            replacement: projectConfig.staticPrefix
        }
    );

    return gulp.task('compile-css-for-ie9', function(cb) {
        if (gutil.env.ie9) {
            return gulp.src(scssFilesToConcatinate)
                .pipe(concat('main_ie9' + buildOptions.hash + '.css'))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass({
                    errLogToConsole: false,
                    onError: function(error) {
                        notify().write('\nAn error occurred while compiling css for ie9.\nLook in the console for details.\n');
                        return gutil.log(gutil.colors.red(error));
                    }
                }))
                .pipe(autoprefix('ie 9', { cascade: true }))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while autoprefixing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + projectConfig.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({stream:true}))
                .pipe(
                    gulpif(notifyConfig.useNotify,
                        notify({
                            onLast: true,
                            sound: notifyConfig.sounds.onSuccess,
                            title: notifyConfig.title,
                            message: 'Css-files for ie9 have been compiled. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                            templateOptions: {
                                date: modifyDate.getTimeOfModify()
                            }
                        })
                    )
                );
        } else {
            gutil.log('!Stylies for ie9 are not used!');
            cb(null);
        }
    });
};