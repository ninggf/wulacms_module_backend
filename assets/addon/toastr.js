/** wulacms-v3.0.0 MIT License By https://github.com/ninggf/wulacms */
 ;layui.define(["jquery"],function(e){var H=layui.$;e("toastr",function(){var f,t,v,C="",w=0,n="error",o="info",i="success",a="warning",e={clear:function(e,t){var s=b();f||T(s);r(e,s,t)||function(e){for(var t=f.children(),s=t.length-1;0<=s;s--)r(H(t[s]),e)}(s)},remove:function(e){var t=b();f||T(t);if(e&&0===H(":focus",e).length)return void D(e);f.children().length&&f.remove()},error:function(e,t,s){return l({type:n,iconClass:b().iconClasses.error,message:e,optionsOverride:s,title:t})},getContainer:T,info:function(e,t,s){return l({type:o,iconClass:b().iconClasses.info,message:e,optionsOverride:s,title:t})},options:{newestOnTop:!0,positionClass:"toast-top-right",preventDuplicates:!0},subscribe:function(e){t=e},success:function(e,t,s){return l({type:i,iconClass:b().iconClasses.success,message:e,optionsOverride:s,title:t})},version:"2.1.3",warning:function(e,t,s){return l({type:a,iconClass:b().iconClasses.warning,message:e,optionsOverride:s,title:t})},tc:function(){return C="toast-top-center",this},br:function(){return C="toast-bottom-right",this}};return e;function T(e,t){return e=e||b(),(f=H("#"+e.containerId)).length||t&&(e=e,(f=H("<div/>").attr("id",e.containerId).addClass(e.positionClass)).appendTo(H(e.target))),f}function r(e,t,s){s=!(!s||!s.force)&&s.force;return e&&(s||0===H(":focus",e).length)&&(e[t.hideMethod]({duration:t.hideDuration,easing:t.hideEasing,complete:function(){D(e)}}),1)}function O(e){t&&t(e)}function l(t){var o=b(),e=t.iconClass||o.iconClass;if(void 0!==t.optionsOverride&&(o=H.extend(o,t.optionsOverride),e=t.optionsOverride.iconClass||e),C&&(o.positionClass=C,C=""),!function(e,t){if(e.preventDuplicates){if(t.message===v)return!0;v=t.message}return!1}(o,t)){w++,f=T(o,!0);var i=null,a=H("<div/>"),s=H("<div/>"),n=H("<div/>"),r=H("<div/>"),l=H(o.closeHtml),c={intervalId:null,hideEta:null,maxHideTime:null},d={toastId:w,state:"visible",startTime:new Date,options:o,map:t};return t.iconClass&&a.addClass(o.toastClass).addClass(e),function(){var e;t.title&&(e=t.title,o.escapeHtml&&(e=u(t.title)),s.append(e).addClass(o.titleClass),a.append(s))}(),function(){var e;t.message&&(e=t.message,o.escapeHtml&&(e=u(t.message)),n.append(e).addClass(o.messageClass),a.append(n))}(),o.closeButton&&(l.addClass(o.closeClass).attr("role","button"),a.prepend(l)),o.progressBar&&(r.addClass(o.progressClass),a.prepend(r)),o.rtl&&a.addClass("rtl"),o.newestOnTop?f.prepend(a):f.append(a),function(){var e="";switch(t.iconClass){case"toast-success":case"toast-info":e="polite";break;default:e="assertive"}a.attr("aria-live",e)}(),a.hide(),a[o.showMethod]({duration:o.showDuration,easing:o.showEasing,complete:o.onShown}),0<o.timeOut&&(i=setTimeout(p,o.timeOut),c.maxHideTime=parseFloat(o.timeOut),c.hideEta=(new Date).getTime()+c.maxHideTime,o.progressBar&&(c.intervalId=setInterval(h,10))),o.closeOnHover&&a.hover(m,g),!o.onclick&&o.tapToDismiss&&a.click(p),o.closeButton&&l&&l.click(function(e){e.stopPropagation?e.stopPropagation():void 0!==e.cancelBubble&&!0!==e.cancelBubble&&(e.cancelBubble=!0),o.onCloseClick&&o.onCloseClick(e),p(!0)}),o.onclick&&a.click(function(e){o.onclick(e),p()}),O(d),o.debug&&console&&console.log(d),a}function u(e){return null==e&&(e=""),e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function p(e){var t=e&&!1!==o.closeMethod?o.closeMethod:o.hideMethod,s=e&&!1!==o.closeDuration?o.closeDuration:o.hideDuration,n=e&&!1!==o.closeEasing?o.closeEasing:o.hideEasing;if(!H(":focus",a).length||e)return clearTimeout(c.intervalId),a[t]({duration:s,easing:n,complete:function(){D(a),clearTimeout(i),o.onHidden&&"hidden"!==d.state&&o.onHidden(),d.state="hidden",d.endTime=new Date,O(d)}})}function g(){(0<o.timeOut||0<o.extendedTimeOut)&&(i=setTimeout(p,o.extendedTimeOut),c.maxHideTime=parseFloat(o.extendedTimeOut),c.hideEta=(new Date).getTime()+c.maxHideTime)}function m(){clearTimeout(i),c.hideEta=0,a.stop(!0,!0)[o.showMethod]({duration:o.showDuration,easing:o.showEasing})}function h(){var e=(c.hideEta-(new Date).getTime())/c.maxHideTime*100;r.width(e+"%")}}function b(){return H.extend({},{tapToDismiss:!0,toastClass:"toast",containerId:"toast-container",debug:!1,showMethod:"fadeIn",showDuration:300,showEasing:"swing",onShown:void 0,hideMethod:"fadeOut",hideDuration:1e3,hideEasing:"swing",onHidden:void 0,closeMethod:!1,closeDuration:!1,closeEasing:!1,closeOnHover:!0,extendedTimeOut:1e3,iconClasses:{error:"toast-error",info:"toast-info",success:"toast-success",warning:"toast-warning"},iconClass:"toast-info",positionClass:"toast-top-right",timeOut:5e3,titleClass:"toast-title",messageClass:"toast-message",escapeHtml:!1,target:"body",closeHtml:'<button type="button">&times;</button>',closeClass:"toast-close-button",newestOnTop:!0,preventDuplicates:!1,progressBar:!1,progressClass:"toast-progress",rtl:!1},e.options)}function D(e){f=f||T(),e.is(":visible")||(e.remove(),e=null,0===f.children().length&&(f.remove(),v=void 0))}}())});