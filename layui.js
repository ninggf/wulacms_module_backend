!function(n){"use strict";function r(){this.v="2.5.6"}function d(e){n.console&&console.error&&console.error("Layui hint: "+e)}var e,f=document,m={modules:{},status:{},timeout:10,event:{}},h=(e=f.currentScript?f.currentScript.src:function(){for(var e,t=f.scripts,o=t.length-1,r=o;0<r;r--)if("interactive"===t[r].readyState){e=t[r].src;break}return e||t[o].src}()).substring(0,e.lastIndexOf("/")+1),v="undefined"!=typeof opera&&"[object Opera]"===opera.toString(),g={layer:"modules/layer",laydate:"modules/laydate",laypage:"modules/laypage",laytpl:"modules/laytpl",layim:"modules/layim",layedit:"modules/layedit",form:"modules/form",upload:"modules/upload",transfer:"modules/transfer",tree:"modules/tree",table:"modules/table",element:"modules/element",rate:"modules/rate",colorpicker:"modules/colorpicker",slider:"modules/slider",carousel:"modules/carousel",flow:"modules/flow",util:"modules/util",code:"modules/code",jquery:"modules/jquery",mobile:"modules/mobile","layui.all":"../layui.all"};r.prototype.cache=m,r.prototype.define=function(e,r){function t(){function o(e,t){layui[e]=t,m.status[e]=!0}return"function"==typeof r&&r(function(e,t){o(e,t),m.callback[e]=function(){r(o)}}),this}var o=this;return"function"==typeof e&&(r=e,e=[]),!layui["layui.all"]&&layui["layui.mobile"]?t.call(o):(o.use(e,t),o)},r.prototype.use=function(o,e,t){var r=this,n=m.dir=m.dir?m.dir:h,a=f.getElementsByTagName("head")[0];o="string"==typeof o?[o]:o,window.jQuery&&jQuery.fn.on&&(r.each(o,function(e,t){"jquery"===t&&o.splice(e,1)}),layui.jquery=layui.$=jQuery);var i,l=o[0]?o[0].replace(/[^\/]+?\//,""):void 0,u=0;function s(e,t){var o="PLaySTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/;"load"!==e.type&&!o.test((e.currentTarget||e.srcElement).readyState)||(m.modules[l]=t,a.removeChild(p),function e(){if(++u>1e3*m.timeout/4)return d(l+" is not a valid module");m.status[l]?c():setTimeout(e,4)}())}function c(){t.push(layui[l]),1<o.length?r.use(o.slice(1),e,t):"function"==typeof e&&e.apply(layui,t)}if(t=t||[],m.host=m.host||(n.match(/\/\/([\s\S]+?)\//)||["//"+location.host+"/"])[0],0===o.length||layui["layui.all"]&&g[l]||!layui["layui.all"]&&layui["layui.mobile"]&&g[l])return c(),r;if(y=(y=(g[l]?n+"lay/":/^\{\/\}/.test(r.modules[l])?"":m.base||"")+(r.modules[l]||l)+".js").replace(/^\{\/\}/,""),!m.modules[l]&&layui[l]&&(m.modules[l]=y),m.modules[l])!function e(){if(++u>1e3*m.timeout/4)return d(l+" is not a valid module");"string"==typeof m.modules[l]&&m.status[l]?c():setTimeout(e,4)}();else{var p=f.createElement("script"),y=(g[l]?n+"lay/":/^\{\/\}/.test(r.modules[l])?"":m.base||"")+(r.modules[l]||l)+".js";/^&/.test(l)?y=n+"lay/exts/"+l.replace(/^&/,"")+".js":/^@/.test(l)?y=(m.module||"")+l.replace(/^@/,"").replace(".","/js/")+".js":/^\$/.test(l)&&(y=(m.theme||"")+l.replace(/^\$/,"").replace(".","/js/")+".js"),y=y.replace(/^\{\/\}/,""),p.async=!0,p.charset="utf-8",p.src=y+((i=!0===m.version?m.v||(new Date).getTime():m.version||"")?"?v="+i:""),a.appendChild(p),!p.attachEvent||p.attachEvent.toString&&p.attachEvent.toString().indexOf("[native code")<0||v?p.addEventListener("load",function(e){s(e,y)},!1):p.attachEvent("onreadystatechange",function(e){s(e,y)}),m.modules[l]=y}return r},r.prototype.getStyle=function(e,t){var o=e.currentStyle?e.currentStyle:n.getComputedStyle(e,null);return o[o.getPropertyValue?"getPropertyValue":"getAttribute"](t)},r.prototype.link=function(t,o,e){var r=this,n=f.createElement("link"),a=f.getElementsByTagName("head")[0];"string"==typeof o&&(e=o);var i=(e||t).replace(/\.|\//g,""),l=n.id="layuicss-"+i,u=0;return n.rel="stylesheet",n.href=t+(m.debug?"?v="+(new Date).getTime():""),n.media="all",f.getElementById(l)||a.appendChild(n),"function"!=typeof o||function e(){if(++u>1e3*m.timeout/100)return d(t+" timeout");1989===parseInt(r.getStyle(f.getElementById(l),"width"))?o():setTimeout(e,100)}(),r},m.callback={},r.prototype.factory=function(e){if(layui[e])return"function"==typeof m.callback[e]?m.callback[e]:null},r.prototype.addcss=function(e,t,o){return layui.link(m.dir+"css/"+e,t,o)},r.prototype.img=function(e,t,o){var r=new Image;if(r.src=e,r.complete)return t(r);r.onload=function(){r.onload=null,"function"==typeof t&&t(r)},r.onerror=function(e){r.onerror=null,"function"==typeof o&&o(e)}},r.prototype.config=function(e){for(var t in e=e||{})m[t]=e[t];return this},r.prototype.modules=function(){var e={};for(var t in g)e[t]=g[t];return e}(),r.prototype.extend=function(e){for(var t in e=e||{})this[t]||this.modules[t]?d("模块名 "+t+" 已被占用"):this.modules[t]=e[t];return this},r.prototype.router=function(e){var o={path:[],search:{},hash:((e=e||location.hash).match(/[^#](#.*$)/)||[])[1]||""};return/^#\//.test(e)&&(e=e.replace(/^#\//,""),o.href="/"+e,e=e.replace(/([^#])(#.*$)/,"$1").split("/")||[],this.each(e,function(e,t){/^\w+=/.test(t)?(t=t.split("="),o.search[t[0]]=t[1]):o.path.push(t)})),o},r.prototype.url=function(e){var n,t,o=this;return{pathname:(e?((e.match(/\.[^.]+?\/.+/)||[])[0]||"").replace(/^[^\/]+/,"").replace(/\?.+/,""):location.pathname).replace(/^\//,"").split("/"),search:(n={},t=(e?(e.match(/\?.+/)||[])[0]||"":location.search).replace(/^\?+/,"").split("&"),o.each(t,function(e,t){var o=t.indexOf("="),r=o<0?t.substr(0,t.length):0!==o&&t.substr(0,o);r&&(n[r]=0<o?t.substr(o+1):null)}),n),hash:o.router(e?(e.match(/#.+/)||[])[0]||"":location.hash)}},r.prototype.data=function(e,t,o){if(e=e||"layui",o=o||localStorage,n.JSON&&n.JSON.parse){if(null===t)return delete o[e];t="object"==typeof t?t:{key:t};try{var r=JSON.parse(o[e])}catch(e){r={}}return"value"in t&&(r[t.key]=t.value),t.remove&&delete r[t.key],o[e]=JSON.stringify(r),t.key?r[t.key]:r}},r.prototype.sessionData=function(e,t){return this.data(e,t,sessionStorage)},r.prototype.device=function(e){function t(e){var t=new RegExp(e+"/([^\\s\\_\\-]+)");return(e=(o.match(t)||[])[1])||!1}var o=navigator.userAgent.toLowerCase(),r={os:/windows/.test(o)?"windows":/linux/.test(o)?"linux":/iphone|ipod|ipad|ios/.test(o)?"ios":/mac/.test(o)?"mac":void 0,ie:!!(n.ActiveXObject||"ActiveXObject"in n)&&((o.match(/msie\s(\d+)/)||[])[1]||"11"),weixin:t("micromessenger")};return e&&!r[e]&&(r[e]=t(e)),r.android=/android/.test(o),r.ios="ios"===r.os,r.mobile=!(!r.android&&!r.ios),r},r.prototype.hint=function(){return{error:d}},r.prototype.each=function(e,t){var o;if("function"!=typeof t)return this;if((e=e||[]).constructor===Object){for(o in e)if(t.call(e[o],o,e[o]))break}else for(o=0;o<e.length&&!t.call(e[o],o,e[o]);o++);return this},r.prototype.sort=function(e,a,t){var o=JSON.parse(JSON.stringify(e||[]));return a&&(o.sort(function(e,t){var o=/^-?\d+$/,r=e[a],n=t[a];return o.test(r)&&(r=parseFloat(r)),o.test(n)&&(n=parseFloat(n)),r&&!n?1:!r&&n?-1:n<r?1:r<n?-1:0}),t&&o.reverse()),o},r.prototype.stope=function(t){t=t||n.event;try{t.stopPropagation()}catch(e){t.cancelBubble=!0}},r.prototype.onevent=function(e,t,o){return"string"!=typeof e||"function"!=typeof o?this:r.event(e,t,null,o)},r.prototype.event=r.event=function(e,t,o,r){function n(e,t){!1===(t&&t.call(a,o))&&null===i&&(i=!1)}var a=this,i=null,l=t.match(/\((.*)\)$/)||[],u=(e+"."+t).replace(l[0],""),s=l[1]||"";return r?(m.event[u]=m.event[u]||{},m.event[u][s]=[r],this):(layui.each(m.event[u],function(e,t){"{*}"!==s?(""===e&&layui.each(t,n),s&&e===s&&layui.each(t,n)):layui.each(t,n)}),i)},n.layui=new r}(window);