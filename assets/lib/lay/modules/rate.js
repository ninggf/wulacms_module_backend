layui.define("jquery",function(e){"use strict";function a(e){var a=this;a.index=++l.index,a.config=u.extend({},a.config,l.config,e),a.render()}var u=layui.jquery,l={config:{},index:layui.rate?layui.rate.index+1e4:0,set:function(e){var a=this;return a.config=u.extend({},a.config,e),a},on:function(e,a){return layui.onevent.call(this,i,e,a)}},i="rate",r="layui-icon-rate",c="layui-icon-rate-solid",o="layui-icon-rate-half",s="layui-icon-rate-solid layui-icon-rate-half",f="layui-icon-rate layui-icon-rate-half";a.prototype.config={length:5,text:!1,readonly:!1,half:!1,value:0,theme:""},a.prototype.render=function(){var e=this,a=e.config,l=a.theme?'style="color: '+a.theme+';"':"";a.elem=u(a.elem),a.value>a.length&&(a.value=a.length),parseInt(a.value)!==a.value&&(a.half||(a.value=Math.ceil(a.value)-a.value<.5?Math.ceil(a.value):Math.floor(a.value)));for(var i='<ul class="layui-rate" '+(a.readonly?"readonly":"")+">",n=1;n<=a.length;n++){var t='<li class="layui-inline"><i class="layui-icon '+(n>Math.floor(a.value)?r:c)+'" '+l+"></i></li>";a.half&&parseInt(a.value)!==a.value&&n==Math.ceil(a.value)?i=i+'<li><i class="layui-icon layui-icon-rate-half" '+l+"></i></li>":i+=t}i+="</ul>"+(a.text?'<span class="layui-inline">'+a.value+"星":"")+"</span>";var o=a.elem,s=o.next(".layui-rate");s[0]&&s.remove(),e.elemTemp=u(i),a.span=e.elemTemp.next("span"),a.setText&&a.setText(a.value),o.html(e.elemTemp),o.addClass("layui-inline"),a.readonly||e.action()},a.prototype.setvalue=function(e){this.config.value=e,this.render()},a.prototype.action=function(){var i=this.config,n=this.elemTemp,t=n.find("i").width();n.children("li").each(function(e){var a=e+1,l=u(this);l.on("click",function(e){i.value=a,i.half&&e.pageX-u(this).offset().left<=t/2&&(i.value=i.value-.5),i.text&&n.next("span").text(i.value+"星"),i.choose&&i.choose(i.value),i.setText&&i.setText(i.value)}),l.on("mousemove",function(e){n.find("i").each(function(){u(this).addClass(r).removeClass(s)}),n.find("i:lt("+a+")").each(function(){u(this).addClass(c).removeClass(f)}),i.half&&e.pageX-u(this).offset().left<=t/2&&l.children("i").addClass(o).removeClass(c)}),l.on("mouseleave",function(){n.find("i").each(function(){u(this).addClass(r).removeClass(s)}),n.find("i:lt("+Math.floor(i.value)+")").each(function(){u(this).addClass(c).removeClass(f)}),i.half&&parseInt(i.value)!==i.value&&n.children("li:eq("+Math.floor(i.value)+")").children("i").addClass(o).removeClass("layui-icon-rate-solid layui-icon-rate")})})},a.prototype.events=function(){this.config},l.render=function(e){e=new a(e);return function(){var a=this;return{setvalue:function(e){a.setvalue.call(a,e)},config:a.config}}.call(e)},e(i,l)});