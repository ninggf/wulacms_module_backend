/** coolay-v1.0.0 MIT License By https://github.com/ninggf/coolayui */
 ;layui.define(["&coolay","jquery"],function(e){"use strict";var n=layui.$;layui["&coolay"];e("@backend.index",{init:function(e,t){new Vue({el:"#index",data:{menu:{show:0,listshow:0,search_focus:0,module_show:0,collection_list:[],menu_list:e,res_list:{title:"搜索结果",lists:[]},current_menu:-1},mod:t,drop:{start:"",target:"",current:-1},ajax:{error:0,success:0},search:{search_val:"",t:"",res:[]}},methods:{collection:function(t){var e;t.isadd?(e=this.menu.collection_list.findIndex(function(e){return e.name==t.name}),this.menu.collection_list.splice(e,1)):this.menu.collection_list.push(t),t.isadd=!t.isadd},dragstart:function(e){this.drop.start=e},dragend:function(){var e,t,s=this;this.drop.start.name!=this.drop.target.name&&(e=this.menu.collection_list.findIndex(function(e){return e.name==s.drop.start.name}),t=this.menu.collection_list.findIndex(function(e){return e.name==s.drop.target.name}),this.menu.collection_list.splice(e,1,this.drop.target),this.menu.collection_list.splice(t,1,this.drop.start),this.drop.current=-1)},dragenter:function(t){this.drop.current=this.menu.collection_list.findIndex(function(e){return e.name==t.name}),this.drop.target=t},clickMenu:function(e){this.getHtml(e),history.pushState({comp:e},e.url,e.url),this.menu.show=this.menu.listshow=this.mod.sid_show=0},searchMenu:function(e){var n=this;n.search.search_val?(n.search.t&&(window.clearTimeout(n.search.t),n.search.t=0),n.search.t=setTimeout(function(){n.search.t=0,n.search.res=[],n.search.res=n.menu.menu_list.map(function(e,t,s){return s=e.lists.filter(function(e){return e.name.includes(n.search.search_val)}),{title:e.title,lists:s}}),n.search.res=n.search.res.filter(function(e){return e.lists.length})},800)):n.search.res=[]},getHtml:function(e){var s=this;n.ajax({url:e.url,method:"GET",timeout:5e3,beforeSend:function(e){e.setRequestHeader("PJAX","1"),s.ajax.error=0,s.ajax.success=0,n(".layui-progress").show(),layui.element.progress("install-progress","0")},success:function(e){n("#workspace .view").html(e),layui.element.progress("install-progress","100%")},complete:function(e,t){setTimeout(function(){layui.element.progress("install-progress","0"),n(".layui-progress").hide(),s.ajax.error=0},2e3)},error:function(e){n("#workspace .view").html(e.responseText),layui.element.progress("install-progress","100%"),setTimeout(function(){s.ajax.error=1},500)},dataType:"html"})}},mounted:function(){var t=this;window.onpopstate=function(e){e.state&&t.getHtml(e.state.comp)}}})}})});