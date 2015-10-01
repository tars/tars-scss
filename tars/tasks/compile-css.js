'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var gulpif = tars.packages.gulpif;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var addsrc = tars.packages.addsrc;
var replace = tars.packages.replace;
var sourcemaps = tars.packages.sourcemaps;
var plumber = tars.packages.plumber;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var patterns = [];
var processors = [];
var processorsIE9 = [];
var generateSourceMaps = tars.config.sourcemaps.css.active && !tars.flags.release && !tars.flags.min;
var sourceMapsDest = tars.config.sourcemaps.css.inline ? '' : '.';

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
        processorsIE9.push(require(processor.name)(processor.options));
    });
}

processorsIE9.push(autoprefixer({browsers: ['ie 9']}));

if (tars.config.autoprefixerConfig) {
    processors.push(
        autoprefixer({browsers: tars.config.autoprefixerConfig})
    );
}

var scssFilesToConcatinate = [
        scssFolderPath + '/normalize.scss',
        scssFolderPath + '/libraries/**/*.scss',
        scssFolderPath + '/libraries/**/*.css',
        scssFolderPath + '/mixins.scss',
        scssFolderPath + '/sprites-scss/sprite_96.scss'
    ];

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        scssFolderPath + '/sprites-scss/svg-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    scssFolderPath + '/fonts.scss',
    scssFolderPath + '/vars.scss',
    scssFolderPath + '/GUI.scss',
    scssFolderPath + '/common.scss',
    scssFolderPath + '/plugins/**/*.scss',
    scssFolderPath + '/plugins/**/*.css',
    './markup/modules/*/*.scss',
    '!./**/_*.scss',
    '!./**/_*.css'
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
        var helperStream = gulp.src(scssFilesToConcatinate, { base: process.cwd() });
        var mainStream = helperStream.pipe(addsrc.append(scssFolderPath + '/etc/**/*.scss'));
        var ie9Stream = helperStream.pipe(
                                addsrc.append([
                                        './markup/modules/*/ie/ie9.scss',
                                        scssFolderPath + '/etc/**/*.scss'
                                    ])
                            );

        if (tars.flags.ie9 || tars.flags.ie) {
            ie9Stream
                .pipe(plumber({
                    errorHandler: function (error) {
                        notifier.error('An error occurred while compiling css for IE9.', error);
                        this.emit('end');
                    }
                }))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass({
                    outputStyle: 'expanded'
                }))
                .pipe(postcss(processorsIE9))
                .pipe(concat('main_ie9' + tars.options.build.hash + '.css'))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier.success('Scss-files for IE9 have been compiled')
                );
        }

        return mainStream
            .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
            .pipe(plumber({
                errorHandler: function (error) {
                    notifier.error('An error occurred while compressing css.', error);
                    this.emit('end');
                }
            }))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(sass({
                outputStyle: 'expanded'
            }))
            .pipe(postcss(processors))
            .pipe(concat('main' + tars.options.build.hash + '.css'))
            .pipe(gulpif(generateSourceMaps, sourcemaps.write(sourceMapsDest)))
            .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier.success('Scss-files\'ve been compiled')
            );
    });
};
