/*!
    This config represents:
    - sass lint and bundle with sourcemaps, compression, autoprefixer and rtl.
    - js bundle with babel, lint for dev and compression
    - images minifying and making sprite (with .png and .jpg formats only) with all 'icon-' named pictures
    - html - build files from pug or lint pure html and bundle with compression and modules structure

    Commands:
    gulp - dev build
    gulp watch - starts browserSync session, so you can change files on livestream
    gulp prod -  test/prod build
 */

let gulp = require('gulp'),

    /* Common plugins */
    plumber = require('gulp-plumber'), // Prevent pipe breaking caused by errors from gulp plugins (Doc: https://github.com/floatdrop/gulp-plumber#monkey-gulp-plumber)
    rename = require('gulp-rename'), // Renames compiled file (Doc: https://github.com/hparra/gulp-rename#usage)
    merge = require('merge-stream'), // Can merge several different pipes at one task (Doc: https://github.com/teambition/merge2#usage)
    del = require('del'), // Clears dist or whatever from folders/files (Doc: https://github.com/sindresorhus/del#usage)
    browserSync = require('browser-sync').create(), // Server with live edit stream (Doc: https://browsersync.io/docs/options/)

    /* style plugins */
    sass = require('gulp-sass'), // Sass compiler to css (Doc: https://github.com/dlmanning/gulp-sass#basic-usage)
    sassLint = require('gulp-sass-lint') // Lint for sass (Doc: https://github.com/sasstools/sass-lint#configuring)
    cleanCSS = require('gulp-clean-css'), // Minify and clear css (Doc: https://github.com/dlmanning/gulp-sass#basic-usage)
    autoprefixer = require('gulp-autoprefixer'), // Add prefixes to unsupported (Doc: https://github.com/sindresorhus/gulp-autoprefixer#usage)
    sourcemaps = require('gulp-sourcemaps'), // Sourcemap for css (Doc: https://github.com/gulp-sourcemaps/gulp-sourcemaps#usage)
    gcmq = require('gulp-group-css-media-queries'), // Concat media queries (Doc: https://github.com/avaly/gulp-group-css-media-queries#usage)
    rtlcss = require('gulp-rtlcss'), // Create rtl styles automatically from main ltr file (Doc: https://github.com/jjlharrison/gulp-rtlcss#basic-usage)

    /* js plugins */
    babel = require('gulp-babel'), // Babel for compiling es6 into es5 (Doc: https://github.com/babel/gulp-babel#usage)
    eslint = require('gulp-eslint'), // Lint for js (Doc: https://github.com/adametry/gulp-eslint#usage)
    uglify = require('gulp-uglify'), // Minify and clear js (Doc: https://github.com/terinjokes/gulp-uglify#usage)
    concat = require('gulp-concat'), // Concat js files into one bundle (Doc: https://github.com/contra/gulp-concat#usage)

    /* image plugins */
    spritesmith = require('gulp.spritesmith'), // Creates png sprite from {.jpg, .png} (Doc: https://github.com/twolfson/gulp.spritesmith#getting-started)
    smushit = require('gulp-smushit'), // Optimizing images for free up to 5MB! (not as good as tinypng, but better than nothing) (Doc: https://github.com/heldr/gulp-smushit#usage)
    svgmin = require('gulp-svgmin'), // Optimizing svg (Doc: https://github.com/ben-eb/gulp-svgmin#example)

    /* html plugins */
    pug = require('gulp-pug'), // Compile pug to html (Doc: https://github.com/pugjs/gulp-pug#api)
    htmlLint = require('gulp-html-lint'), // Lint for html (Doc: https://github.com/htmllint/htmllint/wiki/Options)
    htmlclean = require('gulp-htmlclean'), // Clean html for prod version (Doc: https://github.com/anseki/gulp-htmlclean#usage)
    injectPartials = require('gulp-inject-partials'); // injects partial _*.html files into main *.html files (Doc: https://github.com/meeroslav/gulp-inject-partials#basic-usage)

const path = {
    dist: {
        html: 'dist/',
        js: 'dist/assets/js/',
        jsPartial: 'dist/assets/js/partial',
        css: 'dist/assets/css/',
        img: 'dist/assets/img/'
    },

    src: {
        html: 'src/views/**/*.html',
        pug: 'src/views/**/*.pug',
        js: 'src/js/**/*.js',
        jsPartial: 'src/js/partial/**/*.js',
        css: 'src/sass/**/*.s+(a|c)ss',
        img: 'src/img/**/*'
    }
};

const config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 3223
};

gulp.task('styles', function() {
    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sassLint({configFile: './.sass-lint.yml'}))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gcmq())
        .pipe(gulp.dest(path.dist.css))
        .pipe(browserSync.stream()) // Update after normal styles changed
        // Comment lines below if u don't need rtl support
        .pipe(rtlcss()) // Convert to RTL.
        .pipe(rename({ prefix: 'rtl-' })) // Prepend "rtl-" to the filename.
        .pipe(gulp.dest(path.dist.css)) // Output RTL stylesheets.
        .pipe(browserSync.stream()); // Update after rtl styles
});

