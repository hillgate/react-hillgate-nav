# gulp
awspublish = require('gulp-awspublish')
buffer = require('vinyl-buffer')
cached = require('gulp-cached')
del = require('del')
ecstatic = require('ecstatic')
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
  './node_modules/drop/drop.js'
  './node_modules/drop/css/drop-theme-arrows-bounce.css'
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

gulp.task 'dist:clean', (cb) ->
  del paths.dist, cb

gulp.task 'dist', ->
  gulp.src(join(paths.tmp, '*.html'))
    .pipe(usemin(
      css: [minifyCss(), rev()]
      js: [uglify(), rev()]
      js1: [uglify(), rev()]
      html: [ minifyHtml(empty: true) ]
    ))
    .pipe(gulp.dest(paths.dist))

gulp.task 'content', ->
  gulp.src(join(paths.tmp, 'content/**/*'))
    .pipe(gulp.dest(join(paths.dist, 'content')))

publisher = awspublish.create bucket: 'resources.hillgateconnect.com'
gulp.task 'publish:bare', ->
  gulp.src([
    "#{paths.dist}/**/*.html"
    "#{paths.dist}/**/*.md"
  ])
    .pipe(awspublish.gzip())
    .pipe(publisher.publish('Cache-Control': 'max-age=600')) # 10 minutes
    .pipe(awspublish.reporter())

gulp.task 'publish:revved', ->
  gulp.src([
    "#{paths.dist}/**/*"
    "!#{paths.dist}/**/*.html"
    "!#{paths.dist}/**/*.md"
  ])
    .pipe(awspublish.gzip())
    .pipe(publisher.publish('Cache-Control': 'max-age=315360000')) # 10 years
    .pipe(awspublish.reporter())

gulp.task 'deploy', (callback) ->
  runSequence(
    ['dist:clean']
    ['dist', 'content']
    ['publish:bare', 'publish:revved']
    callback
  )
