/**
 * Created by paul.watkinson on 06/05/2016.
 */

'use strict';

const path = require('path').posix;

const gulp = require('gulp');

const browserify = require('browserify');
const incremental = require('browserify-incremental');
const babelify = require('babelify');
const aliasify = require('aliasify');

const buffer = require('vinyl-buffer');
const globify = require('require-globify');
const source = require('vinyl-source-stream');
const strip = require('gulp-strip-comments');
const uglify = require('gulp-uglify');

const del = require('del');

const SOURCE_ROOT = path.join(__dirname, '/src').replace(/\\/g, '/');
const OUTPUT_ROOT = path.join(__dirname, '/bin').replace(/\\/g, '/');

const BROWSERIFY_CONFIG = Object.assign({
    'entries': [path.join(SOURCE_ROOT, '/js/main.es6')],
    'paths': [SOURCE_ROOT],
    'extensions': ['.js', '.json', '.es6'],
    'browserField': false,
    'builtins': false,
    'commondir': false,
    'debug': true,
    'insertGlobalVars': {
        'process': 'undefined',
        'global': 'undefined',
        'Buffer.isBuffer': 'undefined',
        'Buffer': 'undefined'
    }
}, incremental.args);

const BABELIFY_CONFIG = {
    'extensions': ['.es6']
};

const ALIASIFY_CONFIG = {
    'verbose': true,
    'replacements': {
        '^config$': path.join(SOURCE_ROOT, 'config'),
        '^libs/transfer$': path.join(SOURCE_ROOT, 'js/libs/transfer'),
        'libs/(.*)': path.join(SOURCE_ROOT, 'js/libs/$1'),

        '^client$': path.join(SOURCE_ROOT, 'js/client'),
        '^client/manager$': path.join(SOURCE_ROOT, 'js/client/manager'),
        'client/(.*)': path.join(SOURCE_ROOT, 'js/client/$1'),

        '^server$': path.join(SOURCE_ROOT, 'js/server'),
        'server/(.*)': path.join(SOURCE_ROOT, 'js/server/$1')
    }
};

gulp.task('clean:bin', () => {
    return del([OUTPUT_ROOT + '/**/*'], { 'force': true });
});

let bundler = null;
gulp.task('bundle', ['clean:bin'], () => {
    if (!bundler) {
        let b = browserify(BROWSERIFY_CONFIG);

        incremental(b, {
            'cacheFile': path.join(__dirname, 'cache.json')
        });

        bundler = b
            .transform(globify)
            .transform(babelify, BABELIFY_CONFIG)
            .transform(aliasify, ALIASIFY_CONFIG);
    }

    return bundler
        .bundle()
        .on('error', function(error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(strip())
        // .pipe(uglify())
        .pipe(gulp.dest(OUTPUT_ROOT));
});

gulp.task('watch', ['bundle'], () => {
    return gulp.watch(['es6', 'js', 'json'].map(id => path.join(SOURCE_ROOT, `**/*.${id}`)), ['bundle']);
});

gulp.task('build', ['bundle'], () => {});
