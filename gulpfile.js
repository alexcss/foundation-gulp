"use strict";

var gulp = require('gulp'),
	watch = require('gulp-watch'),
	include = require("gulp-include"),
	prefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	rimraf = require('rimraf'),
	browserSync = require("browser-sync"),
	notify = require('gulp-notify'),
	argv = require('yargs').argv,
	gulpif = require('gulp-if'),
	reload = browserSync.reload;

var path = {
	build: {
		html: 'build/',
		js: 'build/assets/js/',
		css: 'build/assets/css/',
		img: 'build/assets/img/',
		fonts: 'build/fonts/'
	},
	src: {
		html: ['src/**/*.html', '!src/templates{,/**}'],
		js: 'src/assets/js/app.js',
		jsfolder: 'src/assets/js/',
		style: 'src/assets/style/app.scss',
		img: 'src/assets/img/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	watch: {
		html: 'src/**/*.html',
		js: 'src/assets/js/**/*.js',
		style: 'src/assets/style/**/*.*',
		img: 'src/assets/img/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	clean: './build',
	favicons: ['src/favicon.png','src/apple-touch-icon.png'],
	//bootstrap: './node_modules/bootstrap-sass/assets',
	foundation: './node_modules/foundation-sites/',
	motionui: './node_modules/motion-ui/src',
	whatinput: './node_modules/what-input/dist/',
	slick: './node_modules/slick-carousel/slick',
	jquery: './node_modules/jquery/dist/',
	sourcemaps: '../sourcemaps'
};


var config = {
	server: {
		baseDir: "./build"
	},
	tunnel: false,
	host: 'localhost',
	port: 9000,
	logPrefix: "Beetroot_Academy"
};

gulp.task('webserver', function () {
	browserSync(config);
});

gulp.task('clean', function (cb) {
	rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
	gulp.src(path.src.html)
		.pipe(include({
				extensions: "html",
				hardFail: true,
			}).on('error', notify.onError(
					{
						message: "<%= error.message %>",
						title  : "HTML Error!"
					}
				)
			)
		)
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
	gulp.src(path.src.js)
		.pipe(sourcemaps.init())
		.pipe(include({
				extensions: "js",
				hardFail: true,
				includePaths: [path.slick, path.foundation + '/js', path.whatinput, path.jquery, path.src.jsfolder]
			}).on('error', notify.onError(
					{
						message: "<%= error.message %>",
						title  : "JS Error!"
					}
				)
			)
		)
		.pipe(
			gulpif(argv.production,
				uglify().on('error', notify.onError(
						{
							message: "<%= error.message %>",
							title  : "JS Error!"
						}
					)
				)
			)
		)
		.pipe(sourcemaps.write(path.sourcemaps))
		.pipe(gulp.dest(path.build.js))
		.pipe(notify({ message: 'JS task complete', sound: false, onLast: true }))
		.pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
	gulp.src(path.src.style)
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed',
			precision: 8,
			//sourceMap: true,
			//errLogToConsole: true
			includePaths: [path.foundation + '/scss', path.motionui, path.slick],
		}).on( 'error', notify.onError(
				{
					message: "<%= error.message %>",
					title  : "Sass Error!"
				}
			)
		))
		.pipe(prefixer())
		.pipe(sourcemaps.write(path.sourcemaps))
		// .pipe(cssmin())
		.pipe(gulp.dest(path.build.css))
		.pipe(notify({ message: 'Styles task complete', sound: false, onLast: true }))
		.pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
	gulp.src(path.src.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
	'html:build',
	'style:build',
	'js:build',
	'image:build',
	'fonts:build'
]);


gulp.task('watch', function(){
	watch(path.watch.html, function(event, cb) {
		gulp.start('html:build');
	});
	watch(path.watch.style, function(event, cb) {
		gulp.start('style:build');
	});
	watch(path.watch.js, function(event, cb) {
		gulp.start('js:build');
	});
	watch(path.watch.img, function(event, cb) {
		gulp.start('image:build');
	});
	watch(path.watch.fonts, function(event, cb) {
		gulp.start('fonts:build');
	});
});


gulp.task('default', ['build', 'webserver', 'watch']);
