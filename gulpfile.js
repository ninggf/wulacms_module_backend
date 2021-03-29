const {src, dest, parallel} = require('gulp');
const pkg                   = require('./package.json')
const os                    = require('os')
const through               = require('through2');
const babelc                = require('@babel/core')
const babel                 = require('gulp-babel')
const less                  = require('gulp-less')
const lessc                 = require('less')
const postcss               = require('gulp-postcss')
const autoprefix            = require('autoprefixer')
const pxtorem               = require('postcss-pxtorem')
const connect               = require('gulp-connect')
const minimist              = require('minimist')
const cleancss              = require('gulp-clean-css')
const minifyCSS             = require('clean-css');
const clean                 = require('gulp-rimraf')
const uglify                = require('gulp-uglify')
const uglifyJs              = require('uglify-js');
const relogger              = require('gulp-strip-debug')
const validate              = require('gulp-jsvalidate')
const notify                = require('gulp-notify')
const header                = require('gulp-header')
const sourceMap             = require('gulp-sourcemaps')
const identityMap           = require('@gulp-sourcemaps/identity-map')
const include               = require('gulp-include')
const rename                = require('gulp-rename')

let babelRc = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "loose"             : true,
                "modules"           : false,
                "forceAllTransforms": true
            }
        ]
    ],
    "plugins": [
        "@babel/plugin-proposal-class-properties"
    ],
    "compact" : true
};

const knownOptions = {
    string : 'env',
    default: {
        env: process.env.NODE_ENV || 'dev',
        m  : 'all'
    }
}
    , options      = minimist(process.argv.slice(2), knownOptions)

const cmt        = '/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> License By <%= pkg.homepage %> */' + os.EOL + ' <%= js %>'
    , note       = [cmt, {
    pkg: pkg,
    js : ';'
}]
    , noteCss    = [cmt, {
    pkg: pkg,
    js : ''
}]
    , compile    = (stream, file, content, css, next) => {
    let gps    = /<template>(.*)<\/template>/ims.test(content),
        tpl    = gps ? RegExp.$1 : null;
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

    file.contents = Buffer.from(content);//替换文件内容
    stream.push(file);
    next();
}
    , compileTpl = (stream, file, content, css, next) => {
    let gps      = /<template>(.*)<\/template>/ims.test(content)
        , tpl    = gps ? RegExp.$1 : null
        , script = /^<script[^>]*>(.*)<\/script>/ims.test(content)
        , code   = script ? RegExp.$1.trim() : ''
        , cnts   = []
        , minCss = css.css

    if (css && options.env === 'pro') {
        minCss = new minifyCSS({
            compatibility: '*'
        }).minify(css.css).styles;
    }
    if (minCss) {
        cnts.push('<style>' + minCss + '</style>')
    }
    if (tpl) {
        cnts.push(tpl.trim())
    }

    if (script) {
        const fileOpts = Object.assign({}, babelRc, {
            filename        : file.path,
            filenameRelative: file.relative,
            sourceMap       : Boolean(file.sourceMap),
            sourceFileName  : file.relative
        });
        let sc         = babelc.transformSync(code, fileOpts)
            , fp       = file.path
            , php_code = '<script><?php echo \'window.pageData = \',json_encode($pageData??[]);?>;'
        if (options.env === 'pro') {
            let min = uglifyJs.minify(sc.code, {warnings: true, fromString: true})
            if (!min.error) {
                sc.code = min.code
            } else {
                console.error(min.error)
                notify.onError(min.error)
            }
        }
        cnts.push(php_code + sc.code + '</script>')
    }

    file.contents = Buffer.from(cnts.join("\n"));//替换文件内容
    stream.push(file);
    next();
};

const compileVue = () => {
    return through.obj(function (file, enc, cbx) {
        if (file.isNull()) {
            cbx(null, file);
            return;
        }
        let content = file.contents.toString();

        let les = /<style\s+id\s*=\s*"([^"]+)"[^>]*>(.*)<\/style>/ims.test(content),
            css = les ? RegExp.$2.trim() : null;
        if (css) {
            let styleID = RegExp.$1.trim();
            //编译less
            lessc.render(css, {
                async    : false,
                fileAsync: false
            }).then((val) => {
                val.styleID = styleID;
                compile(this, file, content, val, cbx)
            })
        } else {
            compile(this, file, content, false, cbx)
        }
    });
};

