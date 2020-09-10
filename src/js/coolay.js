layui.define(['jquery','&main'], function (exports) {
    'use strict';
    const $ = layui.$;
    const Main= layui['&main']
    class Coolay {
        KSMain=new Main({
            v: 1
        });
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

        dialog(name){
            layui.use(name,conf=>{
                let vm=null;
                let cfg={
                    type: 1,
                    title:conf.dialog.title,
                    maxWidth:1920,
                    btn:[],
                    content:conf.dialog.content(),
                    success (dom){
                        conf.vue.el='#'+dom.attr('id')+' .layui-layer-content';
                        vm=new Vue(conf.vue)
                    },
                    cancel(index){
                        if(conf.dialog.cancel){
                            return conf.dialog.cancel(index)
                        }
                    },
                    end(){
                       if(vm){
                        vm.$destroy();
                       } 
                    },
                }
                //加载按钮
                conf.dialog.btns.forEach((item,i) => {
                    cfg.btn.push(item.name)
                    cfg['btn'+(i+1)]=()=>{
                        return item.fn.bind(vm)();
                    }
                });
                layer.open(cfg)
            })
        }
        notice(option){
            let notice=$(`<div ><h2 class='notice__title'>${option.title}</h2>
                            <div class='notice__content'><p>${option.content}</p></div>
                            <i class="layui-icon layui-icon-close-fill"></i></div>`)

            if($(".notice-list").length){
                $('.notice-list').append(notice)
            }else{
                $('<div class="notice-list"></div>').append(notice).appendTo('body').on('click','.layui-icon',(e)=>{
                    this.delNotice(0,$(e.target).parent())
                })
            }

            setTimeout(() => {
                notice.addClass('notice')
            },500);

            option.time=option.time||5000
            
            this.delNotice(option.time,notice);
        }
        delNotice (time,el){
            time=time?time:0;
            new Promise((resolve)=>{
                setTimeout(() => {
                    $(el).css({"right":-350,"opacity":0})
                    resolve();
                }, time);
            }).then(res=>{
                setTimeout(() => {
                    $(el).remove();
                }, 1000);
            })
        }  

        get(url,data,cb){
            this.ajaxApi('GET',url,data,cb);
        }
        post(url,data,cb){
            this.ajaxApi('POST',url,data,cb);
        }

        ajaxApi(method,url,data,cb){
            let self=this,reqFormatDataS = self.KSMain.formatReq(data);
            let api=reqFormatDataS.api;
            //测试
            self.KSMain.host=url+'/rest';
            //http://wxz.wulaphp.com/rest/rest.client.get?d

            $.ajax({ 
                type: method,
                url: self.KSMain.host+'/'+api,
                data: reqFormatDataS,
                dataType: "json",
                success: function(res){
                    cb(res.response);
                    if(res.response.error){
                        self.ajaxError(res.response.error);
                    }
                },
                error: function(res){
                    self.ajaxError({code:res.status})
                }
            });
            
        }
        ajax(method,url,data,cb){
            
        }
       
        ajaxError(error){
            let self=this,content="",title="";
            switch (error.code) {
                case 401:
                    layer.alert("请重新登录", (index)=>{
                        layer.close(index);
                    });
                break
                case 406:
                    content="非法请求，一般是因为timestamp和服务器时间相差超过5分钟";
                break
                case 500:
                    content="500 服务器运行出错";
                break
                default:
                    content=error.msg;
                break;
            }
            self.notice({
                title:title||'系统提示',
                content:content,
            })
        }
    }

    exports('&coolay', new Coolay());
});
