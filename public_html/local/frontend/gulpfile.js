var 
	gulp                    = require('gulp'),
	mainBowerFiles          = require('gulp-main-bower-files'),
	gulpFilter              = require('gulp-filter'),
	concat                  = require('gulp-concat'),
	cleancss                = require('gulp-clean-css'),
	uglify                  = require('gulp-uglify'),
	sass                    = require('gulp-sass'),
	browserSync             = require('browser-sync'),
	autoprefixer            = require('gulp-autoprefixer'),
	notify                  = require("gulp-notify"),
	imageminJpegRecompress  = require('imagemin-jpeg-recompress'),
	pngquant       		    = require('imagemin-pngquant'),
	cache          		    = require('gulp-cache'),
	imagemin       		    = require('gulp-imagemin'),
	fileinclude				= require('gulp-file-include'),
	sourcemaps				= require('gulp-sourcemaps'),
	pug 					= require('gulp-pug');
	rename                  = require('gulp-rename'),

gulp.task('libs', function() {
	var filterJS = gulpFilter('**/*.js', { restore: true });
	var filterCSS = gulpFilter('**/*.css', { restore: true });
	return gulp.src('./bower.json')
	.pipe(mainBowerFiles())
	.pipe(filterJS)
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
	.pipe(filterJS.restore)
	.pipe(filterCSS)
	.pipe(concat('libs.min.css'))
	.pipe(cleancss({level: { 1: { specialComments: 0 } } }))
	.pipe(gulp.dest('app/css'))
	.pipe(filterJS.restore);
});

gulp.task('images', function() {
  return gulp.src('app/img/**/*.*')
    .pipe(cache(imagemin([
    	imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imageminJpegRecompress({
		loops: 2,
		min: 90,
		max: 98,
		quality:'90'
		}),
		imagemin.svgo(),
		imagemin.optipng({optimizationLevel: 2}),
		pngquant({quality: '90', speed: 1})
    ],{
    	verbose: true
    })))
    .pipe(gulp.dest('app/img/'));
});

gulp.task('pug-fix', () => {
    return gulp.src('source/pug-fix/*.js')
    .pipe(gulp.dest('node_modules/pug-parser/lib')); 
});

gulp.task('pug', () => {
    return gulp.src('source/pug/pages/*.pug')
    	.pipe(pug({
    		pretty: true,
    	}))
    	.on('error', notify.onError(function (error) {
		    return 'An error occurred while compiling jade.\nLook in the console for details.\n' + error;
		}))
        .pipe(gulp.dest('./app/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('styles', function() {
	return gulp.src('source/sass/**/*.sass')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 3 versions']))
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(sourcemaps.write('.'))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());
});

gulp.task('js', function() {
	return gulp.src([
		'source/js/common.js',
		])
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		open: true,
	})
});

gulp.task('watch', ['libs', 'pug', 'styles', 'js', 'browser-sync'], function() {
	gulp.watch('source/sass/**/*.sass', ['styles']);
	gulp.watch('source/pug/**/*.pug', ['pug']);
	gulp.watch(['source/js/common.js'], ['js']);
});

gulp.task('default', ['watch']);

gulp.task('build', ['pug-fix','styles', 'pug', 'images']);