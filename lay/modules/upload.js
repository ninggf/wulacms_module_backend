layui.define("layer",function(e){"use strict";function g(e){var t=this;t.config=v.extend({},t.config,n.config,e),t.render()}var v=layui.$,t=layui.layer,i=layui.hint(),y=layui.device(),n={config:{},set:function(e){var t=this;return t.config=v.extend({},t.config,e),t},on:function(e,t){return layui.onevent.call(this,o,e,t)}},o="upload",a="layui-upload-file",l="layui-upload-form",F="layui-upload-iframe",b="layui-upload-choose";g.prototype.config={accept:"images",exts:"",auto:!0,bindAction:"",url:"",field:"file",acceptMime:"",method:"post",data:{},drag:!0,size:0,number:0,multiple:!1},g.prototype.render=function(e){var t=this;(e=t.config).elem=v(e.elem),e.bindAction=v(e.bindAction),t.file(),t.events()},g.prototype.file=function(){var e=this,t=e.config,i=e.elemFile=v(['<input class="'+a+'" type="file" accept="'+t.acceptMime+'" name="'+t.field+'"',t.multiple?" multiple":"",">"].join("")),n=t.elem.next();(n.hasClass(a)||n.hasClass(l))&&n.remove(),y.ie&&y.ie<10&&t.elem.wrap('<div class="layui-upload-wrap"></div>'),e.isFile()?(e.elemFile=t.elem,t.field=t.elem[0].name):t.elem.after(i),y.ie&&y.ie<10&&e.initIE()},g.prototype.initIE=function(){var i,e=this.config,t=v('<iframe id="'+F+'" class="'+F+'" name="'+F+'" frameborder="0"></iframe>'),n=v(['<form target="'+F+'" class="'+l+'" method="post" key="set-mine" enctype="multipart/form-data" action="'+e.url+'">',"</form>"].join(""));v("#"+F)[0]||v("body").append(t),e.elem.next().hasClass(l)||(this.elemFile.wrap(n),e.elem.next("."+l).append((i=[],layui.each(e.data,function(e,t){t="function"==typeof t?t():t,i.push('<input type="hidden" name="'+e+'" value="'+t+'">')}),i.join(""))))},g.prototype.msg=function(e){return t.msg(e,{icon:2,shift:6})},g.prototype.isFile=function(){var e=this.config.elem[0];if(e)return"input"===e.tagName.toLocaleLowerCase()&&"file"===e.type},g.prototype.preview=function(n){window.FileReader&&layui.each(this.chooseFiles,function(e,t){var i=new FileReader;i.readAsDataURL(t),i.onload=function(){n&&n(e,t,this.result)}})},g.prototype.upload=function(t,e){function i(){function o(){u.multiple&&a+l===r.fileLength&&"function"==typeof u.allDone&&u.allDone({total:r.fileLength,successful:a,aborted:l})}var a=0,l=0,e=t||r.files||r.chooseFiles||c.files;layui.each(e,function(t,e){var i=new FormData;i.append(u.field,e),layui.each(u.data,function(e,t){t="function"==typeof t?t():t,i.append(e,t)});var n={url:u.url,type:"post",data:i,contentType:!1,processData:!1,dataType:"json",headers:u.headers||{},success:function(e){a++,f(t,e),o()},error:function(){l++,r.msg("请求上传接口出现异常"),s(t),o()}};"function"==typeof u.progress&&(n.xhr=function(){var e=v.ajaxSettings.xhr();return e.upload.addEventListener("progress",function(e){if(e.lengthComputable){var t=Math.floor(e.loaded/e.total*100);u.progress(t,u.item[0],e)}}),e}),v.ajax(n)})}var n,o,r=this,u=r.config,c=r.elemFile[0],f=function(e,t){if(r.elemFile.next("."+b).remove(),c.value="","object"!=typeof t)try{t=JSON.parse(t)}catch(e){return t={},r.msg("请对上传接口返回有效JSON")}"function"==typeof u.done&&u.done(t,e||0,function(e){r.upload(e)})},s=function(e){u.auto&&(c.value=""),"function"==typeof u.error&&u.error(e||0,function(e){r.upload(e)})},a=u.exts,l=(o=[],layui.each(t||r.chooseFiles,function(e,t){o.push(t.name)}),o),p={preview:function(e){r.preview(e)},upload:function(e,t){var i={};i[e]=t,r.upload(i)},pushFile:function(){return r.files=r.files||{},layui.each(r.chooseFiles,function(e,t){r.files[e]=t}),r.files},resetFile:function(e,t,i){var n=new File([t],i);r.files=r.files||{},r.files[e]=n}};if(0!==(l=0===l.length?c.value.match(/[^\/\\]+\..+/g)||[]||"":l).length){switch(u.accept){case"file":if(a&&!RegExp("\\w\\.("+a+")$","i").test(escape(l)))return r.msg("选择的文件中包含不支持的格式"),c.value="";break;case"video":if(!RegExp("\\w\\.("+(a||"avi|mp4|wma|rmvb|rm|flash|3gp|flv")+")$","i").test(escape(l)))return r.msg("选择的视频中包含不支持的格式"),c.value="";break;case"audio":if(!RegExp("\\w\\.("+(a||"mp3|wav|mid")+")$","i").test(escape(l)))return r.msg("选择的音频中包含不支持的格式"),c.value="";break;default:if(layui.each(l,function(e,t){RegExp("\\w\\.("+(a||"jpg|png|gif|bmp|jpeg$")+")","i").test(escape(t))||(n=!0)}),n)return r.msg("选择的图片中包含不支持的格式"),c.value=""}var d,m,h;if(r.fileLength=(d=0,m=t||r.files||r.chooseFiles||c.files,layui.each(m,function(){d++}),d),u.number&&r.fileLength>u.number)return r.msg("同时最多只能上传的数量为："+u.number);if(0<u.size&&!(y.ie&&y.ie<10))if(layui.each(r.chooseFiles,function(e,t){if(t.size>1024*u.size){var i=u.size/1024;i=1<=i?i.toFixed(2)+"MB":u.size+"KB",c.value="",h=i}}),h)return r.msg("文件不能超过"+h);!function(){if("choose"!==e&&!u.auto||(u.choose&&u.choose(p),"choose"!==e)){if(u.before&&u.before(p),y.ie)return 9<y.ie?i():function(){var i=v("#"+F);r.elemFile.parent().submit(),clearInterval(g.timer),g.timer=setInterval(function(){var e,t=i.contents().find("body");try{e=t.text()}catch(e){r.msg("获取上传后的响应信息出现异常"),clearInterval(g.timer),s()}e&&(clearInterval(g.timer),t.html(""),f(0,e))},30)}();i()}}()}},g.prototype.reload=function(e){delete(e=e||{}).elem,delete e.bindAction;(e=this.config=v.extend({},this.config,n.config,e)).elem.next().attr({name:e.name,accept:e.acceptMime,multiple:e.multiple})},g.prototype.events=function(){function o(e){l.chooseFiles={},layui.each(e,function(e,t){var i=(new Date).getTime();l.chooseFiles[i+"-"+e]=t})}function a(e,t){var i=l.elemFile,n=1<e.length?e.length+"个文件":(e[0]||{}).name||i[0].value.match(/[^\/\\]+\..+/g)||[]||"";i.next().hasClass(b)&&i.next().remove(),l.upload(null,"choose"),l.isFile()||r.choose||i.after('<span class="layui-inline '+b+'">'+n+"</span>")}var l=this,r=l.config;r.elem.off("upload.start").on("upload.start",function(){var e=v(this),t=e.attr("lay-data");if(t)try{t=new Function("return "+t)(),l.config=v.extend({},r,t)}catch(e){i.error("Upload element property lay-data configuration item has a syntax error: "+t)}l.config.item=e,l.elemFile[0].click()}),y.ie&&y.ie<10||r.elem.off("upload.over").on("upload.over",function(){v(this).attr("lay-over","")}).off("upload.leave").on("upload.leave",function(){v(this).removeAttr("lay-over")}).off("upload.drop").on("upload.drop",function(e,t){var i=v(this),n=t.originalEvent.dataTransfer.files||[];i.removeAttr("lay-over"),o(n),r.auto?l.upload(n):a(n)}),l.elemFile.off("upload.change").on("upload.change",function(){var e=this.files||[];o(e),r.auto?l.upload():a(e)}),r.bindAction.off("upload.action").on("upload.action",function(){l.upload()}),r.elem.data("haveEvents")||(l.elemFile.on("change",function(){v(this).trigger("upload.change")}),r.elem.on("click",function(){l.isFile()||v(this).trigger("upload.start")}),r.drag&&r.elem.on("dragover",function(e){e.preventDefault(),v(this).trigger("upload.over")}).on("dragleave",function(e){v(this).trigger("upload.leave")}).on("drop",function(e){e.preventDefault(),v(this).trigger("upload.drop",e)}),r.bindAction.on("click",function(){v(this).trigger("upload.action")}),r.elem.data("haveEvents",!0))},n.render=function(e){var t=new g(e);return function(){var t=this;return{upload:function(e){t.upload.call(t,e)},reload:function(e){t.reload.call(t,e)},config:t.config}}.call(t)},e(o,n)});