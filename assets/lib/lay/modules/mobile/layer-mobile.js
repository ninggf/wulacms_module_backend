layui.define(function(e){"use strict";window;function l(e){return a.querySelectorAll(e)}function t(e){this.config=d.extend(e),this.view()}var a=document,o="getElementsByClassName",n={type:0,shade:!0,shadeClose:!0,fixed:!0,anim:"scale"},d={extend:function(e){var t,i=JSON.parse(JSON.stringify(n));for(t in e)i[t]=e[t];return i},timer:{},end:{},touch:function(e,t){e.addEventListener("click",function(e){t.call(this,e)},!1)}},c=0,r=["layui-m-layer"];t.prototype.view=function(){var e=this,i=e.config,t=a.createElement("div");e.id=t.id=r[0]+c,t.setAttribute("class",r[0]+" "+r[0]+(i.type||0)),t.setAttribute("index",c);var n=(s="object"==typeof i.title,i.title?'<h3 style="'+(s?i.title[1]:"")+'">'+(s?i.title[0]:i.title)+"</h3>":""),s=function(){"string"==typeof i.btn&&(i.btn=[i.btn]);var e,t=(i.btn||[]).length;return 0!==t&&i.btn?(e='<span yes type="1">'+i.btn[0]+"</span>",2===t&&(e='<span no type="0">'+i.btn[1]+"</span>"+e),'<div class="layui-m-layerbtn">'+e+"</div>"):""}();i.fixed||(i.top=i.hasOwnProperty("top")?i.top:100,i.style=i.style||"",i.style+=" top:"+(a.body.scrollTop+i.top)+"px"),2===i.type&&(i.content='<i></i><i class="layui-m-layerload"></i><i></i><p>'+(i.content||"")+"</p>"),i.skin&&(i.anim="up"),"msg"===i.skin&&(i.shade=!1),t.innerHTML=(i.shade?"<div "+("string"==typeof i.shade?'style="'+i.shade+'"':"")+' class="layui-m-layershade"></div>':"")+'<div class="layui-m-layermain" '+(i.fixed?"":'style="position:static;"')+'><div class="layui-m-layersection"><div class="layui-m-layerchild '+(i.skin?"layui-m-layer-"+i.skin+" ":"")+(i.className||"")+" "+(i.anim?"layui-m-anim-"+i.anim:"")+'" '+(i.style?'style="'+i.style+'"':"")+">"+n+'<div class="layui-m-layercont">'+i.content+"</div>"+s+"</div></div></div>",i.type&&2!==i.type||1<=(s=a[o](r[0]+i.type)).length&&y.close(s[0].getAttribute("index")),document.body.appendChild(t);t=e.elem=l("#"+e.id)[0];i.success&&i.success(t),e.index=c++,e.action(i,t)},t.prototype.action=function(e,t){var i=this;e.time&&(d.timer[i.index]=setTimeout(function(){y.close(i.index)},1e3*e.time));function n(){0==this.getAttribute("type")?(e.no&&e.no(),y.close(i.index)):e.yes?e.yes(i.index):y.close(i.index)}if(e.btn)for(var s=t[o]("layui-m-layerbtn")[0].children,l=s.length,a=0;a<l;a++)d.touch(s[a],n);e.shade&&e.shadeClose&&(t=t[o]("layui-m-layershade")[0],d.touch(t,function(){y.close(i.index,e.end)})),e.end&&(d.end[i.index]=e.end)};var y={v:"2.0 m",index:c,open:function(e){return new t(e||{}).index},close:function(e){var t=l("#"+r[0]+e)[0];t&&(t.innerHTML="",a.body.removeChild(t),clearTimeout(d.timer[e]),delete d.timer[e],"function"==typeof d.end[e]&&d.end[e](),delete d.end[e])},closeAll:function(){for(var e=a[o](r[0]),t=0,i=e.length;t<i;t++)y.close(0|e[0].getAttribute("index"))}};e("layer-mobile",y)});