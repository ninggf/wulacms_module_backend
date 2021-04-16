layui.config({
    version          : '3.0.1',
    base             : window.wulacfg.mBase + '/backend/assets/addon/',
    dir              : window.wulacfg.mBase + '/backend/assets/',
    module           : window.wulacfg.mBase,
    ajaxSuccessBefore: function (data, url, opts) {
        var $d = layui.$(document)
        switch (opts.xhr.status) {
            case 390:
                $d.trigger('auth.user.blocked');
                return false;
            case 391:
                $d.trigger('auth.user.locked');
                return false;
            case 401:
                $d.trigger('auth.need.login');
                return false;
            case 403:
                $d.trigger('auth.perm.denied', data);
                return true
            case 422:
                $d.trigger('form.data.invalid', data);
                return true
            default:
                if (data && typeof data === 'object') {
                    if (data.message) {
                        switch (data.code) {
                            case 500:
                                window.$notice.error(data.message)
                                break;
                            case 400:
                                window.$notice.warning(data.message)
                                break;
                            case 300:
                                window.$notice.info(data.message)
                                break;
                            case 200:
                                window.$notice.success(data.message)
                                break;
                        }
                    }
                    switch (data.action) {
                        case 'redirect':
                            window.location = data.target;
                            return false;
                        case 'reload':
                            if (data.target) {
                                layui.$(data.target).data('loaderObj').reloadData();
                            } else {
                                window.location.reload(true)
                            }
                            return false;
                        case 'click':
                            if (data.target) {
                                layui.$(data.target).click();
                                return false;
                            }
                    }
                }
                return true;
        }
    }
}).extend({
    steps     : 'steps/steps',
    notice    : 'notice/notice',
    cascader  : 'cascader/cascader',
    dropdownX : 'dropdown/dropdown',
    fileChoose: 'fileChoose/fileChoose',
    Split     : 'Split/Split',
    Cropper   : 'Cropper/Cropper',
    tagsInput : 'tagsInput/tagsInput',
    citypicker: 'city-picker/city-picker',
    introJs   : 'introJs/introJs',
    zTree     : 'zTree/zTree'
});

//=require ../addon/contextMenu.js
//=require ../addon/notice/notice.js
//=require ../addon/admin.js

window._t = function () {
    if (arguments.length === 0) return ''
    let msgG = arguments[0].split('@'), msg = msgG[0], gp = msgG.length > 1 ? msgG[1] : false, language, msgStr=msg
    if (gp) {
        language = window.wulacfg.lang['@' + gp]
        if (!language) {
            msgStr = msg
        }
    } else {
        language = window.wulacfg.lang
    }
    if (!msgStr && language[msg]) {
        msgStr = language[msg]
    }

    if (arguments.length > 1) {
        msgStr = msgStr.replaceAll(/%[sd]/g, '{@}')
        for (i = 1; i < arguments.length; i++) {
            msgStr = msgStr.replace('{@}', arguments[i])
        }
    }

    return msgStr
};

layui.use(['admin', 'notice'], function (admin, notice) {
    if (window === top) {
        window.$notice = notice;
    } else {
        window.$notice = top.$notice;
    }
    admin.url    = function (url) {
        if (typeof (url) === "string") {
            if (/^(https?:\/\/|ftps?:\/\/|\/)/.test(url)) {
                return url;
            }
            let config = window.wulacfg,
                chunks = url.split('/');
            if (chunks[0].match(/^([~!@#%^&\*])(.+)$/)) {
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
}, [], 'define');