/** wulacms-v3.0.0 MIT License By https://github.com/ninggf/wulacms */
 ;layui.define("jquery",function(e){"use strict";var i=layui.$;e("code",function(t){var e=[];(t=t||{}).elem=i(t.elem||".layui-code"),t.about=!("about"in t)||t.about,t.elem.each(function(){e.push(this)}),layui.each(e.reverse(),function(e,a){var l=i(a),a=l.html();(l.attr("lay-encode")||t.encode)&&(a=a.replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")),l.html('<ol class="layui-code-ol"><li>'+a.replace(/[\r\t\n]+/g,"</li><li>")+"</li></ol>"),l.find(">.layui-code-h3")[0]||l.prepend('<h3 class="layui-code-h3">'+(l.attr("lay-title")||t.title||"code")+(t.about?'<a href="http://www.layui.com/doc/modules/code.html" target="_blank">layui.code</a>':"")+"</h3>");a=l.find(">.layui-code-ol");l.addClass("layui-box layui-code-view"),(l.attr("lay-skin")||t.skin)&&l.addClass("layui-code-"+(l.attr("lay-skin")||t.skin)),0<(a.find("li").length/100|0)&&a.css("margin-left",(a.find("li").length/100|0)+"px"),(l.attr("lay-height")||t.height)&&a.css("max-height",l.attr("lay-height")||t.height)})})}).addcss("modules/code.css","skincodecss");