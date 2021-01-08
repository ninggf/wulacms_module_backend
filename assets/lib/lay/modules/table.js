layui.define(["laytpl","laypage","layer","form","util"],function(e){"use strict";function i(e){return(e=s.config[e])||y.error("The ID option was not found in the table instance"),e||null}function m(e,t,i,a){return t=e.templet?"function"==typeof e.templet?e.templet(i):g(v(e.templet).html()||String(t)).render(i):t,a?v("<div>"+t+"</div>").text():t}function t(e){return['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" ','{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>',"<thead>","{{# layui.each(d.data.cols, function(i1, item1){ }}","<tr>","{{# layui.each(item1, function(i2, item2){ }}",'{{# if(item2.fixed && item2.fixed !== "right"){ left = true; } }}','{{# if(item2.fixed === "right"){ right = true; } }}',(e=e||{}).fixed&&"right"!==e.fixed?'{{# if(item2.fixed && item2.fixed !== "right"){ }}':"right"===e.fixed?'{{# if(item2.fixed === "right"){ }}':"","{{# var isSort = !(item2.colGroup) && item2.sort; }}",'<th data-field="{{ item2.field||i2 }}" data-key="{{d.index}}-{{i1}}-{{i2}}" {{# if( item2.parentKey){ }}data-parentkey="{{ item2.parentKey }}"{{# } }} {{# if(item2.minWidth){ }}data-minwidth="{{item2.minWidth}}"{{# } }} {{#if(item2.colspan){}} colspan="{{item2.colspan}}"{{#} if(item2.rowspan){}} rowspan="{{item2.rowspan}}"{{#}}} {{# if(item2.unresize || item2.colGroup){ }}data-unresize="true"{{# } }} class="{{# if(item2.hide){ }}layui-hide{{# } }}{{# if(isSort){ }} layui-unselect{{# } }}{{# if(!item2.field){ }} layui-table-col-special{{# } }}">','<div class="layui-table-cell laytable-cell-',"{{# if(item2.colGroup){ }}","group","{{# } else { }}","{{d.index}}-{{i1}}-{{i2}}",'{{# if(item2.type !== "normal"){ }}'," laytable-cell-{{ item2.type }}","{{# } }}","{{# } }}",'" {{#if(item2.align){}}align="{{item2.align}}"{{#}}}>','{{# if(item2.type === "checkbox"){ }}','<input type="checkbox" name="layTableCheckbox" lay-skin="primary" lay-filter="layTableAllChoose" {{# if(item2[d.data.checkName]){ }}checked{{# }; }}>',"{{# } else { }}",'<span>{{item2.title||""}}</span>',"{{# if(isSort){ }}",'<span class="layui-table-sort layui-inline"><i class="layui-edge layui-table-sort-asc" title="升序"></i><i class="layui-edge layui-table-sort-desc" title="降序"></i></span>',"{{# } }}","{{# } }}","</div>","</th>",e.fixed?"{{# }; }}":"","{{# }); }}","</tr>","{{# }); }}","</thead>","</table>"].join("")}function a(e){this.index=++x.index,this.config=v.extend({},this.config,x.config,e),this.render()}var v=layui.$,g=layui.laytpl,o=layui.laypage,b=layui.layer,h=layui.form,y=(layui.util,layui.hint()),f=layui.device(),x={config:{checkName:"LAY_CHECKED",indexName:"LAY_TABLE_INDEX"},cache:{},index:layui.table?layui.table.index+1e4:0,set:function(e){var t=this;return t.config=v.extend({},t.config,e),t},on:function(e,t){return layui.onevent.call(this,p,e,t)}},s=function(){var t=this,e=t.config,i=e.id||e.index;return i&&(s.that[i]=t,s.config[i]=e),{config:e,reload:function(e){t.reload.call(t,e)},setColsWidth:function(){t.setColsWidth.call(t)},resize:function(){t.resize.call(t)},reloadData:function(){t.pullData.call(t,1)}}},p="table",k="layui-hide",d="layui-none",n="layui-table-view",c=".layui-table-header",C=".layui-table-body",w=".layui-table-sort",T="layui-table-edit",A="layui-table-hover",l=['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" ','{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>',"<tbody></tbody>","</table>"].join(""),r=['<div class="layui-form layui-border-box {{d.VIEW_CLASS}}" lay-filter="LAY-table-{{d.index}}" lay-id="{{ d.data.id }}" style="{{# if(d.data.width){ }}width:{{d.data.width}}px;{{# } }} {{# if(d.data.height){ }}height:{{d.data.height}}px;{{# } }}">',"{{# if(d.data.toolbar){ }}",'<div class="layui-table-tool">','<div class="layui-table-tool-temp"></div>','<div class="layui-table-tool-self"></div>',"</div>","{{# } }}",'<div class="layui-table-box">',"{{# if(d.data.loading){ }}",'<div class="layui-table-init" style="background-color: #fff;">','<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>',"</div>","{{# } }}","{{# var left, right; }}",'<div class="layui-table-header">',t(),"</div>",'<div class="layui-table-body layui-table-main">',l,"</div>","{{# if(left){ }}",'<div class="layui-table-fixed layui-table-fixed-l">','<div class="layui-table-header">',t({fixed:!0}),"</div>",'<div class="layui-table-body">',l,"</div>","</div>","{{# }; }}","{{# if(right){ }}",'<div class="layui-table-fixed layui-table-fixed-r">','<div class="layui-table-header">',t({fixed:"right"}),'<div class="layui-table-mend"></div>',"</div>",'<div class="layui-table-body">',l,"</div>","</div>","{{# }; }}","</div>","{{# if(d.data.totalRow){ }}",'<div class="layui-table-total">','<table cellspacing="0" cellpadding="0" border="0" class="layui-table" ','{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>','<tbody><tr><td><div class="layui-table-cell" style="visibility: hidden;">Total</div></td></tr></tbody>',"</table>","</div>","{{# } }}","{{# if(d.data.page){ }}",'<div class="layui-table-page">','<div id="layui-table-page{{d.index}}"></div>',"</div>","{{# } }}","<style>","{{# layui.each(d.data.cols, function(i1, item1){","layui.each(item1, function(i2, item2){ }}",".laytable-cell-{{d.index}}-{{i1}}-{{i2}}{ ","{{# if(item2.width){ }}","width: {{item2.width}}px;","{{# } }}"," }","{{# });","}); }}","</style>","</div>"].join(""),L=v(window),N=v(document);a.prototype.config={limit:10,loading:!0,cellMinWidth:60,defaultToolbar:["filter","exports","print"],autoSort:!0,text:{none:"无数据"}},a.prototype.render=function(){var e=this,t=e.config;if(t.elem=v(t.elem),t.where=t.where||{},t.id=t.id||t.elem.attr("id")||e.index,t.request=v.extend({pageName:"page",limitName:"limit"},t.request),t.response=v.extend({statusName:"code",statusCode:0,msgName:"msg",dataName:"data",totalRowName:"totalRow",countName:"count"},t.response),"object"==typeof t.page&&(t.limit=t.page.limit||t.limit,t.limits=t.page.limits||t.limits,e.page=t.page.curr=t.page.curr||1,delete t.page.elem,delete t.page.jump),!t.elem[0])return e;t.height&&/^full-\d+$/.test(t.height)&&(e.fullHeightGap=t.height.split("-")[1],t.height=L.height()-e.fullHeightGap),e.setInit();var i=t.elem,a=i.next("."+n),l=e.elem=v(g(r).render({VIEW_CLASS:n,data:t,index:e.index}));t.index=e.index,e.key=t.id||t.index,a[0]&&a.remove(),i.after(l),e.layTool=l.find(".layui-table-tool"),e.layBox=l.find(".layui-table-box"),e.layHeader=l.find(c),e.layMain=l.find(".layui-table-main"),e.layBody=l.find(C),e.layFixed=l.find(".layui-table-fixed"),e.layFixLeft=l.find(".layui-table-fixed-l"),e.layFixRight=l.find(".layui-table-fixed-r"),e.layTotal=l.find(".layui-table-total"),e.layPage=l.find(".layui-table-page"),e.renderToolbar(),e.fullSize(),1<t.cols.length&&(t=e.layFixed.find(c).find("th")).height(e.layHeader.height()-1-parseFloat(t.css("padding-top"))-parseFloat(t.css("padding-bottom"))),e.pullData(e.page),e.events()},a.prototype.initOpts=function(e){this.config;e.checkbox&&(e.type="checkbox"),e.space&&(e.type="space"),e.type||(e.type="normal"),"normal"!==e.type&&(e.unresize=!0,e.width=e.width||{checkbox:48,radio:48,space:15,numbers:40}[e.type])},a.prototype.setInit=function(e){var a,t=this,o=t.config;if(o.clientWidth=o.width||(a=function(e){var t,i=(e=e||o.elem.parent()).width();try{t="none"===e.css("display")}catch(e){}return!e[0]||i&&!t?i:a(e.parent())})(),"width"===e)return o.clientWidth;layui.each(o.cols,function(n,e){layui.each(e,function(i,a){var l;a?(a.key=n+"-"+i,a.hide=a.hide||!1,(a.colGroup||1<a.colspan)&&(l=0,layui.each(o.cols[n+1],function(e,t){t.HAS_PARENT||1<l&&l==a.colspan||(t.HAS_PARENT=!0,t.parentKey=n+"-"+i,l+=parseInt(1<t.colspan?t.colspan:1))}),a.colGroup=!0),t.initOpts(a)):e.splice(i,1)})})},a.prototype.renderToolbar=function(){var e=this.config,t=['<div class="layui-inline" lay-event="add"><i class="layui-icon layui-icon-add-1"></i></div>','<div class="layui-inline" lay-event="update"><i class="layui-icon layui-icon-edit"></i></div>','<div class="layui-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'].join(""),i=this.layTool.find(".layui-table-tool-temp");"default"===e.toolbar?i.html(t):"string"!=typeof e.toolbar||(t=v(e.toolbar).html()||"")&&i.html(g(t).render(e));var a={filter:{title:"筛选列",layEvent:"LAYTABLE_COLS",icon:"layui-icon-cols"},exports:{title:"导出",layEvent:"LAYTABLE_EXPORT",icon:"layui-icon-export"},print:{title:"打印",layEvent:"LAYTABLE_PRINT",icon:"layui-icon-print"}},l=[];"object"==typeof e.defaultToolbar&&layui.each(e.defaultToolbar,function(e,t){t="string"==typeof t?a[t]:t;t&&l.push('<div class="layui-inline" title="'+t.title+'" lay-event="'+t.layEvent+'"><i class="layui-icon '+t.icon+'"></i></div>')}),this.layTool.find(".layui-table-tool-self").html(l.join(""))},a.prototype.setParentCol=function(e,t){var i=this.config,a=this.layHeader.find('th[data-key="'+i.index+"-"+t+'"]'),l=parseInt(a.attr("colspan"))||0;a[0]&&(t=t.split("-"),t=i.cols[t[0]][t[1]],e?l--:l++,a.attr("colspan",l),a[l<1?"addClass":"removeClass"](k),t.colspan=l,t.hide=l<1,(a=a.data("parentkey"))&&this.setParentCol(e,a))},a.prototype.setColsPatch=function(){var i=this,e=i.config;layui.each(e.cols,function(e,t){layui.each(t,function(e,t){t.hide&&i.setParentCol(t.hide,t.parentKey)})})},a.prototype.setColsWidth=function(){var a=this,o=a.config,i=0,d=0,c=0,r=0,s=a.setInit("width");a.eachCols(function(e,t){t.hide||i++}),s=s-("line"===o.skin||"nob"===o.skin?2:i+1)-a.getScrollWidth(a.layMain[0])-1;var e=function(n){layui.each(o.cols,function(e,l){layui.each(l,function(e,t){var i=0,a=t.minWidth||o.cellMinWidth;t?t.colGroup||t.hide||(n?c&&c<a&&(d--,i=a):(i=t.width||0,/\d+%$/.test(i)?(i=Math.floor(parseFloat(i)/100*s))<a&&(i=a):i||(t.width=i=0,d++)),t.hide&&(i=0),r+=i):l.splice(e,1)})}),r<s&&d&&(c=(s-r)/d)};e(),e(!0),a.autoColNums=d,a.eachCols(function(e,t){var i=t.minWidth||o.cellMinWidth;t.colGroup||t.hide||(0===t.width?a.getCssRule(o.index+"-"+t.key,function(e){e.style.width=Math.floor(i<=c?c:i)+"px"}):/\d+%$/.test(t.width)&&a.getCssRule(o.index+"-"+t.key,function(e){e.style.width=Math.floor(parseFloat(t.width)/100*s)+"px"}))});var t,l,n=a.layMain.width()-a.getScrollWidth(a.layMain[0])-a.layMain.children("table").outerWidth();a.autoColNums&&-i<=n&&n<=i&&(e=(l=(t=function(e){return!(e=e||a.layHeader.eq(0).find("thead th:last-child")).data("field")&&e.prev()[0]?t(e.prev()):e})()).data("key"),a.getCssRule(e,function(e){var t=e.style.width||l.outerWidth();e.style.width=parseFloat(t)+n+"px",0<a.layMain.height()-a.layMain.prop("clientHeight")&&(e.style.width=parseFloat(e.style.width)-1+"px")})),a.loading(!0)},a.prototype.resize=function(){this.fullSize(),this.setColsWidth(),this.scrollPatch()},a.prototype.reload=function(e){var t=this;e=e||{},delete t.haveInit,e.data&&e.data.constructor===Array&&delete t.config.data,t.config=v.extend(!0,{},t.config,e),t.render()},a.prototype.errorView=function(e){var t=this,i=t.layMain.find("."+d),e=v('<div class="'+d+'">'+(e||"Error")+"</div>");i[0]&&(t.layNone.remove(),i.remove()),t.layFixed.addClass(k),t.layMain.find("tbody").html(""),t.layMain.append(t.layNone=e),x.cache[t.key]=[]},a.prototype.page=1,a.prototype.pullData=function(t){function i(){"object"==typeof n.initSort&&l.sort(n.initSort.field,n.initSort.type)}var e,a,l=this,n=l.config,o=n.request,d=n.response;l.startTime=(new Date).getTime(),n.url?((e={})[o.pageName]=t,e[o.limitName]=n.limit,a=v.extend(e,n.where),v.isFunction(n.data)&&(a=n.data(a)),n.contentType&&0==n.contentType.indexOf("application/json")&&(a=JSON.stringify(a)),l.loading(),v.ajax({type:n.method||"get",url:n.url,contentType:n.contentType,data:a,dataType:"json",headers:n.headers||{},success:function(e){"function"==typeof n.parseData&&(e=n.parseData(e)||e),e[d.statusName]!=d.statusCode?(l.renderForm(),l.errorView(e[d.msgName]||'返回的数据不符合规范，正确的成功状态码应为："'+d.statusName+'": '+d.statusCode)):(l.renderData(e,t,e[d.countName]),i(),n.time=(new Date).getTime()-l.startTime+" ms"),l.setColsWidth(),"function"==typeof n.done&&n.done(e,t,e[d.countName])},error:function(e,t){l.errorView("数据接口请求异常："+t),l.renderForm(),l.setColsWidth()}})):n.data&&n.data.constructor===Array&&(e={},a=t*n.limit-n.limit,e[d.dataName]=n.data.concat().splice(a,n.limit),e[d.countName]=n.data.length,"object"==typeof n.totalRow&&(e[d.totalRowName]=v.extend({},n.totalRow)),l.renderData(e,t,e[d.countName]),i(),l.setColsWidth(),"function"==typeof n.done&&n.done(e,t,e[d.countName]))},a.prototype.eachCols=function(e){return x.eachCols(null,e,this.config.cols),this},a.prototype.renderData=function(e,t,i,a){var u=this,h=u.config,l=e[h.response.dataName]||[],n=e[h.response.totalRowName],y=[],f=[],p=[],e=function(){var s;if(!a&&u.sortKey)return u.sort(u.sortKey.field,u.sortKey.sort,!0);layui.each(l,function(l,n){var o=[],d=[],c=[],r=l+h.limit*(t-1)+1;0!==n.length&&(a||(n[x.config.indexName]=l),u.eachCols(function(e,i){var t=i.field||e,e=h.index+"-"+i.key,a=n[t];null==a&&(a=""),i.colGroup||(e=['<td data-field="'+t+'" data-key="'+e+'" '+(t=[],i.edit&&t.push('data-edit="'+i.edit+'"'),i.align&&t.push('align="'+i.align+'"'),i.templet&&t.push('data-content="'+a+'"'),i.toolbar&&t.push('data-off="true"'),i.event&&t.push('lay-event="'+i.event+'"'),i.style&&t.push('style="'+i.style+'"'),i.minWidth&&t.push('data-minwidth="'+i.minWidth+'"'),t.join(" "))+' class="'+(t=[],i.hide&&t.push(k),i.field||t.push("layui-table-col-special"),t.join(" "))+'">','<div class="layui-table-cell laytable-cell-'+("normal"===i.type?e:e+" laytable-cell-"+i.type)+'">'+function(){var e=v.extend(!0,{LAY_INDEX:r},n),t=x.config.checkName;switch(i.type){case"checkbox":return'<input type="checkbox" name="layTableCheckbox" lay-skin="primary" '+(i[t]?(n[t]=i[t],i[t]?"checked":""):e[t]?"checked":"")+">";case"radio":return e[t]&&(s=l),'<input type="radio" name="layTableRadio_'+h.index+'" '+(e[t]?"checked":"")+' lay-type="layTableRadio">';case"numbers":return r}return i.toolbar?g(v(i.toolbar).html()||"").render(e):m(i,a,e)}(),"</div></td>"].join(""),o.push(e),i.fixed&&"right"!==i.fixed&&d.push(e),"right"===i.fixed&&c.push(e))}),y.push('<tr data-index="'+l+'">'+o.join("")+"</tr>"),f.push('<tr data-index="'+l+'">'+d.join("")+"</tr>"),p.push('<tr data-index="'+l+'">'+c.join("")+"</tr>"))}),u.layBody.scrollTop(0),u.layMain.find("."+d).remove(),u.layMain.find("tbody").html(y.join("")),u.layFixLeft.find("tbody").html(f.join("")),u.layFixRight.find("tbody").html(p.join("")),u.renderForm(),"number"==typeof s&&u.setThisRowChecked(s),u.syncCheckAll(),u.haveInit?u.scrollPatch():setTimeout(function(){u.scrollPatch()},50),u.haveInit=!0,b.close(u.tipsIndex),h.HAS_SET_COLS_PATCH||u.setColsPatch(),h.HAS_SET_COLS_PATCH=!0};return x.cache[u.key]=l,u.layPage[0==i||0===l.length&&1==t?"addClass":"removeClass"](k),0===l.length?(u.renderForm(),u.errorView(h.text.none)):(u.layFixed.removeClass(k),a?e():(e(),u.renderTotal(l,n),void(h.page&&(h.page=v.extend({elem:"layui-table-page"+h.index,count:i,limit:h.limit,limits:h.limits||[10,20,30,40,50,60,70,80,90],groups:3,layout:["prev","page","next","skip","count","limit"],prev:'<i class="layui-icon">&#xe603;</i>',next:'<i class="layui-icon">&#xe602;</i>',jump:function(e,t){t||(u.page=e.curr,h.limit=e.limit,u.pullData(e.curr))}},h.page),h.page.count=i,o.render(h.page)))))},a.prototype.renderTotal=function(e,n){var o,d=this,c=d.config,r={};c.totalRow&&(layui.each(e,function(e,a){0!==a.length&&d.eachCols(function(e,t){var i=t.field||e,e=a[i];t.totalRow&&(r[i]=(r[i]||0)+(parseFloat(e)||0))})}),d.dataTotal={},o=[],d.eachCols(function(e,t){var i,a,l=t.field||e,a=(i=t.totalRowText||"",a=parseFloat(r[l]).toFixed(2),(e={})[l]=a,a=m(t,a,e),n?n[t.field]||i:t.totalRow&&a||i),i=['<td data-field="'+l+'" data-key="'+c.index+"-"+t.key+'" '+(i=[],t.align&&i.push('align="'+t.align+'"'),t.style&&i.push('style="'+t.style+'"'),t.minWidth&&i.push('data-minwidth="'+t.minWidth+'"'),i.join(" "))+' class="'+(i=[],t.hide&&i.push(k),t.field||i.push("layui-table-col-special"),i.join(" "))+'">','<div class="layui-table-cell laytable-cell-'+(i=c.index+"-"+t.key,"normal"===t.type?i:i+" laytable-cell-"+t.type)+'">'+a,"</div></td>"].join("");t.field&&(d.dataTotal[l]=a),o.push(i)}),d.layTotal.find("tbody").html("<tr>"+o.join("")+"</tr>"))},a.prototype.getColElem=function(e,t){var i=this.config;return e.eq(0).find(".laytable-cell-"+i.index+"-"+t+":eq(0)")},a.prototype.renderForm=function(e){h.render(e,"LAY-table-"+this.index)},a.prototype.setThisRowChecked=function(e){this.config;var t="layui-table-click";this.layBody.find('tr[data-index="'+e+'"]').addClass(t).siblings("tr").removeClass(t)},a.prototype.sort=function(l,e,t,i){var a,n=this,o={},d=n.config,c=d.elem.attr("lay-filter"),r=x.cache[n.key];"string"==typeof l&&n.layHeader.find("th").each(function(e,t){var i=v(this),a=i.data("field");if(a===l)return l=i,s=a,!1});try{var s=s||l.data("field"),u=l.data("key");if(n.sortKey&&!t&&s===n.sortKey.field&&e===n.sortKey.sort)return;u=n.layHeader.find("th .laytable-cell-"+u).find(w);n.layHeader.find("th").find(w).removeAttr("lay-sort"),u.attr("lay-sort",e||null),n.layFixed.find("th")}catch(e){return y.error("Table modules: Did not match to field")}n.sortKey={field:s,sort:e},d.autoSort&&("asc"===e?a=layui.sort(r,s):"desc"===e?a=layui.sort(r,s,!0):(a=layui.sort(r,x.config.indexName),delete n.sortKey)),o[d.response.dataName]=a||r,n.renderData(o,n.page,n.count,!0),i&&layui.event.call(l,p,"sort("+c+")",{field:s,type:e})},a.prototype.loading=function(e){var t=this;t.config.loading&&(e?(t.layInit&&t.layInit.remove(),delete t.layInit,t.layBox.find(".layui-table-init").remove()):(t.layInit=v(['<div class="layui-table-init">','<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>',"</div>"].join("")),t.layBox.append(t.layInit)))},a.prototype.setCheckData=function(e,t){var i=this.config,a=x.cache[this.key];a[e]&&a[e].constructor!==Array&&(a[e][i.checkName]=t)},a.prototype.syncCheckAll=function(){function e(i){return t.eachCols(function(e,t){"checkbox"===t.type&&(t[a.checkName]=i)}),i}var t=this,a=t.config,i=t.layHeader.find('input[name="layTableCheckbox"]');i[0]&&(x.checkStatus(t.key).isAll?(i[0].checked||(i.prop("checked",!0),t.renderForm("checkbox")),e(!0)):(i[0].checked&&(i.prop("checked",!1),t.renderForm("checkbox")),e(!1)))},a.prototype.getCssRule=function(i,a){var e=this.elem.find("style")[0],e=e.sheet||e.styleSheet||{},e=e.cssRules||e.rules;layui.each(e,function(e,t){if(t.selectorText===".laytable-cell-"+i)return a(t),!0})},a.prototype.fullSize=function(){var e=this,t=e.config,i=t.height;e.fullHeightGap&&((i=L.height()-e.fullHeightGap)<135&&(i=135),e.elem.css("height",i)),i&&(i=parseFloat(i)-(e.layHeader.outerHeight()||38),t.toolbar&&(i-=e.layTool.outerHeight()||50),t.totalRow&&(i-=e.layTotal.outerHeight()||40),t.page&&(i-=e.layPage.outerHeight()||41),e.layMain.css("height",i-2))},a.prototype.getScrollWidth=function(e){var t=0;return e?t=e.offsetWidth-e.clientWidth:((e=document.createElement("div")).style.width="100px",e.style.height="100px",e.style.overflowY="scroll",document.body.appendChild(e),t=e.offsetWidth-e.clientWidth,document.body.removeChild(e)),t},a.prototype.scrollPatch=function(){var e=this,t=e.layMain.children("table"),i=e.layMain.width()-e.layMain.prop("clientWidth"),a=e.layMain.height()-e.layMain.prop("clientHeight"),l=(e.getScrollWidth(e.layMain[0]),t.outerWidth()-e.layMain.width()),n=function(e){var t;i&&a?(e=e.eq(0)).find(".layui-table-patch")[0]||((t=v('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>')).find("div").css({width:i}),e.find("tr").append(t)):e.find(".layui-table-patch").remove()};n(e.layHeader),n(e.layTotal);n=e.layMain.height()-a;e.layFixed.find(C).css("height",t.height()>=n?n:"auto"),e.layFixRight[0<l?"removeClass":"addClass"](k),e.layFixRight.css("right",i-1)},a.prototype.events=function(){var l,c=this,r=c.config,a=v("body"),n={},e=c.layHeader.find("th"),o=".layui-table-cell",s=r.elem.attr("lay-filter");c.layTool.on("click","*[lay-event]",function(e){function t(e){var t=v(e.list),i=v('<ul class="layui-table-tool-panel"></ul>');i.html(t),r.height&&i.css("max-height",r.height-(c.layTool.outerHeight()||50)),a.find(".layui-table-tool-panel")[0]||a.append(i),c.renderForm(),i.on("click",function(e){layui.stope(e)}),e.done&&e.done(i,t)}var i,a=v(this),l=a.attr("lay-event");switch(layui.stope(e),N.trigger("table.tool.panel.remove"),b.close(c.tipsIndex),l){case"LAYTABLE_COLS":t({list:(i=[],c.eachCols(function(e,t){t.field&&"normal"==t.type&&i.push('<li><input type="checkbox" name="'+t.field+'" data-key="'+t.key+'" data-parentkey="'+(t.parentKey||"")+'" lay-skin="primary" '+(t.hide?"":"checked")+' title="'+(t.title||t.field)+'" lay-filter="LAY_TABLE_TOOL_COLS"></li>')}),i.join("")),done:function(){h.on("checkbox(LAY_TABLE_TOOL_COLS)",function(e){var e=v(e.elem),a=this.checked,l=e.data("key"),n=e.data("parentkey");layui.each(r.cols,function(i,e){layui.each(e,function(e,t){i+"-"+e===l&&(e=t.hide,t.hide=!a,c.elem.find('*[data-key="'+r.index+"-"+l+'"]')[a?"removeClass":"addClass"](k),e!=t.hide&&c.setParentCol(!a,n),c.resize())})})})}});break;case"LAYTABLE_EXPORT":f.ie?b.tips("导出功能不支持 IE，请用 Chrome 等高级浏览器导出",this,{tips:3}):t({list:['<li data-type="csv">导出到 Csv 文件</li>','<li data-type="xls">导出到 Excel 文件</li>'].join(""),done:function(e,t){t.on("click",function(){var e=v(this).data("type");x.exportFile.call(c,r.id,null,e)})}});break;case"LAYTABLE_PRINT":var n=window.open("打印窗口","_blank"),o=["<style>","body{font-size: 12px; color: #666;}","table{width: 100%; border-collapse: collapse; border-spacing: 0;}","th,td{line-height: 20px; padding: 9px 15px; border: 1px solid #ccc; text-align: left; font-size: 12px; color: #666;}","a{color: #666; text-decoration:none;}","*.layui-hide{display: none}","</style>"].join(""),d=v(c.layHeader.html());d.append(c.layMain.find("table").html()),d.append(c.layTotal.find("table").html()),d.find("th.layui-table-patch").remove(),d.find(".layui-table-col-special").remove(),n.document.write(o+d.prop("outerHTML")),n.document.close(),n.print(),n.close()}layui.event.call(this,p,"toolbar("+s+")",v.extend({event:l,config:r},{}))}),e.on("mousemove",function(e){var t=v(this),i=t.offset().left,i=e.clientX-i;t.data("unresize")||n.resizeStart||(n.allowResize=t.width()-i<=10,a.css("cursor",n.allowResize?"col-resize":""))}).on("mouseleave",function(){v(this);n.resizeStart||a.css("cursor","")}).on("mousedown",function(e){var t,i=v(this);n.allowResize&&(t=i.data("key"),e.preventDefault(),n.resizeStart=!0,n.offset=[e.clientX,e.clientY],c.getCssRule(t,function(e){var t=e.style.width||i.outerWidth();n.rule=e,n.ruleWidth=parseFloat(t),n.minWidth=i.data("minwidth")||r.cellMinWidth}))}),N.on("mousemove",function(e){n.resizeStart&&(e.preventDefault(),n.rule&&((e=n.ruleWidth+e.clientX-n.offset[0])<n.minWidth&&(e=n.minWidth),n.rule.style.width=e+"px",b.close(c.tipsIndex)),l=1)}).on("mouseup",function(e){n.resizeStart&&(n={},a.css("cursor",""),c.scrollPatch()),2===l&&(l=null)}),e.on("click",function(e){var t=v(this),i=t.find(w),a=i.attr("lay-sort");if(!i[0]||1===l)return l=2;a="asc"===a?"desc":"desc"===a?null:"asc",c.sort(t,a,null,!0)}).find(w+" .layui-edge ").on("click",function(e){var t=v(this),i=t.index(),t=t.parents("th").eq(0).data("field");layui.stope(e),0===i?c.sort(t,"asc",null,!0):c.sort(t,"desc",null,!0)});function d(e){var t=v(this).parents("tr").eq(0).data("index"),l=c.layBody.find('tr[data-index="'+t+'"]'),n=(n=x.cache[c.key]||[])[t]||{};return v.extend({tr:l,data:x.clearCacheKey(n),del:function(){x.cache[c.key][t]=[],l.remove(),c.scrollPatch()},update:function(e){e=e||{},layui.each(e,function(i,e){var a,t;i in n&&(t=l.children('td[data-field="'+i+'"]'),n[i]=e,c.eachCols(function(e,t){t.field==i&&t.templet&&(a=t.templet)}),t.children(o).html(m({templet:a},e,n)),t.data("content",e))})}},e)}c.elem.on("click",'input[name="layTableCheckbox"]+',function(){var e=v(this).prev(),t=c.layBody.find('input[name="layTableCheckbox"]'),i=e.parents("tr").eq(0).data("index"),a=e[0].checked,l="layTableAllChoose"===e.attr("lay-filter");l?(t.each(function(e,t){t.checked=a,c.setCheckData(e,a)}),c.syncCheckAll(),c.renderForm("checkbox")):(c.setCheckData(i,a),c.syncCheckAll()),layui.event.call(e[0],p,"checkbox("+s+")",d.call(e[0],{checked:a,type:l?"all":"one"}))}),c.elem.on("click",'input[lay-type="layTableRadio"]+',function(){var e=v(this).prev(),t=e[0].checked,i=x.cache[c.key],a=e.parents("tr").eq(0).data("index");layui.each(i,function(e,t){a===e?t.LAY_CHECKED=!0:delete t.LAY_CHECKED}),c.setThisRowChecked(a),layui.event.call(this,p,"radio("+s+")",d.call(this,{checked:t}))}),c.layBody.on("mouseenter","tr",function(){var e=v(this),t=e.index();e.data("off")||c.layBody.find("tr:eq("+t+")").addClass(A)}).on("mouseleave","tr",function(){var e=v(this),t=e.index();e.data("off")||c.layBody.find("tr:eq("+t+")").removeClass(A)}).on("click","tr",function(){t.call(this,"row")}).on("dblclick","tr",function(){t.call(this,"rowDouble")});var t=function(e){var t=v(this);t.data("off")||layui.event.call(this,p,e+"("+s+")",d.call(t.children("td")[0]))};c.layBody.on("change","."+T,function(){var e=v(this),t=this.value,i=e.parent().data("field"),e=e.parents("tr").eq(0).data("index");x.cache[c.key][e][i]=t,layui.event.call(this,p,"edit("+s+")",d.call(this,{value:t,field:i}))}).on("blur","."+T,function(){var i,e=v(this),a=e.parent().data("field"),t=e.parents("tr").eq(0).data("index"),l=x.cache[c.key][t];c.eachCols(function(e,t){t.field==a&&t.templet&&(i=t.templet)}),e.siblings(o).html((t=this.value,m({templet:i},t,l))),e.parent().data("content",this.value),e.remove()}),c.layBody.on("click","td",function(e){var t=v(this),i=(t.data("field"),t.data("edit")),a=t.children(o);t.data("off")||i&&((i=v('<input class="layui-input '+T+'">'))[0].value=t.data("content")||a.text(),t.find("."+T)[0]||t.append(i),i.focus(),layui.stope(e))}).on("mouseenter","td",function(){i.call(this)}).on("mouseleave","td",function(){i.call(this,"hide")});var u="layui-table-grid-down",i=function(e){var t=v(this),i=t.children(o);t.data("off")||(e?t.find(".layui-table-grid-down").remove():i.prop("scrollWidth")>i.outerWidth()&&(i.find("."+u)[0]||t.append('<div class="'+u+'"><i class="layui-icon layui-icon-down"></i></div>')))};c.layBody.on("click","."+u,function(e){var t=v(this).parent().children(o);c.tipsIndex=b.tips(['<div class="layui-table-tips-main" style="margin-top: -'+(t.height()+16)+"px;"+("sm"===r.size?"padding: 4px 15px; font-size: 12px;":"lg"===r.size?"padding: 14px 15px;":"")+'">',t.html(),"</div>",'<i class="layui-icon layui-table-tips-c layui-icon-close"></i>'].join(""),t[0],{tips:[3,""],time:-1,anim:-1,maxWidth:f.ios||f.android?300:c.elem.width()/2,isOutAnim:!1,skin:"layui-table-tips",success:function(e,t){e.find(".layui-table-tips-c").on("click",function(){b.close(t)})}}),layui.stope(e)}),c.layBody.on("click","*[lay-event]",function(){var e=v(this),t=e.parents("tr").eq(0).data("index");layui.event.call(this,p,"tool("+s+")",d.call(this,{event:e.attr("lay-event")})),c.setThisRowChecked(t)}),c.layMain.on("scroll",function(){var e=v(this),t=e.scrollLeft(),e=e.scrollTop();c.layHeader.scrollLeft(t),c.layTotal.scrollLeft(t),c.layFixed.find(C).scrollTop(e),b.close(c.tipsIndex)}),L.on("resize",function(){c.resize()})},N.on("click",function(){N.trigger("table.remove.tool.panel")}),N.on("table.remove.tool.panel",function(){v(".layui-table-tool-panel").remove()}),x.init=function(i,a){a=a||{};var e=v(i?'table[lay-filter="'+i+'"]':".layui-table[lay-data]"),l="Table element property lay-data configuration item has a syntax error: ";return e.each(function(){var e=v(this),t=e.attr("lay-data");try{t=new Function("return "+t)()}catch(e){y.error(l+t)}var n=[],o=v.extend({elem:this,cols:[],data:[],skin:e.attr("lay-skin"),size:e.attr("lay-size"),even:"string"==typeof e.attr("lay-even")},x.config,a,t);i&&e.hide(),e.find("thead>tr").each(function(a){o.cols[a]=[],v(this).children().each(function(e){var t=v(this),i=t.attr("lay-data");try{i=new Function("return "+i)()}catch(e){return y.error(l+i)}t=v.extend({title:t.text(),colspan:t.attr("colspan")||0,rowspan:t.attr("rowspan")||0},i);t.colspan<2&&n.push(t),o.cols[a].push(t)})}),e.find("tbody>tr").each(function(e){var i=v(this),l={};i.children("td").each(function(e,t){var i=v(this),a=i.data("field");if(a)return l[a]=i.html()}),layui.each(n,function(e,t){e=i.children("td").eq(e);l[t.field]=e.html()}),o.data[e]=l}),x.render(o)}),this},s.that={},s.config={},x.eachCols=function(e,i,l){var e=s.config[e]||{},n=[],o=0;l=v.extend(!0,[],l||e.cols),layui.each(l,function(t,e){layui.each(e,function(e,i){var a;i.colGroup&&(a=0,o++,i.CHILD_COLS=[],layui.each(l[t+1],function(e,t){t.PARENT_COL_INDEX||1<a&&a==i.colspan||(t.PARENT_COL_INDEX=o,i.CHILD_COLS.push(t),a+=parseInt(1<t.colspan?t.colspan:1))})),i.PARENT_COL_INDEX||n.push(i)})});var a=function(e){layui.each(e||n,function(e,t){return t.CHILD_COLS?a(t.CHILD_COLS):void("function"==typeof i&&i(e,t))})};a()},x.checkStatus=function(e){var i=0,a=0,l=[],e=x.cache[e]||[];return layui.each(e,function(e,t){t.constructor!==Array?t[x.config.checkName]&&(i++,l.push(x.clearCacheKey(t))):a++}),{data:l,isAll:!!e.length&&i===e.length-a}},x.exportFile=function(e,t,i){var a=this;t=t||x.clearCacheKey(x.cache[e]),i=i||"csv";var o,d,l,n=s.config[e]||{},c={csv:"text/csv",xls:"application/vnd.ms-excel"}[i],r=document.createElement("a");if(f.ie)return y.error("IE_NOT_SUPPORT_EXPORTS");r.href="data:"+c+";charset=utf-8,\ufeff"+encodeURIComponent((o=[],d=[],l=[],layui.each(t,function(a,l){var n=[];"object"==typeof e?(layui.each(e,function(e,t){0==a&&o.push(t||"")}),layui.each(x.clearCacheKey(l),function(e,t){n.push('"'+(t||"")+'"')})):x.eachCols(e,function(e,t){var i;t.field&&"normal"==t.type&&!t.hide&&(null==(i=l[t.field])&&(i=""),0==a&&o.push(t.title||""),n.push('"'+m(t,i,l,"text")+'"'))}),d.push(n.join(","))}),layui.each(a.dataTotal,function(e,t){l.push(t)}),o.join(",")+"\r\n"+d.join("\r\n")+"\r\n"+l.join(","))),r.download=(n.title||"table_"+(n.index||""))+"."+i,document.body.appendChild(r),r.click(),document.body.removeChild(r)},x.resize=function(e){e?i(e)&&s.that[e].resize():layui.each(s.that,function(){this.resize()})},x.reload=function(e,t){if(i(e)){e=s.that[e];return e.reload(t),s.call(e)}},x.render=function(e){e=new a(e);return s.call(e)},x.clearCacheKey=function(e){return delete(e=v.extend({},e))[x.config.checkName],delete e[x.config.indexName],e},x.init(),e(p,x)});