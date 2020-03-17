/** coolay-v1.0.0 MIT License By https://github.com/ninggf/coolayui */
 ;layui.define(["jquery"],function(t){"use strict";var n=layui.$;t("@backend.install",new Vue({el:"#install",data:{step:[{title:"环境检测",name:"home"},{title:"安全码验证",name:"verify"},{title:"环境选择",name:"config"},{title:"数据库配置",name:"db"},{title:"创建管理员",name:"user"},{title:"安装",name:"install"}],requirements:window.vueData.requirements,dirs:window.vueData.dirs,page_step:window.vueData.step,page_data:window.vueData.data,status:0,current:"home",install_progress:0,tips:"",progress:{percent:0,list:[]},verify:{code:""},config:{config:"pro"},db:{type:"MYSQL",dbname:"",dbusername:"",dbpwd:"",host:"",port:"",prefix:"",persistent:0},user:{name:"",pwd:"",confirm_pwd:"",url:"backend"},url1:"",url2:""},methods:{verifyNext:function(){var s=1;return this.requirements.map(function(t){t[1].pass|t[1].optional||(s=0)}),this.dirs.map(function(t){t[1].pass|t[1].optional||(s=0)}),s},go:function(t){if(t){var s=this;s.tips="",s.status=0,n("input").removeClass("tips");for(var e=0;e<s.step.length;e++)if(s.step[e].name==s.current)return s.current="next"==t?s.step[e+1].name:s.step[e-1].name,void("install"==s.current&&s.doInstall())}},removeTips:function(t){n("input."+t).removeClass("tips")},setup:function(t){var s=this,e="installer/setup",r=[];if(this.status=1,"db"==t||"user"==t){for(var i in s[t])s[t][i]||"port"==i||"host"==i||"persistent"==i||r.push("input."+i);for(;r.length;)if(n(r.shift()).addClass("tips"),0==r.length)return void(s.status=0)}"verify"==t&&(e="installer/verify"),n.post(e,"installer/setup"==e?{step:t,cfg:s[t]}:{step:t,code:s.verify.code},function(t){t&&t.status?(s.status=1,s.go("next")):(s.current=t.step,s.tips=t.msg||"tips",s.status=0)})},doInstall:function(){var r=this,i=!1;n.get({url:"installer/install",timeout:3e6,dataType:"text",xhrFields:{onprogress:function(t){var s,e=t.currentTarget.response;i=!1===i?(s=e).length:(s=e.substring(i),e.length),s.replace(/\}\{/g,"}]-[{").split("]-[").forEach(function(t){r.installLog(t,r)})}}},function(t){r.url1=r.progress.list[r.progress.list.length-1].url[0],r.url2=r.progress.list[r.progress.list.length-1].url[1]})},installLog:function(t,s){var e=JSON.parse(t),r=0;if(0==e.status&&(s.install_progress=-1),s.progress.list.length){for(var i=0;i<s.progress.list.length;i++){var n=s.progress.list[i];e&&n.step==e.step&&1==e.done&&(s.progress.list.splice(i,1,e),r=1)}r||s.progress.list.push(e),s.install_progress=s.progress.list[s.progress.list.length-1].percent,layui.element.progress("install-progress",s.install_progress+"%")}else s.progress.list.push(e)}},mounted:function(){if(this.page_step){for(var t in this.page_data)this.page_data[t]&&this[t]&&(this[t]=this.page_data[t]);this.current=this.page_step}},watch:{"db.prefix":{handler:function(t,s){this.db.prefix=this.db.prefix.replace(/[^A-Za-z]/g,"")}}}}))});