/** coolay-v1.0.0 MIT License By https://github.com/ninggf/coolayui */
 ;layui.define(["jquery"],function(t){"use strict";var a=layui.$;t("&install",new Vue({el:"#install",data:{step:[{title:"环境检测",name:"home"},{title:"安全码验证",name:"verify"},{title:"环境选择",name:"config"},{title:"数据库配置",name:"db"},{title:"创建管理员",name:"user"},{title:"安装",name:"install"},{title:"完成",name:"finfish"}],requirements:window.vueData.requirements,dirs:window.vueData.dirs,page_step:window.vueData.step,page_data:window.vueData.data,status:0,current:"home",install_progress:0,tips:"",verify:{code:""},config:{config:"pro"},db:{type:"MYSQL",dbname:"",dbusername:"",dbpwd:"",host:"",port:""},user:{name:"",pwd:"",confirm_pwd:"",url:"backend"}},methods:{verifyNext:function(){var e=1;return this.requirements.map(function(t){t[1].pass|t[1].optional||(e=0)}),this.dirs.map(function(t){t[1].pass|t[1].optional||(e=0)}),e},go:function(t){if(t){var e=this;e.tips="",e.status=0,a("input").removeClass("tips");for(var s=0;s<e.step.length;s++)if(e.step[s].name==e.current)return e.current="next"==t?e.step[s+1].name:e.step[s-1].name,void("install"==e.current&&e.doInstall())}},removeTips:function(t){a("input."+t).removeClass("tips")},setup:function(t){var e=this,s="installer/setup",i=[];if(this.status=1,"db"==t||"user"==t){for(var n in e[t])e[t][n]||"port"==n||"host"==n||i.push("input."+n);for(;i.length;)if(a(i.shift()).addClass("tips"),0==i.length)return void(e.status=0)}"verify"==t&&(s="installer/verify"),a.post(s,"installer/setup"==s?{step:t,cfg:e[t]}:{step:t,code:e.verify.code},function(t){t&&t.status?(e.status=1,e.go("next")):(e.current=t.step,e.tips=t.msg||"tips",e.status=0)})},doInstall:function(){var i=!1;a.get({url:"installer/install",timeout:3e6,dataType:"text",xhrFields:{onprogress:function(t){var e,s=t.currentTarget.response;i=!1===i?(e=s).length:(e=s.substring(i),s.length),JSON.parse(e)}}},function(t){})}},mounted:function(){if(this.page_step){for(var t in this.page_data)this.page_data[t]&&this[t]&&(this[t]=this.page_data[t]);this.current=this.page_step}}}))});