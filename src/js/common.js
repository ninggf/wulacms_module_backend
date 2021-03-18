let __laydef = false;
//=require _laydef.js
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