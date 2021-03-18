__laydef = layui.define;
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
    },
    recoverState     : function (admin) {
        if (top.wulacfg.slocked) {
            admin.isLockScreen = true;
            admin.putTempData('isLockScreen', admin.isLockScreen, true);
            admin.putTempData('lockScreenUrl', top.wulacfg.lockurl, true);
            console.log('recoverState');
        }
    },
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