/*****************************
  
  front-end build
  gulpfile.js

  Antonis Karamitros
  2014
 *****************************/

(function() {

'use strict';

    //  modules
var exec          = require('child_process').exec,
    gulp          = require('gulp'),
    es            = require('event-stream'),
    path          = require('path'),
    runSequence   = require('run-sequence'),
    source        = require('vinyl-source-stream'),
    vinylBuffer   = require('vinyl-buffer'),
    rimraf        = require('rimraf'),
    //  gulp plugins
    gulpUtil      = require('gulp-util'),
    less          = require('gulp-less'),
    eslint        = require('gulp-eslint'),
    concat        = require('gulp-concat'),
    order         = require('gulp-order'),
    tap           = require('gulp-tap'),
    //  variables
    execute,
    preparationTasks,
    assets = {
      locale: {},
      inline: {}
    },
    paths = {};  //  environment is develop by default


/**********************************************************/
/** set paths **/
paths.base = '.';
//  source
paths.src         = path.join(paths.base, 'src');
paths.styles      = path.join(paths.src, 'styles');
paths.markup      = path.join(paths.src, 'markup');
paths.scripts     = path.join(paths.src, 'scripts');
paths.thirdParty  = path.join(paths.src, '3rd-party');
// deploy
paths.deploy      = path.join(paths.base, 'deploy');


var
htmlIndexFile = [
  path.join(paths.markup, 'index.html')
],
lessFiles = [
  path.join(paths.styles, '**/*.less')
],
thirdPartyCss = [
  path.join(paths.thirdParty, 'css', '*.css')
];
/**********************************************************/
/** helper functions **/
execute = function(command, callback){
  exec(command, function(err, stdout){
    if(err){
      throw err;
    }

    callback(stdout);
  });
};

/**********************************************************/
/** Tasks **/

//  clean the deploy target directory
gulp.task('clean-deploy', function(taskDone){

  rimraf(paths.deploy, function(err){
    if(err){
      throw err;
    }
    taskDone();
  });
});

//  lint the gulpfile code
gulp.task('lint-self', function(){

  return gulp.src('./gulpfile.js')
  .pipe( eslint({ config: '.eslintrc' }) )
  .pipe( eslint.format() );
});

//  read and save in memory the index.html file
gulp.task('read-index-html', function(taskDone){

  gulp.src(htmlIndexFile)
  //  tap in and save the contents of the index.html file
  .pipe( tap(function(file) {
    assets.index_html = file._contents.toString();
  }) )
  .on('end',function(){
    taskDone();
  });
});

// process style files, output main css file
gulp.task('styles', function(taskDone){

  es.merge(
    //  grab the CSS files
    gulp.src(thirdPartyCss)
    .pipe( concat('3rdparty.css') ),

    //  process the LESS files
    gulp.src( path.join(paths.styles, 'main.less') )
    .pipe( less() )
  )
  .pipe( order([
    '3rdparty.css',
    '*'
  ]) )
  .pipe( concat('main.min.css') )
  //   tap in the stream to get the minified CSS file contents
  .pipe( tap(function(file, t) {
    assets.main_css = file._contents.toString();
    return t;
  }) )
  .on('end',function(){
    taskDone();
  });
});

//  inline the main.css into index.html ( in memory )
gulp.task('inline-css', function(taskDone){

  var regexCssPlaceholder = /<!--\s+main_css-placeholder\s+-->/;
  // replace the main.css [;aceholder] into the index.hmtl files
  assets.index_html = assets.index_html.replace(regexCssPlaceholder, '<style>'+assets.main_css+'</style>');
  taskDone();
});

//  write the complete index.html in the disk
gulp.task('write-index-html', function(){

  var stream = source('index.html'),
      file_contents = assets.index_html;

  stream.write(file_contents);

  process.nextTick(function(){
    stream.end();
  });

  return stream
  .pipe( vinylBuffer() )
  .pipe( gulp.dest(paths.deploy) );
});

//  task to rebuild the index.html file without building the stylesheet main.css file
gulp.task('rebuild-index-html', function(taskDone){
  if(assets.main_css === undefined){
    var err = new Error('no main.css was loaded');
    throw err;
  }

  runSequence(
    'read-index-html',
    'inline-css',
    'write-index-html',
    taskDone
  );
});

gulp.task('rebuild-style', function(taskDone){

  runSequence(
    ['read-index-html','styles'],
    'inline-css',
    'write-index-html',
    taskDone
  );
});

//  copy all image files
gulp.task('image-files', function(taskDone){

  gulp
  .src(paths.src + '/images/**/*.*')
  .pipe( gulp.dest(paths.deploy + '/images') )
  .on('end',function(){
      taskDone();
  });

});


gulp.task('serve',function(taskDone){

  gulpUtil.log('Serving the /deploy folder at localhost:8000');
  gulpUtil.log('ctrl+c to stop the server');
  execute('node dev-server/server.js', function(stdout){
    gulpUtil.log(stdout);
    taskDone();
  });
});


/**** main tasks ****/

preparationTasks = [
  'clean-deploy',
  'lint-self'
];


gulp.task('default', function(){

  gulpUtil.log('run `gulp build` to build the test');
  gulpUtil.log('run `gulp serve` to serve the /deploy directory');
});

//  ======================================================= develop main task
gulp.task('build', function(taskDone){

  runSequence(
    preparationTasks,
    ['read-index-html', 'styles'/*, 'image-files'*/],
    ['inline-css', 'write-index-html'],
    taskDone
  );
});

//  ======================================================= watchers
//  main watcher task
gulp.task('watch', function(){

  gulpUtil.log('watching files...');

  gulp.watch([htmlIndexFile], ['rebuild-index-html']);

  //  watch stylesheets
  gulp.watch([thirdPartyCss, lessFiles], ['rebuild-style']);

});

//  watcher for develop
gulp.task('watch-dev', function(taskDone){
  runSequence(
    'build',
    'watch',
    taskDone
  );
});


})();
