/** wulacms-v3.0.0 MIT License By https://www.wulacms.com */
 ;layui.define(["layer","jquery"],function(i){"use strict";layui.$;i("@backend.module",{init:function(i){return new Vue({el:"#module",data:{list:[],module_list:[],module_r_list:[],hide_sid:0,sid_show:0,mod_show:0},methods:{add:function(t){var i,n=this;t.isadd?(i=this.module_list.findIndex(function(i){return i.name==t.name}),this.module_list.splice(i,1)):layui.use("@"+t.name,function(i){n.module_list.push(i.cfg)}),t.isadd=!t.isadd},saveModule:function(){},init:function(){var n=this;this.list=i,this.mod_show="backend"!=location.href.split("/")[location.href.split("/").length-1]?0:1,this.list.forEach(function(t){t.isadd&&layui.use("@"+t.name,function(i){i.cfg.width=t.width,i.cfg.pos=t.pos,n.module_list.push(i.cfg)})})}},mounted:function(){this.init()}})}})});