/** wulacms-v3.0.0 MIT License By https://www.wulacms.com */
 ;layui.define(["&coolay","jquery"],function(e){"use strict";var s=layui.$,r=layui["&coolay"];e("@backend.index",{init:function(e){new Vue({el:"#index",data:{menu:{show:0,listshow:0,search_focus:0,module_show:0,collection_list:[],menu_list:e.menu,res_list:{title:"搜索结果",lists:[]},current_menu:-1},links:e.tmenu,notice:e.notice,cart:e.cart,faq:e.faq,drop:{start:"",target:"",current:-1},ajax:{error:0,success:0},search:{search_val:"",t:"",res:[]}},methods:{collection:function(t){var e;t.isadd?(e=this.menu.collection_list.findIndex(function(e){return e.name==t.name}),this.menu.collection_list.splice(e,1)):this.menu.collection_list.push(t),t.isadd=!t.isadd},dragstart:function(e){this.drop.start=e},dragend:function(){var e,t,n=this;this.drop.start.name!=this.drop.target.name&&(e=this.menu.collection_list.findIndex(function(e){return e.name==n.drop.start.name}),t=this.menu.collection_list.findIndex(function(e){return e.name==n.drop.target.name}),this.menu.collection_list.splice(e,1,this.drop.target),this.menu.collection_list.splice(t,1,this.drop.start),this.drop.current=-1)},dragenter:function(t){this.drop.current=this.menu.collection_list.findIndex(function(e){return e.name==t.name}),this.drop.target=t},clickMenu:function(e){this.menu.show=this.menu.listshow=0,location.pathname!=e.url&&(this.getHtml(e),s("#module").hide(),history.pushState({comp:e},e.url,e.url))},searchMenu:function(e){var s=this;s.search.search_val?(s.search.t&&(window.clearTimeout(s.search.t),s.search.t=0),s.search.t=setTimeout(function(){s.search.t=0,s.search.res=[],s.search.res=s.menu.menu_list.map(function(e,t,n){return n=e.lists.filter(function(e){return e.name.includes(s.search.search_val)}),{title:e.title,lists:n}}),s.search.res=s.search.res.filter(function(e){return e.lists.length})},800)):s.search.res=[]},getHtml:function(t){var n=this;s.ajax({url:t.url,method:"GET",timeout:5e3,beforeSend:function(e){e.setRequestHeader("PJAX","1"),n.ajax.error=0,n.ajax.success=0,s(".layui-progress").show(),layui.element.progress("install-progress","0")},success:function(e){s("#workspace").html(e),layui.element.progress("install-progress","100%")},complete:function(e){r.setPageTitle(e.getResponseHeader("PageTitle")),setTimeout(function(){layui.element.progress("install-progress","0"),s(".layui-progress").hide(),n.ajax.error=0},2e3),"/backend"==t.url&&s("#module").show()},error:function(e){s("#workspace").html(e.responseText),layui.element.progress("install-progress","100%"),setTimeout(function(){n.ajax.error=1},500)},dataType:"html"})},goHome:function(){"/backend"!=location.pathname&&(this.getHtml({url:"/backend"}),history.pushState({comp:{url:"/backend"}},"/backend","/backend"))}},mounted:function(){var t=this;history.pushState({comp:{url:location.pathname}},location.pathname,location.pathname),window.onpopstate=function(e){e.state&&t.getHtml(e.state.comp)}}})}})});