gulp.task('scripts', function() {
    return gulp.src(['!src/js/partial/*.js', path.src.js]) // This task doesn't work with partial files
        .pipe(plumber())
        .pipe(eslint({"fix": true}))
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .pipe(gulp.dest(file => file.base))
        .pipe(babel({
            presets: "env"
        }))
        .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
        .pipe(browserSync.stream());
});

gulp.task('partialScripts', function() { // But this task does!
    return gulp.src(path.src.jsPartial)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.jsPartial))
        .pipe(browserSync.stream());
});

gulp.task('images-copy', function() { // Actually, this task just copy images from src to dist
    return gulp.src(['!src/img/**/icon-*.{jpg,png,gif,bmp,tif}', path.src.img])
        .pipe(plumber())
        .pipe(gulp.dest(path.dist.img))
        .pipe(browserSync.stream());
});

gulp.task('images-min', function() { // This one is started with default gulp task and minify images.
    let imgRastr =  gulp.src(['!src/img/**/icon-*.{jpg,png,gif,bmp,tif}','src/img/**/*.{jpg,png,gif,bmp,tif}']) // Don't affect icons! They all are in the sprite file, so we don't need them at dist folder
        .pipe(plumber())
        .pipe(smushit()) // WARNING! Files should be UP TO 5MB !
        .pipe(gulp.dest('src/img/')) // Change images in source too. Why do we need not optimized images?
        .pipe(gulp.dest('dist/assets/img'));

    let imgVector = gulp.src('src/img/**/*.svg') // For minifying svg files
        .pipe(plumber())
        .pipe(svgmin())
        .pipe(gulp.dest('dist/assets/img'));

    return merge(imgRastr, imgVector);
});

gulp.task('sprite-task', function () {
    let spriteData = gulp.src('src/img/**/icon-*.{jpg,png}').pipe(spritesmith({ // Affect only icons (images started with 'icon-' prefix)
        imgName: 'sprite.png', // Sprite img name
        imgPath: '../img/sprite.png', // Relative path from style to sprite image
        cssName: '_sprite.css', // Sprite css name
        cssHandlebarsHelpers: { // Register helper for handlebars css template
            ifContains: function(arg1, arg2, options) { // Checks rather icon has needed suffix or not (in template). This was done for '-before' icons' styling.
                return (arg1.indexOf(arg2) !== -1) ? options.fn(this) : options.inverse(this);
            }
        },
        cssTemplate: 'sprite_template.css.handlebars' // Path to our handlebars template
    }));

    let imgStream = spriteData.img
        .pipe(gulp.dest('src/img/')); // Send our sprite to images folder

    let spriteStream = spriteData.css // Minify sprite css and send it to vendor folder
        .pipe(plumber())
        .pipe(cleanCSS({ // The most optimized options for sprite
            level: {
                2: {
                    restructureRules: true
                }
            }
        }))

        .pipe(gulp.dest('src/sass/vendor/'));

    return merge(spriteStream, imgStream);
});

gulp.task('sprite', ['sprite-task'], function() { // First create/update sprite and then merge it into main css bundle
    gulp.start('styles-prod');
});

gulp.task('html', function () {
  let htmlConcat =  gulp.src(['!src/views/**/_*.html', path.src.html])
    .pipe(plumber())
    .pipe(injectPartials({removeTags: true}))
    .pipe(htmlclean({})) // Disable if you don't need html compression
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());

  let htmlLinter = gulp.src(path.src.html)
    .pipe(plumber())
    .pipe(htmlLint({ htmllintrc: "./.htmllintrc"}))
    .pipe(htmlLint.format())
    .pipe(htmlLint.failOnError())

  return merge(htmlLinter, htmlConcat);
});

gulp.task('pug', function () {
  return gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream());
});

gulp.task('clean', function() {
    return del([path.dist.css, path.dist.js, path.dist.img, 'dist/**/*.html']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('html', 'pug', 'sprite-task', 'styles', 'scripts', 'partialScripts', 'images-copy');
});

gulp.task('watch', function() {
    browserSync.init(config);
    gulp.watch(path.src.css, ['styles']);
    gulp.watch(path.src.js, ['scripts']);
    gulp.watch(path.src.img, ['images-copy']);
    gulp.watch(path.src.html, ['html']);
    gulp.watch(path.src.pug, ['pug']);
    gulp.watch('src/img/**/icon-*.{jpg,png}', ['sprite-task']); // Sprite task affects change in styles. So after sprite created, 'styles' task executes
    gulp.watch('sprite_template.css.handlebars', ['sprite-task']); // Change sprite when you change its template
});

gulp.task('styles-prod', function() {
    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename({suffix: '.min'}))
        .pipe(gcmq())
        .pipe(cleanCSS({level: 2}))
        .pipe(gulp.dest(path.dist.css))
        // comment lines below if u don't need rtl support
        .pipe(rtlcss()) // Convert to RTL.
        .pipe(rename({ prefix: 'rtl-' })) // Append "-rtl" to the filename.
        .pipe(gulp.dest(path.dist.css)); // Output RTL stylesheets.
});

gulp.task('prod', ['clean'], function() {
    gulp.start('pug', 'html', 'sprite', 'styles-prod', 'scripts', 'partialScripts', 'images-min');
});