layui.define("jquery",function(l){"use strict";function e(l){}var v=layui.$;e.prototype.load=function(l){var t,i,n,e=this,o=0,r=v((l=l||{}).elem);if(r[0]){var a=v(l.scrollElem||document),c=l.mb||50,m=!("isAuto"in l)||l.isAuto,f=l.end||"没有更多了",s=l.scrollElem&&l.scrollElem!==document,u="<cite>加载更多</cite>",y=v('<div class="layui-flow-more"><a href="javascript:;">'+u+"</a></div>");r.find(".layui-flow-more")[0]||r.append(y);var d=function(l,e){l=v(l),y.before(l),(e=0==e||null)?y.html(f):y.find("a").html(u),i=e,t=null,p&&p()},h=function(){t=!0,y.find("a").html('<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon ">&#xe63e;</i>'),"function"==typeof l.done&&l.done(++o,d)};if(h(),y.find("a").on("click",function(){v(this);i||t||h()}),l.isLazyimg)var p=e.lazyimg({elem:l.elem+" img",scrollElem:l.scrollElem});return m&&a.on("scroll",function(){var e=v(this),o=e.scrollTop();n&&clearTimeout(n),!i&&r.width()&&(n=setTimeout(function(){var l=s?e.height():v(window).height();(s?e.prop("scrollHeight"):document.documentElement.scrollHeight)-o-l<=c&&(t||h())},100))}),e}},e.prototype.lazyimg=function(l){function c(e,l){var o=s.scrollTop(),t=o+l,i=y?e.offset().top-s.offset().top+o:e.offset().top;if(o<=i&&i<=t&&!e.attr("src")){var n=e.attr("lay-src");layui.img(n,function(){var l=m.lazyimg.elem.eq(f);e.attr("src",n).removeAttr("lay-src"),l[0]&&r(l),f++})}}var e,o,m=this,f=0,s=v((l=l||{}).scrollElem||document),u=l.elem||"img",y=l.scrollElem&&l.scrollElem!==document,r=function(l,e){var o=y?(e||s).height():v(window).height(),t=s.scrollTop(),i=t+o;if(m.lazyimg.elem=v(u),l)c(l,o);else for(var n=0;n<m.lazyimg.elem.length;n++){var r=m.lazyimg.elem.eq(n),a=y?r.offset().top-s.offset().top+t:r.offset().top;if(c(r,o),f=n,i<a)break}};r(),e||(s.on("scroll",function(){var l=v(this);o&&clearTimeout(o),o=setTimeout(function(){r(null,l)},50)}),e=!0);return r},l("flow",new e)});