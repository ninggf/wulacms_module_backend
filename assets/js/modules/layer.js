/** wulacms-v3.0.0 MIT License By https://github.com/ninggf/wulacms */
 ;!function(d){"use strict";function t(e){var t=this;t.index=++y.index,t.config=u.extend({},t.config,c.config,e),document.body?t.creat():setTimeout(function(){t.creat()},30)}var u,f,e,n=d.layui&&layui.define,c={getPath:(e=document.currentScript?document.currentScript.src:function(){for(var e,t=document.scripts,i=t.length-1,n=i;0<n;n--)if("interactive"===t[n].readyState){e=t[n].src;break}return e||t[i].src}()).substring(0,e.lastIndexOf("/")+1),config:{},end:{},destroy:{},minIndex:0,minLeft:[],btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],type:["dialog","page","iframe","loading","tips"],getStyle:function(e,t){e=e.currentStyle||d.getComputedStyle(e,null);return e[e.getPropertyValue?"getPropertyValue":"getAttribute"](t)},link:function(e,t,i){var n,a,o,s;y.path&&(n=document.getElementsByTagName("head")[0],a=document.createElement("link"),"string"==typeof t&&(i=t),o="layuicss-"+(i||e).replace(/\.|\//g,""),s=0,a.rel="stylesheet",a.href=y.path+e,a.id=o,document.getElementById(o)||n.appendChild(a),"function"==typeof t&&function e(){return 80<++s?d.console&&void 0:void(1989===parseInt(c.getStyle(document.getElementById(o),"width"))?t():setTimeout(e,100))}())}},y={v:"3.1.1",ie:(e=navigator.userAgent.toLowerCase(),!!(d.ActiveXObject||"ActiveXObject"in d)&&((e.match(/msie\s(\d+)/)||[])[1]||"11")),index:d.layer&&d.layer.v?1e5:0,path:c.getPath,config:function(e,t){return e=e||{},y.cache=c.config=u.extend({},c.config,e),y.path=c.config.path||y.path,"string"==typeof e.extend&&(e.extend=[e.extend]),c.config.path&&y.ready(),e.extend&&(n?layui.addcss("modules/layer/"+e.extend):c.link("theme/"+e.extend)),this},ready:function(e){var t="layer",i=(n?"modules/layer/":"theme/")+"default/layer.css?v="+y.v;return n?layui.addcss(i,e,t):c.link(i,e,t),this},alert:function(e,t,i){var n="function"==typeof t;return n&&(i=t),y.open(u.extend({content:e,yes:i},n?{}:t))},confirm:function(e,t,i,n){var a="function"==typeof t;return a&&(n=i,i=t),y.open(u.extend({content:e,btn:c.btn,yes:i,btn2:n},a?{}:t))},msg:function(e,t,i){var n="function"==typeof t,a=c.config.skin,o=(a?a+" "+a+"-msg":"")||"layui-layer-msg",a=p.anim.length-1;return n&&(i=t),y.open(u.extend({content:e,time:3e3,shade:!1,skin:o,title:!1,closeBtn:!1,btn:!1,resize:!1,end:i},n&&!c.config.skin?{skin:o+" layui-layer-hui",anim:a}:(-1!==(t=t||{}).icon&&(void 0!==t.icon||c.config.skin)||(t.skin=o+" "+(t.skin||"layui-layer-hui")),t)))},load:function(e,t){return y.open(u.extend({type:3,icon:e||0,resize:!1,shade:.01},t))},tips:function(e,t,i){return y.open(u.extend({type:4,content:[e,t],closeBtn:!1,time:3e3,shade:!1,resize:!1,fixed:!1,maxWidth:210},i))}};t.pt=t.prototype;var p=["layui-layer",".layui-layer-title",".layui-layer-main",".layui-layer-dialog","layui-layer-iframe","layui-layer-content","layui-layer-btn","layui-layer-close"];function h(e){return i.skin?" "+i.skin+" "+i.skin+"-"+e:""}p.anim=["layer-anim-00","layer-anim-01","layer-anim-02","layer-anim-03","layer-anim-04","layer-anim-05","layer-anim-06"],t.pt.config={type:0,shade:.3,fixed:!0,move:p[1],title:"&#x4FE1;&#x606F;",offset:"auto",area:"auto",closeBtn:1,time:0,zIndex:19891014,maxWidth:360,anim:0,isOutAnim:!0,icon:-1,moveType:1,resize:!0,scrollbar:!0,tips:2},t.pt.vessel=function(e,t){var i=this.index,n=this.config,a=n.zIndex+i,o="object"==typeof n.title,s=n.maxmin&&(1===n.type||2===n.type),o=n.title?'<div class="layui-layer-title" style="'+(o?n.title[1]:"")+'">'+(o?n.title[0]:n.title)+"</div>":"";return n.zIndex=a,t([n.shade?'<div class="layui-layer-shade" id="layui-layer-shade'+i+'" times="'+i+'" style="z-index:'+(a-1)+'; "></div>':"",'<div class="'+p[0]+" layui-layer-"+c.type[n.type]+(0!=n.type&&2!=n.type||n.shade?"":" layui-layer-border")+" "+(n.skin||"")+'" id="'+p[0]+i+'" type="'+c.type[n.type]+'" times="'+i+'" showtime="'+n.time+'" conType="'+(e?"object":"string")+'" style="z-index: '+a+"; width:"+n.area[0]+";height:"+n.area[1]+(n.fixed?"":";position:absolute;")+'">'+(e&&2!=n.type?"":o)+'<div id="'+(n.id||"")+'" class="layui-layer-content'+(0==n.type&&-1!==n.icon?" layui-layer-padding":"")+(3==n.type?" layui-layer-loading"+n.icon:"")+'">'+(0==n.type&&-1!==n.icon?'<i class="layui-layer-ico layui-layer-ico'+n.icon+'"></i>':"")+((1!=n.type||!e)&&n.content||"")+'</div><span class="layui-layer-setwin">'+(s=s?'<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>':"",n.closeBtn&&(s+='<a class="layui-layer-ico '+p[7]+" "+p[7]+(n.title?n.closeBtn:4==n.type?"1":"2")+'" href="javascript:;"></a>'),s)+"</span>"+(n.btn?function(){var e="";"string"==typeof n.btn&&(n.btn=[n.btn]);for(var t=0,i=n.btn.length;t<i;t++)e+='<a class="'+p[6]+t+'">'+n.btn[t]+"</a>";return'<div class="'+p[6]+" layui-layer-btn-"+(n.btnAlign||"")+'">'+e+"</div>"}():"")+(n.resize?'<span class="layui-layer-resize"></span>':"")+"</div>"],o,u('<div class="layui-layer-move"></div>')),this},t.pt.creat=function(){var e,n=this,a=n.config,o=n.index,s="object"==typeof(l=a.content),r=u("body");if(!a.id||!u("#"+a.id)[0]){switch("string"==typeof a.area&&(a.area="auto"===a.area?["",""]:[a.area,""]),a.shift&&(a.anim=a.shift),6==y.ie&&(a.fixed=!1),a.type){case 0:a.btn="btn"in a?a.btn:c.btn[0],y.closeAll("dialog");break;case 2:var l=a.content=s?a.content:[a.content||"","auto"];a.content='<iframe scrolling="'+(a.content[1]||"auto")+'" allowtransparency="true" id="'+p[4]+o+'" name="'+p[4]+o+'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="'+a.content[0]+'"></iframe>';break;case 3:delete a.title,delete a.closeBtn,-1===a.icon&&a.icon,y.closeAll("loading");break;case 4:s||(a.content=[a.content,"body"]),a.follow=a.content[1],a.content=a.content[0]+'<i class="layui-layer-TipsG"></i>',delete a.title,a.tips="object"==typeof a.tips?a.tips:[a.tips,!0],a.tipsMore||y.closeAll("tips")}n.vessel(s,function(e,t,i){r.append(e[0]),s?2==a.type||4==a.type?u("body").append(e[1]):l.parents("."+p[0])[0]||(l.data("display",l.css("display")).show().addClass("layui-layer-wrap").wrap(e[1]),u("#"+p[0]+o).find("."+p[5]).before(t)):r.append(e[1]),u(".layui-layer-move")[0]||r.append(c.moveElem=i),n.layero=u("#"+p[0]+o),a.scrollbar||p.html.css("overflow","hidden").attr("layer-full",o)}).auto(o),u("#layui-layer-shade"+n.index).css({"background-color":a.shade[1]||"#000",opacity:a.shade[0]||a.shade}),2==a.type&&6==y.ie&&n.layero.find("iframe").attr("src",l[0]),4==a.type?n.tips():n.offset(),a.fixed&&f.on("resize",function(){n.offset(),(/^\d+%$/.test(a.area[0])||/^\d+%$/.test(a.area[1]))&&n.auto(o),4==a.type&&n.tips()}),a.time<=0||setTimeout(function(){y.close(n.index)},a.time),n.move().callback(),p.anim[a.anim]&&(e="layer-anim "+p.anim[a.anim],n.layero.addClass(e).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){u(this).removeClass(e)})),a.isOutAnim&&n.layero.data("isOutAnim",!0)}},t.pt.auto=function(e){var t=this.config,i=u("#"+p[0]+e);""===t.area[0]&&0<t.maxWidth&&(y.ie&&y.ie<8&&t.btn&&i.width(i.innerWidth()),i.outerWidth()>t.maxWidth&&i.width(t.maxWidth));var n=[i.innerWidth(),i.innerHeight()],a=i.find(p[1]).outerHeight()||0,o=i.find("."+p[6]).outerHeight()||0,e=function(e){(e=i.find(e)).height(n[1]-a-o-2*(0|parseFloat(e.css("padding-top"))))};return 2===t.type?e("iframe"):""===t.area[1]?0<t.maxHeight&&i.outerHeight()>t.maxHeight?(n[1]=t.maxHeight,e("."+p[5])):t.fixed&&n[1]>=f.height()&&(n[1]=f.height(),e("."+p[5])):e("."+p[5]),this},t.pt.offset=function(){var e=this,t=e.config,i=e.layero,n=[i.outerWidth(),i.outerHeight()],a="object"==typeof t.offset;e.offsetTop=(f.height()-n[1])/2,e.offsetLeft=(f.width()-n[0])/2,a?(e.offsetTop=t.offset[0],e.offsetLeft=t.offset[1]||e.offsetLeft):"auto"!==t.offset&&("t"===t.offset?e.offsetTop=0:"r"===t.offset?e.offsetLeft=f.width()-n[0]:"b"===t.offset?e.offsetTop=f.height()-n[1]:"l"===t.offset?e.offsetLeft=0:"lt"===t.offset?(e.offsetTop=0,e.offsetLeft=0):"lb"===t.offset?(e.offsetTop=f.height()-n[1],e.offsetLeft=0):"rt"===t.offset?(e.offsetTop=0,e.offsetLeft=f.width()-n[0]):"rb"===t.offset?(e.offsetTop=f.height()-n[1],e.offsetLeft=f.width()-n[0]):e.offsetTop=t.offset),t.fixed||(e.offsetTop=/%$/.test(e.offsetTop)?f.height()*parseFloat(e.offsetTop)/100:parseFloat(e.offsetTop),e.offsetLeft=/%$/.test(e.offsetLeft)?f.width()*parseFloat(e.offsetLeft)/100:parseFloat(e.offsetLeft),e.offsetTop+=f.scrollTop(),e.offsetLeft+=f.scrollLeft()),i.attr("minLeft")&&(e.offsetTop=f.height()-(i.find(p[1]).outerHeight()||0),e.offsetLeft=i.css("left")),i.css({top:e.offsetTop,left:e.offsetLeft})},t.pt.tips=function(){var e=this.config,t=this.layero,i=[t.outerWidth(),t.outerHeight()],n=u(e.follow);n[0]||(n=u("body"));var a={width:n.outerWidth(),height:n.outerHeight(),top:n.offset().top,left:n.offset().left},o=t.find(".layui-layer-TipsG"),n=e.tips[0];e.tips[1]||o.remove(),a.autoLeft=function(){0<a.left+i[0]-f.width()?(a.tipLeft=a.left+a.width-i[0],o.css({right:12,left:"auto"})):a.tipLeft=a.left},a.where=[function(){a.autoLeft(),a.tipTop=a.top-i[1]-10,o.removeClass("layui-layer-TipsB").addClass("layui-layer-TipsT").css("border-right-color",e.tips[1])},function(){a.tipLeft=a.left+a.width+10,a.tipTop=a.top,o.removeClass("layui-layer-TipsL").addClass("layui-layer-TipsR").css("border-bottom-color",e.tips[1])},function(){a.autoLeft(),a.tipTop=a.top+a.height+10,o.removeClass("layui-layer-TipsT").addClass("layui-layer-TipsB").css("border-right-color",e.tips[1])},function(){a.tipLeft=a.left-i[0]-10,a.tipTop=a.top,o.removeClass("layui-layer-TipsR").addClass("layui-layer-TipsL").css("border-bottom-color",e.tips[1])}],a.where[n-1](),1===n?a.top-(f.scrollTop()+i[1]+16)<0&&a.where[2]():2===n?0<f.width()-(a.left+a.width+i[0]+16)||a.where[3]():3===n?0<a.top-f.scrollTop()+a.height+i[1]+16-f.height()&&a.where[0]():4===n&&0<i[0]+16-a.left&&a.where[1](),t.find("."+p[5]).css({"background-color":e.tips[1],"padding-right":e.closeBtn?"30px":""}),t.css({left:a.tipLeft-(e.fixed?f.scrollLeft():0),top:a.tipTop-(e.fixed?f.scrollTop():0)})},t.pt.move=function(){var o=this,s=o.config,e=u(document),r=o.layero,t=r.find(s.move),i=r.find(".layui-layer-resize"),l={};return s.move&&t.css("cursor","move"),t.on("mousedown",function(e){e.preventDefault(),s.move&&(l.moveStart=!0,l.offset=[e.clientX-parseFloat(r.css("left")),e.clientY-parseFloat(r.css("top"))],c.moveElem.css("cursor","move").show())}),i.on("mousedown",function(e){e.preventDefault(),l.resizeStart=!0,l.offset=[e.clientX,e.clientY],l.area=[r.outerWidth(),r.outerHeight()],c.moveElem.css("cursor","se-resize").show()}),e.on("mousemove",function(e){var t,i,n,a;l.moveStart&&(n=e.clientX-l.offset[0],a=e.clientY-l.offset[1],i="fixed"===r.css("position"),e.preventDefault(),l.stX=i?0:f.scrollLeft(),l.stY=i?0:f.scrollTop(),s.moveOut||(t=f.width()-r.outerWidth()+l.stX,i=f.height()-r.outerHeight()+l.stY,n<l.stX&&(n=l.stX),t<n&&(n=t),a<l.stY&&(a=l.stY),i<a&&(a=i)),r.css({left:n,top:a})),s.resize&&l.resizeStart&&(n=e.clientX-l.offset[0],a=e.clientY-l.offset[1],e.preventDefault(),y.style(o.index,{width:l.area[0]+n,height:l.area[1]+a}),l.isResize=!0,s.resizing&&s.resizing(r))}).on("mouseup",function(e){l.moveStart&&(delete l.moveStart,c.moveElem.hide(),s.moveEnd&&s.moveEnd(r)),l.resizeStart&&(delete l.resizeStart,c.moveElem.hide())}),o},t.pt.callback=function(){var t=this,i=t.layero,n=t.config;t.openLayer(),n.success&&(2==n.type?i.find("iframe").on("load",function(){n.success(i,t.index)}):n.success(i,t.index)),6==y.ie&&t.IE6(i),i.find("."+p[6]).children("a").on("click",function(){var e=u(this).index();0===e?n.yes?n.yes(t.index,i):n.btn1?n.btn1(t.index,i):y.close(t.index):!1===(n["btn"+(e+1)]&&n["btn"+(e+1)](t.index,i))||y.close(t.index)}),i.find("."+p[7]).on("click",function(){!1===(n.cancel&&n.cancel(t.index,i))||y.close(t.index)}),n.shadeClose&&u("#layui-layer-shade"+t.index).on("click",function(){y.close(t.index)}),i.find(".layui-layer-min").on("click",function(){!1===(n.min&&n.min(i))||y.min(t.index,n)}),i.find(".layui-layer-max").on("click",function(){u(this).hasClass("layui-layer-maxmin")?(y.restore(t.index),n.restore&&n.restore(i)):(y.full(t.index,n),setTimeout(function(){n.full&&n.full(i)},100))}),n.end&&(c.end[t.index]=n.end),n.destroy&&(c.destroy[t.index]=n.destroy)},c.reselect=function(){u.each(u("select"),function(e,t){var i=u(this);i.parents("."+p[0])[0]||1==i.attr("layer")&&u("."+p[0]).length<1&&i.removeAttr("layer").show(),i=null})},t.pt.IE6=function(e){u("select").each(function(e,t){var i=u(this);i.parents("."+p[0])[0]||"none"===i.css("display")||i.attr({layer:"1"}).hide(),i=null})},t.pt.openLayer=function(){y.zIndex=this.config.zIndex,y.setTop=function(e){return y.zIndex=parseInt(e[0].style.zIndex),e.on("mousedown",function(){y.zIndex++,e.css("z-index",y.zIndex+1)}),y.zIndex}},c.record=function(e){var t=[e.width(),e.height(),e.position().top,e.position().left+parseFloat(e.css("margin-left"))];e.find(".layui-layer-max").addClass("layui-layer-maxmin"),e.attr({area:t})},c.rescollbar=function(e){p.html.attr("layer-full")==e&&(p.html[0].style.removeProperty?p.html[0].style.removeProperty("overflow"):p.html[0].style.removeAttribute("overflow"),p.html.removeAttr("layer-full"))},(d.layer=y).getChildFrame=function(e,t){return t=t||u("."+p[4]).attr("times"),u("#"+p[0]+t).find("iframe").contents().find(e)},y.getFrameIndex=function(e){return u("#"+e).parents("."+p[4]).attr("times")},y.iframeAuto=function(e){var t,i,n;e&&(t=y.getChildFrame("html",e).outerHeight(),n=(i=u("#"+p[0]+e)).find(p[1]).outerHeight()||0,e=i.find("."+p[6]).outerHeight()||0,i.css({height:t+n+e}),i.find("iframe").css({height:t}))},y.iframeSrc=function(e,t){u("#"+p[0]+e).find("iframe").attr("src",t)},y.style=function(e,t,i){var n=u("#"+p[0]+e),a=n.find(".layui-layer-content"),o=n.attr("type"),s=n.find(p[1]).outerHeight()||0,e=n.find("."+p[6]).outerHeight()||0;n.attr("minLeft");o!==c.type[3]&&o!==c.type[4]&&(i||(parseFloat(t.width)<=260&&(t.width=260),parseFloat(t.height)-s-e<=64&&(t.height=64+s+e)),n.css(t),e=n.find("."+p[6]).outerHeight(),o===c.type[2]?n.find("iframe").css({height:parseFloat(t.height)-s-e}):a.css({height:parseFloat(t.height)-s-e-parseFloat(a.css("padding-top"))-parseFloat(a.css("padding-bottom"))}))},y.min=function(e,t){var i=u("#"+p[0]+e),n=i.find(p[1]).outerHeight()||0,a=i.attr("minLeft")||181*c.minIndex+"px",o=i.css("position");c.record(i),c.minLeft[0]&&(a=c.minLeft[0],c.minLeft.shift()),i.attr("position",o),y.style(e,{width:180,height:n,left:a,top:f.height()-n,position:"fixed",overflow:"hidden"},!0),i.find(".layui-layer-min").hide(),"page"===i.attr("type")&&i.find(p[4]).hide(),c.rescollbar(e),i.attr("minLeft")||c.minIndex++,i.attr("minLeft",a)},y.restore=function(e){var t=u("#"+p[0]+e),i=t.attr("area").split(",");t.attr("type");y.style(e,{width:parseFloat(i[0]),height:parseFloat(i[1]),top:parseFloat(i[2]),left:parseFloat(i[3]),position:t.attr("position"),overflow:"visible"},!0),t.find(".layui-layer-max").removeClass("layui-layer-maxmin"),t.find(".layui-layer-min").show(),"page"===t.attr("type")&&t.find(p[4]).show(),c.rescollbar(e)},y.full=function(t){var i=u("#"+p[0]+t);c.record(i),p.html.attr("layer-full")||p.html.css("overflow","hidden").attr("layer-full",t),clearTimeout(void 0),setTimeout(function(){var e="fixed"===i.css("position");y.style(t,{top:e?0:f.scrollTop(),left:e?0:f.scrollLeft(),width:f.width(),height:f.height()},!0),i.find(".layui-layer-min").hide()},100)},y.title=function(e,t){u("#"+p[0]+(t||y.index)).find(p[1]).html(e)},y.close=function(n){var a,e,o=u("#"+p[0]+n),s=o.attr("type");o[0]&&(a="layui-layer-wrap",e=function(){if("function"==typeof c.destroy[n]&&c.destroy[n](o,n),delete c.destroy[n],s===c.type[1]&&"object"===o.attr("conType")){o.children(":not(."+p[5]+")").remove();for(var e=o.find("."+a),t=0;t<2;t++)e.unwrap();e.css("display",e.data("display")).removeClass(a)}else{if(s===c.type[2])try{var i=u("#"+p[4]+n)[0];i.contentWindow.document.write(""),i.contentWindow.close(),o.find("."+p[5])[0].removeChild(i)}catch(e){}o[0].innerHTML="",o.remove()}"function"==typeof c.end[n]&&c.end[n](),delete c.end[n]},o.data("isOutAnim")&&o.addClass("layer-anim layer-anim-close"),u("#layui-layer-moves, #layui-layer-shade"+n).remove(),6==y.ie&&c.reselect(),c.rescollbar(n),o.attr("minLeft")&&(c.minIndex--,c.minLeft.push(o.attr("minLeft"))),y.ie&&y.ie<10||!o.data("isOutAnim")?e():setTimeout(function(){e()},200))},y.closeAll=function(t){u.each(u("."+p[0]),function(){var e=u(this);(t?e.attr("type")===t:1)&&y.close(e.attr("times"))})};var i=y.cache||{};y.prompt=function(i,n){var e,t="";"function"==typeof(i=i||{})&&(n=i),i.area&&(t='style="width: '+(e=i.area)[0]+"; height: "+e[1]+';"',delete i.area);var a,t=2==i.formType?'<textarea class="layui-layer-input"'+t+"></textarea>":'<input type="'+(1==i.formType?"password":"text")+'" class="layui-layer-input">',o=i.success;return delete i.success,y.open(u.extend({type:1,btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],content:t,skin:"layui-layer-prompt"+h("prompt"),maxWidth:f.width(),success:function(e){(a=e.find(".layui-layer-input")).val(i.value||"").focus(),"function"==typeof o&&o(e)},resize:!1,yes:function(e){var t=a.val();""===t?a.focus():t.length>(i.maxlength||500)?y.tips("&#x6700;&#x591A;&#x8F93;&#x5165;"+(i.maxlength||500)+"&#x4E2A;&#x5B57;&#x6570;",a,{tips:1}):n&&n(t,e,a)}},i))},y.tab=function(n){var a=(n=n||{}).tab||{},o="layui-this",s=n.success;return delete n.success,y.open(u.extend({type:1,skin:"layui-layer-tab"+h("tab"),resize:!1,title:function(){var e=a.length,t=1,i="";if(0<e)for(i='<span class="'+o+'">'+a[0].title+"</span>";t<e;t++)i+="<span>"+a[t].title+"</span>";return i}(),content:'<ul class="layui-layer-tabmain">'+function(){var e=a.length,t=1,i="";if(0<e)for(i='<li class="layui-layer-tabli '+o+'">'+(a[0].content||"no content")+"</li>";t<e;t++)i+='<li class="layui-layer-tabli">'+(a[t].content||"no  content")+"</li>";return i}()+"</ul>",success:function(e){var t=e.find(".layui-layer-title").children(),i=e.find(".layui-layer-tabmain").children();t.on("mousedown",function(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0;var t=u(this),e=t.index();t.addClass(o).siblings().removeClass(o),i.eq(e).show().siblings().hide(),"function"==typeof n.change&&n.change(e)}),"function"==typeof s&&s(e)}},n))},y.photos=function(i,e,n){var a={};if((i=i||{}).photos){var t=i.photos.constructor===Object,o=t?i.photos:{},s=o.data||[],r=o.start||0;a.imgIndex=1+(0|r),i.img=i.img||"img";var l=i.success;if(delete i.success,t){if(0===s.length)return y.msg("&#x6CA1;&#x6709;&#x56FE;&#x7247;")}else{var f=u(i.photos),c=function(){s=[],f.find(i.img).each(function(e){var t=u(this);t.attr("layer-index",e),s.push({alt:t.attr("alt"),pid:t.attr("layer-pid"),src:t.attr("layer-src")||t.attr("src"),thumb:t.attr("src")})})};if(c(),0===s.length)return;if(e||f.on("click",i.img,function(){var e=u(this).attr("layer-index");y.photos(u.extend(i,{photos:{start:e,data:s,tab:i.tab},full:i.full}),!0),c()}),!e)return}a.imgprev=function(e){a.imgIndex--,a.imgIndex<1&&(a.imgIndex=s.length),a.tabimg(e)},a.imgnext=function(e,t){a.imgIndex++,a.imgIndex>s.length&&(a.imgIndex=1,t)||a.tabimg(e)},a.keyup=function(e){var t;a.end||(t=e.keyCode,e.preventDefault(),37===t?a.imgprev(!0):39===t?a.imgnext(!0):27===t&&y.close(a.index))},a.tabimg=function(e){if(!(s.length<=1))return o.start=a.imgIndex-1,y.close(a.index),y.photos(i,!0,e)},a.event=function(){a.bigimg.hover(function(){a.imgsee.show()},function(){a.imgsee.hide()}),a.bigimg.find(".layui-layer-imgprev").on("click",function(e){e.preventDefault(),a.imgprev()}),a.bigimg.find(".layui-layer-imgnext").on("click",function(e){e.preventDefault(),a.imgnext()}),u(document).on("keyup",a.keyup)},a.loadi=y.load(1,{shade:!("shade"in i)&&.9,scrollbar:!1}),function(e,t,i){var n=new Image;if(n.src=e,n.complete)return t(n);n.onload=function(){n.onload=null,t(n)},n.onerror=function(e){n.onerror=null,i(e)}}(s[r].src,function(e){var t;y.close(a.loadi),a.index=y.open(u.extend({type:1,id:"layui-layer-photos",area:(t=[e.width,e.height],e=[u(d).width()-100,u(d).height()-100],!i.full&&(t[0]>e[0]||t[1]>e[1])&&((e=[t[0]/e[0],t[1]/e[1]])[1]<e[0]?(t[0]=t[0]/e[0],t[1]=t[1]/e[0]):e[0]<e[1]&&(t[0]=t[0]/e[1],t[1]=t[1]/e[1])),[t[0]+"px",t[1]+"px"]),title:!1,shade:.9,shadeClose:!0,closeBtn:!1,move:".layui-layer-phimg img",moveType:1,scrollbar:!1,moveOut:!0,isOutAnim:!1,skin:"layui-layer-photos"+h("photos"),content:'<div class="layui-layer-phimg"><img src="'+s[r].src+'" alt="'+(s[r].alt||"")+'" layer-pid="'+s[r].pid+'"><div class="layui-layer-imgsee">'+(1<s.length?'<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>':"")+'<div class="layui-layer-imgbar" style="display:'+(n?"block":"")+'"><span class="layui-layer-imgtit"><a href="javascript:;">'+(s[r].alt||"")+"</a><em>"+a.imgIndex+"/"+s.length+"</em></span></div></div></div>",success:function(e,t){a.bigimg=e.find(".layui-layer-phimg"),a.imgsee=e.find(".layui-layer-imguide,.layui-layer-imgbar"),a.event(e),i.tab&&i.tab(s[r],e),"function"==typeof l&&l(e)},end:function(){a.end=!0,u(document).off("keyup",a.keyup)}},i))},function(){y.close(a.loadi),y.msg("&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;",{time:3e4,btn:["&#x4E0B;&#x4E00;&#x5F20;","&#x4E0D;&#x770B;&#x4E86;"],yes:function(){1<s.length&&a.imgnext(!0,!0)}})})}},c.run=function(e){f=(u=e)(d),p.html=u("html"),y.open=function(e){return new t(e).index}},d.layui&&layui.define?(y.ready(),layui.define("jquery",function(e){y.path=layui.cache.dir,c.run(layui.$),e("layer",d.layer=y)})):"function"==typeof define&&define.amd?define(["jquery"],function(){return c.run(d.jQuery),y}):(c.run(d.jQuery),y.ready())}(window);