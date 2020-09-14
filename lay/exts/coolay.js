/** wulacms-v3.0.0 MIT License By https://www.wulacms.com */
 ;function _defineProperty(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}layui.define(["jquery","&main"],function(t){"use strict";var s=layui.$,e=layui["&main"];t("&coolay",new(function(){function t(){_defineProperty(this,"KSMain",new e({v:1}))}var i=t.prototype;return i.init=function(t,i){this.pMeta=t,this.uMeta=i,this.config={ids:t.id2dir,groups:t.prefix,base:t.basedir},this.naviCfg=t.naviCfg},i.url=function(t){if("string"==typeof t){var i=this.config,e=t.split("/");if(e[0].match(/^([~!@#%\^&\*])(.+)$/)){var n=RegExp.$2,a=RegExp.$1;if(i.ids&&i.ids[n]&&(n=i.ids[n]),i.groups&&i.groups.char)for(var o=0;o<i.groups.char.length;o++)if(i.groups.char[o]===a){a=i.groups.prefix[o];break}e[0]=a+n}else{var r=e[0];i.ids&&i.ids[r]&&(r=i.ids[r],e[0]=r)}e[0]=i.base+e[0],t=e.join("/")}return t},i.setPageTitle=function(t){document.title=(t||this.pMeta.defaultTitle)+this.pMeta.titleSuffix},i.dialog=function(t){layui.use(t,function(i){var e=null,n={type:1,title:i.dialog.title,maxWidth:1920,btn:[],content:i.dialog.content(),success:function(t){i.vue.el="#"+t.attr("id")+" .layui-layer-content",e=new Vue(i.vue)},cancel:function(t){if(i.dialog.cancel)return i.dialog.cancel(t)},end:function(){e&&e.$destroy()}};i.dialog.btns.forEach(function(t,i){n.btn.push(t.name),n["btn"+(i+1)]=function(){return t.fn.bind(e)()}}),layer.open(n)})},i.notice=function(t){var i=this,e=s("<div ><h2 class='notice__title'>"+t.title+"</h2>\n                            <div class='notice__content'><p>"+t.content+'</p></div>\n                            <i class="layui-icon layui-icon-close-fill"></i></div>');s(".notice-list").length?s(".notice-list").append(e):s('<div class="notice-list"></div>').append(e).appendTo("body").on("click",".layui-icon",function(t){i.delNotice(0,s(t.target).parent())}),setTimeout(function(){e.addClass("notice")},500),t.time=t.time||5e3,this.delNotice(t.time,e)},i.delNotice=function(i,e){i=i||0,new Promise(function(t){setTimeout(function(){s(e).css({right:-350,opacity:0}),t()},i)}).then(function(t){setTimeout(function(){s(e).remove()},1e3)})},i.get=function(t,i,e){3==arguments.length?this.ajax("GET",t,i,e):this.ajaxApi("GET",i,e)},i.post=function(t,i,e){3==arguments.length?this.ajax("POST",t,i,e):this.ajaxApi("POST",i,e)},i.ajaxApi=function(t,i,e,n){var a=this,o=a.KSMain.formatReq(e),r=o.api;a.KSMain.host=i+"/rest",s.ajax({type:t,url:a.KSMain.host+"/"+r,data:o,dataType:"json",success:function(t){n(t.response),t.response.error&&a.ajaxError(t.response.error)},error:function(t){a.ajaxError({code:t.status})}})},i.ajax=function(t,i,e,n){var a=this;s.ajax({type:t,url:i,data:e,dataType:"json",success:function(t){n(t),t.error&&a.ajaxError(t.error)},error:function(t){a.ajaxError({code:t.status})}})},i.ajaxError=function(t){var i="";switch(t.code){case 401:layer.alert("请重新登录",function(t){layer.close(t)});break;case 406:i="非法请求，一般是因为timestamp和服务器时间相差超过5分钟";break;case 500:i="500 服务器运行出错";break;default:i=t.msg}this.notice({title:"系统提示",content:i})},t}()))});