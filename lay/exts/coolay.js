/** coolay-v1.0.0 MIT License By https://github.com/ninggf/coolayui */
 ;layui.define(["jquery","element"],function(e){"use strict";function o(){}var s=layui.$,a=s("body").addClass("loaded"),l=s("#cl-overlay");o.prototype.overlay=function(e){"show"==e?l.addClass("show"):l.removeClass("show")};var n=new o;window.Coolayui=n,a.on("click","#cl-overlay",function(){a.removeClass("opened"),l.removeClass("show")}).on("mouseenter",".cl-sidebar",function(){a.hasClass("sidebar-folded")&&!a.hasClass("opened")&&a.addClass("opened")}).on("mouseleave",".cl-sidebar",function(){a.hasClass("sidebar-folded")&&a.removeClass("opened")}),e("&coolay",n)});