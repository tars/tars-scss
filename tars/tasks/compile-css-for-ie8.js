'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var gulpif = tars.packages.gulpif;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var sourcemaps = tars.packages.sourcemaps;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var postcssProcessors = tars.config.postcss;
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var scssFilesToConcatinate = [
        scssFolderPath + '/normalize.scss',
        scssFolderPath + '/libraries/**/*.scss',
        scssFolderPath + '/libraries/**/*.css',
        scssFolderPath + '/mixins.scss',
        scssFolderPath + '/sprites-scss/sprite_96.scss'
    ];
var patterns = [];
var processors = [];
var generateSourceMaps = tars.config.sourcemaps.css.active && !tars.flags.release && !tars.flags.min;
var sourceMapsDest = tars.config.sourcemaps.css.inline ? '' : '.';

if (postcssProcessors && postcssProcessors.length) {
    postcssProcessors.forEach(function (processor) {
        processors.push(require(processor.name)(processor.options));
    });
}

processors.push(autoprefixer({browsers: ['ie 8']}));

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        scssFolderPath + '/sprites-scss/svg-fallback-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    scssFolderPath + '/sprites-scss/sprite-ie.scss',
    scssFolderPath + '/fonts.scss',
    scssFolderPath + '/vars.scss',
    scssFolderPath + '/GUI.scss',
    scssFolderPath + '/common.scss',
    scssFolderPath + '/plugins/**/*.scss',
    scssFolderPath + '/plugins/**/*.css',
    './markup/modules/*/*.scss',
    './markup/modules/*/ie/ie8.scss',
    scssFolderPath + '/etc/**/*.scss',
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
 * Scss compilation for ie8
 */
module.exports = function () {
    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8 || tars.flags.ie) {
            return gulp.src(scssFilesToConcatinate, { base: process.cwd() })
                .pipe(gulpif(generateSourceMaps, sourcemaps.init()))
                .pipe(concat({cwd: process.cwd(), path: 'main_ie8' + tars.options.build.hash + '.css'}))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass().on('error',
                function (error) {
                    notify().write('\nAn error occurred while compiling css for IE8.\nLook in the console for details.\n');
                    this.emit('end');
                    return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                }
            ))
                .pipe(postcss(processors))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulpif(generateSourceMaps, sourcemaps.write(sourceMapsDest)))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Scss-files for IE8 have been compiled')
                );
        } else {
            gutil.log('!Stylies for ie8 are not used!');
            cb(null);
        }
    });
};
