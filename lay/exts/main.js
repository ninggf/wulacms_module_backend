/** wulacms-v3.0.0 MIT License By https://www.wulacms.com */
 ;layui.define(["&md5","jquery","&common"],function(e){var n=layui.$,o=layui["&common"];e("&main",function(e){var f=this;this.v="1",this.url="/",this.sign_method="md5",this.app_key="5f534709eb6ff",this.appSecret="5f534709eb7001.06028873",this.homeCenter="center.html",this.debug=!1,"object"==typeof e&&0==n.isEmptyObject(e)&&n.extend(this,e),this.format=function(){var e=new Date,t=e.getFullYear(),n=e.getMonth()+1;n<10&&(n="0"+n);var o=e.getDate();o<10&&(o="0"+o);var r=e.getHours();r<10&&(r="0"+r);var i=e.getMinutes();i<10&&(i="0"+i);var s=e.getSeconds();return s<10&&(s="0"+s),t+"-"+n+"-"+o+" "+r+":"+i+":"+s},this.host=this.url+"rest",this.token=o("user_info"),this.sortKey=function(e){var t=[],n={};for(var o in e)t.push(o);for(var o in t.sort(),t)n[t[o]]=e[t[o]];return n},this.crc=function(e,t){f.debug||delete e.debug;var n=Object.keys(e).sort(),o=[];for(var r in n){var i=e[n[r]];if("object"==typeof i){var s=Object.keys(i).sort();for(var a in s)o.push(n[r]+"["+s[a]+"]"+i[s[a]])}else o.push(n[r]+i)}o.push(f.appSecret);var h=o.join("");if("md5"==t)var c=md5(h);else c=sha1(h);return c},this.formatReq=function(e){return f.debug||delete e.debug,e.app_key=f.app_key,e.sign_method=f.sign_method,e.timestamp=f.format(),e.format="json",e.v=f.v,e.sign=f.crc(e,f.sign_method),e},this.milSecondToDate=function(e){var t=parseInt(e/1e3/60/60%60),n=parseInt(e/1e3/60%60),o=parseInt(e/1e3%60),r=parseInt(e%1e3);return{h:t<10?"0"+t:t+"",m:n<10?"0"+n:n+"",s:o<10?"0"+o:o+"",ms:r<10?"00"+r:r<100?"0"+r:r+""}},this.checkToken=function(e){if(this.token&&"null"!=this.token)return this.token;t()};var t=function(){decodeURIComponent(window.location.href);"micromessenger"==navigator.userAgent.toLowerCase().match(/MicroMessenger/i)?window.location.href="/weixin/login?from="+encodeURIComponent(window.location.href):window.sjdb?sjdb.native_Login(window.location.href):window.location.href="/login.html?come_from="+encodeURIComponent(window.location.href)};this.alert=function(e){alert(e)},this.okAlert=function(e){f.alert(e)},this.errorAlert=function(e){f.alert(e)}})});