const compileView = () => {
    return through.obj(function (file, enc, cbx) {
        if (file.isNull()) {
            cbx(null, file);
            return;
        }
        let content = file.contents.toString()
            , les   = /<style[^>]*>(.*)<\/style>/ims.test(content)
            , css   = les ? RegExp.$1.trim() : null;

        if (css) {
            //编译less
            lessc.render(css, {
                async    : false,
                fileAsync: false
            }).then((val) => {
                compileTpl(this, file, content, val, cbx)
            })
        } else {
            compileTpl(this, file, content, false, cbx)
        }
    });
}

const cleanTask = (cb, m) => {
    src([
        'assets/js',
        'assets/css',
        'assets/font',
        'assets/img',
        'assets/addon',
        'views/**/*.phtml',
    ], {
        allowEmpty: true
    }).pipe(clean())

    cb()
}

const copyImg = (cb, m) => {
    let gp = src([
        'src/**/*.png',
        'src/**/*.gif',
        'src/**/*.jpeg',
        'src/**/*.jpg',
        'src/**/*.webp'
    ], {
        allowEmpty: true
    })
    gp.pipe(dest('assets'))

    cb();
};

const buildJs = (cb, m) => {
    let gp = src(['src/js/**/[^_]*.js'], {
        allowEmpty: true
    })

    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.init()).pipe(identityMap());
    }
    if (options.env === 'pro') {
        gp = gp.pipe(include())
    }
    gp = gp.pipe(babel(babelRc)).on('error', (e) => {
        console.error(e.message)
        notify.onError(e.message)
    }).pipe(validate()).on('error', (e) => {
        notify.onError(e.message)
        console.error(e.message)
    })

    if (options.env === 'pro') {
        gp = gp.pipe(relogger())
        .pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(['js', e.message, e])
        }).pipe(header.apply(null, note))
    }

    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.write())
    }

    gp.pipe(dest('assets/js'))

    cb();
}

const buildAddonJs = (cb) => {
    let gp = src(['src/addon/**/*.js'], {
        allowEmpty: true
    })

    if (options.env === 'pro') {
        gp = gp.pipe(relogger()).pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(['js', e.message, e])
        }).pipe(header.apply(null, note))
    }

    gp = gp.pipe(dest('assets/addon'))

    if (options.watch) {
        gp.pipe(connect.reload());
    }

    cb();
}

const buildCss = (cb, m) => {
    let gp = src(['src/less/[^_]*.less'], {
        allowEmpty: true
    })

    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.init()).pipe(identityMap());
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
    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.write())
    }
    if (options.env === 'pro') {
        gp = gp.pipe(cleancss()).pipe(header.apply(null, noteCss))
    }
    gp.pipe(dest('assets/css'));

    cb();
}

const buildAdminCss = (cb) => {
    let gp = src(['src/css/**/*.css'], {
        allowEmpty: true
    })

    if (options.env === 'pro') {
        gp = gp.pipe(cleancss()).pipe(header.apply(null, noteCss))
    }
    gp.pipe(dest('assets/css'));

    cb();
}

const buildAddonCss = (cb) => {
    let gp = src(['src/addon/**/*.css'], {
        allowEmpty: true
    })

    if (options.env === 'pro') {
        gp = gp.pipe(cleancss()).pipe(header.apply(null, noteCss))
    }
    gp = gp.pipe(dest('assets/addon'));

    cb();
}

const copyAdminFont = (cb) => {
    let gp = src(['src/font/**'], {
        allowEmpty: true
    })
    gp.pipe(dest('assets/font'))

    cb();
};

const buildVue = (cb, f) => {
    let gp = src(['src/widget/*.vue'], {
        allowEmpty: true
    });
    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.init()).pipe(identityMap());
    }
    gp = gp.pipe(compileVue())
    .pipe(babel(babelRc)).on('error', (e) => {
        console.error(e.message);
        notify.onError(e.message)
    })
    .pipe(validate()).on('error', (e) => {
        notify.onError(e.message);
        console.error(e.message)
    });

    if (options.env === 'pro') {
        gp = gp.pipe(relogger()).pipe(uglify()).on('error', (e) => {
            notify.onError(e.message)
            console.error(['widget', e.message])
        }).pipe(header.apply(null, note))
    }

    if (options.env !== 'pro') {
        gp = gp.pipe(sourceMap.write())
    }

    gp.pipe(dest('assets/js'));
    cb();
}

const buildView = (cb, f) => {
    let gp = src(['src/views/**/*.vue'], {
        allowEmpty: true
    });

    gp.pipe(compileView())
    .pipe(rename((path) => {
        path.extname = '.phtml'
    }))
    .pipe(dest('views', f));
    cb();
}

exports.default = parallel(buildCss, buildJs, buildVue, buildView, copyImg, buildAdminCss, buildAddonJs, buildAddonCss, copyAdminFont)

exports.build = exports.default

exports.clean = cleanTask