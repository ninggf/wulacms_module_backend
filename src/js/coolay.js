layui.define(['jquery', 'element'], (exports) => {
    'use strict';

    const $ = layui.$;

    const Coolay = function () {
    };

    Coolay.prototype.alert = msg => {
        alert('cool + ' + msg)
    };

    Coolay.prototype.dialog = (opts) => {

    };

    Coolay.prototype.apiGet = (data) => {
        return '';
    }

    Coolay.prototype.url = (url) => {
        return '';
    }

    /**
     * 设置页面标题
     * @param title
     */
    Coolay.prototype.setPageTitle = (title) => {
        document.title = title ? title : pageMeta.defaultTitle + pageMeta.titleSuffix
    }

    console.log(window.pageMeta)

    const _coolay   = new Coolay();
    window.Coolayui = _coolay;

    exports('&coolay', _coolay);
});
