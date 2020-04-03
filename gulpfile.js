const {
          src,
          dest,
          series,
          parallel,
          watch
      } = require('gulp');

const pkg         = require('./package.json')
const fs          = require('fs')
const os          = require('os')
const through     = require('through2');
const sourcemap   = require('gulp-sourcemaps')
const identityMap = require('@gulp-sourcemaps/identity-map')
const babel       = require('gulp-babel')
const less        = require('gulp-less')
const lessc       = require('less')
const postcss     = require('gulp-postcss')
const autoprefix  = require('autoprefixer')
const pxtorem     = require('postcss-pxtorem')
const connect     = require('gulp-connect')
const minimist    = require('minimist')
const preprocess  = require("gulp-preprocess")
const cleancss    = require('gulp-clean-css')
const minifyCSS   = require('clean-css');
const clean       = require('gulp-rimraf')
const uglify      = require('gulp-uglify')
const relogger    = require('gulp-remove-logging')
const validate    = require('gulp-jsvalidate')
const notify      = require('gulp-notify')
const header      = require('gulp-header')
const open        = require('gulp-open')

const knownOptions = {
          string : 'env',
          default: {
              env: process.env.NODE_ENV || 'dev'
          }
      },
      options      = minimist(process.argv.slice(2), knownOptions)

const cmt        = '/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> License By <%= pkg.homepage %> */' + os.EOL + ' <%= js %>',
      note       = [cmt, {
          pkg: pkg,
          js : ';'
      }],
      noteCss    = [cmt, {
          pkg: pkg,
          js : ''
      }],
      layuiTasks = {
          //压缩js模块
          minjs(cb) {

              //可指定模块压缩，eg：gulp minjs --mod layer,laytpl
              let mod  = options.mod ? function () {
                      return '(' + options.mod.replace(/,/g, '|') + ')';
                  }() : '',
                  srcx = [
                      'layui/src/**/*' + mod + '.js', '!layui/src/**/mobile/*.js', '!layui/src/lay/**/mobile.js', '!layui/src/lay/all.js', '!layui/src/lay/all-mobile.js'
                  ]

              let gp = src(srcx)

              if (options.env == 'pro')
                  gp = gp.pipe(uglify())

              gp = gp.pipe(dest('./'))

              if (options.watch)
                  gp.pipe(connect.reload())

              cb()
          },

          //压缩css文件
          mincss(cb) {
              const srcx = [
                  'layui/src/css/**/*.css', '!layui/src/css/**/font.css'
              ]

              let gp = src(srcx)

              if (options.env == 'pro')
                  gp = gp.pipe(cleancss())

              gp = gp.pipe(dest('css'))

              if (options.watch)
                  gp.pipe(connect.reload());

              cb()
          },

          //复制iconfont文件
          font(cb) {
              src('layui/src/font/*')
              .pipe(dest('font'))

              cb()
          },

          //复制组件可能所需的非css和js资源
          mv(cb) {
              const srcx = ['layui/src/**/*.{png,jpg,gif,html,mp3,json}']

              src(srcx).pipe(dest('./'))

              cb()
          }
      };

const compileVue = function () {
    const compile = (stream, file, content, css, next) => {
        let gps    = /<template>(.*)<\/template>/ims.test(content), tpl = gps ? RegExp.$1 : null;
        let script = /<script[^>]*>(.*)<\/script>/ims.test(content);
        if (tpl && script) {
            content = RegExp.$1.trim().replace('$tpl$', tpl.trim())
        } else if (script) {
            content = RegExp.$1.trim()
        }
        if (css) {
            let minCss = new minifyCSS({
                compatibility: '*'
            }).minify(css.css).styles;

            let styleId = css.styleID;
            content     = `layui.injectCss('cmp-${styleId}',\`${minCss}\`);` + content;
        }

        file.contents = Buffer.from(content);
        stream.push(file);
        next();
    };
    return through.obj(function (file, enc, cbx) {
        let content = file.contents.toString();

        let les = /<style\s+id\s*=\s*"([^"]+)"[^>]*>(.*)<\/style>/ims.test(content),
            css = les ? RegExp.$2.trim() : null;
        if (css) {
            let styleID = RegExp.$1.trim();
            lessc.render(css, {
                async    : false,
                fileAsync: false
            }).then((val) => {
                val.styleID = styleID;
                compile(this, file, content, val, cbx)
            }).catch((err) => {
                compile(this, file, content, false, cbx);
            });
        } else {
            compile(this, file, content, false, cbx)
        }
    });
};

const cleanTask = cb => {
    src(['lay/*', 'css/*', 'demo/*', 'font/*', 'images/*', 'layui.js'], {
        read      : true,
        allowEmpty: true
    }).pipe(clean())

    cb()
}

