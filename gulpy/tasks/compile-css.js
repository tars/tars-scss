var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var autoprefix = require('gulp-autoprefixer');
var notify = require('gulp-notify');
var projectConfig = require('../../projectConfig');
var notifyConfig = projectConfig.notifyConfig;
var modifyDate = require('../helpers/modifyDateFormatter');
var browserSync = require('browser-sync');

var scssFilesToConcatinate = [
        './markup/' + projectConfig.fs.staticFolderName + '/scss/normalize.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/mixins.scss',
        './markup/' + projectConfig.fs.staticFolderName + '/scss/spritesScss/sprite96.scss'
    ],

    autoprefixerConfig = projectConfig.autoprefixerConfig.join(',');

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
        './markup/' + projectConfig.fs.staticFolderName + '/scss/etc/**/*.scss'
    );

/**
 * Scss compilation
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('compile-css', function() {
        gulp.src(scssFilesToConcatinate)
            .pipe(concat('main' + buildOptions.hash + '.css'))
            .pipe(sass({
                    errLogToConsole: false,
                    onError: function(error) {
                        notify().write('\nAn error occurred while compiling css.\nLook in the console for details.\n');
                        return gutil.log(gutil.colors.red(error));
                    }
                }))
            .pipe(autoprefix(autoprefixerConfig, { cascade: true }))
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
                        message: 'Scss-files\'ve been compiled. \n'+ notifyConfig.taskFinishedText +'<%= options.date %>',
                        templateOptions: {
                            date: modifyDate.getTimeOfModify()
                        }
                    })
                )
            );
        });
};