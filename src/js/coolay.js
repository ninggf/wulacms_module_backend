layui.define(['jquery', 'element'], function (exports) {
    'use strict';

    const $ = layui.$;

    class Coolay {
        init(pmeta, umeta) {
            this.pMeta   = pmeta // page Meta
            this.uMeta   = umeta // user Meta
            this.config  = {
                ids   : pmeta.id2dir,
                groups: pmeta.prefix,
                base  : pmeta.basedir
            }
            this.naviCfg = pmeta.naviCfg // menus
        }

        url(url) {
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

        setPageTitle(title) {
            document.title = (title ? title : this.pMeta.defaultTitle) + this.pMeta.titleSuffix
        }
    }

    exports('&coolay', new Coolay());
});