const buildCss = cb => {
    let gp = src(['src/less/[^_]*.less'])

    if (options.env != 'pro') {
        gp = gp.pipe(sourcemap.init()).pipe(identityMap());
    }

    gp = gp.pipe(less()).on('error', e => {
        console.error(e.message)
    })
    .pipe(postcss([pxtorem({
        rootValue: 16
    }), autoprefix()]))
    .on('error', e => {
        console.error(e.message)
    })

    // write sourcemap
    if (options.env != 'pro')
        gp = gp.pipe(sourcemap.write())

    if (options.env == 'pro')
        gp = gp.pipe(cleancss()).pipe(header.apply(null, noteCss))

    gp = gp.pipe(dest('css'))

    if (options.watch)
        gp = gp.pipe(connect.reload());

    cb();
}

const buildJs = cb => {
    let gp = src(['src/js/*.js'])

    if (options.env != 'pro') {
        gp = gp.pipe(sourcemap.init()).pipe(identityMap());
    }

    gp = gp.pipe(babel()).on('error', (e) => {
        console.error(e.message)
        notify.onError(e.message)
    }).pipe(validate()).on('error', (e) => {
        notify.onError(e.message)
        console.error(e.message)
    })

    if (options.env != 'pro')
        gp = gp.pipe(sourcemap.write())

    if (options.env == 'pro')
        gp = gp.pipe(relogger({
            replaceWith: 'void 0'
        })).pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(e.message)
        }).pipe(header.apply(null, note))

    gp = gp.pipe(dest('lay/exts'))

    if (options.watch)
        gp.pipe(connect.reload());

    cb();
}

const buildmJs = cb => {
    let gp = src(['src/mjs/*.js'])

    if (options.env != 'pro') {
        gp = gp.pipe(sourcemap.init()).pipe(identityMap());
    }

    gp = gp.pipe(babel()).on('error', (e) => {
        console.error(e.message)
        notify.onError(e.message)
    }).pipe(validate()).on('error', (e) => {
        notify.onError(e.message)
        console.error(e.message)
    })

    if (options.env != 'pro')
        gp = gp.pipe(sourcemap.write())

    if (options.env == 'pro')
        gp = gp.pipe(relogger({
            replaceWith: 'void 0'
        })).pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(e.message)
        }).pipe(header.apply(null, note))

    gp = gp.pipe(dest('js'))

    if (options.watch) {
        gp.pipe(connect.reload());
    }

    cb();
}

const buildVue = cb => {
    let gp = src(['src/components/*.vue']);

    gp = gp.pipe(compileVue()).pipe(babel()).on('error', (e) => {
        console.error(e.message);
        notify.onError(e.message)
    }).pipe(validate()).on('error', (e) => {
        notify.onError(e.message);
        console.error(e.message)
    });

    if (options.env == 'pro')
        gp = gp.pipe(relogger({
            replaceWith: 'void 0'
        })).pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(e.message)
        }).pipe(header.apply(null, note))

    gp = gp.pipe(dest('lay/exts'));

    if (options.watch) {
        gp.pipe(connect.reload());
    }
    cb();
}

const buildHtml = cb => {
    let gp = src(['src/html/**/*.{html,js}']).pipe(preprocess({
        context: options
    })).on('error', e => {
        console.error(e.message)
    }).pipe(dest('demo'))

    if (options.watch) {
        gp.pipe(connect.reload());
    }

    cb()
}

const mvAssets = cb => {
    const srcx = ['./src/**/*.{png,jpg,gif,mp3,json,eot,svg,ttf,woff,woff2}']

    let gp = src(srcx).pipe(dest('./'))

    if (options.watch)
        gp.pipe(connect.reload());

    cb()
}

const watching = cb => {
    // start dev server
    connect.server({
        root      : './',
        livereload: true,
        port      : 9090,
    })

    src(['.babelrc'], {
        allowEmpty: true
    }).pipe(open({
        uri: 'http://127.0.0.1:9090/demo/'
    }))

    options.watch = true

    watch(['src/html/**/*.{html,js,htm}'], buildHtml)
    watch(['src/js/**/*.js'], buildJs)
    watch(['src/mjs/**/*.js'], buildmJs)
    watch(['src/less/**/*.less'], buildCss)
    watch(['src/components/*.vue'], buildVue)
    watch(['src/**/*.{png,jpg,gif,mp3,json,eot,svg,ttf,woff,woff2}'], mvAssets)

    if (fs.existsSync('layui/')) {
        watch(['layui/src/**/*.js'], layuiTasks.minjs)
        watch(['layui/src/**/*.css'], layuiTasks.mincss)
    }

    cb()
}

const buildLayui = fs.existsSync('layui/') ? parallel(layuiTasks.minjs, layuiTasks.mincss, layuiTasks.mv, layuiTasks.font) : cb => {
    console.log('skip build layui')
    cb()
}

exports.clean = cleanTask

exports.build      = parallel(buildCss, buildVue, buildmJs, buildJs, buildHtml, mvAssets, buildLayui);
exports.buildVue   = buildVue;
exports.buildLayui = buildLayui;

exports.default = series(cb => {
    options.env = 'pro'
    cb()
}, exports.build);

exports.watch = series(exports.build, watching)
