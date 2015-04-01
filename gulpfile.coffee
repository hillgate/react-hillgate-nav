# gulp
buffer = require('vinyl-buffer')
cached = require('gulp-cached')
del = require('del')
ecstatic = require('ecstatic')
ghPages = require('gulp-gh-pages')
gulp = require('gulp')
gutil = require('gulp-util')
http = require('http')
liveReload = require('gulp-livereload')
minifyHtml = require('gulp-minify-html')
path = require('path')
rev = require('gulp-rev')
runSequence = require('run-sequence')
source = require('vinyl-source-stream')
sourcemaps = require('gulp-sourcemaps')
usemin = require('gulp-usemin')

# css
suitcss = require('gulp-suitcss')
minifyCss = require('gulp-minify-css')

# js
browserify = require('browserify')
reactify = require('reactify')
uglify = require('gulp-uglify')
watchify = require('watchify')

join = ->
  Array::slice.call(arguments).join ''

paths =
  src: 'src/'
  dist: 'dist/'
  tmp: 'tmp/'
paths.static = [
  join(paths.src, '**/*')
  join('!', paths.src, '**/*.css')
  join('!', paths.src, '**/*.js*')
]
paths.css = [
  'index.css'
  join(paths.src, '**/*.css')
]
paths.js = join(paths.src, 'js/app.js')

# development
# ============================================================================
gulp.task 'dev:clean', (cb) ->
  del paths.tmp, cb

gulp.task 'dev:static', ->
  gulp.src(paths.static)
    .pipe(cached('static'))
    .pipe(gulp.dest(paths.tmp))
    .pipe(liveReload())

gulp.task 'dev:css', ->

  # Note: We do not include subfolders in the source glob
  gulp.src(join(paths.src, 'css/app.css'))
    .pipe(suitcss())
    .pipe(gulp.dest(join(paths.tmp, 'css/')))
    .pipe(liveReload())

bundler = watchify browserify "./#{paths.js}", watchify.args
bundler.transform reactify

bundle = ->
  bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init(loadMaps: true))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(join(paths.tmp, 'js/')))
    .pipe(liveReload())

gulp.task 'dev:js', bundle

gulp.task 'dev', (callback) ->
  runSequence [ 'dev:clean' ], [
    'dev:static'
    'dev:css'
    'dev:js'
  ], callback

gulp.task 'server', (cb) ->
  port = parseInt(process.env.PORT) or 9090
  rootFolder = path.join(__dirname, paths.tmp)
  server = http.createServer(ecstatic(root: rootFolder))
  server.listen port, cb

gulp.task 'watch', ->
  gulp.watch paths.css, [ 'dev:css' ]
  bundler.on 'update', bundle
  gulp.watch paths.static, [ 'dev:static' ]

gulp.task 'default', (callback) ->
  runSequence [ 'dev' ], [
    'server'
    'watch'
  ], callback





# deploy
# ============================================================================

gulp.task 'deploy', ->
  gulp.src(join(paths.tmp, '**/*'))
    .pipe(ghPages())
