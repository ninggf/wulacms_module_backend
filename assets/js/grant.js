/** wulacms-v3.0.0 MIT License By https://github.com/ninggf/wulacms */
 ;function _defineProperty(e,i,t){return i in e?Object.defineProperty(e,i,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[i]=t,e}layui.define(["layer","table","util","admin","notice"],function(e){var n=layui.jquery,a=layui.layer,t=layui.table,r=layui.admin,l=layui.notice;e("@backend.grant",new(function(){function e(){_defineProperty(this,"grantListTable",void 0),_defineProperty(this,"insXmSel",void 0),_defineProperty(this,"selRid",void 0)}var i=e.prototype;return i.init=function(e){this.selRid=n("#saveBtn").data("rid"),this.grantListTable=t.render({id:"grantList",lazy:!0,data:e,url:r.url("backend/role/grant"),where:{rid:this.selRid},treeDefaultClose:!1,treeLinkage:!1,elem:"#grantTable",defaultToolbar:[],cellMinWidth:100,page:!1,cols:[[{field:"name",title:"名称",width:180,sort:!1,templet:function(e){return["","&emsp;","&emsp;&emsp;"][e.level]+e.name}},{field:"op",title:"权限",sort:!1,templet:function(e){var i,t,n="";for(i in e.ops){var a=e.ops[i].resId;"r"===i&&(t=a),n+='<input data-level="'+e.level+'" class="authCheckbox '+t+'" '+e.ops[i].checkbox+' type="checkbox" title='+e.ops[i].name+' name="grant" value="'+a+'" > &nbsp;'}return n}}]],done:function(e){var i=n(".authCheckbox").siblings("div.layui-form-checkbox");i.css("height","24px"),i.css("line-height","24px"),i.children("span").css("font-size","12px"),i.children("span").css("padding","0 6px"),i.children("i").css("height","24px")}})},i.save=function(){var i,e=n(".authCheckbox"),t=[];e.each(function(){n(this).next("div.layui-form-checkbox").hasClass("layui-form-checked")&&t.push(n(this).val())}),0<t.length?(i=a.load(2),r.post(r.url("backend/role/grant"),{rid:this.selRid,grants:t}).then(function(e){a.close(i),200===e.code?(l.success("保存成功"),setTimeout(function(){r.closeThisTabs()},2200)):l.error(e.message)}).fail(function(e){l.error(e.message)})):l.warning("请选择角色权限")},e}()))});