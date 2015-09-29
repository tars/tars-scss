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
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var patterns = [];
var processors = [];
var processorsIE9 = [];
var generateSourceMaps = tars.config.sourcemaps.css && !tars.flags.release;

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
    '!./**/_*.scss'
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
                .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
                .pipe(concat({cwd: process.cwd(), path: 'main_ie9' + tars.options.build.hash + '.css'}))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass().on('error',
                    function (error) {
                        notify().write('\nAn error occurred while compiling css for IE9.\nLook in the console for details.\n');
                        this.emit('end');
                        return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                    }
                ))
                .pipe(postcss(processorsIE9))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulpif(generateSourceMaps, sourcemaps.write()))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Scss-files for ie9 have been compiled')
                );
        }

        return mainStream
            .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
            .pipe(concat({cwd: process.cwd(), path: 'main' + tars.options.build.hash + '.css'}))
            .pipe(replace({
                patterns: patterns,
                usePrefix: false
            }))
            .pipe(sass().on('error',
                function (error) {
                    notify().write('\nAn error occurred while compiling css.\nLook in the console for details.\n');
                    this.emit('end');
                    return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                }
            ))
            .pipe(postcss(processors))
            .on('error', notify.onError(function (error) {
                return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulpif(generateSourceMaps, sourcemaps.write()))
            .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
            .pipe(browserSync.reload({ stream: true }))
            .pipe(
                notifier('Scss-files\'ve been compiled')
            );
    });
};
