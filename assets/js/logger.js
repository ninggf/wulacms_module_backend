/** wulacms-v3.0.0 MIT License By https://github.com/ninggf/wulacms */
 ;function _defineProperty(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}layui.define(["jquery","form","table","admin","laydate"],function(e){var o=layui.$,l=layui.form,d=layui.table,u=layui.admin,c=layui.laydate;e("@backend.logger",new(function(){function e(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d"})}return e.prototype.init=function(e,r,t){var a=this,n=o("#searchForm").outerHeight()+36,i=d.render({elem:"#loggers",cols:r,autoSort:!1,data:t,lazy:!0,limit:30,height:"full-"+n,where:this.where,url:u.url("backend/logger/data/"+e),page:!0});d.on("sort(loggerTable)",function(e){a.where["sort[name]"]=e.field,a.where["sort[dir]"]="asc"===e.type?"a":"d",i.reloadData()}),c.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),l.on("submit(searchBtn)",function(e){return a.where=o.extend(a.where,e.field),i.reloadData(),!1}),l.on("reset(searchForm)",function(e){a.where=o.extend(a.where,e.field),i.reloadData()})},e}()))});