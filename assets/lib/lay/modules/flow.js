layui.define("jquery",function(l){"use strict";function o(l){}var v=layui.$;o.prototype.load=function(l){var t,i,n,o=this,e=0,r=v((l=l||{}).elem);if(r[0]){var a=v(l.scrollElem||document),c=l.mb||50,m=!("isAuto"in l)||l.isAuto,s=l.end||"没有更多了",u=l.scrollElem&&l.scrollElem!==document,f="<cite>加载更多</cite>",y=v('<div class="layui-flow-more"><a href="javascript:;">'+f+"</a></div>");r.find(".layui-flow-more")[0]||r.append(y);var d,p=function(l,o){l=v(l),y.before(l),(o=0==o||null)?y.html(s):y.find("a").html(f),i=o,t=null,d&&d()},h=function(){t=!0,y.find("a").html('<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon ">&#xe63e;</i>'),"function"==typeof l.done&&l.done(++e,p)};return(h(),y.find("a").on("click",function(){v(this);i||t||h()}),l.isLazyimg&&(d=o.lazyimg({elem:l.elem+" img",scrollElem:l.scrollElem})),m)?(a.on("scroll",function(){var o=v(this),e=o.scrollTop();n&&clearTimeout(n),!i&&r.width()&&(n=setTimeout(function(){var l=(u?o:v(window)).height();(u?o.prop("scrollHeight"):document.documentElement.scrollHeight)-e-l<=c&&(t||h())},100))}),o):o}},o.prototype.lazyimg=function(l){function c(o,l){var e,t=u.scrollTop(),i=t+l,l=y?o.offset().top-u.offset().top+t:o.offset().top;t<=l&&l<=i&&(o.attr("src")||(e=o.attr("lay-src"),layui.img(e,function(){var l=m.lazyimg.elem.eq(s);o.attr("src",e).removeAttr("lay-src"),l[0]&&n(l),s++})))}var o,m=this,s=0,u=v((l=l||{}).scrollElem||document),f=l.elem||"img",y=l.scrollElem&&l.scrollElem!==document,n=function(l,o){var e=(y?o||u:v(window)).height(),t=u.scrollTop(),i=t+e;if(m.lazyimg.elem=v(f),l)c(l,e);else for(var n=0;n<m.lazyimg.elem.length;n++){var r=m.lazyimg.elem.eq(n),a=y?r.offset().top-u.offset().top+t:r.offset().top;if(c(r,e),s=n,i<a)break}};return n(),u.on("scroll",function(){var l=v(this);o&&clearTimeout(o),o=setTimeout(function(){n(null,l)},50)}),n},l("flow",new o)});