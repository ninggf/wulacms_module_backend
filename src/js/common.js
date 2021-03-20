let __laydef = layui.define;
layui.config({
    version          : '3.0.1',
    base             : '$~/addon/',
    dir              : '$~/',
    module           : '$@',
    theme            : '$!',
    ajaxSuccessBefore: function (data, url, opts) {
        let $d = layui.$(document)
        switch (opts.xhr.status) {
            case 401:
                $d.trigger('auth.need.login');
                return false;
            case 403:
                $d.trigger('auth.perm.denied');
                return false;
            case 500:
                $d.trigger('status.500');
                return true;
            case 502:
                $d.trigger('status.502');
                return true;
            case 503:
                $d.trigger('status.503');
                return true;
            case 404:
                $d.trigger('status.404');
                return true;
            default:
                return true;
        }
    }
}).extend({
    steps     : 'steps/steps',
    notice    : 'notice/notice',
    cascader  : 'cascader/cascader',
    dropdown  : 'dropdown/dropdown',
    fileChoose: 'fileChoose/fileChoose',
    Split     : 'Split/Split',
    Cropper   : 'Cropper/Cropper',
    tagsInput : 'tagsInput/tagsInput',
    citypicker: 'city-picker/city-picker',
    introJs   : 'introJs/introJs',
    zTree     : 'zTree/zTree'
});
layui.define = (deps, factory) => {
    let type       = typeof deps === 'function'
        , callback = function () {

        const setApp = function (app, exports) {
            layui[app]               = exports;
            layui.cache.modules[app] = app;
            layui.cache.status[app]  = true;
        };

        typeof factory === 'function' && factory(function (app, exports) {
            setApp(app, exports);
            layui.cache.callback[app] = function () {
                factory(setApp);
            }
        });

        return this;
    };

    type && (factory = deps)
    callback()
    return layui
};

//=require ./modules/jquery.js
//=require ./modules/layer.js
//=require ./modules/element.js
//=require ./modules/form.js
//=require ./modules/laytpl.js
//=require ./modules/laypage.js
//=require ./modules/util.js
//=require ../addon/toastr.js
//=require ../addon/admin.js

if (__laydef) layui.define = __laydef;

layui.use(['admin'], (admin) => {
    admin.url    = function (url) {
        if (typeof (url) === "string") {
            if (/^(https?:\/\/|ftps?:\/\/|\/)/.test(url)) {
                return url;
            }
            let config = window.wulacfg,
                chunks = url.split('/');
            if (chunks[0].match(/^([~!@#%\^&\*])(.+)$/)) {
                let id     = RegExp.$2,
                    prefix = RegExp.$1;
                if (config.ids && config.ids[id]) {
                    id = config.ids[id];
                }
                if (config.groups && config.groups.char) {
                    for (let i = 0; i < config.groups.char.length; i++) {
                        if (config.groups.char[i] === prefix) {
                            prefix = config.groups.prefix[i];
                            break;
                        }
                    }
                }
                chunks[0] = prefix + id;
            } else {
                let id = chunks[0];
                if (config.ids && config.ids[id]) {
                    id        = config.ids[id];
                    chunks[0] = id;
                }
            }
            chunks[0] = config.base + chunks[0];
            url       = chunks.join('/');
        }
        return url;
    };
    admin.assets = function (url) {
        if (/^(\/|https?:\/\/).+/.test(url)) {
            return url;
        }
        return window.wulacfg.assets + url;
    };
    admin.base   = function (url) {
        if (/^(\/|https?:\/\/).+/.test(url)) {
            return url;
        }
        return window.wulacfg.base + url;
    };
    if (window !== top) {
        admin.toast = top.layui.toastr;
    }
});