var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var tarsConfig = require('../../../tars-config');
var notifier = require('../../helpers/notifier');

/**
 * Make sprite for svg-fallback and scss for this sprite
 * Return pipe with scss for sprite
 * @param  {object} buildOptions
 */
module.exports = function(buildOptions) {

    return gulp.task('css:make-fallback-for-svg', function(cb) {
        var spriteData = '';

        if (tarsConfig.useSVG && gutil.env.ie8) {

            spriteData = gulp.src('./dev/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/rastered-svg-images/*.png')
                .pipe(
                    spritesmith(
                        {
                            imgName: 'svg-fallback-sprite.png',
                            cssName: 'svg-fallback-sprite.scss',
                            Algorithms: 'diagonal',
                            cssTemplate: './markup/' + tarsConfig.fs.staticFolderName + '/scss/sprite-generator-templates/scss.svg-fallback-sprite.mustache'
                        }
                    )
                )
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while making fallback for svg.\nLook in the console for details.\n' + error;
                }));

            spriteData.img.pipe(gulp.dest('./dev/' + tarsConfig.fs.staticFolderName + '/' + tarsConfig.fs.imagesFolderName + '/rastered-svg-sprite/'))
                .pipe(
                    notifier('Sprite img for svg is ready')
                );

            return spriteData.css.pipe(gulp.dest('./markup/' + tarsConfig.fs.staticFolderName + '/scss/sprites-scss/'))
                    .pipe(
                        notifier('Scss for svg-sprite is ready')
                    );

        } else {
            gutil.log('!Svg-fallback is not used!');
            cb(null);
        }
    });
};