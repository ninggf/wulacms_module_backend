layui.define(['jquery', 'element'], function (exports) {
    'use strict';

    const $ = layui.$;

    const Coolay = function () {
        this.init = function (pmeta, umeta) {
            this.pMeta   = pmeta
            this.uMeta   = umeta
            this.config  = {
                ids   : pmeta.id2dir,
                groups: pmeta.prefix,
                base  : pmeta.basedir
            }
            this.naviCfg = pmeta.naviCfg
        }
    };

    Coolay.prototype.alert = function (msg) {
        alert('cool + ' + msg)
    };

    Coolay.prototype.dialog = function (opts) {

    };

    Coolay.prototype.apiGet = function (api, data) {
        return '';
    }

    Coolay.prototype.apiPost = function (api, data) {

    }

    /**
     * 生成URL.
     *
     * @param url
     * @returns string
     */
    Coolay.prototype.url = function (url) {
        if (typeof (url) === "string") {
            let config = this.config,
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
    }

    /**
     * 设置页面标题
     * @param title
     */
    Coolay.prototype.setPageTitle = function (title) {
        document.title = (title ? title : this.pMeta.defaultTitle) + this.pMeta.titleSuffix
    }

    exports('&coolay', new Coolay());
});
