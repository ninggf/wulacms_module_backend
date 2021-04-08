layui.define("jquery",function(t){"use strict";var r=layui.$,c=(layui.hint(),layui.device()),o="element",u="layui-this",d="layui-show",a=function(){this.config={}};a.prototype.set=function(t){return r.extend(!0,this.config,t),this},a.prototype.on=function(t,a){return layui.onevent.call(this,o,t,a)},a.prototype.tabAdd=function(t,a){var i=r(".layui-tab[lay-filter="+t+"]"),e=i.children(".layui-tab-title"),l=e.children(".layui-tab-bar"),t=i.children(".layui-tab-content"),i='<li lay-id="'+(a.id||"")+'"'+(a.attr?' lay-attr="'+a.attr+'"':"")+">"+(a.title||"unnaming")+"</li>";return l[0]?l.before(i):e.append(i),t.append('<div class="layui-tab-item">'+(a.content||"")+"</div>"),m.hideTabMore(!0),m.tabAuto(),this},a.prototype.tabDelete=function(t,a){a=r(".layui-tab[lay-filter="+t+"]").children(".layui-tab-title").find('>li[lay-id="'+a+'"]');return m.tabDelete(null,a),this},a.prototype.tabChange=function(t,a){a=r(".layui-tab[lay-filter="+t+"]").children(".layui-tab-title").find('>li[lay-id="'+a+'"]');return m.tabClick.call(a[0],null,null,a),this},a.prototype.tab=function(i){i=i||{},e.on("click",i.headerElem,function(t){var a=r(this).index();m.tabClick.call(this,t,a,null,i)})},a.prototype.progress=function(t,a){var i="layui-progress",t=r("."+i+"[lay-filter="+t+"]").find("."+i+"-bar"),i=t.find("."+i+"-text");return t.css("width",a),i.text(a),this};var y=".layui-nav",h="layui-nav-item",l="layui-nav-bar",f="layui-nav-tree",p="layui-nav-child",b="layui-nav-more",v="layui-anim layui-anim-upbit",m={tabClick:function(t,a,i,e){e=e||{};var l=i||r(this),a=a||l.parent().children("li").index(l),n=e.headerElem?l.parent():l.parents(".layui-tab").eq(0),s=e.bodyElem?r(e.bodyElem):n.children(".layui-tab-content").children(".layui-tab-item"),i=l.find("a"),e=n.attr("lay-filter");"javascript:;"!==i.attr("href")&&"_blank"===i.attr("target")||(l.addClass(u).siblings().removeClass(u),s.eq(a).addClass(d).siblings().removeClass(d)),layui.event.call(this,o,"tab("+e+")",{elem:n,index:a})},tabDelete:function(t,a){var i=a||r(this).parent(),e=i.index(),l=i.parents(".layui-tab").eq(0),n=l.children(".layui-tab-content").children(".layui-tab-item"),a=l.attr("lay-filter");i.hasClass(u)&&(i.next()[0]?m.tabClick.call(i.next()[0],null,e+1):i.prev()[0]&&m.tabClick.call(i.prev()[0],null,e-1)),i.remove(),n.eq(e).remove(),setTimeout(function(){m.tabAuto()},50),layui.event.call(this,o,"tabDelete("+a+")",{elem:l,index:e})},tabAuto:function(){var e="layui-tab-bar",l="layui-tab-close",n=this;r(".layui-tab").each(function(){var t=r(this),a=t.children(".layui-tab-title"),i=(t.children(".layui-tab-content").children(".layui-tab-item"),'lay-stope="tabmore"'),i=r('<span class="layui-unselect layui-tab-bar" '+i+"><i "+i+' class="layui-icon">&#xe61a;</i></span>');n===window&&8!=c.ie&&m.hideTabMore(!0),t.attr("lay-allowClose")&&a.find("li").each(function(){var t,a=r(this);a.find("."+l)[0]||((t=r('<i class="layui-icon layui-unselect '+l+'">&#x1006;</i>')).on("click",m.tabDelete),a.append(t))}),"string"!=typeof t.attr("lay-unauto")&&(a.prop("scrollWidth")>a.outerWidth()+1?a.find("."+e)[0]||(a.append(i),t.attr("overflow",""),i.on("click",function(t){a[this.title?"removeClass":"addClass"]("layui-tab-more"),this.title=this.title?"":"收缩"})):(a.find("."+e).remove(),t.removeAttr("overflow")))})},hideTabMore:function(t){var a=r(".layui-tab-title");!0!==t&&"tabmore"===r(t.target).attr("lay-stope")||(a.removeClass("layui-tab-more"),a.find(".layui-tab-bar").attr("title",""))},clickThis:function(){var t=r(this),a=t.parents(y),i=a.attr("lay-filter"),e=t.parent(),l=t.siblings("."+p),n="string"==typeof e.attr("lay-unselect");"javascript:;"!==t.attr("href")&&"_blank"===t.attr("target")||n||l[0]||(a.find("."+u).removeClass(u),e.addClass(u)),a.hasClass(f)&&(l.removeClass(v),l[0]&&(e["none"===l.css("display")?"addClass":"removeClass"](h+"ed"),"all"===a.attr("lay-shrink")&&e.siblings().removeClass(h+"ed"))),layui.event.call(this,o,"nav("+i+")",t)},collapse:function(){var t=r(this),a=t.find(".layui-colla-icon"),i=t.siblings(".layui-colla-content"),e=t.parents(".layui-collapse").eq(0),l=e.attr("lay-filter"),n="none"===i.css("display");"string"==typeof e.attr("lay-accordion")&&((e=e.children(".layui-colla-item").children("."+d)).siblings(".layui-colla-title").children(".layui-colla-icon").html("&#xe602;"),e.removeClass(d)),i[n?"addClass":"removeClass"](d),a.html(n?"&#xe61a;":"&#xe602;"),layui.event.call(this,o,"collapse("+l+")",{title:t,content:i,show:n})}};a.prototype.render=a.prototype.init=function(t,a){var i=a?'[lay-filter="'+a+'"]':"",a={tab:function(){m.tabAuto.call({})},nav:function(){var n={},s={},o={};r(y+i).each(function(t){var a=r(this),i=r('<span class="'+l+'"></span>'),e=a.find("."+h);a.find("."+l)[0]||(a.append(i),e.on("mouseenter",function(){(function(t,a,i){var e=r(this),l=e.find("."+p);a.hasClass(f)?t.css({top:e.position().top,height:e.children("a").outerHeight(),opacity:1}):(l.addClass(v),t.css({left:e.position().left+parseFloat(e.css("marginLeft")),top:e.position().top+e.height()-t.height()}),n[i]=setTimeout(function(){t.css({width:e.width(),opacity:1})},c.ie&&c.ie<10?0:200),clearTimeout(o[i]),"block"===l.css("display")&&clearTimeout(s[i]),s[i]=setTimeout(function(){l.addClass(d),e.find("."+b).addClass(b+"d")},300))}).call(this,i,a,t)}).on("mouseleave",function(){a.hasClass(f)||(clearTimeout(s[t]),s[t]=setTimeout(function(){a.find("."+p).removeClass(d),a.find("."+b).removeClass(b+"d")},300))}),a.on("mouseleave",function(){clearTimeout(n[t]),o[t]=setTimeout(function(){a.hasClass(f)?i.css({height:0,top:i.position().top+i.height()/2,opacity:0}):i.css({width:0,left:i.position().left+i.width()/2,opacity:0})},200)})),e.find("a").each(function(){var t=r(this);t.parent();t.siblings("."+p)[0]&&!t.children("."+b)[0]&&t.append('<span class="'+b+'"></span>'),t.off("click",m.clickThis).on("click",m.clickThis)})})},breadcrumb:function(){r(".layui-breadcrumb"+i).each(function(){var t=r(this),a="lay-separator",i=t.attr(a)||"/",e=t.find("a");e.next("span["+a+"]")[0]||(e.each(function(t){t!==e.length-1&&r(this).after("<span "+a+">"+i+"</span>")}),t.css("visibility","visible"))})},progress:function(){var e="layui-progress";r("."+e+i).each(function(){var t=r(this),a=t.find(".layui-progress-bar"),i=a.attr("lay-percent");a.css("width",/^.+\/.+$/.test(i)?100*new Function("return "+i)()+"%":i),t.attr("lay-showPercent")&&setTimeout(function(){a.html('<span class="'+e+'-text">'+i+"</span>")},350)})},collapse:function(){r(".layui-collapse"+i).each(function(){r(this).find(".layui-colla-item").each(function(){var t=r(this),a=t.find(".layui-colla-title"),t="none"===t.find(".layui-colla-content").css("display");a.find(".layui-colla-icon").remove(),a.append('<i class="layui-icon layui-colla-icon">'+(t?"&#xe602;":"&#xe61a;")+"</i>"),a.off("click",m.collapse).on("click",m.collapse)})})}};return a[t]?a[t]():layui.each(a,function(t,a){a()})};var a=new a,e=r(document);a.render();e.on("click",".layui-tab-title li",m.tabClick),e.on("click",m.hideTabMore),r(window).on("resize",m.tabAuto),t(o,a)});