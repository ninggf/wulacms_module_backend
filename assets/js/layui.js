/*!

 @Name: layui
 @Description：Classic modular front-end UI framework
 @License：MIT

 */
 
;!function(win){
  "use strict";

  var doc = document, config = {
    modules: {} //记录模块物理路径
    ,status: {} //记录模块加载状态
    ,timeout: 10 //符合规范的模块请求最长等待秒数
    ,event: {} //记录模块自定义事件
  }

  ,Layui = function(){
    this.v = '2.6.4'; //版本号
  }

  //获取layui所在目录
  ,getPath = function(){
    var jsPath = doc.currentScript ? doc.currentScript.src : function(){
      var js = doc.scripts
      ,last = js.length - 1
      ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }()

  //异常提示
  ,error = function(msg, type){
    type = type || 'log';
    win.console && console[type] && console[type]('layui error hint: ' + msg);
  }

  ,isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]'

  //内置模块
  ,modules = config.builtin = {
    lay: 'modules/lay' //基础 DOM 操作
    ,layer: 'modules/layer' //弹层
    ,laydate: 'modules/laydate' //日期
    ,laypage: 'modules/laypage' //分页
    ,laytpl: 'modules/laytpl' //模板引擎
    ,layedit: 'modules/layedit' //富文本编辑器
    ,form: 'modules/form' //表单集
    ,upload: 'modules/upload' //上传
    ,dropdown: 'modules/dropdown' //下拉菜单
    ,transfer: 'modules/transfer' //穿梭框
    ,tree: 'modules/tree' //树结构
    ,table: 'modules/table' //表格
    ,element: 'modules/element' //常用元素操作
    ,rate: 'modules/rate'  //评分组件
    ,colorpicker: 'modules/colorpicker' //颜色选择器
    ,slider: 'modules/slider' //滑块
    ,carousel: 'modules/carousel' //轮播
    ,flow: 'modules/flow' //流加载
    ,util: 'modules/util' //工具块
    ,code: 'modules/code' //代码修饰器
    ,jquery: 'modules/jquery' //DOM 库（第三方）
    
    ,all: 'modules/all'
    ,'layui.all': 'modules/layui.all' //聚合标识（功能性的，非真实模块）
  };

  //记录基础数据
  Layui.prototype.cache = config;

  //定义模块
  Layui.prototype.define = function(deps, factory){
    var that = this
    ,type = typeof deps === 'function'
    ,callback = function(){
      var setApp = function(app, exports){
        layui[app] = exports;
        config.status[app] = true;
      };
      typeof factory === 'function' && factory(function(app, exports){
        setApp(app, exports);
        config.callback[app] = function(){
          factory(setApp);
        }
      });
      return this;
    };
    
    type && (
      factory = deps,
      deps = []
    );
    
    that.use(deps, callback, null, 'define');
    return that;
  };

  //使用特定模块
  Layui.prototype.use = function(apps, callback, exports, from){
    var that = this
    ,dir = config.dir = config.dir ? config.dir : getPath
    ,head = doc.getElementsByTagName('head')[0];

    apps = function(){
      if(typeof apps === 'string'){
        return [apps];
      }
      //当第一个参数为 function 时，则自动加载所有内置模块，且执行的回调即为该 function 参数；
      else if(typeof apps === 'function'){
        callback = apps;
        return ['all'];
      }
      return apps;
    }();
    
    //如果页面已经存在 jQuery 1.7+ 库且所定义的模块依赖 jQuery，则不加载内部 jquery 模块
    if(window.jQuery && jQuery.fn.on){
      that.each(apps, function(index, item){
        if(item === 'jquery'){
          apps.splice(index, 1);
        }
      });
      layui.jquery = layui.$ = jQuery;
    }
    
    var item = apps[0]
    ,timeout = 0;
    exports = exports || [];

    //静态资源host
    config.host = config.host || (dir.match(/\/\/([\s\S]+?)\//)||['//'+ location.host +'/'])[0];
    
    //加载完毕
    function onScriptLoad(e, url){
      var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
      if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
        config.modules[item] = url;
        head.removeChild(node);
        (function poll() {
          if(++timeout > config.timeout * 1000 / 4){
            return error(item + ' is not a valid module', 'error');
          };
          config.status[item] ? onCallback() : setTimeout(poll, 4);
        }());
      }
    }

    //回调
    function onCallback(){
      exports.push(layui[item]);
      apps.length > 1 ?
        that.use(apps.slice(1), callback, exports, from)
      : ( typeof callback === 'function' && function(){
        //保证文档加载完毕再执行回调
        if(layui.jquery && typeof layui.jquery === 'function' && from !== 'define'){
          return layui.jquery(function(){
            callback.apply(layui, exports);
          });
        }
        callback.apply(layui, exports);
      }() );
    }
    
    //如果引入了聚合板，内置的模块则不必重复加载
    if( apps.length === 0 || (layui['layui.all'] && modules[item]) ){
      return onCallback(), that;
    }
    
    //获取加载的模块 URL
    //如果是内置模块，则按照 dir 参数拼接模块路径
    //如果是扩展模块，则判断模块路径值是否为 {/} 开头，
    //如果路径值是 {/} 开头，则模块路径即为后面紧跟的字符。
    //否则，则按照 base 参数拼接模块路径

    var url = ( modules[item] ? (dir + 'modules/')
      : (/^\{\/\}/.test(that.modules[item]) ? '' : (config.base || ''))
    ) + (that.modules[item] || item) + '.js';
    url = url.replace(/^\{\/\}/, '');
    
    //如果扩展模块（即：非内置模块）对象已经存在，则不必再加载
    if(!config.modules[item] && layui[item]){
      config.modules[item] = url; //并记录起该扩展模块的 url
    }

    //首次加载模块
    if(!config.modules[item]){
      var node = doc.createElement('script')
      //如果是内置模块，则按照 dir 参数拼接模块路径
      //如果是扩展模块，则判断模块路径值是否为 {/} 开头，
      //如果路径值是 {/} 开头，则模块路径即为后面紧跟的字符。
      //否则，则按照 base 参数拼接模块路径
      ,url = ( modules[item] ? (dir + 'js/')
        : (/^\{\/\}/.test(that.modules[item]) ? '' : (config.base || ''))
      ) + (that.modules[item] || item) + '.js';

      if (/^@/.test(item)){
          url = (config.module || '') + item.replace(/^@/,'').replace('.','/assets/js/')+'.js'
      } else if(/^\$/.test(item)){
          url = (config.theme || '') + item.replace(/^\$/,'').replace('.','/js/')+'.js'
      }

      url = url.replace(/^\{\/\}/, '');
      node.async = true;
      node.charset = 'utf-8';
      node.src = url + function(){
        var version = config.version === true 
        ? (config.v || (new Date()).getTime())
        : (config.version||'');
        return version ? ('?v=' + version) : '';
      }();
      
      head.appendChild(node);
      
      if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
        node.attachEvent('onreadystatechange', function(e){
          onScriptLoad(e, url);
        });
      } else {
        node.addEventListener('load', function(e){
          onScriptLoad(e, url);
        }, false);
      }
      
      config.modules[item] = url;
    } else { //缓存
      (function poll() {
        if(++timeout > config.timeout * 1000 / 4){
          return error(item + ' is not a valid module', 'error');
        };
        (typeof config.modules[item] === 'string' && config.status[item]) 
        ? onCallback() 
        : setTimeout(poll, 4);
      }());
    }
    
    return that;
  };
  //注入内置css
  Layui.prototype.injectCss = function(id,style){
    if(doc.getElementById(id)){
        return;
    }
    var link  = doc.createElement('style')
        ,head = doc.getElementsByTagName('head')[0];
    link.id   = id;
    link.media = 'all';
    link.innerHTML= style.replace(/url\s*\(['"]?@(.+?)['"]?\)/ig, 'url('+(config.module || '/')+'$1)');
    head.appendChild(link);
  };
  //获取节点的style属性值
  Layui.prototype.getStyle = function(node, name){
    var style = node.currentStyle ? node.currentStyle : win.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  };

  //css外部加载器
  Layui.prototype.link = function(href, fn, cssname){
    var that = this
    ,link = doc.createElement('link')
    ,head = doc.getElementsByTagName('head')[0];
    
    if(typeof fn === 'string') cssname = fn;
    
    var app = (cssname || href).replace(/\.|\//g, '')
    ,id = link.id = 'layuicss-'+ app
    ,timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = href + (config.debug ? '?v='+new Date().getTime() : '');
    link.media = 'all';
    
    if(!doc.getElementById(id)){
      head.appendChild(link);
    }

    if(typeof fn !== 'function') return that;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > config.timeout * 1000 / 100){
        return error(href + ' timeout');
      };
      parseInt(that.getStyle(doc.getElementById(id), 'width')) === 1989 ? function(){
        fn();
      }() : setTimeout(poll, 100);
    }());
    
    return that;
  };
  
  //存储模块的回调
  config.callback = {};
  
  //重新执行模块的工厂函数
  Layui.prototype.factory = function(modName){
    if(layui[modName]){
      return typeof config.callback[modName] === 'function' 
        ? config.callback[modName]
      : null;
    }
  };

  //css内部加载器
  Layui.prototype.addcss = function(firename, fn, cssname){
    // layuiDir
    return layui.link(window.wulacfg.mBase + '/backend/assets/css/' + firename, fn, cssname);
  };

  //图片预加载
  Layui.prototype.img = function(url, callback, error) {   
    var img = new Image();
    img.src = url; 
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      typeof callback === 'function' && callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      typeof error === 'function' && error(e);
    };  
  };

  //全局配置
  Layui.prototype.config = function(options){
    options = options || {};
    for(var key in options){
      config[key] = options[key];
    }
    return this;
  };

  //记录全部模块
  Layui.prototype.modules = function(){
    var clone = {};
    for(var o in modules){
      clone[o] = modules[o];
    }
    return clone;
  }();

  //拓展模块
  Layui.prototype.extend = function(options){
    var that = this;

    //验证模块是否被占用
    options = options || {};
    for(var o in options){
      if(that[o] || that.modules[o]){
        error(o+ ' Module already exists', 'error');
      } else {
        that.modules[o] = options[o];
      }
    }

    return that;
  };

  // location.hash 路由解析
  Layui.prototype.router = function(hash){
    var that = this
    ,hash = hash || location.hash
    ,data = {
      path: []
      ,search: {}
      ,hash: (hash.match(/[^#](#.*$)/) || [])[1] || ''
    };
    
    if(!/^#\//.test(hash)) return data; //禁止非路由规范
    hash = hash.replace(/^#\//, '');
    data.href = '/' + hash;
    hash = hash.replace(/([^#])(#.*$)/, '$1').split('/') || [];
    
    //提取 Hash 结构
    that.each(hash, function(index, item){
      /^\w+=/.test(item) ? function(){
        item = item.split('=');
        data.search[item[0]] = item[1];
      }() : data.path.push(item);
    });
    
    return data;
  };
  
  //URL 解析
  Layui.prototype.url = function(href){
    var that = this
    ,data = {
      //提取 url 路径
      pathname: function(){
        var pathname = href
          ? function(){
            var str = (href.match(/\.[^.]+?\/.+/) || [])[0] || '';
            return str.replace(/^[^\/]+/, '').replace(/\?.+/, '');
          }()
        : location.pathname;
        return pathname.replace(/^\//, '').split('/');
      }()
      
      //提取 url 参数
      ,search: function(){
        var obj = {}
        ,search = (href 
          ? function(){
            var str = (href.match(/\?.+/) || [])[0] || '';
            return str.replace(/\#.+/, '');
          }()
          : location.search
        ).replace(/^\?+/, '').split('&'); //去除 ?，按 & 分割参数
        
        //遍历分割后的参数
        that.each(search, function(index, item){
          var _index = item.indexOf('=')
          ,key = function(){ //提取 key
            if(_index < 0){
              return item.substr(0, item.length);
            } else if(_index === 0){
              return false;
            } else {
              return item.substr(0, _index);
            }
          }(); 
          //提取 value
          if(key){
            obj[key] = _index > 0 ? item.substr(_index + 1) : null;
          }
        });
        
        return obj;
      }()
      
      //提取 Hash
      ,hash: that.router(function(){
        return href 
          ? ((href.match(/#.+/) || [])[0] || '')
        : location.hash;
      }())
    };
    
    return data;
  };

  //本地持久性存储
  Layui.prototype.data = function(table, settings, storage){
    table = table || 'layui';
    storage = storage || localStorage;
    
    if(!win.JSON || !win.JSON.parse) return;
    
    //如果settings为null，则删除表
    if(settings === null){
      return delete storage[table];
    }
    
    settings = typeof settings === 'object' 
      ? settings 
    : {key: settings};
    
    try{
      var data = JSON.parse(storage[table]);
    } catch(e){
      var data = {};
    }
    
    if('value' in settings) data[settings.key] = settings.value;
    if(settings.remove) delete data[settings.key];
    storage[table] = JSON.stringify(data);
    
    return settings.key ? data[settings.key] : data;
  };
  
  //本地会话性存储
  Layui.prototype.sessionData = function(table, settings){
    return this.data(table, settings, sessionStorage);
  }

  //设备信息
  Layui.prototype.device = function(key){
    var agent = navigator.userAgent.toLowerCase()

    //获取版本号
    ,getVersion = function(label){
      var exp = new RegExp(label + '/([^\\s\\_\\-]+)');
      label = (agent.match(exp)||[])[1];
      return label || false;
    }
    
    //返回结果集
    ,result = {
      os: function(){ //底层操作系统
        if(/windows/.test(agent)){
          return 'windows';
        } else if(/linux/.test(agent)){
          return 'linux';
        } else if(/iphone|ipod|ipad|ios/.test(agent)){
          return 'ios';
        } else if(/mac/.test(agent)){
          return 'mac';
        } 
      }()
      ,ie: function(){ //ie版本
        return (!!win.ActiveXObject || "ActiveXObject" in win) ? (
          (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
        ) : false;
      }()
      ,weixin: getVersion('micromessenger')  //是否微信
    };
    
    //任意的key
    if(key && !result[key]){
      result[key] = getVersion(key);
    }
    
    //移动设备
    result.android = /android/.test(agent);
    result.ios = result.os === 'ios';
    result.mobile = (result.android || result.ios) ? true : false;
    
    return result;
  };

  //提示
  Layui.prototype.hint = function(){
    return {
      error: error
    }
  };

  //遍历
  Layui.prototype.each = function(obj, fn){
    var key
    ,that = this;
    if(typeof fn !== 'function') return that;
    obj = obj || [];
    if(obj.constructor === Object){
      for(key in obj){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    } else {
      for(key = 0; key < obj.length; key++){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    }
    return that;
  };

  //将数组中的对象按其某个成员排序
  Layui.prototype.sort = function(obj, key, desc){
    var clone = JSON.parse(
      JSON.stringify(obj || [])
    );
    
    if(!key) return clone;
    
    //如果是数字，按大小排序，如果是非数字，按字典序排序
    clone.sort(function(o1, o2){
      var isNum = /^-?\d+$/
      ,v1 = o1[key]
      ,v2 = o2[key];
      
      if(isNum.test(v1)) v1 = parseFloat(v1);
      if(isNum.test(v2)) v2 = parseFloat(v2);
      
      if(v1 && !v2){
        return 1;
      } else if(!v1 && v2){
        return -1;
      }
        
      if(v1 > v2){
        return 1;
      } else if (v1 < v2) {
        return -1;
      } else {
        return 0;
      }
    });

    desc && clone.reverse(); //倒序
    return clone;
  };

  //阻止事件冒泡
  Layui.prototype.stope = function(thisEvent){
    thisEvent = thisEvent || win.event;
    try { thisEvent.stopPropagation() } catch(e){
      thisEvent.cancelBubble = true;
    }
  };

  //自定义模块事件
  Layui.prototype.onevent = function(modName, events, callback){
    if(typeof modName !== 'string' 
    || typeof callback !== 'function') return this;

    return Layui.event(modName, events, null, callback);
  };

  //执行自定义模块事件
  Layui.prototype.event = Layui.event = function(modName, events, params, fn){
    var that = this
    ,result = null
    ,filter = (events || '').match(/\((.*)\)$/)||[] //提取事件过滤器字符结构，如：select(xxx)
    ,eventName = (modName + '.'+ events).replace(filter[0], '') //获取事件名称，如：form.select
    ,filterName = filter[1] || '' //获取过滤器名称,，如：xxx
    ,callback = function(_, item){
      var res = item && item.call(that, params);
      res === false && result === null && (result = false);
    };
    
    //如果参数传入特定字符，则执行移除事件
    if(params === 'LAYUI-EVENT-REMOVE'){
      delete (that.cache.event[eventName] || {})[filterName];
      return that;
    }
    
    //添加事件
    if(fn){
      config.event[eventName] = config.event[eventName] || {};

      //这里不再对多次事件监听做支持，避免更多麻烦
      //config.event[eventName][filterName] ? config.event[eventName][filterName].push(fn) : 
      config.event[eventName][filterName] = [fn];
      return this;
    }
    
    //执行事件回调
    layui.each(config.event[eventName], function(key, item){
      //执行当前模块的全部事件
      if(filterName === '{*}'){
        layui.each(item, callback);
        return;
      }
      
      //执行指定事件
      key === '' && layui.each(item, callback);
      (filterName && key === filterName) && layui.each(item, callback);
    });
    
    return result;
  };
  
  //新增模块事件
  Layui.prototype.on = function(events, modName, callback){
    var that = this;
    return that.onevent.call(that, modName, events, callback);
  }
  
  //移除模块事件
  Layui.prototype.off = function(events, modName){
    var that = this;
    return that.event.call(that, modName, events, 'LAYUI-EVENT-REMOVE');
  };

  win.layui = new Layui();
  
}(window);

/**

 @Name：用于打包聚合版，该文件不会存在于构建后的目录
    
 */
 
layui.define(function(exports){
  var cache = layui.cache;
  layui.config({
    dir: cache.dir.replace(/lay\/dest\/$/, '')
  });
  exports('layui.all', layui.v);
});/** lay 基础 DOM 操作 */

;!function(){
  "use strict";
  
  var MOD_NAME = 'lay' //模块名
  ,document = window.document
  
  //DOM查找
  ,lay = function(selector){   
    return new LAY(selector);
  }
  
  //DOM构造器
  ,LAY = function(selector){
    var index = 0
    ,nativeDOM = typeof selector === 'object' ? [selector] : (
      this.selector = selector
      ,document.querySelectorAll(selector || null)
    );
    for(; index < nativeDOM.length; index++){
      this.push(nativeDOM[index]);
    }
  };
  
  /*
    lay 对象操作
  */
  
  LAY.prototype = [];
  LAY.prototype.constructor = LAY;
  
  //普通对象深度扩展
  lay.extend = function(){
    var ai = 1, args = arguments
    ,clone = function(target, obj){
      target = target || (obj.constructor === Array ? [] : {}); 
      for(var i in obj){
        //如果值为对象，则进入递归，继续深度合并
        target[i] = (obj[i] && (obj[i].constructor === Object))
          ? clone(target[i], obj[i])
        : obj[i];
      }
      return target;
    }

    args[0] = typeof args[0] === 'object' ? args[0] : {};

    for(; ai < args.length; ai++){
      if(typeof args[ai] === 'object'){
        clone(args[0], args[ai])
      }
    }
    return args[0];
  };
  
  //lay 模块版本
  lay.v = '1.0.0';
  
  //ie版本
  lay.ie = function(){
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
    ) : false;
  }();
  
  //获取当前 JS 所在目录
  lay.getPath = function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
      ,last = js.length - 1
      ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }
  
  //中止冒泡
  lay.stope = function(e){
    e = e || window.event;
    e.stopPropagation 
      ? e.stopPropagation() 
    : e.cancelBubble = true;
  };
  
  //对象遍历
  lay.each = function(obj, fn){
    var key
    ,that = this;
    if(typeof fn !== 'function') return that;
    obj = obj || [];
    if(obj.constructor === Object){
      for(key in obj){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    } else {
      for(key = 0; key < obj.length; key++){
        if(fn.call(obj[key], key, obj[key])) break;
      }
    }
    return that;
  };
  
  //数字前置补零
  lay.digit = function(num, length, end){
    var str = '';
    num = String(num);
    length = length || 2;
    for(var i = num.length; i < length; i++){
      str += '0';
    }
    return num < Math.pow(10, length) ? str + (num|0) : num;
  };
  
  //创建元素
  lay.elem = function(elemName, attr){
    var elem = document.createElement(elemName);
    lay.each(attr || {}, function(key, value){
      elem.setAttribute(key, value);
    });
    return elem;
  };
  
  //获取节点的 style 属性值
  lay.getStyle = function(node, name){
    var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  };
  
  //载入 CSS 依赖
  lay.link = function(href, fn, cssname){
    var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+ app, timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = href;
    link.id = id;
    
    if(!document.getElementById(id)){
      head.appendChild(link);
    }
    
    if(typeof fn !== 'function') return;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error(app + '.css: Invalid');
      };
      parseInt(lay.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  };
  
  //当前页面是否存在滚动条
  lay.hasScrollbar = function(){
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
  };
  
  //元素定位
  lay.position = function(elem, elemView, obj){
    if(!elemView) return;
    obj = obj || {};
    
    //如果绑定的是 document 或 body 元素，则直接获取鼠标坐标
    if(elem === document || elem === lay('body')[0]){
      obj.clickType = 'right';
    }

    //绑定绑定元素的坐标
    var rect = obj.clickType === 'right' ? function(){
      var e = obj.e || window.event || {};
      return {
        left: e.clientX
        ,top: e.clientY
        ,right: e.clientX
        ,bottom: e.clientY
      }
    }() : elem.getBoundingClientRect()
    ,elemWidth = elemView.offsetWidth //控件的宽度
    ,elemHeight = elemView.offsetHeight //控件的高度
    
    //滚动条高度
    ,scrollArea = function(type){
      type = type ? 'scrollLeft' : 'scrollTop';
      return document.body[type] | document.documentElement[type];
    }
    
    //窗口宽高
    ,winArea = function(type){
      return document.documentElement[type ? 'clientWidth' : 'clientHeight']
    }, margin = 5, left = rect.left, top = rect.bottom;

    //判断右侧是否超出边界
    if(left + elemWidth + margin > winArea('width')){
      left = winArea('width') - elemWidth - margin; //如果超出右侧，则将面板向右靠齐
    }
    
    //判断底部和顶部是否超出边界
    if(top + elemHeight + margin > winArea()){
      //优先顶部是否有足够区域显示完全
      if(rect.top > elemHeight + margin){
        top = rect.top - elemHeight - margin*2; //顶部有足够的区域显示
      } else {
        //如果面板是鼠标右键弹出，且顶部没有足够区域显示，则将面板向底部靠齐
        if(obj.clickType === 'right'){
          top = winArea() - elemHeight - margin*2;
          if(top < 0) top = 0; //不能溢出窗口顶部
        }
      }
    }
    
    //定位类型
    var position = obj.position;
    if(position) elemView.style.position = position;
    
    //设置坐标
    elemView.style.left = left + (position === 'fixed' ? 0 : scrollArea(1)) + 'px';
    elemView.style.top = top + (position === 'fixed' ? 0 : scrollArea()) + 'px';

    //防止页面无滚动条时，又因为弹出面板而出现滚动条导致的坐标计算偏差
    if(!lay.hasScrollbar()){
      var rect1 = elemView.getBoundingClientRect();
      //如果弹出面板的溢出窗口底部，则表示将出现滚动条，此时需要重新计算坐标
      if(!obj.SYSTEM_RELOAD && (rect1.bottom + margin) > winArea()){
        obj.SYSTEM_RELOAD = true;
        setTimeout(function(){
          lay.position(elem, elemView, obj);
        }, 50);
      }
    }
  };
  
  //获取元素上的参数配置上
  lay.options = function(elem, attr){
    var othis = lay(elem)
    ,attrName = attr || 'lay-options';
    try {
      return new Function('return '+ (othis.attr(attrName) || '{}'))();
    } catch(ev) {
      hint.error('parseerror：'+ ev, 'error');
      return {};
    }
  };
  
  //元素是否属于顶级元素（document 或 body）
  lay.isTopElem = function(elem){
    var topElems = [document, lay('body')[0]]
    ,matched = false;
    lay.each(topElems, function(index, item){
      if(item === elem){
        return matched = true
      }
    });
    return matched;
  };
  
  //追加字符
  LAY.addStr = function(str, new_str){
    str = str.replace(/\s+/, ' ');
    new_str = new_str.replace(/\s+/, ' ').split(' ');
    lay.each(new_str, function(ii, item){
      if(!new RegExp('\\b'+ item + '\\b').test(str)){
        str = str + ' ' + item;
      }
    });
    return str.replace(/^\s|\s$/, '');
  };
  
  //移除值
  LAY.removeStr = function(str, new_str){
    str = str.replace(/\s+/, ' ');
    new_str = new_str.replace(/\s+/, ' ').split(' ');
    lay.each(new_str, function(ii, item){
      var exp = new RegExp('\\b'+ item + '\\b')
      if(exp.test(str)){
        str = str.replace(exp, '');
      }
    });
    return str.replace(/\s+/, ' ').replace(/^\s|\s$/, '');
  };
  
  //查找子元素
  LAY.prototype.find = function(selector){
    var that = this;
    var index = 0, arr = []
    ,isObject = typeof selector === 'object';
    
    this.each(function(i, item){
      var nativeDOM = isObject ? [selector] : item.querySelectorAll(selector || null);
      for(; index < nativeDOM.length; index++){
        arr.push(nativeDOM[index]);
      }
      that.shift();
    });
    
    if(!isObject){
      that.selector =  (that.selector ? that.selector + ' ' : '') + selector
    }
    
    lay.each(arr, function(i, item){
      that.push(item);
    });
    
    return that;
  };
  
  //DOM遍历
  LAY.prototype.each = function(fn){
    return lay.each.call(this, this, fn);
  };
  
  //添加css类
  LAY.prototype.addClass = function(className, type){
    return this.each(function(index, item){
      item.className = LAY[type ? 'removeStr' : 'addStr'](item.className, className)
    });
  };
  
  //移除 css 类
  LAY.prototype.removeClass = function(className){
    return this.addClass(className, true);
  };
  
  //是否包含 css 类
  LAY.prototype.hasClass = function(className){
    var has = false;
    this.each(function(index, item){
      if(new RegExp('\\b'+ className +'\\b').test(item.className)){
        has = true;
      }
    });
    return has;
  };
  
  //添加或获取 css style
  LAY.prototype.css = function(key, value){
    var that = this
    ,parseValue = function(v){
      return isNaN(v) ? v : (v +'px');
    };
    return (typeof key === 'string' && value === undefined) ? function(){
      if(that.length > 0) return that[0].style[key];
    }() : that.each(function(index, item){
      typeof key === 'object' ? lay.each(key, function(thisKey, thisValue){
        item.style[thisKey] = parseValue(thisValue);
      }) : item.style[key] = parseValue(value);
    });   
  };
  
  //添加或获取宽度
  LAY.prototype.width = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetWidth; //此处还需做兼容
    }() : that.each(function(index, item){
      that.css('width', value);
    });   
  };
  
  //添加或获取高度
  LAY.prototype.height = function(value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].offsetHeight; //此处还需做兼容
    }() : that.each(function(index, item){
      that.css('height', value);
    });   
  };
  
  //添加或获取属性
  LAY.prototype.attr = function(key, value){
    var that = this;
    return value === undefined ? function(){
      if(that.length > 0) return that[0].getAttribute(key);
    }() : that.each(function(index, item){
      item.setAttribute(key, value);
    });   
  };
  
  //移除属性
  LAY.prototype.removeAttr = function(key){
    return this.each(function(index, item){
      item.removeAttribute(key);
    });
  };
  
  //设置或获取 HTML 内容
  LAY.prototype.html = function(html){
    var that = this;
    return html === undefined ? function(){
      if(that.length > 0) return that[0].innerHTML;
    }() : this.each(function(index, item){
      item.innerHTML = html;
    });
  };
  
  //设置或获取值
  LAY.prototype.val = function(value){
    return value === undefined ? function(){
      if(that.length > 0) return that[0].value;
    }() : this.each(function(index, item){
        item.value = value;
    });
  };
  
  //追加内容
  LAY.prototype.append = function(elem){
    return this.each(function(index, item){
      typeof elem === 'object' 
        ? item.appendChild(elem)
      :  item.innerHTML = item.innerHTML + elem;
    });
  };
  
  //移除内容
  LAY.prototype.remove = function(elem){
    return this.each(function(index, item){
      elem ? item.removeChild(elem) : item.parentNode.removeChild(item);
    });
  };
  
  //事件绑定
  LAY.prototype.on = function(eventName, fn){
    return this.each(function(index, item){
      item.attachEvent ? item.attachEvent('on' + eventName, function(e){
        e.target = e.srcElement;
        fn.call(item, e);
      }) : item.addEventListener(eventName, fn, false);
    });
  };
  
  //解除事件
  LAY.prototype.off = function(eventName, fn){
    return this.each(function(index, item){
      item.detachEvent 
        ? item.detachEvent('on'+ eventName, fn)  
      : item.removeEventListener(eventName, fn, false);
    });
  };
  
  //暴露 lay 到全局作用域
  window.lay = lay;
  
  //如果在 layui 体系中
  if(window.layui && layui.define){
    layui.define(function(exports){ //layui 加载
      exports(MOD_NAME, lay);
    });
  }
  
}();

/**
 
 @Name : laytpl 模板引擎
 @License：MIT
 
 */

layui.define(function(exports){

  "use strict";

  var config = {
    open: '{{',
    close: '}}'
  };

  var tool = {
    exp: function(str){
      return new RegExp(str, 'g');
    },
    //匹配满足规则内容
    query: function(type, _, __){
      var types = [
        '#([\\s\\S])+?',   //js语句
        '([^{#}])*?' //普通字段
      ][type || 0];
      return exp((_||'') + config.open + types + config.close + (__||''));
    },   
    escape: function(html){
      return String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    },
    error: function(e, tplog){
      var error = 'Laytpl Error: ';
      typeof console === 'object' && console.error(error + e + '\n'+ (tplog || ''));
      return error + e;
    }
  };

  var exp = tool.exp, Tpl = function(tpl){
    this.tpl = tpl;
  };

  Tpl.pt = Tpl.prototype;

  window.errors = 0;

  //编译模版
  Tpl.pt.parse = function(tpl, data){
    var that = this, tplog = tpl;
    var jss = exp('^'+config.open+'#', ''), jsse = exp(config.close+'$', '');
    
    tpl = tpl.replace(/\s+|\r|\t|\n/g, ' ')
    .replace(exp(config.open+'#'), config.open+'# ')
    .replace(exp(config.close+'}'), '} '+config.close).replace(/\\/g, '\\\\')
    
    //不匹配指定区域的内容
    .replace(exp(config.open + '!(.+?)!' + config.close), function(str){
      str = str.replace(exp('^'+ config.open + '!'), '')
      .replace(exp('!'+ config.close), '')
      .replace(exp(config.open + '|' + config.close), function(tag){
        return tag.replace(/(.)/g, '\\$1')
      });
      return str
    })
    
    //匹配JS规则内容
    .replace(/(?="|')/g, '\\').replace(tool.query(), function(str){
      str = str.replace(jss, '').replace(jsse, '');
      return '";' + str.replace(/\\/g, '') + ';view+="';
    })
    
    //匹配普通字段
    .replace(tool.query(1), function(str){
      var start = '"+(';
      if(str.replace(/\s/g, '') === config.open+config.close){
        return '';
      }
      str = str.replace(exp(config.open+'|'+config.close), '');
      if(/^=/.test(str)){
        str = str.replace(/^=/, '');
        start = '"+_escape_(';
      }
      return start + str.replace(/\\/g, '') + ')+"';
    });
    
    tpl = '"use strict";var view = "' + tpl + '";return view;';

    try{
      that.cache = tpl = new Function('d, _escape_', tpl);
      return tpl(data, tool.escape);
    } catch(e){
      delete that.cache;
      return tool.error(e, tplog);
    }
  };

  Tpl.pt.render = function(data, callback){
    var that = this, tpl;
    if(!data) return tool.error('no data');
    tpl = that.cache ? that.cache(data, tool.escape) : that.parse(that.tpl, data);
    if(!callback) return tpl;
    callback(tpl);
  };

  var laytpl = function(tpl){
    if(typeof tpl !== 'string') return tool.error('Template not found');
    return new Tpl(tpl);
  };

  laytpl.config = function(options){
    options = options || {};
    for(var i in options){
      config[i] = options[i];
    }
  };

  laytpl.v = '1.2.0';
  
  exports('laytpl', laytpl);

});/**
 
 @Name : laypage 分页组件
 @License：MIT
 
 */

layui.define(function(exports){
  "use strict";
  
  var doc = document
  ,id = 'getElementById'
  ,tag = 'getElementsByTagName'
  
  //字符常量
  ,MOD_NAME = 'laypage', DISABLED = 'layui-disabled'
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.config = options || {};
    that.config.index = ++laypage.index;
    that.render(true);
  };

  //判断传入的容器类型
  Class.prototype.type = function(){
    var config = this.config;
    if(typeof config.elem === 'object'){
      return config.elem.length === undefined ? 2 : 3;
    }
  };

  //分页视图
  Class.prototype.view = function(){
    var that = this
    ,config = that.config
    ,groups = config.groups = 'groups' in config ? (config.groups|0) : 5; //连续页码个数
    
    //排版
    config.layout = typeof config.layout === 'object' 
      ? config.layout 
    : ['prev', 'page', 'next'];
    
    config.count = config.count|0; //数据总数
    config.curr = (config.curr|0) || 1; //当前页

    //每页条数的选择项
    config.limits = typeof config.limits === 'object'
      ? config.limits
    : [10, 20, 30, 40, 50];
    config.limit = (config.limit|0) || 10; //默认条数
    
    //总页数
    config.pages = Math.ceil(config.count/config.limit) || 1;
    
    //当前页不能超过总页数
    if(config.curr > config.pages){
      config.curr = config.pages;
    }
    
    //连续分页个数不能低于0且不能大于总页数
    if(groups < 0){
      groups = 1;
    } else if (groups > config.pages){
      groups = config.pages;
    }
    
    config.prev = 'prev' in config ? config.prev : '&#x4E0A;&#x4E00;&#x9875;'; //上一页文本
    config.next = 'next' in config ? config.next : '&#x4E0B;&#x4E00;&#x9875;'; //下一页文本
    
    //计算当前组
    var index = config.pages > groups 
      ? Math.ceil( (config.curr + (groups > 1 ? 1 : 0)) / (groups > 0 ? groups : 1) )
    : 1
    
    //视图片段
    ,views = {
      //上一页
      prev: function(){
        return config.prev 
          ? '<a href="javascript:;" class="layui-laypage-prev'+ (config.curr == 1 ? (' ' + DISABLED) : '') +'" data-page="'+ (config.curr - 1) +'">'+ config.prev +'</a>'
        : '';
      }()
      
      //页码
      ,page: function(){
        var pager = [];
        
        //数据量为0时，不输出页码
        if(config.count < 1){
          return '';
        }
        
        //首页
        if(index > 1 && config.first !== false && groups !== 0){
          pager.push('<a href="javascript:;" class="layui-laypage-first" data-page="1"  title="&#x9996;&#x9875;">'+ (config.first || 1) +'</a>');
        }

        //计算当前页码组的起始页
        var halve = Math.floor((groups-1)/2) //页码数等分
        ,start = index > 1 ? config.curr - halve : 1
        ,end = index > 1 ? (function(){
          var max = config.curr + (groups - halve - 1);
          return max > config.pages ? config.pages : max;
        }()) : groups;
        
        //防止最后一组出现“不规定”的连续页码数
        if(end - start < groups - 1){
          start = end - groups + 1;
        }

        //输出左分割符
        if(config.first !== false && start > 2){
          pager.push('<span class="layui-laypage-spr">&#x2026;</span>')
        }
        
        //输出连续页码
        for(; start <= end; start++){
          if(start === config.curr){
            //当前页
            pager.push('<span class="layui-laypage-curr"><em class="layui-laypage-em" '+ (/^#/.test(config.theme) ? 'style="background-color:'+ config.theme +';"' : '') +'></em><em>'+ start +'</em></span>');
          } else {
            pager.push('<a href="javascript:;" data-page="'+ start +'">'+ start +'</a>');
          }
        }
        
        //输出输出右分隔符 & 末页
        if(config.pages > groups && config.pages > end && config.last !== false){
          if(end + 1 < config.pages){
            pager.push('<span class="layui-laypage-spr">&#x2026;</span>');
          }
          if(groups !== 0){
            pager.push('<a href="javascript:;" class="layui-laypage-last" title="&#x5C3E;&#x9875;"  data-page="'+ config.pages +'">'+ (config.last || config.pages) +'</a>');
          }
        }

        return pager.join('');
      }()
      
      //下一页
      ,next: function(){
        return config.next 
          ? '<a href="javascript:;" class="layui-laypage-next'+ (config.curr == config.pages ? (' ' + DISABLED) : '') +'" data-page="'+ (config.curr + 1) +'">'+ config.next +'</a>'
        : '';
      }()
      
      //数据总数
      ,count: '<span class="layui-laypage-count">共 '+ config.count +' 条</span>'
      
      //每页条数
      ,limit: function(){
        var options = ['<span class="layui-laypage-limits"><select lay-ignore>'];
        layui.each(config.limits, function(index, item){
          options.push(
            '<option value="'+ item +'"'
            +(item === config.limit ? 'selected' : '') 
            +'>'+ item +' 条/页</option>'
          );
        });
        return options.join('') +'</select></span>';
      }()
      
      //刷新当前页
      ,refresh: ['<a href="javascript:;" data-page="'+ config.curr +'" class="layui-laypage-refresh">'
        ,'<i class="layui-icon layui-icon-refresh"></i>'
      ,'</a>'].join('')

      //跳页区域
      ,skip: function(){
        return ['<span class="layui-laypage-skip">&#x5230;&#x7B2C;'
          ,'<input type="text" min="1" value="'+ config.curr +'" class="layui-input">'
          ,'&#x9875;<button type="button" class="layui-laypage-btn">&#x786e;&#x5b9a;</button>'
        ,'</span>'].join('');
      }()
    };

    return ['<div class="layui-box layui-laypage layui-laypage-'+ (config.theme ? (
      /^#/.test(config.theme) ? 'molv' : config.theme
    ) : 'default') +'" id="layui-laypage-'+ config.index +'">'
      ,function(){
        var plate = [];
        layui.each(config.layout, function(index, item){
          if(views[item]){
            plate.push(views[item])
          }
        });
        return plate.join('');
      }()
    ,'</div>'].join('');
  };

  //跳页的回调
  Class.prototype.jump = function(elem, isskip){
    if(!elem) return;
    var that = this
    ,config = that.config
    ,childs = elem.children
    ,btn = elem[tag]('button')[0]
    ,input = elem[tag]('input')[0]
    ,select = elem[tag]('select')[0]
    ,skip = function(){
      var curr = input.value.replace(/\s|\D/g, '')|0;
      if(curr){
        config.curr = curr;
        that.render();
      }
    };
    
    if(isskip) return skip();
    
    //页码
    for(var i = 0, len = childs.length; i < len; i++){
      if(childs[i].nodeName.toLowerCase() === 'a'){
        laypage.on(childs[i], 'click', function(){
          var curr = this.getAttribute('data-page')|0;
          if(curr < 1 || curr > config.pages) return;
          config.curr = curr;
          that.render();
        });
      }
    }
    
    //条数
    if(select){
      laypage.on(select, 'change', function(){
        var value = this.value;
        if(config.curr*value > config.count){
          config.curr = Math.ceil(config.count/value);
        }
        config.limit = value;
        that.render();
      });
    }
    
    //确定
    if(btn){
      laypage.on(btn, 'click', function(){
        skip();
      });
    }
  };
  
  //输入页数字控制
  Class.prototype.skip = function(elem){
    if(!elem) return;
    var that = this, input = elem[tag]('input')[0];
    if(!input) return;
    laypage.on(input, 'keyup', function(e){
      var value = this.value
      ,keyCode = e.keyCode;
      if(/^(37|38|39|40)$/.test(keyCode)) return;
      if(/\D/.test(value)){
        this.value = value.replace(/\D/, '');
      }
      if(keyCode === 13){
        that.jump(elem, true)
      }
    });
  };

  //渲染分页
  Class.prototype.render = function(load){
    var that = this
    ,config = that.config
    ,type = that.type()
    ,view = that.view();
    
    if(type === 2){
      config.elem && (config.elem.innerHTML = view);
    } else if(type === 3){
      config.elem.html(view);
    } else {
      if(doc[id](config.elem)){
        doc[id](config.elem).innerHTML = view;
      }
    }

    config.jump && config.jump(config, load);
    
    var elem = doc[id]('layui-laypage-' + config.index);
    that.jump(elem);
    
    if(config.hash && !load){
      location.hash = '!'+ config.hash +'='+ config.curr;
    }
    
    that.skip(elem);
  };
  
  //外部接口
  var laypage = {
    //分页渲染
    render: function(options){
      var o = new Class(options);
      return o.index;
    }
    ,index: layui.laypage ? (layui.laypage.index + 10000) : 0
    ,on: function(elem, even, fn){
      elem.attachEvent ? elem.attachEvent('on'+ even, function(e){ //for ie
        e.target = e.srcElement;
        fn.call(elem, e);
      }) : elem.addEventListener(even, fn, false);
      return this;
    }
  }

  exports(MOD_NAME, laypage);
});/** layDate 日期与时间控件 */

;!function(window){
  "use strict";

  var isLayui = window.layui && layui.define, ready = {
    getPath: (window.lay && lay.getPath) ? lay.getPath() : ''
    
    //载入 CSS 依赖
    ,link: function(href, fn, cssname){
      
      //未设置路径，则不主动加载 css
      if(!laydate.path) return;
      
      //加载 css
      if(window.lay && lay.link){
        lay.link(laydate.path + href, fn, cssname);
      }
    }
  }

  ,laydate = {
    v: '5.2.1'
    ,config: {} //全局配置项
    ,index: (window.laydate && window.laydate.v) ? 100000 : 0
    ,path: ready.getPath
    
    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = lay.extend({}, that.config, options);
      return that;
    }
    
    //主体CSS等待事件
    ,ready: function(fn){
      var cssname = 'laydate', ver = ''
      ,path = (isLayui ? 'modules/laydate/' : 'theme/') + 'default/laydate.css?v='+ laydate.v + ver;
      isLayui ? layui.addcss(path, fn, cssname) : ready.link(path, fn, cssname);
      return this;
    }
  }
  
  //操作当前实例
  ,thisDate = function(){
    var that = this;
    return {
      //提示框
      hint: function(content){
        that.hint.call(that, content);
      }
      ,config: that.config
    };
  }

  //字符常量
  ,MOD_NAME = 'laydate', ELEM = '.layui-laydate', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'laydate-disabled', LIMIT_YEAR = [100, 200000]
  
  ,ELEM_STATIC = 'layui-laydate-static', ELEM_LIST = 'layui-laydate-list', ELEM_SELECTED = 'laydate-selected', ELEM_HINT = 'layui-laydate-hint', ELEM_PREV = 'laydate-day-prev', ELEM_NEXT = 'laydate-day-next', ELEM_FOOTER = 'layui-laydate-footer', ELEM_CONFIRM = '.laydate-btns-confirm', ELEM_TIME_TEXT = 'laydate-time-text', ELEM_TIME_BTN = '.laydate-btns-time'
  
  //组件构造器
  ,Class = function(options){
    var that = this;
    that.index = ++laydate.index;
    that.config = lay.extend({}, that.config, laydate.config, options);
    laydate.ready(function(){
      that.init();
    });
  }
  
  /*
    组件操作
  */
  
  //是否闰年
  Class.isLeapYear = function(year){
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };
  
  //默认配置
  Class.prototype.config = {
    type: 'date' //控件类型，支持：year/month/date/time/datetime
    ,range: false //是否开启范围选择，即双控件
    ,format: 'yyyy-MM-dd' //默认日期格式
    ,value: null //默认日期，支持传入new Date()，或者符合format参数设定的日期格式字符
    ,isInitValue: true //用于控制是否自动向元素填充初始值（需配合 value 参数使用）
    ,min: '1900-1-1' //有效最小日期，年月日必须用“-”分割，时分秒必须用“:”分割。注意：它并不是遵循 format 设定的格式。
    ,max: '2099-12-31' //有效最大日期，同上
    ,trigger: 'click' //呼出控件的事件
    ,show: false //是否直接显示，如果设置 true，则默认直接显示控件
    ,showBottom: true //是否显示底部栏
    ,btns: ['clear', 'now', 'confirm'] //右下角显示的按钮，会按照数组顺序排列
    ,lang: 'cn' //语言，只支持cn/en，即中文和英文
    ,theme: 'default' //主题
    ,position: null //控件定位方式定位, 默认absolute，支持：fixed/absolute/static
    ,calendar: false //是否开启公历重要节日，仅支持中文版
    ,mark: {} //日期备注，如重要事件或活动标记
    ,zIndex: null //控件层叠顺序
    ,done: null //控件选择完毕后的回调，点击清空/现在/确定也均会触发
    ,change: null //日期时间改变后的回调
  };
  
  //多语言
  Class.prototype.lang = function(){
    var that = this
    ,options = that.config
    ,text = {
      cn: {
        weeks: ['日', '一', '二', '三', '四', '五', '六']
        ,time: ['时', '分', '秒']
        ,timeTips: '选择时间'
        ,startTime: '开始时间'
        ,endTime: '结束时间'
        ,dateTips: '返回日期'
        ,month: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
        ,tools: {
          confirm: '确定'
          ,clear: '清空'
          ,now: '现在'
        }
        ,timeout: '结束时间不能早于开始时间<br>请重新选择'
        ,invalidDate: '不在有效日期或时间范围内'
        ,formatError: ['日期格式不合法<br>必须遵循下述格式：<br>', '<br>已为你重置']
      }
      ,en: {
        weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        ,time: ['Hours', 'Minutes', 'Seconds']
        ,timeTips: 'Select Time'
        ,startTime: 'Start Time'
        ,endTime: 'End Time'
        ,dateTips: 'Select Date'
        ,month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        ,tools: {
          confirm: 'Confirm'
          ,clear: 'Clear'
          ,now: 'Now'
        }
        ,timeout: 'End time cannot be less than start Time<br>Please re-select'
        ,invalidDate: 'Invalid date'
        ,formatError: ['The date format error<br>Must be followed：<br>', '<br>It has been reset']
      }
    };
    return text[options.lang] || text['cn'];
  };
  
  //初始准备
  Class.prototype.init = function(){
    var that = this
    ,options = that.config
    ,dateType = 'yyyy|y|MM|M|dd|d|HH|H|mm|m|ss|s'
    ,isStatic = options.position === 'static'
    ,format = {
      year: 'yyyy'
      ,month: 'yyyy-MM'
      ,date: 'yyyy-MM-dd'
      ,time: 'HH:mm:ss'
      ,datetime: 'yyyy-MM-dd HH:mm:ss'
    };
    
    options.elem = lay(options.elem);
    options.eventElem = lay(options.eventElem);
    
    if(!options.elem[0]) return;
    
    //日期范围分隔符
    if(options.range === true) options.range = '-';
    
    //若 type 设置非法，则初始化为 date 类型
    if(!format[options.type]){
      window.console && console.error && console.error('laydate type error:\''+ options.type + '\' is not supported')
      options.type = 'date';
    }
    
    //根据不同 type，初始化默认 format
    
    if(options.format === format.date){
      options.format = format[options.type] || format.date;
      
    }
    
    
    //将日期格式转化成数组
    that.format = options.format.match(new RegExp(dateType + '|.', 'g')) || [];
    
    //生成正则表达式
    that.EXP_IF = ''; 
    that.EXP_SPLIT = ''; 
    lay.each(that.format, function(i, item){
      var EXP =  new RegExp(dateType).test(item) 
        ? '\\d{'+ function(){
          if(new RegExp(dateType).test(that.format[i === 0 ? i + 1 : i - 1]||'')){
            if(/^yyyy|y$/.test(item)) return 4;
            return item.length;
          }
          if(/^yyyy$/.test(item)) return '1,4';
          if(/^y$/.test(item)) return '1,308';
          return '1,2';
        }() +'}' 
      : '\\' + item;
      that.EXP_IF = that.EXP_IF + EXP;
      that.EXP_SPLIT = that.EXP_SPLIT + '(' + EXP + ')';
    });
    that.EXP_IF = new RegExp('^'+ (
      options.range ? 
        that.EXP_IF + '\\s\\'+ options.range + '\\s' + that.EXP_IF
      : that.EXP_IF
    ) +'$');
    that.EXP_SPLIT = new RegExp('^'+ that.EXP_SPLIT +'$', '');
    
    //如果不是input|textarea元素，则默认采用click事件
    if(!that.isInput(options.elem[0])){
      if(options.trigger === 'focus'){
        options.trigger = 'click';
      }
    }
    
    //设置唯一KEY
    if(!options.elem.attr('lay-key')){
      options.elem.attr('lay-key', that.index);
      options.eventElem.attr('lay-key', that.index);
    }
    
    //记录重要日期
    options.mark = lay.extend({}, (options.calendar && options.lang === 'cn') ? {
      '0-1-1': '元旦'
      ,'0-2-14': '情人'
      ,'0-3-8': '妇女'
      ,'0-3-12': '植树'
      ,'0-4-1': '愚人'
      ,'0-5-1': '劳动'
      ,'0-5-4': '青年'
      ,'0-6-1': '儿童'
      ,'0-9-10': '教师'
      ,'0-9-18': '国耻'
      ,'0-10-1': '国庆'
      ,'0-12-25': '圣诞'
    } : {}, options.mark);
    
    //获取限制内日期
    lay.each(['min', 'max'], function(i, item){
      var ymd = [], hms = [];
      if(typeof options[item] === 'number'){ //如果为数字
        var day = options[item]
        ,time = new Date().getTime()
        ,STAMP = 86400000 //代表一天的时间戳
        ,thisDate = new Date(
          day ? (
            day < STAMP ? time + day*STAMP : day //如果数字小于一天的时间戳，则数字为天数，否则为时间戳
          ) : time
        );
        ymd = [thisDate.getFullYear(), thisDate.getMonth() + 1, thisDate.getDate()];
        day < STAMP || (hms = [thisDate.getHours(), thisDate.getMinutes(), thisDate.getSeconds()]);
      } else {
        ymd = (options[item].match(/\d+-\d+-\d+/) || [''])[0].split('-');
        hms = (options[item].match(/\d+:\d+:\d+/) || [''])[0].split(':');
      }
      options[item] = {
        year: ymd[0] | 0 || new Date().getFullYear()
        ,month: ymd[1] ? (ymd[1] | 0) - 1 : new Date().getMonth()
        ,date: ymd[2] | 0 || new Date().getDate()
        ,hours: hms[0] | 0
        ,minutes: hms[1] | 0
        ,seconds: hms[2] | 0
      };
    });
    
    that.elemID = 'layui-laydate'+ options.elem.attr('lay-key');
    
    if(options.show || isStatic) that.render();
    isStatic || that.events();
    
    //默认赋值
    if(options.value && options.isInitValue){
      if(options.value.constructor === Date){
        that.setValue(that.parse(0, that.systemDate(options.value))); 
      } else {
        that.setValue(options.value); 
      }
    }
  };
  
  //控件主体渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config
    ,lang = that.lang()
    ,isStatic = options.position === 'static'
    
    //主面板
    ,elem = that.elem = lay.elem('div', {
      id: that.elemID
      ,'class': [
        'layui-laydate'
        ,options.range ? ' layui-laydate-range' : ''
        ,isStatic ? (' '+ ELEM_STATIC) : ''
        ,options.theme && options.theme !== 'default' && !/^#/.test(options.theme) ? (' laydate-theme-' + options.theme) : ''
      ].join('')
    })
    
    //主区域
    ,elemMain = that.elemMain = []
    ,elemHeader = that.elemHeader = []
    ,elemCont = that.elemCont = []
    ,elemTable = that.table = []

    //底部区域
    ,divFooter = that.footer = lay.elem('div', {
      'class': ELEM_FOOTER
    });
    
    if(options.zIndex) elem.style.zIndex = options.zIndex;
    
    //单双日历区域
    lay.each(new Array(2), function(i){
      if(!options.range && i > 0){
        return true;
      }

      //头部区域
      var divHeader = lay.elem('div', {
        'class': 'layui-laydate-header'
      })
      
      //左右切换
      ,headerChild = [function(){ //上一年
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-prev-y'
        });
        elem.innerHTML = '&#xe65a;';
        return elem;
      }(), function(){ //上一月
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-prev-m'
        });
        elem.innerHTML = '&#xe603;';
        return elem;
      }(), function(){ //年月选择
        var elem = lay.elem('div', {
          'class': 'laydate-set-ym'
        }), spanY = lay.elem('span'), spanM = lay.elem('span');
        elem.appendChild(spanY);
        elem.appendChild(spanM);
        return elem;
      }(), function(){ //下一月
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-next-m'
        });
        elem.innerHTML = '&#xe602;';
        return elem;
      }(), function(){ //下一年
        var elem = lay.elem('i', {
          'class': 'layui-icon laydate-icon laydate-next-y'
        });
        elem.innerHTML = '&#xe65b;';
        return elem;
      }()]
      
      //日历内容区域
      ,divContent = lay.elem('div', {
        'class': 'layui-laydate-content'
      })
      ,table = lay.elem('table')
      ,thead = lay.elem('thead'), theadTr = lay.elem('tr');
      
      //生成年月选择
      lay.each(headerChild, function(i, item){
        divHeader.appendChild(item);
      });
      
       //生成表格
      thead.appendChild(theadTr);
      lay.each(new Array(6), function(i){ //表体
        var tr = table.insertRow(0);
        lay.each(new Array(7), function(j){
          if(i === 0){
            var th = lay.elem('th');
            th.innerHTML = lang.weeks[j];
            theadTr.appendChild(th);
          }
          tr.insertCell(j);
        });
      });
      table.insertBefore(thead, table.children[0]); //表头
      divContent.appendChild(table);
      
      elemMain[i] = lay.elem('div', {
        'class': 'layui-laydate-main laydate-main-list-'+ i
      });
      
      elemMain[i].appendChild(divHeader);
      elemMain[i].appendChild(divContent);
      
      elemHeader.push(headerChild);
      elemCont.push(divContent);
      elemTable.push(table);
    });
    
    //生成底部栏
    lay(divFooter).html(function(){
      var html = [], btns = [];
      if(options.type === 'datetime'){
        html.push('<span lay-type="datetime" class="laydate-btns-time">'+ lang.timeTips +'</span>');
      }
      lay.each(options.btns, function(i, item){
        var title = lang.tools[item] || 'btn';
        if(options.range && item === 'now') return;
        if(isStatic && item === 'clear') title = options.lang === 'cn' ? '重置' : 'Reset';
        btns.push('<span lay-type="'+ item +'" class="laydate-btns-'+ item +'">'+ title +'</span>');
      });
      html.push('<div class="laydate-footer-btns">'+ btns.join('') +'</div>');
      return html.join('');
    }());
    
    //插入到主区域
    lay.each(elemMain, function(i, main){
      elem.appendChild(main);
    });
    options.showBottom && elem.appendChild(divFooter);
    
    //生成自定义主题
    if(/^#/.test(options.theme)){
      var style = lay.elem('style')
      ,styleText = [
        '#{{id}} .layui-laydate-header{background-color:{{theme}};}'
        ,'#{{id}} .layui-this{background-color:{{theme}} !important;}'
      ].join('').replace(/{{id}}/g, that.elemID).replace(/{{theme}}/g, options.theme);
      
      if('styleSheet' in style){
        style.setAttribute('type', 'text/css');
        style.styleSheet.cssText = styleText;
      } else {
        style.innerHTML = styleText;
      }
      
      lay(elem).addClass('laydate-theme-molv');
      elem.appendChild(style);
    }
    
    //移除上一个控件
    that.remove(Class.thisElemDate); 
    
    //如果是静态定位，则插入到指定的容器中，否则，插入到body
    isStatic ? options.elem.append(elem) : (
      document.body.appendChild(elem)
      ,that.position() //定位
    );
    
    that.checkDate().calendar(null, 0, 'init'); //初始校验
    that.changeEvent(); //日期切换
    
    Class.thisElemDate = that.elemID;

    typeof options.ready === 'function' && options.ready(lay.extend({}, options.dateTime, {
      month: options.dateTime.month + 1
    }));
  };
  
  //控件移除
  Class.prototype.remove = function(prev){
    var that = this
    ,options = that.config
    ,elem = lay('#'+ (prev || that.elemID));
    if(!elem[0]) return that;
    
    if(!elem.hasClass(ELEM_STATIC)){
      that.checkDate(function(){
        elem.remove();
        delete that.endDate;
      });
    }
    return that;
  };
  
  //定位算法
  Class.prototype.position = function(){
    var that = this
    ,options = that.config;
    lay.position(that.bindElem || options.elem[0], that.elem, {
      position: options.position
    });
    return that;
  };
  
  //提示
  Class.prototype.hint = function(content){
    var that = this
    ,options = that.config
    ,div = lay.elem('div', {
      'class': ELEM_HINT
    });
    
    if(!that.elem) return;
    
    div.innerHTML = content || '';
    lay(that.elem).find('.'+ ELEM_HINT).remove();
    that.elem.appendChild(div);

    clearTimeout(that.hinTimer);
    that.hinTimer = setTimeout(function(){
      lay(that.elem).find('.'+ ELEM_HINT).remove();
    }, 3000);
  };
  
  //获取递增/减后的年月
  Class.prototype.getAsYM = function(Y, M, type){
    type ? M-- : M++;
    if(M < 0){
      M = 11;
      Y--;
    }
    if(M > 11){
      M = 0;
      Y++;
    }
    return [Y, M];
  };
  
  //系统日期
  Class.prototype.systemDate = function(newDate){
    var thisDate = newDate || new Date();
    return {
      year: thisDate.getFullYear() //年
      ,month: thisDate.getMonth() //月
      ,date: thisDate.getDate() //日
      ,hours: newDate ? newDate.getHours() : 0 //时
      ,minutes: newDate ? newDate.getMinutes() : 0 //分
      ,seconds: newDate ? newDate.getSeconds() : 0 //秒
    }
  };
  
  //日期校验
  Class.prototype.checkDate = function(fn){
    var that = this
    ,thisDate = new Date()
    ,options = that.config
    ,lang = that.lang()
    ,dateTime = options.dateTime = options.dateTime || that.systemDate()
    ,thisMaxDate, error
    
    ,elem = that.bindElem || options.elem[0]
    ,valType = that.isInput(elem) ? 'val' : 'html'
    ,value = that.isInput(elem) ? elem.value : (options.position === 'static' ? '' : elem.innerHTML)
    
    //校验日期有效数字
    ,checkValid = function(dateTime){
      if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], error = true; //不能超过20万年
      if(dateTime.month > 11) dateTime.month = 11, error = true;
      if(dateTime.hours > 23) dateTime.hours = 0, error = true;
      if(dateTime.minutes > 59) dateTime.minutes = 0, dateTime.hours++, error = true;
      if(dateTime.seconds > 59) dateTime.seconds = 0, dateTime.minutes++, error = true;
      
      //计算当前月的最后一天
      thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year);
      if(dateTime.date > thisMaxDate) dateTime.date = thisMaxDate, error = true;
    }
    
    //获得初始化日期值
    ,initDate = function(dateTime, value, index){
      var startEnd = ['startTime', 'endTime'];
      value = (value.match(that.EXP_SPLIT) || []).slice(1);
      index = index || 0;
      if(options.range){
        that[startEnd[index]] = that[startEnd[index]] || {};
      }
      lay.each(that.format, function(i, item){
        var thisv = parseFloat(value[i]);
        if(value[i].length < item.length) error = true;
        if(/yyyy|y/.test(item)){ //年
          if(thisv < LIMIT_YEAR[0]) thisv = LIMIT_YEAR[0], error = true; //年不能低于100年
          dateTime.year = thisv;
        } else if(/MM|M/.test(item)){ //月
          if(thisv < 1) thisv = 1, error = true;
          dateTime.month = thisv - 1;
        } else if(/dd|d/.test(item)){ //日
          if(thisv < 1) thisv = 1, error = true;
          dateTime.date = thisv;
        } else if(/HH|H/.test(item)){ //时
          if(thisv < 1) thisv = 0, error = true;
          dateTime.hours = thisv;
          options.range && (that[startEnd[index]].hours = thisv);
        } else if(/mm|m/.test(item)){ //分
          if(thisv < 1) thisv = 0, error = true;
          dateTime.minutes = thisv;
          options.range && (that[startEnd[index]].minutes = thisv);
        } else if(/ss|s/.test(item)){ //秒
          if(thisv < 1) thisv = 0, error = true;
          dateTime.seconds = thisv;
          options.range && (that[startEnd[index]].seconds = thisv);
        }
      });
      checkValid(dateTime)
    };
    
    if(fn === 'limit') return checkValid(dateTime), that;
    
    value = value || options.value;
    if(typeof value === 'string'){
      value = value.replace(/\s+/g, ' ').replace(/^\s|\s$/g, '');
    }
    
    //如果开启范围
    if(options.range){
      that.endDate = that.endDate || lay.extend({}, dateTime, function(){
        var obj = {}
        ,EYM = that.getAsYM(dateTime.year, dateTime.month);
        
        if(options.type === 'year'){
          obj.year = dateTime.year + 1;
        } else if(options.type !== 'time'){
          obj.year = EYM[0];
          obj.month = EYM[1];
        }
        return obj;
      }());
    }

    if(typeof value === 'string' && value){
      if(that.EXP_IF.test(value)){ //校验日期格式
        if(options.range){
          value = value.split(' '+ options.range +' ');
          
          lay.each([options.dateTime, that.endDate], function(i, item){
            initDate(item, value[i], i);
          });
        } else {
          initDate(dateTime, value)
        }
      } else {
        that.hint(lang.formatError[0] + (
          options.range ? (options.format + ' '+ options.range +' ' + options.format) : options.format
        ) + lang.formatError[1]);
        error = true;
      }
    } else if(value && value.constructor === Date){ //如果值为日期对象时
      options.dateTime = that.systemDate(value);
    } else {
      options.dateTime = that.systemDate();
      
      delete that.startTime;
      delete that.endTime;
    }

    checkValid(dateTime);

    if(error && value){
      that.setValue(
        options.range ? (that.endDate ? that.parse() : '') : that.parse()
      );
    }
    fn && fn();
    return that;
  };
  
  //公历重要日期与自定义备注
  Class.prototype.mark = function(td, YMD){
    var that = this
    ,mark, options = that.config;
    lay.each(options.mark, function(key, title){
      var keys = key.split('-');
      if((keys[0] == YMD[0] || keys[0] == 0) //每年的每月
      && (keys[1] == YMD[1] || keys[1] == 0) //每月的每日
      && keys[2] == YMD[2]){ //特定日
        mark = title || YMD[2];
      }
    });
    mark && td.html('<span class="laydate-day-mark">'+ mark +'</span>');
    
    return that;
  };
  
  //无效日期范围的标记
  Class.prototype.limit = function(elem, date, index, time){
    var that = this
    ,options = that.config, timestrap = {}
    ,dateTime = options[index > 41 ? 'endDate' : 'dateTime']
    ,isOut, thisDateTime = lay.extend({}, dateTime, date || {});
    lay.each({
      now: thisDateTime
      ,min: options.min
      ,max: options.max
    }, function(key, item){
      timestrap[key] = that.newDate(lay.extend({
        year: item.year
        ,month: item.month
        ,date: item.date
      }, function(){
        var hms = {};
        lay.each(time, function(i, keys){
          hms[keys] = item[keys];
        });
        return hms;
      }())).getTime();  //time：是否比较时分秒
    });
    
    isOut = timestrap.now < timestrap.min || timestrap.now > timestrap.max;
    elem && elem[isOut ? 'addClass' : 'removeClass'](DISABLED);
    return isOut;
  };
  
  //当前日期对象
  Class.prototype.thisDateTime = function(index){
    var that = this
    ,options = that.config;
    return index ? that.endDate: options.dateTime;
  };
  
  //日历表
  Class.prototype.calendar = function(value, index, type){
    var that = this
    ,options = that.config
    ,index = index ? 1 : 0
    ,dateTime = value || that.thisDateTime(index)
    ,thisDate = new Date(), startWeek, prevMaxDate, thisMaxDate
    ,lang = that.lang()
    
    ,isAlone = options.type !== 'date' && options.type !== 'datetime'
    ,tds = lay(that.table[index]).find('td')
    ,elemYM = lay(that.elemHeader[index][2]).find('span');
    
    if(dateTime.year < LIMIT_YEAR[0]) dateTime.year = LIMIT_YEAR[0], that.hint(lang.invalidDate);
    if(dateTime.year > LIMIT_YEAR[1]) dateTime.year = LIMIT_YEAR[1], that.hint(lang.invalidDate);
    
    //记录初始值
    if(!that.firstDate){
      that.firstDate = lay.extend({}, dateTime);
    }
    
    //计算当前月第一天的星期
    thisDate.setFullYear(dateTime.year, dateTime.month, 1);
    startWeek = thisDate.getDay();
    
    prevMaxDate = laydate.getEndDate(dateTime.month || 12, dateTime.year); //计算上个月的最后一天
    thisMaxDate = laydate.getEndDate(dateTime.month + 1, dateTime.year); //计算当前月的最后一天
    
    //赋值日
    lay.each(tds, function(index_, item){
      var YMD = [dateTime.year, dateTime.month], st = 0;
      item = lay(item);
      item.removeAttr('class');
      if(index_ < startWeek){
        st = prevMaxDate - startWeek + index_;
        item.addClass('laydate-day-prev');
        YMD = that.getAsYM(dateTime.year, dateTime.month, 'sub');
      } else if(index_ >= startWeek && index_ < thisMaxDate + startWeek){
        st = index_ - startWeek;
        st + 1 === dateTime.date && item.addClass(THIS);
      } else {
        st = index_ - thisMaxDate - startWeek;
        item.addClass('laydate-day-next');
        YMD = that.getAsYM(dateTime.year, dateTime.month);
      }
      YMD[1]++;
      YMD[2] = st + 1;
      item.attr('lay-ymd', YMD.join('-')).html(YMD[2]);
      that.mark(item, YMD).limit(item, {
        year: YMD[0]
        ,month: YMD[1] - 1
        ,date: YMD[2]
      }, index_);
    });  
    
    //同步头部年月
    lay(elemYM[0]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    lay(elemYM[1]).attr('lay-ym', dateTime.year + '-' + (dateTime.month + 1));
    
    if(options.lang === 'cn'){
      lay(elemYM[0]).attr('lay-type', 'year').html(dateTime.year + '年')
      lay(elemYM[1]).attr('lay-type', 'month').html((dateTime.month + 1) + '月');
    } else {
      lay(elemYM[0]).attr('lay-type', 'month').html(lang.month[dateTime.month]);
      lay(elemYM[1]).attr('lay-type', 'year').html(dateTime.year);
    }

    //初始默认选择器
    if(isAlone){ //年、月等独立选择器
      if(options.range){
        if(value){
          that.listYM = [
            [options.dateTime.year, options.dateTime.month + 1]
            ,[that.endDate.year, that.endDate.month + 1]
          ];  
          that.list(options.type, 0).list(options.type, 1);
          
          //同步按钮可点状态
          options.type === 'time' ? that.setBtnStatus('时间'
            ,lay.extend({}, that.systemDate(), that.startTime)
            ,lay.extend({}, that.systemDate(), that.endTime)
          ) : that.setBtnStatus(true);
        }        
      } else {
        that.listYM = [[dateTime.year, dateTime.month + 1]];
        that.list(options.type, 0);
      }
    }
    
    //初始赋值双日历
    if(options.range && type === 'init' && !value){
      //执行渲染第二个日历
      that.calendar(that.endDate, 1);
    }
    
    //通过检测当前有效日期，来设定确定按钮是否可点
    if(!options.range) that.limit(lay(that.footer).find(ELEM_CONFIRM), null, 0, ['hours', 'minutes', 'seconds']);
    
    //同步按钮可点状态
    that.setBtnStatus();
    that.stampRange(index, tds); //标记范围内的日期
    
    return that;
  };

  //生成年月时分秒列表
  Class.prototype.list = function(type, index){
    var that = this
    ,options = that.config
    ,dateTime = options.dateTime
    ,lang = that.lang()
    ,isAlone = options.range && options.type !== 'date' && options.type !== 'datetime' //独立范围选择器
    
    ,ul = lay.elem('ul', {
      'class': ELEM_LIST + ' ' + ({
        year: 'laydate-year-list'
        ,month: 'laydate-month-list'
        ,time: 'laydate-time-list'
      })[type]
    })
    ,elemHeader = that.elemHeader[index]
    ,elemYM = lay(elemHeader[2]).find('span')
    ,elemCont = that.elemCont[index || 0]
    ,haveList = lay(elemCont).find('.'+ ELEM_LIST)[0]
    ,isCN = options.lang === 'cn'
    ,text = isCN ? '年' : ''
   
    ,listYM = that.listYM[index] || {}
    ,hms = ['hours', 'minutes', 'seconds']
    ,startEnd = ['startTime', 'endTime'][index];

    if(listYM[0] < 1) listYM[0] = 1;
    
    if(type === 'year'){ //年列表
      var yearNum, startY = yearNum = listYM[0] - 7;
      if(startY < 1) startY = yearNum = 1;
      lay.each(new Array(15), function(i){
        var li = lay.elem('li', {
          'lay-ym': yearNum
        }), ymd = {year: yearNum};
        yearNum == listYM[0] && lay(li).addClass(THIS);
        li.innerHTML = yearNum + text;
        ul.appendChild(li);
        if(yearNum < that.firstDate.year){
          ymd.month = options.min.month;
          ymd.date = options.min.date;
        } else if(yearNum >= that.firstDate.year){
          ymd.month = options.max.month;
          ymd.date = options.max.date;
        }
        that.limit(lay(li), ymd, index);
        yearNum++;
      });
      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', (yearNum - 8) + '-' + listYM[1])
      .html((startY + text) + ' - ' + (yearNum - 1 + text));
    } else if(type === 'month'){ //月列表
      lay.each(new Array(12), function(i){
        var li = lay.elem('li', {
          'lay-ym': i
        }), ymd = {year: listYM[0], month: i};
        i + 1 == listYM[1] && lay(li).addClass(THIS);
        li.innerHTML = lang.month[i] + (isCN ? '月' : '');
        ul.appendChild(li);
        if(listYM[0] < that.firstDate.year){
          ymd.date = options.min.date;
        } else if(listYM[0] >= that.firstDate.year){
          ymd.date = options.max.date;
        }
        that.limit(lay(li), ymd, index);
      });
      lay(elemYM[isCN ? 0 : 1]).attr('lay-ym', listYM[0] + '-' + listYM[1])
      .html(listYM[0] + text);
    } else if(type === 'time'){ //时间列表
      //检测时分秒状态是否在有效日期时间范围内
      var setTimeStatus = function(){
        lay(ul).find('ol').each(function(i, ol){
          lay(ol).find('li').each(function(ii, li){
            that.limit(lay(li), [{
              hours: ii
            }, {
              hours: that[startEnd].hours
              ,minutes: ii
            }, {
              hours: that[startEnd].hours
              ,minutes: that[startEnd].minutes
              ,seconds: ii
            }][i], index, [['hours'], ['hours', 'minutes'], ['hours', 'minutes', 'seconds']][i]);
          });
        });
        if(!options.range) that.limit(lay(that.footer).find(ELEM_CONFIRM), that[startEnd], 0, ['hours', 'minutes', 'seconds']);
      };
      if(options.range){
        if(!that[startEnd]) that[startEnd] = {
          hours: 0
          ,minutes: 0
          ,seconds: 0
        };
      } else {
        that[startEnd] = dateTime;
      }
      lay.each([24, 60, 60], function(i, item){
        var li = lay.elem('li'), childUL = ['<p>'+ lang.time[i] +'</p><ol>'];
        lay.each(new Array(item), function(ii){
          childUL.push('<li'+ (that[startEnd][hms[i]] === ii ? ' class="'+ THIS +'"' : '') +'>'+ lay.digit(ii, 2) +'</li>');
        });
        li.innerHTML = childUL.join('') + '</ol>';
        ul.appendChild(li);
      });
      setTimeStatus();
    }
    
    //插入容器
    if(haveList) elemCont.removeChild(haveList);
    elemCont.appendChild(ul);
    
    //年月
    if(type === 'year' || type === 'month'){      
      //显示切换箭头
      lay(that.elemMain[index]).addClass('laydate-ym-show');
      
      //选中
      lay(ul).find('li').on('click', function(){
        var ym = lay(this).attr('lay-ym') | 0;
        if(lay(this).hasClass(DISABLED)) return;
        
        if(index === 0){
          dateTime[type] = ym;
          that.limit(lay(that.footer).find(ELEM_CONFIRM), null, 0);
        } else { //范围选择
          that.endDate[type] = ym;
        }
        
        //当为年选择器或者年月选择器
        var isYearOrMonth = options.type === 'year' || options.type === 'month';
        if(isYearOrMonth){
          lay(ul).find('.'+ THIS).removeClass(THIS);
          lay(this).addClass(THIS);
          
          //如果为年月选择器，点击了年列表，则切换到月选择器
          if(options.type === 'month' && type === 'year'){
            that.listYM[index][0] = ym;
            if(isAlone){
              if(index){
                dateTime.year = ym;
              } else {
                that.endDate.year = ym;
              }
            }
            that.list('month', index);
          }
        } else {
          that.checkDate('limit').calendar(null, index);
          that.closeList();
        }

        that.setBtnStatus(); //同步按钮可点状态
        //如果非范围选择，则选中即自动关闭选择器
        if(!options.range){
          //若为月选择器，只有当选择月份时才自动关闭；若为年选择器，选择年份即自动关闭
          if((options.type === 'month' && type === 'month') || (options.type === 'year' && type === 'year')){
            that.setValue(that.parse()).remove().done();
          }
          that.done(null, 'change');
        }
        lay(that.footer).find(ELEM_TIME_BTN).removeClass(DISABLED);
      });
    } else {
      var span = lay.elem('span', {
        'class': ELEM_TIME_TEXT
      }), scroll = function(){ //滚动条定位
        lay(ul).find('ol').each(function(i){
          var ol = this
          ,li = lay(ol).find('li')
          ol.scrollTop = 30*(that[startEnd][hms[i]] - 2);
          if(ol.scrollTop <= 0){
            li.each(function(ii, item){
              if(!lay(this).hasClass(DISABLED)){
                ol.scrollTop = 30*(ii - 2);
                return true;
              }
            });
          }
        });
      }, haveSpan = lay(elemHeader[2]).find('.'+ ELEM_TIME_TEXT);
      scroll()
      span.innerHTML = options.range ? [lang.startTime,lang.endTime][index] : lang.timeTips
      lay(that.elemMain[index]).addClass('laydate-time-show');
      if(haveSpan[0]) haveSpan.remove();
      elemHeader[2].appendChild(span);

      lay(ul).find('ol').each(function(i){
        var ol = this;
        //选择时分秒
        lay(ol).find('li').on('click', function(){
          var value = this.innerHTML | 0;
          if(lay(this).hasClass(DISABLED)) return;
          if(options.range){
            that[startEnd][hms[i]]  = value;
          } else {
            dateTime[hms[i]] = value;
          }
          lay(ol).find('.'+ THIS).removeClass(THIS);
          lay(this).addClass(THIS);

          setTimeStatus();
          scroll();
          (that.endDate || options.type === 'time') && that.done(null, 'change');
          
          //同步按钮可点状态
          that.setBtnStatus();
        });
      });
    }
    
    return that;
  };
  
  //记录列表切换后的年月
  Class.prototype.listYM = [];
  
  //关闭列表
  Class.prototype.closeList = function(){
    var that = this
    ,options = that.config;
    
    lay.each(that.elemCont, function(index, item){
      lay(this).find('.'+ ELEM_LIST).remove();
      lay(that.elemMain[index]).removeClass('laydate-ym-show laydate-time-show');
    });
    lay(that.elem).find('.'+ ELEM_TIME_TEXT).remove();
  };
  
  //检测结束日期是否超出开始日期
  Class.prototype.setBtnStatus = function(tips, start, end){
    var that = this
    ,options = that.config
    ,lang = that.lang()
    ,isOut, elemBtn = lay(that.footer).find(ELEM_CONFIRM);
    if(options.range && options.type !== 'time'){
      start = start || options.dateTime;
      end = end || that.endDate;
      isOut = that.newDate(start).getTime() > that.newDate(end).getTime();
      
      //如果不在有效日期内，直接禁用按钮，否则比较开始和结束日期
      (that.limit(null, start) || that.limit(null, end)) 
        ? elemBtn.addClass(DISABLED)
      : elemBtn[isOut ? 'addClass' : 'removeClass'](DISABLED);
      
      //是否异常提示
      if(tips && isOut) that.hint(
        typeof tips === 'string' ? lang.timeout.replace(/日期/g, tips) : lang.timeout
      );
    }
  };
  
  //转义为规定格式的日期字符
  Class.prototype.parse = function(state, date){
    var that = this
    ,options = that.config
    ,dateTime = date || (state 
      ? lay.extend({}, that.endDate, that.endTime)
    : (options.range ? lay.extend({}, options.dateTime, that.startTime) : options.dateTime))
    ,format = that.format.concat();

    //转义为规定格式
    lay.each(format, function(i, item){
      if(/yyyy|y/.test(item)){ //年
        format[i] = lay.digit(dateTime.year, item.length);
      } else if(/MM|M/.test(item)){ //月
        format[i] = lay.digit(dateTime.month + 1, item.length);
      } else if(/dd|d/.test(item)){ //日
        format[i] = lay.digit(dateTime.date, item.length);
      } else if(/HH|H/.test(item)){ //时
        format[i] = lay.digit(dateTime.hours, item.length);
      } else if(/mm|m/.test(item)){ //分
        format[i] = lay.digit(dateTime.minutes, item.length);
      } else if(/ss|s/.test(item)){ //秒
        format[i] = lay.digit(dateTime.seconds, item.length);
      }
    });
    
    //返回日期范围字符
    if(options.range && !state){
      return format.join('') + ' '+ options.range +' ' + that.parse(1);
    }
    
    return format.join('');
  };
  
  //创建指定日期时间对象
  Class.prototype.newDate = function(dateTime){
    dateTime = dateTime || {};
    return new Date(
      dateTime.year || 1
      ,dateTime.month || 0
      ,dateTime.date || 1
      ,dateTime.hours || 0
      ,dateTime.minutes || 0
      ,dateTime.seconds || 0
    );
  };
  
  //赋值
  Class.prototype.setValue = function(value){
    var that = this
    ,options = that.config
    ,elem = that.bindElem || options.elem[0]
    ,valType = that.isInput(elem) ? 'val' : 'html'
    
    options.position === 'static' || lay(elem)[valType](value || '');
    return this;
  };
  
  //标记范围内的日期
  Class.prototype.stampRange = function(index, tds){
    var that = this
    ,options = that.config
    ,startTime, endTime;

    if(!options.range) return;
    
    startTime = that.newDate(options.dateTime).getTime();
    endTime = that.newDate(that.endDate).getTime();
    
    //标记范围样式
    lay.each(tds, function(i, item){
      var ymd = lay(item).attr('lay-ymd').split('-')
      ,thisTime = that.newDate({
        year: ymd[0]
        ,month: ymd[1] - 1
        ,date: ymd[2]
      }).getTime();

      if(index == 0){
        if(thisTime > startTime){
          lay(item).addClass(ELEM_SELECTED);
        }
      } else {
        if(thisTime < endTime){
          lay(item).addClass(ELEM_SELECTED);
        }
      }
      
      return;
      if(thisTime === startTime || thisTime === endTime){
        lay(item).addClass(
          lay(item).hasClass(ELEM_PREV) || lay(item).hasClass(ELEM_NEXT)
            ? ELEM_SELECTED
          : THIS
        );
      }
      if(thisTime > startTime && thisTime < endTime){
        lay(item).addClass(ELEM_SELECTED);
      }
    });
    
    return;
    
    if(options.range && !that.endDate) lay(that.footer).find(ELEM_CONFIRM).addClass(DISABLED);
    if(!that.endDate) return;

    startTime = that.newDate({
      year: that.startDate.year
      ,month: that.startDate.month
      ,date: that.startDate.date
    }).getTime();
    
    endTime = that.newDate({
      year: that.endDate.year
      ,month: that.endDate.month
      ,date: that.endDate.date
    }).getTime();
    
    if(startTime > endTime) return that.hint(TIPS_OUT);
    
    lay.each(tds, function(i, item){
      var ymd = lay(item).attr('lay-ymd').split('-')
      ,thisTime = that.newDate({
        year: ymd[0]
        ,month: ymd[1] - 1
        ,date: ymd[2]
      }).getTime();
      lay(item).removeClass(ELEM_SELECTED + ' ' + THIS);
      if(thisTime === startTime || thisTime === endTime){
        lay(item).addClass(
          lay(item).hasClass(ELEM_PREV) || lay(item).hasClass(ELEM_NEXT)
            ? ELEM_SELECTED
          : THIS
        );
      }
      if(thisTime > startTime && thisTime < endTime){
        lay(item).addClass(ELEM_SELECTED);
      }
    });
  };
  
  //执行 done/change 回调
  Class.prototype.done = function(param, type){
    var that = this
    ,options = that.config
    ,start = lay.extend({}, lay.extend(options.dateTime, that.startTime))
    ,end = lay.extend({}, lay.extend(that.endDate, that.endTime))
    
    lay.each([start, end], function(i, item){
      if(!('month' in item)) return;
      lay.extend(item, {
        month: item.month + 1
      });
    });
    
    param = param || [that.parse(), start, end];
    typeof options[type || 'done'] === 'function' && options[type || 'done'].apply(options, param);
    
    return that;
  };
  
  //选择日期
  Class.prototype.choose = function(td, index){
    var that = this
    ,options = that.config
    ,dateTime = that.thisDateTime(index)

    ,tds = lay(that.elem).find('td')
    ,YMD = td.attr('lay-ymd').split('-');
    
    YMD = {
      year: YMD[0] | 0
      ,month: (YMD[1] | 0) - 1
      ,date: YMD[2] | 0
    };
    
    if(td.hasClass(DISABLED)) return;
    
    lay.extend(dateTime, YMD); //同步 dateTime

    //范围选择
    if(options.range){
      //补充时分秒
      lay.each(['startTime', 'endTime'], function(i, item){
        that[item] = that[item] || {
          hours: 0
          ,minutes: 0
          ,seconds: 0
        };
      });
      that.calendar(null, index);
    } else if(options.position === 'static'){ //直接嵌套的选中
      that.calendar().done().done(null, 'change'); //同时执行 done 和 change 回调
    } else if(options.type === 'date'){
      that.setValue(that.parse()).remove().done();
    } else if(options.type === 'datetime'){
      that.calendar().done(null, 'change');
    }
  };
  
  //底部按钮
  Class.prototype.tool = function(btn, type){
    var that = this
    ,options = that.config
    ,lang = that.lang()
    ,dateTime = options.dateTime
    ,isStatic = options.position === 'static'
    ,active = {
      //选择时间
      datetime: function(){
        if(lay(btn).hasClass(DISABLED)) return;
        that.list('time', 0);
        options.range && that.list('time', 1);
        lay(btn).attr('lay-type', 'date').html(that.lang().dateTips);
      }
      
      //选择日期
      ,date: function(){
        that.closeList();
        lay(btn).attr('lay-type', 'datetime').html(that.lang().timeTips);
      }
      
      //清空、重置
      ,clear: function(){
        that.setValue('').remove();
        isStatic && (
          lay.extend(dateTime, that.firstDate)
          ,that.calendar()
        )
        options.range && (
          delete that.endDate
          ,delete that.startTime
          ,delete that.endTime
        );
        that.done(['', {}, {}]);
      }
      
      //现在
      ,now: function(){
        var thisDate = new Date();
        lay.extend(dateTime, that.systemDate(), {
          hours: thisDate.getHours()
          ,minutes: thisDate.getMinutes()
          ,seconds: thisDate.getSeconds()
        });
        that.setValue(that.parse()).remove();
        isStatic && that.calendar();
        that.done();
      }
      
      //确定
      ,confirm: function(){
        if(options.range){
          if(lay(btn).hasClass(DISABLED)) return that.hint(
            options.type === 'time' ? lang.timeout.replace(/日期/g, '时间') : lang.timeout
          );
        } else {
          if(lay(btn).hasClass(DISABLED)) return that.hint(lang.invalidDate);
        }
        that.done();
        that.setValue(that.parse()).remove()
      }
    };
    active[type] && active[type]();
  };
  
  //统一切换处理
  Class.prototype.change = function(index){
    var that = this
    ,options = that.config
    ,dateTime = that.thisDateTime(index)
    ,isAlone = options.range && (options.type === 'year' || options.type === 'month')
    
    ,elemCont = that.elemCont[index || 0]
    ,listYM = that.listYM[index]
    ,addSubYeay = function(type){
      var isYear = lay(elemCont).find('.laydate-year-list')[0]
      ,isMonth = lay(elemCont).find('.laydate-month-list')[0];
      
      //切换年列表
      if(isYear){
        listYM[0] = type ? listYM[0] - 15 : listYM[0] + 15;
        that.list('year', index);
      }
      
      if(isMonth){ //切换月面板中的年
        type ? listYM[0]-- : listYM[0]++;
        that.list('month', index);
      }
      
      if(isYear || isMonth){
        lay.extend(dateTime, {
          year: listYM[0]
        });
        if(isAlone) dateTime.year = listYM[0];
        options.range || that.done(null, 'change');     
        options.range || that.limit(lay(that.footer).find(ELEM_CONFIRM), {
          year: listYM[0]
        });
      }
      
      that.setBtnStatus();
      return isYear || isMonth;
    };
    
    return {
      prevYear: function(){
        if(addSubYeay('sub')) return;
        dateTime.year--;
        that.checkDate('limit').calendar(null, index);
        options.range || that.done(null, 'change');
      }
      ,prevMonth: function(){
        var YM = that.getAsYM(dateTime.year, dateTime.month, 'sub');
        lay.extend(dateTime, {
          year: YM[0]
          ,month: YM[1]
        });
        that.checkDate('limit').calendar(null, index);
        options.range || that.done(null, 'change');
      }
      ,nextMonth: function(){
        var YM = that.getAsYM(dateTime.year, dateTime.month);
        lay.extend(dateTime, {
          year: YM[0]
          ,month: YM[1]
        });
        that.checkDate('limit').calendar(null, index);
        options.range || that.done(null, 'change');
      }
      ,nextYear: function(){
        if(addSubYeay()) return;
        dateTime.year++
        that.checkDate('limit').calendar(null, index);
        options.range || that.done(null, 'change');
      }
    };
  };
  
  //日期切换事件
  Class.prototype.changeEvent = function(){
    var that = this
    ,options = that.config;

    //日期选择事件
    lay(that.elem).on('click', function(e){
      lay.stope(e);
    });
    
    //年月切换
    lay.each(that.elemHeader, function(i, header){
      //上一年
      lay(header[0]).on('click', function(e){
        that.change(i).prevYear();
      });
      
      //上一月
      lay(header[1]).on('click', function(e){
        that.change(i).prevMonth();
      });
      
      //选择年月
      lay(header[2]).find('span').on('click', function(e){
        var othis = lay(this)
        ,layYM = othis.attr('lay-ym')
        ,layType = othis.attr('lay-type');
        
        if(!layYM) return;
        
        layYM = layYM.split('-');

        that.listYM[i] = [layYM[0] | 0, layYM[1] | 0];
        that.list(layType, i);
        lay(that.footer).find(ELEM_TIME_BTN).addClass(DISABLED);
      });

      //下一月
      lay(header[3]).on('click', function(e){
        that.change(i).nextMonth();
      });
      
      //下一年
      lay(header[4]).on('click', function(e){
        that.change(i).nextYear();
      });
    });
    
    //点击日期
    lay.each(that.table, function(i, table){
      var tds = lay(table).find('td');
      tds.on('click', function(){
        that.choose(lay(this), i);
      });
    });
    
    //点击底部按钮
    lay(that.footer).find('span').on('click', function(){
      var type = lay(this).attr('lay-type');
      that.tool(this, type);
    });
  };
  
  //是否输入框
  Class.prototype.isInput = function(elem){
    return /input|textarea/.test(elem.tagName.toLocaleLowerCase());
  };

  //绑定的元素事件处理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config

    //绑定呼出控件事件
    ,showEvent = function(elem, bind){
      elem.on(options.trigger, function(){
        bind && (that.bindElem = this);
        that.render();
      });
    };
    
    if(!options.elem[0] || options.elem[0].eventHandler) return;
    
    showEvent(options.elem, 'bind');
    showEvent(options.eventElem);
    
    //绑定关闭控件事件
    lay(document).on('click', function(e){
      if(e.target === options.elem[0] 
      || e.target === options.eventElem[0]
      || e.target === lay(options.closeStop)[0]){
        return;
      }
      that.remove();
    }).on('keydown', function(e){
      if(e.keyCode === 13){
        if(lay('#'+ that.elemID)[0] && that.elemID === Class.thisElemDate){
          e.preventDefault();
          lay(that.footer).find(ELEM_CONFIRM)[0].click();
        }
      }
    });
    
    //自适应定位
    lay(window).on('resize', function(){
      if(!that.elem || !lay(ELEM)[0]){
        return false;
      }
      that.position();
    });
    
    options.elem[0].eventHandler = true;
  };
  
  //核心接口
  laydate.render = function(options){
    var inst = new Class(options);
    return thisDate.call(inst);
  };
  
  //得到某月的最后一天
  laydate.getEndDate = function(month, year){
    var thisDate = new Date();
    //设置日期为下个月的第一天
    thisDate.setFullYear(
      year || thisDate.getFullYear()
      ,month || (thisDate.getMonth() + 1)
    ,1);
    //减去一天，得到当前月最后一天
    return new Date(thisDate.getTime() - 1000*60*60*24).getDate();
  };
  
  //加载方式
  isLayui ? (
    laydate.ready()
    ,layui.define('lay', function(exports){ //layui 加载
      laydate.path = layui.cache.dir;
      exports(MOD_NAME, laydate);
    })
  ) : (
    (typeof define === 'function' && define.amd) ? define(function(){ //requirejs加载
      return laydate;
    }) : function(){ //普通 script 标签加载
      laydate.ready();
      window.laydate = laydate;
    }()
  );

}(window);

/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon



//将jQuery对象局部暴露给layui
layui.define(function(exports){
  layui.$ = jQuery;
  exports('jquery', jQuery);
});

return jQuery;
}));/**

 @Name：layer - Web 弹出层组件
 @License：MIT
    
 */

;!function(window, undefined){
"use strict";

var isLayui = window.layui && layui.define, $, win, ready = {
  getPath: function(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
      ,last = js.length - 1
      ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
  }(),

  config: {}, end: {}, destroy:{}, minIndex: 0, minLeft: [],
  btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],

  //五种原始层模式
  type: ['dialog', 'page', 'iframe', 'loading', 'tips'],
  
  //获取节点的style属性值
  getStyle: function(node, name){
    var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
    return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
  },
  
  //载入 CSS 依赖
  link: function(href, fn, cssname){
    
    //未设置路径，则不主动加载css
    if(!layer.path) return;
    
    var head = document.getElementsByTagName("head")[0], link = document.createElement('link');
    if(typeof fn === 'string') cssname = fn;
    var app = (cssname || href).replace(/\.|\//g, '');
    var id = 'layuicss-'+ app, timeout = 0;
    
    link.rel = 'stylesheet';
    link.href = layer.path + href;
    link.id = id;
    
    if(!document.getElementById(id)){
      head.appendChild(link);
    }
    
    if(typeof fn !== 'function') return;
    
    //轮询css是否加载完毕
    (function poll() {
      if(++timeout > 8 * 1000 / 100){
        return window.console && console.error('layer.css: Invalid');
      };
      parseInt(ready.getStyle(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
    }());
  }
};

//默认内置方法。
var layer = {
  v: '3.3.0',
  ie: function(){ //ie版本
    var agent = navigator.userAgent.toLowerCase();
    return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
      (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
    ) : false;
  }(),
  index: (window.layer && window.layer.v) ? 100000 : 0,
  path: ready.getPath,
  config: function(options, fn){
    options = options || {};
    layer.cache = ready.config = $.extend({}, ready.config, options);
    layer.path = ready.config.path || layer.path;
    typeof options.extend === 'string' && (options.extend = [options.extend]);
    
    if(ready.config.path) layer.ready();
    
    if(!options.extend) return this;
    
    isLayui 
      ? layui.addcss('modules/layer/' + options.extend)
    : ready.link('theme/' + options.extend);
    
    return this;
  },

  //主体CSS等待事件
  ready: function(callback){
    var cssname = 'layer', ver = ''
    ,path = (isLayui ? 'modules/layer/' : 'theme/') + 'default/layer.css?v='+ layer.v + ver;
    isLayui ? layui.addcss(path, callback, cssname) : ready.link(path, callback, cssname);
    return this;
  },
  
  //各种快捷引用
  alert: function(content, options, yes){
    var type = typeof options === 'function';
    if(type) yes = options;
    return layer.open($.extend({
      content: content,
      yes: yes
    }, type ? {} : options));
  }, 
  
  confirm: function(content, options, yes, cancel){ 
    var type = typeof options === 'function';
    if(type){
      cancel = yes;
      yes = options;
    }
    return layer.open($.extend({
      content: content,
      btn: ready.btn,
      yes: yes,
      btn2: cancel
    }, type ? {} : options));
  },
  
  msg: function(content, options, end){ //最常用提示层
    var type = typeof options === 'function', rskin = ready.config.skin;
    var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '')||'layui-layer-msg';
    var anim = doms.anim.length - 1;
    if(type) end = options;
    return layer.open($.extend({
      content: content,
      time: 3000,
      shade: false,
      skin: skin,
      title: false,
      closeBtn: false,
      btn: false,
      resize: false,
      end: end
    }, (type && !ready.config.skin) ? {
      skin: skin + ' layui-layer-hui',
      anim: anim
    } : function(){
       options = options || {};
       if(options.icon === -1 || options.icon === undefined && !ready.config.skin){
         options.skin = skin + ' ' + (options.skin||'layui-layer-hui');
       }
       return options;
    }()));  
  },
  
  load: function(icon, options){
    return layer.open($.extend({
      type: 3,
      icon: icon || 0,
      resize: false,
      shade: 0.01
    }, options));
  }, 
  
  tips: function(content, follow, options){
    return layer.open($.extend({
      type: 4,
      content: [content, follow],
      closeBtn: false,
      time: 3000,
      shade: false,
      resize: false,
      fixed: false,
      maxWidth: 260
    }, options));
  }
};

var Class = function(setings){  
  var that = this, creat = function(){
    layer.ready(function(){
      that.creat();
    });
  };
  that.index = ++layer.index;
  that.config.maxWidth = $(win).width() - 15*2; //初始最大宽度：当前屏幕宽，左右留 15px 边距
  that.config = $.extend({}, that.config, ready.config, setings);
  document.body ? creat() : setTimeout(function(){
    creat();
  }, 30);
};

Class.pt = Class.prototype;

//缓存常用字符
var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];
doms.anim = ['layer-anim-00', 'layer-anim-01', 'layer-anim-02', 'layer-anim-03', 'layer-anim-04', 'layer-anim-05', 'layer-anim-06'];

//默认配置
Class.pt.config = {
  type: 0,
  shade: 0.3,
  fixed: true,
  move: doms[1],
  title: '&#x4FE1;&#x606F;',
  offset: 'auto',
  area: 'auto',
  closeBtn: 1,
  time: 0, //0表示不自动关闭
  zIndex: 19891014, 
  maxWidth: 360,
  anim: 0,
  isOutAnim: true,
  icon: -1,
  moveType: 1,
  resize: true,
  scrollbar: true, //是否允许浏览器滚动条
  tips: 2
};

//容器
Class.pt.vessel = function(conType, callback){
  var that = this, times = that.index, config = that.config;
  var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
  var ismax = config.maxmin && (config.type === 1 || config.type === 2);
  var titleHTML = (config.title ? '<div class="layui-layer-title" style="'+ (titype ? config.title[1] : '') +'">' 
    + (titype ? config.title[0] : config.title) 
  + '</div>' : '');
  
  config.zIndex = zIndex;
  callback([
    //遮罩
    config.shade ? ('<div class="layui-layer-shade" id="layui-layer-shade'+ times +'" times="'+ times +'" style="'+ ('z-index:'+ (zIndex-1) +'; ') +'"></div>') : '',
    
    //主体
    '<div class="'+ doms[0] + (' layui-layer-'+ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin||'') +'" id="'+ doms[0] + times +'" type="'+ ready.type[config.type] +'" times="'+ times +'" showtime="'+ config.time +'" conType="'+ (conType ? 'object' : 'string') +'" style="z-index: '+ zIndex +'; width:'+ config.area[0] + ';height:' + config.area[1] + (config.fixed ? '' : ';position:absolute;') +'">'
      + (conType && config.type != 2 ? '' : titleHTML)
      + '<div id="'+ (config.id||'') +'" class="layui-layer-content'+ ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' :'') + (config.type == 3 ? ' layui-layer-loading'+config.icon : '') +'">'
        + (config.type == 0 && config.icon !== -1 ? '<i class="layui-layer-ico layui-layer-ico'+ config.icon +'"></i>' : '')
        + (config.type == 1 && conType ? '' : (config.content||''))
      + '</div>'
      + '<span class="layui-layer-setwin">'+ function(){
        var closebtn = ismax ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : '';
        config.closeBtn && (closebtn += '<a class="layui-layer-ico '+ doms[7] +' '+ doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) +'" href="javascript:;"></a>');
        return closebtn;
      }() + '</span>'
      + (config.btn ? function(){
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for(var i = 0, len = config.btn.length; i < len; i++){
          button += '<a class="'+ doms[6] +''+ i +'">'+ config.btn[i] +'</a>'
        }
        return '<div class="'+ doms[6] +' layui-layer-btn-'+ (config.btnAlign||'') +'">'+ button +'</div>'
      }() : '')
      + (config.resize ? '<span class="layui-layer-resize"></span>' : '')
    + '</div>'
  ], titleHTML, $('<div class="layui-layer-move"></div>'));
  return that;
};

//创建骨架
Class.pt.creat = function(){
  var that = this
  ,config = that.config
  ,times = that.index, nodeIndex
  ,content = config.content
  ,conType = typeof content === 'object'
  ,body = $('body');
  
  if(config.id && $('#'+config.id)[0])  return;

  if(typeof config.area === 'string'){
    config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
  }
  
  //anim兼容旧版shift
  if(config.shift){
    config.anim = config.shift;
  }
  
  if(layer.ie == 6){
    config.fixed = false;
  }
  
  switch(config.type){
    case 0:
      config.btn = ('btn' in config) ? config.btn : ready.btn[0];
      layer.closeAll('dialog');
    break;
    case 2:
      var content = config.content = conType ? config.content : [config.content||'', 'auto'];
      config.content = '<iframe scrolling="'+ (config.content[1]||'auto') +'" allowtransparency="true" id="'+ doms[4] +''+ times +'" name="'+ doms[4] +''+ times +'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
    break;
    case 3:
      delete config.title;
      delete config.closeBtn;
      config.icon === -1 && (config.icon === 0);
      layer.closeAll('loading');
    break;
    case 4:
      conType || (config.content = [config.content, 'body']);
      config.follow = config.content[1];
      config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
      delete config.title;
      config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
      config.tipsMore || layer.closeAll('tips');
    break;
  }
  
  //建立容器
  that.vessel(conType, function(html, titleHTML, moveElem){
    body.append(html[0]);
    conType ? function(){
      (config.type == 2 || config.type == 4) ? function(){
        $('body').append(html[1]);
      }() : function(){
        if(!content.parents('.'+doms[0])[0]){
          content.data('display', content.css('display')).show().addClass('layui-layer-wrap').wrap(html[1]);
          $('#'+ doms[0] + times).find('.'+doms[5]).before(titleHTML);
        }
      }();
    }() : body.append(html[1]);
    $('.layui-layer-move')[0] || body.append(ready.moveElem = moveElem);
    that.layero = $('#'+ doms[0] + times);
    config.scrollbar || doms.html.css('overflow', 'hidden').attr('layer-full', times);
  }).auto(times);
  
  //遮罩
  $('#layui-layer-shade'+ that.index).css({
    'background-color': config.shade[1] || '#000'
    ,'opacity': config.shade[0]||config.shade
  });

  config.type == 2 && layer.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

  //坐标自适应浏览器窗口尺寸
  config.type == 4 ? that.tips() : that.offset();
  if(config.fixed){
    win.on('resize', function(){
      that.offset();
      (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
      config.type == 4 && that.tips();
    });
  }
  
  config.time <= 0 || setTimeout(function(){
    layer.close(that.index)
  }, config.time);
  that.move().callback();
  
  //为兼容jQuery3.0的css动画影响元素尺寸计算
  if(doms.anim[config.anim]){
    var animClass = 'layer-anim '+ doms.anim[config.anim];
    that.layero.addClass(animClass).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $(this).removeClass(animClass);
    });
  };
  
  //记录关闭动画
  if(config.isOutAnim){
    that.layero.data('isOutAnim', true);
  }
};

//自适应
Class.pt.auto = function(index){
  var that = this, config = that.config, layero = $('#'+ doms[0] + index);
  
  if(config.area[0] === '' && config.maxWidth > 0){
    //为了修复IE7下一个让人难以理解的bug
    if(layer.ie && layer.ie < 8 && config.btn){
      layero.width(layero.innerWidth());
    }
    layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
  }
  
  var area = [layero.innerWidth(), layero.innerHeight()]
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,btnHeight = layero.find('.'+doms[6]).outerHeight() || 0
  ,setHeight = function(elem){
    elem = layero.find(elem);
    elem.height(area[1] - titHeight - btnHeight - 2*(parseFloat(elem.css('padding-top'))|0));
  };

  switch(config.type){
    case 2: 
      setHeight('iframe');
    break;
    default:
      if(config.area[1] === ''){
        if(config.maxHeight > 0 && layero.outerHeight() > config.maxHeight){
          area[1] = config.maxHeight;
          setHeight('.'+doms[5]);
        } else if(config.fixed && area[1] >= win.height()){
          area[1] = win.height();
          setHeight('.'+doms[5]);
        }
      } else {
        setHeight('.'+doms[5]);
      }
    break;
  };
  
  return that;
};

//计算坐标
Class.pt.offset = function(){
  var that = this, config = that.config, layero = that.layero;
  var area = [layero.outerWidth(), layero.outerHeight()];
  var type = typeof config.offset === 'object';
  that.offsetTop = (win.height() - area[1])/2;
  that.offsetLeft = (win.width() - area[0])/2;
  
  if(type){
    that.offsetTop = config.offset[0];
    that.offsetLeft = config.offset[1]||that.offsetLeft;
  } else if(config.offset !== 'auto'){
    
    if(config.offset === 't'){ //上
      that.offsetTop = 0;
    } else if(config.offset === 'r'){ //右
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'b'){ //下
      that.offsetTop = win.height() - area[1];
    } else if(config.offset === 'l'){ //左
      that.offsetLeft = 0;
    } else if(config.offset === 'lt'){ //左上角
      that.offsetTop = 0;
      that.offsetLeft = 0;
    } else if(config.offset === 'lb'){ //左下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = 0;
    } else if(config.offset === 'rt'){ //右上角
      that.offsetTop = 0;
      that.offsetLeft = win.width() - area[0];
    } else if(config.offset === 'rb'){ //右下角
      that.offsetTop = win.height() - area[1];
      that.offsetLeft = win.width() - area[0];
    } else {
      that.offsetTop = config.offset;
    }
    
  }
 
  if(!config.fixed){
    that.offsetTop = /%$/.test(that.offsetTop) ? 
      win.height()*parseFloat(that.offsetTop)/100
    : parseFloat(that.offsetTop);
    that.offsetLeft = /%$/.test(that.offsetLeft) ? 
      win.width()*parseFloat(that.offsetLeft)/100
    : parseFloat(that.offsetLeft);
    that.offsetTop += win.scrollTop();
    that.offsetLeft += win.scrollLeft();
  }
  
  if(layero.attr('minLeft')){
    that.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
    that.offsetLeft = layero.css('left');
  }

  layero.css({top: that.offsetTop, left: that.offsetLeft});
};

//Tips
Class.pt.tips = function(){
  var that = this, config = that.config, layero = that.layero;
  var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
  if(!follow[0]) follow = $('body');
  var goal = {
    width: follow.outerWidth(),
    height: follow.outerHeight(),
    top: follow.offset().top,
    left: follow.offset().left
  }, tipsG = layero.find('.layui-layer-TipsG');
  
  var guide = config.tips[0];
  config.tips[1] || tipsG.remove();
  
  goal.autoLeft = function(){
    if(goal.left + layArea[0] - win.width() > 0){
      goal.tipLeft = goal.left + goal.width - layArea[0];
      tipsG.css({right: 12, left: 'auto'});
    } else {
      goal.tipLeft = goal.left;
    };
  };
  
  //辨别tips的方位
  goal.where = [function(){ //上        
    goal.autoLeft();
    goal.tipTop = goal.top - layArea[1] - 10;
    tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
  }, function(){ //右
    goal.tipLeft = goal.left + goal.width + 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]); 
  }, function(){ //下
    goal.autoLeft();
    goal.tipTop = goal.top + goal.height + 10;
    tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
  }, function(){ //左
    goal.tipLeft = goal.left - layArea[0] - 10;
    goal.tipTop = goal.top;
    tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
  }];
  goal.where[guide-1]();
  
  /* 8*2为小三角形占据的空间 */
  if(guide === 1){
    goal.top - (win.scrollTop() + layArea[1] + 8*2) < 0 && goal.where[2]();
  } else if(guide === 2){
    win.width() - (goal.left + goal.width + layArea[0] + 8*2) > 0 || goal.where[3]()
  } else if(guide === 3){
    (goal.top - win.scrollTop() + goal.height + layArea[1] + 8*2) - win.height() > 0 && goal.where[0]();
  } else if(guide === 4){
     layArea[0] + 8*2 - goal.left > 0 && goal.where[1]()
  }

  layero.find('.'+doms[5]).css({
    'background-color': config.tips[1], 
    'padding-right': (config.closeBtn ? '30px' : '')
  });
  layero.css({
    left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0), 
    top: goal.tipTop  - (config.fixed ? win.scrollTop() : 0)
  });
}

//拖拽层
Class.pt.move = function(){
  var that = this
  ,config = that.config
  ,_DOC = $(document)
  ,layero = that.layero
  ,moveElem = layero.find(config.move)
  ,resizeElem = layero.find('.layui-layer-resize')
  ,dict = {};
  
  if(config.move){
    moveElem.css('cursor', 'move');
  }

  moveElem.on('mousedown', function(e){
    e.preventDefault();
    if(config.move){
      dict.moveStart = true;
      dict.offset = [
        e.clientX - parseFloat(layero.css('left'))
        ,e.clientY - parseFloat(layero.css('top'))
      ];
      ready.moveElem.css('cursor', 'move').show();
    }
  });
  
  resizeElem.on('mousedown', function(e){
    e.preventDefault();
    dict.resizeStart = true;
    dict.offset = [e.clientX, e.clientY];
    dict.area = [
      layero.outerWidth()
      ,layero.outerHeight()
    ];
    ready.moveElem.css('cursor', 'se-resize').show();
  });
  
  _DOC.on('mousemove', function(e){

    //拖拽移动
    if(dict.moveStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1]
      ,fixed = layero.css('position') === 'fixed';
      
      e.preventDefault();
      
      dict.stX = fixed ? 0 : win.scrollLeft();
      dict.stY = fixed ? 0 : win.scrollTop();

      //控制元素不被拖出窗口外
      if(!config.moveOut){
        var setRig = win.width() - layero.outerWidth() + dict.stX
        ,setBot = win.height() - layero.outerHeight() + dict.stY;  
        X < dict.stX && (X = dict.stX);
        X > setRig && (X = setRig); 
        Y < dict.stY && (Y = dict.stY);
        Y > setBot && (Y = setBot);
      }
      
      layero.css({
        left: X
        ,top: Y
      });
    }
    
    //Resize
    if(config.resize && dict.resizeStart){
      var X = e.clientX - dict.offset[0]
      ,Y = e.clientY - dict.offset[1];
      
      e.preventDefault();
      
      layer.style(that.index, {
        width: dict.area[0] + X
        ,height: dict.area[1] + Y
      })
      dict.isResize = true;
      config.resizing && config.resizing(layero);
    }
  }).on('mouseup', function(e){
    if(dict.moveStart){
      delete dict.moveStart;
      ready.moveElem.hide();
      config.moveEnd && config.moveEnd(layero);
    }
    if(dict.resizeStart){
      delete dict.resizeStart;
      ready.moveElem.hide();
    }
  });
  
  return that;
};

Class.pt.callback = function(){
  var that = this, layero = that.layero, config = that.config;
  that.openLayer();
  if(config.success){
    if(config.type == 2){
      layero.find('iframe').on('load', function(){
        config.success(layero, that.index);
      });
    } else {
      config.success(layero, that.index);
    }
  }
  layer.ie == 6 && that.IE6(layero);
  
  //按钮
  layero.find('.'+ doms[6]).children('a').on('click', function(){
    var index = $(this).index();
    if(index === 0){
      if(config.yes){
        config.yes(that.index, layero)
      } else if(config['btn1']){
        config['btn1'](that.index, layero)
      } else {
        layer.close(that.index);
      }
    } else {
      var close = config['btn'+(index+1)] && config['btn'+(index+1)](that.index, layero);
      close === false || layer.close(that.index);
    }
  });
  
  //取消
  function cancel(){
    var close = config.cancel && config.cancel(that.index, layero);
    close === false || layer.close(that.index);
  }
  
  //右上角关闭回调
  layero.find('.'+ doms[7]).on('click', cancel);
  
  //点遮罩关闭
  if(config.shadeClose){
    $('#layui-layer-shade'+ that.index).on('click', function(){
      layer.close(that.index);
    });
  } 
  
  //最小化
  layero.find('.layui-layer-min').on('click', function(){
    var min = config.min && config.min(layero);
    min === false || layer.min(that.index, config); 
  });
  
  //全屏/还原
  layero.find('.layui-layer-max').on('click', function(){
    if($(this).hasClass('layui-layer-maxmin')){
      layer.restore(that.index);
      config.restore && config.restore(layero);
    } else {
      layer.full(that.index, config);
      setTimeout(function(){
        config.full && config.full(layero);
      }, 100);
    }
  });

  config.end && (ready.end[that.index] = config.end);
  // add destroy
  config.destroy && (ready.destroy[that.index] = config.destroy);
};

//for ie6 恢复select
ready.reselect = function(){
  $.each($('select'), function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      (sthis.attr('layer') == 1 && $('.'+doms[0]).length < 1) && sthis.removeAttr('layer').show(); 
    }
    sthis = null;
  });
}; 

Class.pt.IE6 = function(layero){
  //隐藏select
  $('select').each(function(index , value){
    var sthis = $(this);
    if(!sthis.parents('.'+doms[0])[0]){
      sthis.css('display') === 'none' || sthis.attr({'layer' : '1'}).hide();
    }
    sthis = null;
  });
};

//需依赖原型的对外方法
Class.pt.openLayer = function(){
  var that = this;
  
  //置顶当前窗口
  layer.zIndex = that.config.zIndex;
  layer.setTop = function(layero){
    var setZindex = function(){
      layer.zIndex++;
      layero.css('z-index', layer.zIndex + 1);
    };
    layer.zIndex = parseInt(layero[0].style.zIndex);
    layero.on('mousedown', setZindex);
    return layer.zIndex;
  };
};

ready.record = function(layero){
  var area = [
    layero.width(),
    layero.height(),
    layero.position().top, 
    layero.position().left + parseFloat(layero.css('margin-left'))
  ];
  layero.find('.layui-layer-max').addClass('layui-layer-maxmin');
  layero.attr({area: area});
};

ready.rescollbar = function(index){
  if(doms.html.attr('layer-full') == index){
    if(doms.html[0].style.removeProperty){
      doms.html[0].style.removeProperty('overflow');
    } else {
      doms.html[0].style.removeAttribute('overflow');
    }
    doms.html.removeAttr('layer-full');
  }
};

/** 内置成员 */

window.layer = layer;

//获取子iframe的DOM
layer.getChildFrame = function(selector, index){
  index = index || $('.'+doms[4]).attr('times');
  return $('#'+ doms[0] + index).find('iframe').contents().find(selector);  
};

//得到当前iframe层的索引，子iframe时使用
layer.getFrameIndex = function(name){
  return $('#'+ name).parents('.'+doms[4]).attr('times');
};

//iframe层自适应宽高
layer.iframeAuto = function(index){
  if(!index) return;
  var heg = layer.getChildFrame('html', index).outerHeight();
  var layero = $('#'+ doms[0] + index);
  var titHeight = layero.find(doms[1]).outerHeight() || 0;
  var btnHeight = layero.find('.'+doms[6]).outerHeight() || 0;
  layero.css({height: heg + titHeight + btnHeight});
  layero.find('iframe').css({height: heg});
};

//重置iframe url
layer.iframeSrc = function(index, url){
  $('#'+ doms[0] + index).find('iframe').attr('src', url);
};

//设定层的样式
layer.style = function(index, options, limit){
  var layero = $('#'+ doms[0] + index)
  ,contElem = layero.find('.layui-layer-content')
  ,type = layero.attr('type')
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,btnHeight = layero.find('.'+doms[6]).outerHeight() || 0
  ,minLeft = layero.attr('minLeft');
  
  if(type === ready.type[3] || type === ready.type[4]){
    return;
  }
  
  if(!limit){
    if(parseFloat(options.width) <= 260){
      options.width = 260;
    };
    
    if(parseFloat(options.height) - titHeight - btnHeight <= 64){
      options.height = 64 + titHeight + btnHeight;
    };
  }
  
  layero.css(options);
  btnHeight = layero.find('.'+doms[6]).outerHeight();
  
  if(type === ready.type[2]){
    layero.find('iframe').css({
      height: parseFloat(options.height) - titHeight - btnHeight
    });
  } else {
    contElem.css({
      height: parseFloat(options.height) - titHeight - btnHeight
      - parseFloat(contElem.css('padding-top'))
      - parseFloat(contElem.css('padding-bottom'))
    })
  }
};

//最小化
layer.min = function(index, options){
  var layero = $('#'+ doms[0] + index)
  ,titHeight = layero.find(doms[1]).outerHeight() || 0
  ,left = layero.attr('minLeft') || (181*ready.minIndex)+'px'
  ,position = layero.css('position');
  
  ready.record(layero);
  
  if(ready.minLeft[0]){
    left = ready.minLeft[0];
    ready.minLeft.shift();
  }
  
  layero.attr('position', position);
  
  layer.style(index, {
    width: 180
    ,height: titHeight
    ,left: left
    ,top: win.height() - titHeight
    ,position: 'fixed'
    ,overflow: 'hidden'
  }, true);

  layero.find('.layui-layer-min').hide();
  layero.attr('type') === 'page' && layero.find(doms[4]).hide();
  ready.rescollbar(index);
  
  if(!layero.attr('minLeft')){
    ready.minIndex++;
  }
  layero.attr('minLeft', left);
};

//还原
layer.restore = function(index){
  var layero = $('#'+ doms[0] + index), area = layero.attr('area').split(',');
  var type = layero.attr('type');
  layer.style(index, {
    width: parseFloat(area[0]), 
    height: parseFloat(area[1]), 
    top: parseFloat(area[2]), 
    left: parseFloat(area[3]),
    position: layero.attr('position'),
    overflow: 'visible'
  }, true);
  layero.find('.layui-layer-max').removeClass('layui-layer-maxmin');
  layero.find('.layui-layer-min').show();
  layero.attr('type') === 'page' && layero.find(doms[4]).show();
  ready.rescollbar(index);
};

//全屏
layer.full = function(index){
  var layero = $('#'+ doms[0] + index), timer;
  ready.record(layero);
  if(!doms.html.attr('layer-full')){
    doms.html.css('overflow','hidden').attr('layer-full', index);
  }
  clearTimeout(timer);
  timer = setTimeout(function(){
    var isfix = layero.css('position') === 'fixed';
    layer.style(index, {
      top: isfix ? 0 : win.scrollTop(),
      left: isfix ? 0 : win.scrollLeft(),
      width: win.width(),
      height: win.height()
    }, true);
    layero.find('.layui-layer-min').hide();
  }, 100);
};

//改变title
layer.title = function(name, index){
  var title = $('#'+ doms[0] + (index||layer.index)).find(doms[1]);
  title.html(name);
};

//关闭layer总方法
layer.close = function(index){
  var layero = $('#'+ doms[0] + index), type = layero.attr('type'), closeAnim = 'layer-anim-close';
  if(!layero[0]) return;
  var WRAP = 'layui-layer-wrap', remove = function(){
    // call destroy before end
    typeof ready.destroy[index] === 'function' && ready.destroy[index](layero,index);
    delete ready.destroy[index];

    if(type === ready.type[1] && layero.attr('conType') === 'object'){
      layero.children(':not(.'+ doms[5] +')').remove();
      var wrap = layero.find('.'+WRAP);
      for(var i = 0; i < 2; i++){
        wrap.unwrap();
      }
      wrap.css('display', wrap.data('display')).removeClass(WRAP);
    } else {
      //低版本IE 回收 iframe
      if(type === ready.type[2]){
        try {
          var iframe = $('#'+doms[4]+index)[0];
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          layero.find('.'+doms[5])[0].removeChild(iframe);
        } catch(e){}
      }
      layero[0].innerHTML = '';
      layero.remove();
    }
    typeof ready.end[index] === 'function' && ready.end[index]();
    delete ready.end[index];
  };

  if(layero.data('isOutAnim')){
    layero.addClass('layer-anim '+ closeAnim);
  }

  $('#layui-layer-moves, #layui-layer-shade' + index).remove();
  layer.ie == 6 && ready.reselect();
  ready.rescollbar(index);
  if(layero.attr('minLeft')){
    ready.minIndex--;
    ready.minLeft.push(layero.attr('minLeft'));
  }

  if((layer.ie && layer.ie < 10) || !layero.data('isOutAnim')){
    remove()
  } else {
    setTimeout(function(){
      remove();
    }, 200);
  }
};

//关闭所有层
layer.closeAll = function(type){
  layer.ready(function(){
    $.each($('.'+doms[0]), function(){
      var othis = $(this);
      var is = type ? (othis.attr('type') === type) : 1;
      is && layer.close(othis.attr('times'));
      is = null;
    });
  });
};

/** 

  拓展模块，layui开始合并在一起

 */

var cache = layer.cache||{}, skin = function(type){
  return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-'+type) : '');
}; 
 
//仿系统prompt
layer.prompt = function(options, yes){
  var style = '';
  options = options || {};
  
  if(typeof options === 'function') yes = options;
  
  if(options.area){
    var area = options.area;
    style = 'style="width: '+ area[0] +'; height: '+ area[1] + ';"';
    delete options.area;
  }
  var prompt, content = options.formType == 2 ? '<textarea class="layui-layer-input"' + style +'></textarea>' : function(){
    return '<input type="'+ (options.formType == 1 ? 'password' : 'text') +'" class="layui-layer-input">';
  }();
  
  var success = options.success;
  delete options.success;
  
  return layer.open($.extend({
    type: 1
    ,btn: ['&#x786E;&#x5B9A;','&#x53D6;&#x6D88;']
    ,content: content
    ,skin: 'layui-layer-prompt' + skin('prompt')
    ,maxWidth: win.width()
    ,success: function(layero){
      prompt = layero.find('.layui-layer-input');
      prompt.val(options.value || '').focus();
      typeof success === 'function' && success(layero);
    }
    ,resize: false
    ,yes: function(index){
      var value = prompt.val();
      if(value === ''){
        prompt.focus();
      } else if(value.length > (options.maxlength||500)) {
        layer.tips('&#x6700;&#x591A;&#x8F93;&#x5165;'+ (options.maxlength || 500) +'&#x4E2A;&#x5B57;&#x6570;', prompt, {tips: 1});
      } else {
        yes && yes(value, index, prompt);
      }
    }
  }, options));
};

//tab层
layer.tab = function(options){
  options = options || {};
  
  var tab = options.tab || {}
  ,THIS = 'layui-this'
  ,success = options.success;
  
  delete options.success;
  
  return layer.open($.extend({
    type: 1,
    skin: 'layui-layer-tab' + skin('tab'),
    resize: false,
    title: function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<span class="'+ THIS +'">'+ tab[0].title +'</span>';
        for(; ii < len; ii++){
          str += '<span>'+ tab[ii].title +'</span>';
        }
      }
      return str;
    }(),
    content: '<ul class="layui-layer-tabmain">'+ function(){
      var len = tab.length, ii = 1, str = '';
      if(len > 0){
        str = '<li class="layui-layer-tabli '+ THIS +'">'+ (tab[0].content || 'no content') +'</li>';
        for(; ii < len; ii++){
          str += '<li class="layui-layer-tabli">'+ (tab[ii].content || 'no  content') +'</li>';
        }
      }
      return str;
    }() +'</ul>',
    success: function(layero){
      var btn = layero.find('.layui-layer-title').children();
      var main = layero.find('.layui-layer-tabmain').children();
      btn.on('mousedown', function(e){
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        var othis = $(this), index = othis.index();
        othis.addClass(THIS).siblings().removeClass(THIS);
        main.eq(index).show().siblings().hide();
        typeof options.change === 'function' && options.change(index);
      });
      typeof success === 'function' && success(layero);
    }
  }, options));
};

//相册层
layer.photos = function(options, loop, key){
  var dict = {};
  options = options || {};
  if(!options.photos) return;
  var type = options.photos.constructor === Object;
  var photos = type ? options.photos : {}, data = photos.data || [];
  var start = photos.start || 0;
  dict.imgIndex = (start|0) + 1;
  
  options.img = options.img || 'img';
  
  var success = options.success;
  delete options.success;

  if(!type){ //页面直接获取
    var parent = $(options.photos), pushData = function(){
      data = [];
      parent.find(options.img).each(function(index){
        var othis = $(this);
        othis.attr('layer-index', index);
        data.push({
          alt: othis.attr('alt'),
          pid: othis.attr('layer-pid'),
          src: othis.attr('layer-src') || othis.attr('src'),
          thumb: othis.attr('src')
        });
      })
    };
    
    pushData();
    
    if (data.length === 0) return;
    
    loop || parent.on('click', options.img, function(){
      var othis = $(this), index = othis.attr('layer-index'); 
      layer.photos($.extend(options, {
        photos: {
          start: index,
          data: data,
          tab: options.tab
        },
        full: options.full
      }), true);
      pushData();
    })
    
    //不直接弹出
    if(!loop) return;
    
  } else if (data.length === 0){
    return layer.msg('&#x6CA1;&#x6709;&#x56FE;&#x7247;');
  }
  
  //上一张
  dict.imgprev = function(key){
    dict.imgIndex--;
    if(dict.imgIndex < 1){
      dict.imgIndex = data.length;
    }
    dict.tabimg(key);
  };
  
  //下一张
  dict.imgnext = function(key,errorMsg){
    dict.imgIndex++;
    if(dict.imgIndex > data.length){
      dict.imgIndex = 1;
      if (errorMsg) {return};
    }
    dict.tabimg(key)
  };
  
  //方向键
  dict.keyup = function(event){
    if(!dict.end){
      var code = event.keyCode;
      event.preventDefault();
      if(code === 37){
        dict.imgprev(true);
      } else if(code === 39) {
        dict.imgnext(true);
      } else if(code === 27) {
        layer.close(dict.index);
      }
    }
  }
  
  //切换
  dict.tabimg = function(key){
    if(data.length <= 1) return;
    photos.start = dict.imgIndex - 1;
    layer.close(dict.index);
    return layer.photos(options, true, key);
    setTimeout(function(){
      layer.photos(options, true, key);
    }, 200);
  }
  
  //一些动作
  dict.event = function(){
    dict.bigimg.hover(function(){
      dict.imgsee.show();
    }, function(){
      dict.imgsee.hide();
    });
    
    dict.bigimg.find('.layui-layer-imgprev').on('click', function(event){
      event.preventDefault();
      dict.imgprev();
    });  
    
    dict.bigimg.find('.layui-layer-imgnext').on('click', function(event){     
      event.preventDefault();
      dict.imgnext();
    });
    
    $(document).on('keyup', dict.keyup);
  };
  
  //图片预加载
  function loadImage(url, callback, error) {   
    var img = new Image();
    img.src = url; 
    if(img.complete){
      return callback(img);
    }
    img.onload = function(){
      img.onload = null;
      callback(img);
    };
    img.onerror = function(e){
      img.onerror = null;
      error(e);
    };  
  };
  
  dict.loadi = layer.load(1, {
    shade: 'shade' in options ? false : 0.9,
    scrollbar: false
  });

  loadImage(data[start].src, function(img){
    layer.close(dict.loadi);
    dict.index = layer.open($.extend({
      type: 1,
      id: 'layui-layer-photos',
      area: function(){
        var imgarea = [img.width, img.height];
        var winarea = [$(window).width() - 100, $(window).height() - 100];
        
        //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
        if(!options.full && (imgarea[0]>winarea[0]||imgarea[1]>winarea[1])){
          var wh = [imgarea[0]/winarea[0],imgarea[1]/winarea[1]];//取宽度缩放比例、高度缩放比例
          if(wh[0] > wh[1]){//取缩放比例最大的进行缩放
            imgarea[0] = imgarea[0]/wh[0];
            imgarea[1] = imgarea[1]/wh[0];
          } else if(wh[0] < wh[1]){
            imgarea[0] = imgarea[0]/wh[1];
            imgarea[1] = imgarea[1]/wh[1];
          }
        }
        
        return [imgarea[0]+'px', imgarea[1]+'px']; 
      }(),
      title: false,
      shade: 0.9,
      shadeClose: true,
      closeBtn: false,
      move: '.layui-layer-phimg img',
      moveType: 1,
      scrollbar: false,
      moveOut: true,
      //anim: Math.random()*5|0,
      isOutAnim: false,
      skin: 'layui-layer-photos' + skin('photos'),
      content: '<div class="layui-layer-phimg">'
        +'<img src="'+ data[start].src +'" alt="'+ (data[start].alt||'') +'" layer-pid="'+ data[start].pid +'">'
        +'<div class="layui-layer-imgsee">'
          +(data.length > 1 ? '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>' : '')
          +'<div class="layui-layer-imgbar" style="display:'+ (key ? 'block' : '') +'"><span class="layui-layer-imgtit"><a href="javascript:;">'+ (data[start].alt||'') +'</a><em>'+ dict.imgIndex +'/'+ data.length +'</em></span></div>'
        +'</div>'
      +'</div>',
      success: function(layero, index){
        dict.bigimg = layero.find('.layui-layer-phimg');
        dict.imgsee = layero.find('.layui-layer-imguide,.layui-layer-imgbar');
        dict.event(layero);
        options.tab && options.tab(data[start], layero);
        typeof success === 'function' && success(layero);
      }, end: function(){
        dict.end = true;
        $(document).off('keyup', dict.keyup);
      }
    }, options));
  }, function(){
    layer.close(dict.loadi);
    layer.msg('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', {
      time: 30000, 
      btn: ['&#x4E0B;&#x4E00;&#x5F20;', '&#x4E0D;&#x770B;&#x4E86;'], 
      yes: function(){
        data.length > 1 && dict.imgnext(true,true);
      }
    });
  });
};

//主入口
ready.run = function(_$){
  $ = _$;
  win = $(window);
  doms.html = $('html');
  layer.open = function(deliver){
    var o = new Class(deliver);
    return o.index;
  };
};

//加载方式
window.layui && layui.define ? (
  layer.ready()
  ,layui.define('jquery', function(exports){ //layui加载
    layer.path = layui.cache.dir;
    ready.run(layui.$);

    //暴露模块
    window.layer = layer;
    exports('layer', layer);
  })
) : (
  (typeof define === 'function' && define.amd) ? define(['jquery'], function(){ //requirejs加载
    ready.run(window.jQuery);
    return layer;
  }) : function(){ //普通script标签加载
    ready.run(window.jQuery);
    layer.ready();
  }()
);

}(window);
/**

 @Name：util 工具集组件
 @License：MIT
    
*/

layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.$
  
  //外部接口
  ,util = {
    //固定块
    fixbar: function(options){
      var ELEM = 'layui-fixbar', TOP_BAR = 'layui-fixbar-top'
      ,dom = $(document), body = $('body')
      ,is, timer;

      options = $.extend({
        showHeight: 200 //出现TOP的滚动条高度临界值
      }, options);
      
      options.bar1 = options.bar1 === true ? '&#xe606;' : options.bar1;
      options.bar2 = options.bar2 === true ? '&#xe607;' : options.bar2;
      options.bgcolor = options.bgcolor ? ('background-color:' + options.bgcolor) : '';
      
      var icon = [options.bar1, options.bar2, '&#xe604;'] //图标：信息、问号、TOP
      ,elem = $(['<ul class="'+ ELEM +'">'
        ,options.bar1 ? '<li class="layui-icon" lay-type="bar1" style="'+ options.bgcolor +'">'+ icon[0] +'</li>' : ''
        ,options.bar2 ? '<li class="layui-icon" lay-type="bar2" style="'+ options.bgcolor +'">'+ icon[1] +'</li>' : ''
        ,'<li class="layui-icon '+ TOP_BAR +'" lay-type="top" style="'+ options.bgcolor +'">'+ icon[2] +'</li>'
      ,'</ul>'].join(''))
      ,topBar = elem.find('.'+TOP_BAR)
      ,scroll = function(){
        var stop = dom.scrollTop();
        if(stop >= (options.showHeight)){
          is || (topBar.show(), is = 1);
        } else {
          is && (topBar.hide(), is = 0);
        }
      };
      if($('.'+ ELEM)[0]) return;
      
      typeof options.css === 'object' && elem.css(options.css);
      body.append(elem), scroll();
      
      //bar点击事件
      elem.find('li').on('click', function(){
        var othis = $(this), type = othis.attr('lay-type');
        if(type === 'top'){
          $('html,body').animate({
            scrollTop : 0
          }, 200);
        }
        options.click && options.click.call(this, type);
      });
      
      //Top显示控制
      dom.on('scroll', function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
          scroll();
        }, 100);
      }); 
    }
    
    //倒计时
    ,countdown: function(endTime, serverTime, callback){
      var that = this
      ,type = typeof serverTime === 'function'
      ,end = new Date(endTime).getTime()
      ,now = new Date((!serverTime || type) ? new Date().getTime() : serverTime).getTime()
      ,count = end - now
      ,time = [
        Math.floor(count/(1000*60*60*24)) //天
        ,Math.floor(count/(1000*60*60)) % 24 //时
        ,Math.floor(count/(1000*60)) % 60 //分
        ,Math.floor(count/1000) % 60 //秒
      ];
      
      if(type) callback = serverTime;
       
      var timer = setTimeout(function(){
        that.countdown(endTime, now + 1000, callback);
      }, 1000);
      
      callback && callback(count > 0 ? time : [0,0,0,0], serverTime, timer);
      
      if(count <= 0) clearTimeout(timer);
      return timer;
    }
    
    //某个时间在当前时间的多久前
    ,timeAgo: function(time, onlyDate){
      var that = this
      ,arr = [[], []]
      ,stamp = new Date().getTime() - new Date(time).getTime();
      
      //返回具体日期
      if(stamp > 1000*60*60*24*31){
        stamp =  new Date(time);
        arr[0][0] = that.digit(stamp.getFullYear(), 4);
        arr[0][1] = that.digit(stamp.getMonth() + 1);
        arr[0][2] = that.digit(stamp.getDate());
        
        //是否输出时间
        if(!onlyDate){
          arr[1][0] = that.digit(stamp.getHours());
          arr[1][1] = that.digit(stamp.getMinutes());
          arr[1][2] = that.digit(stamp.getSeconds());
        }
        return arr[0].join('-') + ' ' + arr[1].join(':');
      }
      
      //30天以内，返回“多久前”
      if(stamp >= 1000*60*60*24){
        return ((stamp/1000/60/60/24)|0) + '天前';
      } else if(stamp >= 1000*60*60){
        return ((stamp/1000/60/60)|0) + '小时前';
      } else if(stamp >= 1000*60*3){ //3分钟以内为：刚刚
        return ((stamp/1000/60)|0) + '分钟前';
      } else if(stamp < 0){
        return '未来';
      } else {
        return '刚刚';
      }
    }
    
    //数字前置补零
    ,digit: function(num, length){
      var str = '';
      num = String(num);
      length = length || 2;
      for(var i = num.length; i < length; i++){
        str += '0';
      }
      return num < Math.pow(10, length) ? str + (num|0) : num;
    }
    
    //转化为日期格式字符
    ,toDateString: function(time, format){
      var that = this
      ,date = new Date(time || new Date())
      ,ymd = [
        that.digit(date.getFullYear(), 4)
        ,that.digit(date.getMonth() + 1)
        ,that.digit(date.getDate())
      ]
      ,hms = [
        that.digit(date.getHours())
        ,that.digit(date.getMinutes())
        ,that.digit(date.getSeconds())
      ];

      format = format || 'yyyy-MM-dd HH:mm:ss';

      return format.replace(/yyyy/g, ymd[0])
      .replace(/MM/g, ymd[1])
      .replace(/dd/g, ymd[2])
      .replace(/HH/g, hms[0])
      .replace(/mm/g, hms[1])
      .replace(/ss/g, hms[2]);
    }
    
    //防 xss 攻击
    ,escape: function(html){
      return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }
    
    ,unescape: function(str){
      return String(str || '').replace(/\&amp;/g, '&')
      .replace(/\&lt;/g, '<').replace(/\&gt;/g, '>')
      .replace(/\&#39;/, '\'').replace(/\&quot;/, '"');
    }
    
    //批量事件
    ,event: function(attr, obj, eventType){
      var _body = $('body');
      eventType = eventType || 'click';
      
      //记录事件回调集合
      obj = util.event[attr] = $.extend(true, util.event[attr], obj) || {};
      
      //清除委托事件
      util.event.UTIL_EVENT_CALLBACK = util.event.UTIL_EVENT_CALLBACK || {};
      _body.off(eventType, '*['+ attr +']', util.event.UTIL_EVENT_CALLBACK[attr])
      
      //绑定委托事件
      util.event.UTIL_EVENT_CALLBACK[attr] = function(){
        var othis = $(this)
        ,key = othis.attr(attr);
        (typeof obj[key] === 'function') && obj[key].call(this, othis);
      };

      //清除旧事件，绑定新事件
      _body.on(eventType, '*['+ attr +']', util.event.UTIL_EVENT_CALLBACK[attr]);
      
      return obj;
    }
  };
  
  // DOM 尺寸变化，该创意来自：http://benalman.com/projects/jquery-resize-plugin/
  /*
  !function(a,b,c){"$:nomunge";function l(){f=b[g](function(){d.each(function(){var b=a(this),c=b.width(),d=b.height(),e=a.data(this,i);(c!==e.w||d!==e.h)&&b.trigger(h,[e.w=c,e.h=d])}),l()},e[j])}var f,d=a([]),e=a.resize=a.extend(a.resize,{}),g="setTimeout",h="resize",i=h+"-special-event",j="delay",k="throttleWindow";e[j]=250,e[k]=!0,a.event.special[h]={setup:function(){if(!e[k]&&this[g])return!1;var b=a(this);d=d.add(b),a.data(this,i,{w:b.width(),h:b.height()}),1===d.length&&l()},teardown:function(){if(!e[k]&&this[g])return!1;var b=a(this);d=d.not(b),b.removeData(i),d.length||clearTimeout(f)},add:function(b){function f(b,e,f){var g=a(this),h=a.data(this,i)||{};h.w=e!==c?e:g.width(),h.h=f!==c?f:g.height(),d.apply(this,arguments)}if(!e[k]&&this[g])return!1;var d;return a.isFunction(b)?(d=b,f):(d=b.handler,b.handler=f,void 0)}}}($,window);
  */
  
  //暴露接口
  exports('util', util);
});/**

 @Name：element 常用元素操作
 @License：MIT
    
 */
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.$
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'element', THIS = 'layui-this', SHOW = 'layui-show'
  
  ,Element = function(){
    this.config = {};
  };
  
  //全局设置
  Element.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //表单事件
  Element.prototype.on = function(events, callback){
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };
  
  //外部Tab新增
  Element.prototype.tabAdd = function(filter, options){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,barElem = titElem.children('.layui-tab-bar')
    ,contElem = tabElem.children('.layui-tab-content')
    ,li = '<li lay-id="'+ (options.id||'') +'"'
    +(options.attr ? ' lay-attr="'+ options.attr +'"' : '') +'>'+ (options.title||'unnaming') +'</li>';
    
    barElem[0] ? barElem.before(li) : titElem.append(li);
    contElem.append('<div class="layui-tab-item">'+ (options.content||'') +'</div>');
    call.hideTabMore(true);
    call.tabAuto();
    return this;
  };
  
  //外部Tab删除
  Element.prototype.tabDelete = function(filter, layid){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
    call.tabDelete(null, liElem);
    return this;
  };
  
  //外部Tab切换
  Element.prototype.tabChange = function(filter, layid){
    var TITLE = '.layui-tab-title'
    ,tabElem = $('.layui-tab[lay-filter='+ filter +']')
    ,titElem = tabElem.children(TITLE)
    ,liElem = titElem.find('>li[lay-id="'+ layid +'"]');
    call.tabClick.call(liElem[0], null, null, liElem);
    return this;
  };
  
  //自定义Tab选项卡
  Element.prototype.tab = function(options){
    options = options || {};
    dom.on('click', options.headerElem, function(e){
      var index = $(this).index();
      call.tabClick.call(this, e, index, null, options);
    });
  };
  
  
  //动态改变进度条
  Element.prototype.progress = function(filter, percent){
    var ELEM = 'layui-progress'
    ,elem = $('.'+ ELEM +'[lay-filter='+ filter +']')
    ,elemBar = elem.find('.'+ ELEM +'-bar')
    ,text = elemBar.find('.'+ ELEM +'-text');
    elemBar.css('width', percent);
    text.text(percent);
    return this;
  };
  
  var NAV_ELEM = '.layui-nav', NAV_ITEM = 'layui-nav-item', NAV_BAR = 'layui-nav-bar'
  ,NAV_TREE = 'layui-nav-tree', NAV_CHILD = 'layui-nav-child', NAV_MORE = 'layui-nav-more'
  ,NAV_ANIM = 'layui-anim layui-anim-upbit'
  
  //基础事件体
  ,call = {
    //Tab点击
    tabClick: function(e, index, liElem, options){
      options = options || {};
      var othis = liElem || $(this)
      ,index = index || othis.parent().children('li').index(othis)
      ,parents = options.headerElem ? othis.parent() : othis.parents('.layui-tab').eq(0)
      ,item = options.bodyElem ? $(options.bodyElem) : parents.children('.layui-tab-content').children('.layui-tab-item')
      ,elemA = othis.find('a')
      ,filter = parents.attr('lay-filter');
      
      if(!(elemA.attr('href') !== 'javascript:;' && elemA.attr('target') === '_blank')){
        othis.addClass(THIS).siblings().removeClass(THIS);
        item.eq(index).addClass(SHOW).siblings().removeClass(SHOW);
      }
      
      layui.event.call(this, MOD_NAME, 'tab('+ filter +')', {
        elem: parents
        ,index: index
      });
    }
    
    //Tab删除
    ,tabDelete: function(e, othis){
      var li = othis || $(this).parent(), index = li.index()
      ,parents = li.parents('.layui-tab').eq(0)
      ,item = parents.children('.layui-tab-content').children('.layui-tab-item')
      ,filter = parents.attr('lay-filter');
      
      if(li.hasClass(THIS)){
        if(li.next()[0]){
          call.tabClick.call(li.next()[0], null, index + 1);
        } else if(li.prev()[0]){
          call.tabClick.call(li.prev()[0], null, index - 1);
        }
      }
      
      li.remove();
      item.eq(index).remove();
      setTimeout(function(){
        call.tabAuto();
      }, 50);
      
      layui.event.call(this, MOD_NAME, 'tabDelete('+ filter +')', {
        elem: parents
        ,index: index
      });
    }
    
    //Tab自适应
    ,tabAuto: function(){
      var SCROLL = 'layui-tab-scroll', MORE = 'layui-tab-more', BAR = 'layui-tab-bar'
      ,CLOSE = 'layui-tab-close', that = this;
      
      $('.layui-tab').each(function(){
        var othis = $(this)
        ,title = othis.children('.layui-tab-title')
        ,item = othis.children('.layui-tab-content').children('.layui-tab-item')
        ,STOPE = 'lay-stope="tabmore"'
        ,span = $('<span class="layui-unselect layui-tab-bar" '+ STOPE +'><i '+ STOPE +' class="layui-icon">&#xe61a;</i></span>');

        if(that === window && device.ie != 8){
          call.hideTabMore(true)
        }
        
        //允许关闭
        if(othis.attr('lay-allowClose')){
          title.find('li').each(function(){
            var li = $(this);
            if(!li.find('.'+CLOSE)[0]){
              var close = $('<i class="layui-icon layui-unselect '+ CLOSE +'">&#x1006;</i>');
              close.on('click', call.tabDelete);
              li.append(close);
            }
          });
        }
        
        if(typeof othis.attr('lay-unauto') === 'string') return;
        
        //响应式
        if(title.prop('scrollWidth') > title.outerWidth()+1){
          if(title.find('.'+BAR)[0]) return;
          title.append(span);
          othis.attr('overflow', '');
          span.on('click', function(e){
            title[this.title ? 'removeClass' : 'addClass'](MORE);
            this.title = this.title ? '' : '收缩';
          });
        } else {
          title.find('.'+BAR).remove();
          othis.removeAttr('overflow');
        }
      });
    }
    //隐藏更多Tab
    ,hideTabMore: function(e){
      var tsbTitle = $('.layui-tab-title');
      if(e === true || $(e.target).attr('lay-stope') !== 'tabmore'){
        tsbTitle.removeClass('layui-tab-more');
        tsbTitle.find('.layui-tab-bar').attr('title','');
      }
    }
    
    //点击一级菜单
    /*
    ,clickThis: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter')
      ,elemA = othis.find('a')
      ,unselect = typeof othis.attr('lay-unselect') === 'string';

      if(othis.find('.'+NAV_CHILD)[0]) return;
      
      if(!(elemA.attr('href') !== 'javascript:;' && elemA.attr('target') === '_blank') && !unselect){
        parents.find('.'+THIS).removeClass(THIS);
        othis.addClass(THIS);
      }
      
      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    )
    */
    
    //点击菜单 - a标签触发
    ,clickThis: function(){
      var othis = $(this)
      ,parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter')
      ,parent = othis.parent() 
      ,child = othis.siblings('.'+NAV_CHILD)
      ,unselect = typeof parent.attr('lay-unselect') === 'string';
      
      if(!(othis.attr('href') !== 'javascript:;' && othis.attr('target') === '_blank') && !unselect){
        if(!child[0]){
          parents.find('.'+THIS).removeClass(THIS);
          parent.addClass(THIS);
        }
      }
      
      //如果是垂直菜单
      if(parents.hasClass(NAV_TREE)){
        child.removeClass(NAV_ANIM);
        
        //如果有子菜单，则展开
        if(child[0]){
          parent[child.css('display') === 'none' ? 'addClass': 'removeClass'](NAV_ITEM+'ed');
          if(parents.attr('lay-shrink') === 'all'){
            parent.siblings().removeClass(NAV_ITEM + 'ed');
          }
        }
      }
      
      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    
    //点击子菜单选中
    /*
    ,clickChild: function(){
      var othis = $(this), parents = othis.parents(NAV_ELEM)
      ,filter = parents.attr('lay-filter');
      parents.find('.'+THIS).removeClass(THIS);
      othis.addClass(THIS);
      layui.event.call(this, MOD_NAME, 'nav('+ filter +')', othis);
    }
    */
    
    //折叠面板
    ,collapse: function(){
      var othis = $(this), icon = othis.find('.layui-colla-icon')
      ,elemCont = othis.siblings('.layui-colla-content')
      ,parents = othis.parents('.layui-collapse').eq(0)
      ,filter = parents.attr('lay-filter')
      ,isNone = elemCont.css('display') === 'none';
      
      //是否手风琴
      if(typeof parents.attr('lay-accordion') === 'string'){
        var show = parents.children('.layui-colla-item').children('.'+SHOW);
        show.siblings('.layui-colla-title').children('.layui-colla-icon').html('&#xe602;');
        show.removeClass(SHOW);
      }
      
      elemCont[isNone ? 'addClass' : 'removeClass'](SHOW);
      icon.html(isNone ? '&#xe61a;' : '&#xe602;');
      
      layui.event.call(this, MOD_NAME, 'collapse('+ filter +')', {
        title: othis
        ,content: elemCont
        ,show: isNone
      });
    }
  };
  
  //初始化元素操作
  Element.prototype.init = function(type, filter){
    var that = this, elemFilter = function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }(), items = {
      
      //Tab选项卡
      tab: function(){
        call.tabAuto.call({});
      }
      
      //导航菜单
      ,nav: function(){
        var TIME = 200, timer = {}, timerMore = {}, timeEnd = {}, follow = function(bar, nav, index){
          var othis = $(this), child = othis.find('.'+NAV_CHILD);
          
          if(nav.hasClass(NAV_TREE)){
            bar.css({
              top: othis.position().top
              ,height: othis.children('a').outerHeight()
              ,opacity: 1
            });
          } else {
            child.addClass(NAV_ANIM);
            bar.css({
              left: othis.position().left + parseFloat(othis.css('marginLeft'))
              ,top: othis.position().top + othis.height() - bar.height()
            });
            
            timer[index] = setTimeout(function(){
              bar.css({
                width: othis.width()
                ,opacity: 1
              });
            }, device.ie && device.ie < 10 ? 0 : TIME);
            
            clearTimeout(timeEnd[index]);
            if(child.css('display') === 'block'){
              clearTimeout(timerMore[index]);
            }
            timerMore[index] = setTimeout(function(){
              child.addClass(SHOW)
              othis.find('.'+NAV_MORE).addClass(NAV_MORE+'d');
            }, 300);
          }
        }
        
        $(NAV_ELEM + elemFilter).each(function(index){
          var othis = $(this)
          ,bar = $('<span class="'+ NAV_BAR +'"></span>')
          ,itemElem = othis.find('.'+NAV_ITEM);
          
          //Hover滑动效果
          if(!othis.find('.'+NAV_BAR)[0]){
            othis.append(bar);
            itemElem.on('mouseenter', function(){
              follow.call(this, bar, othis, index);
            }).on('mouseleave', function(){
              if(!othis.hasClass(NAV_TREE)){
                clearTimeout(timerMore[index]);
                timerMore[index] = setTimeout(function(){
                  othis.find('.'+NAV_CHILD).removeClass(SHOW);
                  othis.find('.'+NAV_MORE).removeClass(NAV_MORE+'d');
                }, 300);
              }
            });
            othis.on('mouseleave', function(){
              clearTimeout(timer[index])
              timeEnd[index] = setTimeout(function(){
                if(othis.hasClass(NAV_TREE)){
                  bar.css({
                    height: 0
                    ,top: bar.position().top + bar.height()/2
                    ,opacity: 0
                  });
                } else {
                  bar.css({
                    width: 0
                    ,left: bar.position().left + bar.width()/2
                    ,opacity: 0
                  });
                }
              }, TIME);
            });
          }
          
          //展开子菜单
          itemElem.find('a').each(function(){
            var thisA = $(this)
            ,parent = thisA.parent()
            ,child = thisA.siblings('.'+NAV_CHILD);
            
            //输出小箭头
            if(child[0] && !thisA.children('.'+NAV_MORE)[0]){
              thisA.append('<span class="'+ NAV_MORE +'"></span>');
            }
            
            thisA.off('click', call.clickThis).on('click', call.clickThis); //点击菜单
          });
        });
      }
      
      //面包屑
      ,breadcrumb: function(){
        var ELEM = '.layui-breadcrumb';
        
        $(ELEM + elemFilter).each(function(){
          var othis = $(this)
          ,ATTE_SPR = 'lay-separator'
          ,separator = othis.attr(ATTE_SPR) || '/'
          ,aNode = othis.find('a');
          if(aNode.next('span['+ ATTE_SPR +']')[0]) return;
          aNode.each(function(index){
            if(index === aNode.length - 1) return;
            $(this).after('<span '+ ATTE_SPR +'>'+ separator +'</span>');
          });
          othis.css('visibility', 'visible');
        });
      }
      
      //进度条
      ,progress: function(){
        var ELEM = 'layui-progress';
        $('.' + ELEM + elemFilter).each(function(){
          var othis = $(this)
          ,elemBar = othis.find('.layui-progress-bar')
          ,percent = elemBar.attr('lay-percent');

          elemBar.css('width', function(){
            return /^.+\/.+$/.test(percent) 
              ? (new Function('return '+ percent)() * 100) + '%'
           : percent;
          }());
          
          if(othis.attr('lay-showPercent')){
            setTimeout(function(){
              elemBar.html('<span class="'+ ELEM +'-text">'+ percent +'</span>');
            },350);
          }
        });
      }
      
      //折叠面板
      ,collapse: function(){
        var ELEM = 'layui-collapse';
        
        $('.' + ELEM + elemFilter).each(function(){
          var elemItem = $(this).find('.layui-colla-item')
          elemItem.each(function(){
            var othis = $(this)
            ,elemTitle = othis.find('.layui-colla-title')
            ,elemCont = othis.find('.layui-colla-content')
            ,isNone = elemCont.css('display') === 'none';
            
            //初始状态
            elemTitle.find('.layui-colla-icon').remove();
            elemTitle.append('<i class="layui-icon layui-colla-icon">'+ (isNone ? '&#xe602;' : '&#xe61a;') +'</i>');

            //点击标题
            elemTitle.off('click', call.collapse).on('click', call.collapse);
          });     
         
        });
      }
    };

    return items[type] ? items[type]() : layui.each(items, function(index, item){
      item();
    });
  };
  
  Element.prototype.render = Element.prototype.init;

  var element = new Element(), dom = $(document);
  
  $(function(){
    element.render();
  });
  
  var TITLE = '.layui-tab-title li';
  dom.on('click', TITLE, call.tabClick); //Tab切换
  dom.on('click', call.hideTabMore); //隐藏展开的Tab
  $(window).on('resize', call.tabAuto); //自适应
  
  exports(MOD_NAME, element);
});

/**

 @Title: upload 文件上传组件
 @License：MIT

 */
 
layui.define('layer' , function(exports){
  "use strict";
  
  var $ = layui.$
  ,layer = layui.layer
  ,hint = layui.hint()
  ,device = layui.device()

  //外部接口
  ,upload = {
    config: {} //全局配置项

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }
  
  //操作当前实例
  ,thisUpload = function(){
    var that = this;
    return {
      upload: function(files){
        that.upload.call(that, files);
      }
      ,reload: function(options){
        that.reload.call(that, options);
      }
      ,config: that.config
    }
  }
  
  //字符常量
  ,MOD_NAME = 'upload', ELEM = '.layui-upload', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'
  
  ,ELEM_FILE = 'layui-upload-file', ELEM_FORM = 'layui-upload-form', ELEM_IFRAME = 'layui-upload-iframe', ELEM_CHOOSE = 'layui-upload-choose', ELEM_DRAG = 'layui-upload-drag'
  
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.config = $.extend({}, that.config, upload.config, options);
    that.render();
  };
  
  //默认配置
  Class.prototype.config = {
    accept: 'images' //允许上传的文件类型：images/file/video/audio
    ,exts: '' //允许上传的文件后缀名
    ,auto: true //是否选完文件后自动上传
    ,bindAction: '' //手动上传触发的元素
    ,url: '' //上传地址
    ,field: 'file' //文件字段名
    ,acceptMime: '' //筛选出的文件类型，默认为所有文件
    ,method: 'post' //请求上传的 http 类型
    ,data: {} //请求上传的额外参数
    ,drag: true //是否允许拖拽上传
    ,size: 0 //文件限制大小，默认不限制
    ,number: 0 //允许同时上传的文件数，默认不限制
    ,multiple: false //是否允许多文件上传，不支持ie8-9
  };
  
  //初始渲染
  Class.prototype.render = function(options){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    options.bindAction = $(options.bindAction);

    that.file();
    that.events();
  };
  
  //追加文件域
  Class.prototype.file = function(){
    var that = this
    ,options = that.config
    ,elemFile = that.elemFile = $([
      '<input class="'+ ELEM_FILE +'" type="file" accept="'+ options.acceptMime +'" name="'+ options.field +'"'
      ,(options.multiple ? ' multiple' : '') 
      ,'>'
    ].join(''))
    ,next = options.elem.next();
    
    if(next.hasClass(ELEM_FILE) || next.hasClass(ELEM_FORM)){
      next.remove();
    }
    
    //包裹ie8/9容器
    if(device.ie && device.ie < 10){
      options.elem.wrap('<div class="layui-upload-wrap"></div>');
    }
    
    that.isFile() ? (
      that.elemFile = options.elem
      ,options.field = options.elem[0].name
    ) : options.elem.after(elemFile);
    
    //初始化ie8/9的Form域
    if(device.ie && device.ie < 10){
      that.initIE();
    }
  };
  
  //ie8-9初始化
  Class.prototype.initIE = function(){
    var that = this
    ,options = that.config
    ,iframe = $('<iframe id="'+ ELEM_IFRAME +'" class="'+ ELEM_IFRAME +'" name="'+ ELEM_IFRAME +'" frameborder="0"></iframe>')
    ,elemForm = $(['<form target="'+ ELEM_IFRAME +'" class="'+ ELEM_FORM +'" method="post" key="set-mine" enctype="multipart/form-data" action="'+ options.url +'">'
    ,'</form>'].join(''));
    
    //插入iframe    
    $('#'+ ELEM_IFRAME)[0] || $('body').append(iframe);

    //包裹文件域
    if(!options.elem.next().hasClass(ELEM_FORM)){
      that.elemFile.wrap(elemForm);      
      
      //追加额外的参数
      options.elem.next('.'+ ELEM_FORM).append(function(){
        var arr = [];
        layui.each(options.data, function(key, value){
          value = typeof value === 'function' ? value() : value;
          arr.push('<input type="hidden" name="'+ key +'" value="'+ value +'">')
        });
        return arr.join('');
      }());
    }
  };
  
  //异常提示
  Class.prototype.msg = function(content){
    return layer.msg(content, {
      icon: 2
      ,shift: 6
    });
  };
  
  //判断绑定元素是否为文件域本身
  Class.prototype.isFile = function(){
    var elem = this.config.elem[0];
    if(!elem) return;
    return elem.tagName.toLocaleLowerCase() === 'input' && elem.type === 'file'
  }
  
  //预读图片信息
  Class.prototype.preview = function(callback){
    var that = this;
    if(window.FileReader){
      layui.each(that.chooseFiles, function(index, file){
        var reader = new FileReader();
        reader.readAsDataURL(file);  
        reader.onload = function(){
          callback && callback(index, file, this.result);
        }
      });
    }
  };
  
  //执行上传
  Class.prototype.upload = function(files, type){
    var that = this
    ,options = that.config
    ,elemFile = that.elemFile[0]
    
    //高级浏览器处理方式，支持跨域
    ,ajaxSend = function(){
      var successful = 0, aborted = 0
      ,items = files || that.files || that.chooseFiles || elemFile.files
      ,allDone = function(){ //多文件全部上传完毕的回调
        if(options.multiple && successful + aborted === that.fileLength){
          typeof options.allDone === 'function' && options.allDone({
            total: that.fileLength
            ,successful: successful
            ,aborted: aborted
          });
        }
      };
      layui.each(items, function(index, file){
        var formData = new FormData();
        
        formData.append(options.field, file);
        
        //追加额外的参数
        layui.each(options.data, function(key, value){
          value = typeof value === 'function' ? value() : value;
          formData.append(key, value);
        });
        
        //提交文件
        var opts = {
          url: options.url
          ,type: 'post' //统一采用 post 上传
          ,data: formData
          ,contentType: false 
          ,processData: false
          ,dataType: 'json'
          ,headers: options.headers || {}
          //成功回调
          ,success: function(res){
            successful++;
            done(index, res);
            allDone();
          }
          //异常回调
          ,error: function(){
            aborted++;
            that.msg('请求上传接口出现异常');
            error(index);
            allDone();
          }
        };
        //进度条
        if(typeof options.progress === 'function'){
          opts.xhr = function(){
            var xhr = $.ajaxSettings.xhr();
            //上传进度
            xhr.upload.addEventListener("progress", function (e) {
              if(e.lengthComputable) {
                var percent = Math.floor((e.loaded/e.total)* 100); //百分比
                options.progress(percent, options.item[0], e);
              }
            });
            return xhr;
          }
        }
        $.ajax(opts);
      });
    }
    
    //低版本IE处理方式，不支持跨域
    ,iframeSend = function(){
      var iframe = $('#'+ ELEM_IFRAME);
    
      that.elemFile.parent().submit();

      //获取响应信息
      clearInterval(Class.timer);
      Class.timer = setInterval(function() {
        var res, iframeBody = iframe.contents().find('body');
        try {
          res = iframeBody.text();
        } catch(e) {
          that.msg('获取上传后的响应信息出现异常');
          clearInterval(Class.timer);
          error();
        }
        if(res){
          clearInterval(Class.timer);
          iframeBody.html('');
          done(0, res);
        }
      }, 30); 
    }
    
    //统一回调
    ,done = function(index, res){
      that.elemFile.next('.'+ ELEM_CHOOSE).remove();
      elemFile.value = '';
      if(typeof res !== 'object'){
        try {
          res = JSON.parse(res);
        } catch(e){
          res = {};
          return that.msg('请对上传接口返回有效JSON');
        }
      }
      typeof options.done === 'function' && options.done(res, index || 0, function(files){
        that.upload(files);
      });
    }
    
    //统一网络异常回调
    ,error = function(index){
      if(options.auto){
        elemFile.value = '';
      }
      typeof options.error === 'function' && options.error(index || 0, function(files){
        that.upload(files);
      });
    }
    
    ,exts = options.exts
    ,check ,value = function(){
      var arr = [];
      layui.each(files || that.chooseFiles, function(i, item){
        arr.push(item.name);
      });
      return arr;
    }()
    
    //回调返回的参数
    ,args = {
      //预览
      preview: function(callback){
        that.preview(callback);
      }
      //上传
      ,upload: function(index, file){
        var thisFile = {};
        thisFile[index] = file;
        that.upload(thisFile);
      }
      //追加文件到队列
      ,pushFile: function(){
        that.files = that.files || {};
        layui.each(that.chooseFiles, function(index, item){
          that.files[index] = item;
        });
        return that.files;
      }
      //重置文件
      ,resetFile: function(index, file, filename){
        var newFile = new File([file], filename);
        that.files = that.files || {};
        that.files[index] = newFile;
      }
    }
    
    //提交上传
    ,send = function(){      
      //选择文件的回调      
      if(type === 'choose' || options.auto){
        options.choose && options.choose(args);
        if(type === 'choose'){
          return;
        }
      }
      
      //上传前的回调
      options.before && options.before(args);

      //IE兼容处理
      if(device.ie){
        return device.ie > 9 ? ajaxSend() : iframeSend();
      }
      
      ajaxSend();
    }

    //校验文件格式
    value = value.length === 0 
      ? ((elemFile.value.match(/[^\/\\]+\..+/g)||[]) || '')
    : value;
    
    if(value.length === 0) return;

    switch(options.accept){
      case 'file': //一般文件
        if(exts && !RegExp('\\w\\.('+ exts +')$', 'i').test(escape(value))){
          that.msg('选择的文件中包含不支持的格式');
          return elemFile.value = '';
        }
      break;
      case 'video': //视频文件
        if(!RegExp('\\w\\.('+ (exts || 'avi|mp4|wma|rmvb|rm|flash|3gp|flv') +')$', 'i').test(escape(value))){
          that.msg('选择的视频中包含不支持的格式');
          return elemFile.value = '';
        }
      break;
      case 'audio': //音频文件
        if(!RegExp('\\w\\.('+ (exts || 'mp3|wav|mid') +')$', 'i').test(escape(value))){
          that.msg('选择的音频中包含不支持的格式');
          return elemFile.value = '';
        }
      break;
      default: //图片文件
        layui.each(value, function(i, item){
          if(!RegExp('\\w\\.('+ (exts || 'jpg|png|gif|bmp|jpeg$') +')', 'i').test(escape(item))){
            check = true;
          }
        });
        if(check){
          that.msg('选择的图片中包含不支持的格式');
          return elemFile.value = '';
        }
      break;
    }
    
    //检验文件数量
    that.fileLength = function(){
      var length = 0
      ,items = files || that.files || that.chooseFiles || elemFile.files;
      layui.each(items, function(){
        length++;
      });
      return length;
    }();
    if(options.number && that.fileLength > options.number){
      return that.msg('同时最多只能上传的数量为：'+ options.number);
    }
    
    //检验文件大小
    if(options.size > 0 && !(device.ie && device.ie < 10)){
      var limitSize;
      
      layui.each(that.chooseFiles, function(index, file){
        if(file.size > 1024*options.size){
          var size = options.size/1024;
          size = size >= 1 ? (size.toFixed(2) + 'MB') : options.size + 'KB'
          elemFile.value = '';
          limitSize = size;
        }
      });
      if(limitSize) return that.msg('文件不能超过'+ limitSize);
    }
    send();
  };
  
  //重置方法
  Class.prototype.reload = function(options){
    options = options || {};
    delete options.elem;
    delete options.bindAction;
    
    var that = this
    ,options = that.config = $.extend({}, that.config, upload.config, options)
    ,next = options.elem.next();
    
    //更新文件域相关属性
    next.attr({
      name: options.name
      ,accept: options.acceptMime
      ,multiple: options.multiple
    });
  };
  
  //事件处理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    
    //设置当前选择的文件队列
    ,setChooseFile = function(files){
      that.chooseFiles = {};
      layui.each(files, function(i, item){
        var time = new Date().getTime();
        that.chooseFiles[time + '-' + i] = item;
      });
    }
    
    //设置选择的文本
    ,setChooseText = function(files, filename){
      var elemFile = that.elemFile
      ,value = files.length > 1 
        ? files.length + '个文件' 
      : ((files[0] || {}).name || (elemFile[0].value.match(/[^\/\\]+\..+/g)||[]) || '');
      
      if(elemFile.next().hasClass(ELEM_CHOOSE)){
        elemFile.next().remove();
      }
      that.upload(null, 'choose');
      if(that.isFile() || options.choose) return;
      elemFile.after('<span class="layui-inline '+ ELEM_CHOOSE +'">'+ value +'</span>');
    };

    //点击上传容器
    options.elem.off('upload.start').on('upload.start', function(){
      var othis = $(this), data = othis.attr('lay-data');
      
      if(data){
        try{
          data = new Function('return '+ data)();
          that.config = $.extend({}, options, data);
        } catch(e){
          hint.error('Upload element property lay-data configuration item has a syntax error: ' + data)
        }
      }
      
      that.config.item = othis;
      that.elemFile[0].click();
    });
    
    //拖拽上传
    if(!(device.ie && device.ie < 10)){
      options.elem.off('upload.over').on('upload.over', function(){
        var othis = $(this)
        othis.attr('lay-over', '');
      })
      .off('upload.leave').on('upload.leave', function(){
        var othis = $(this)
        othis.removeAttr('lay-over');
      })
      .off('upload.drop').on('upload.drop', function(e, param){
        var othis = $(this), files = param.originalEvent.dataTransfer.files || [];
        
        othis.removeAttr('lay-over');
        setChooseFile(files);
        
        if(options.auto){
          that.upload(files);
        } else {
          setChooseText(files);
        }
      });
    }
    
    //文件选择
    that.elemFile.off('upload.change').on('upload.change', function(){
      var files = this.files || [];
      setChooseFile(files);
      options.auto ? that.upload() : setChooseText(files); //是否自动触发上传
    });
    
    //手动触发上传
    options.bindAction.off('upload.action').on('upload.action', function(){
      that.upload();
    });
    
    //防止事件重复绑定
    if(options.elem.data('haveEvents')) return;
    
    that.elemFile.on('change', function(){
      $(this).trigger('upload.change');
    });
    
    options.elem.on('click', function(){
      if(that.isFile()) return;
      $(this).trigger('upload.start');
    });
    
    if(options.drag){
      options.elem.on('dragover', function(e){
        e.preventDefault();
        $(this).trigger('upload.over');
      }).on('dragleave', function(e){
        $(this).trigger('upload.leave');
      }).on('drop', function(e){
        e.preventDefault();
        $(this).trigger('upload.drop', e);
      });
    }
    
    options.bindAction.on('click', function(){
      $(this).trigger('upload.action');
    });
    
    options.elem.data('haveEvents', true);
  };
  
  //核心入口  
  upload.render = function(options){
    var inst = new Class(options);
    return thisUpload.call(inst);
  };
  
  exports(MOD_NAME, upload);
});

/**
 
 @Name：dropdown 下拉菜单组件
 @License：MIT

 */

layui.define(['jquery', 'laytpl', 'lay'], function(exports){
  "use strict";
  
  var $ = layui.$
  ,laytpl = layui.laytpl
  ,hint = layui.hint()
  ,device = layui.device()
  ,clickOrMousedown = (device.mobile ? 'click' : 'mousedown')
  
  //模块名
  ,MOD_NAME = 'dropdown'
  ,MOD_INDEX = 'layui_'+ MOD_NAME +'_index' //模块索引名

  //外部接口
  ,dropdown = {
    config: {}
    ,index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作当前实例
  ,thisModule = function(){
    var that = this
    ,options = that.config
    ,id = options.id;

    thisModule.that[id] = that; //记录当前实例对象

    return {
      config: options
      //重置实例
      ,reload: function(options){
        that.reload.call(that, options);
      }
    }
  }

  //字符常量
  ,STR_ELEM = 'layui-dropdown', STR_HIDE = 'layui-hide', STR_DISABLED = 'layui-disabled', STR_NONE = 'layui-none'
  ,STR_ITEM_UP = 'layui-menu-item-up', STR_ITEM_DOWN = 'layui-menu-item-down', STR_MENU_TITLE = 'layui-menu-body-title', STR_ITEM_GROUP = 'layui-menu-item-group', STR_ITEM_PARENT = 'layui-menu-item-parent', STR_ITEM_DIV = 'layui-menu-item-divider', STR_ITEM_CHECKED = 'layui-menu-item-checked', STR_ITEM_CHECKED2 = 'layui-menu-item-checked2', STR_MENU_PANEL = 'layui-menu-body-panel', STR_MENU_PANEL_L = 'layui-menu-body-panel-left'
  
  ,STR_GROUP_TITLE = '.'+ STR_ITEM_GROUP + '>.'+ STR_MENU_TITLE

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++dropdown.index;
    that.config = $.extend({}, that.config, dropdown.config, options);
    that.init();
  };

  //默认配置
  Class.prototype.config = {
    trigger: 'click' //事件类型
    ,content: '' //自定义菜单内容
    ,className: '' //自定义样式类名
    ,style: '' //设置面板 style 属性
    ,show: false //是否初始即显示菜单面板
    ,isAllowSpread: true //是否允许菜单组展开收缩
    ,isSpreadItem: true //是否初始展开子菜单
    ,data: [] //菜单数据结构
    ,delay: 300 //延迟关闭的毫秒数，若 trigger 为 hover 时才生效
  };
  
  //重载实例
  Class.prototype.reload = function(options){
    var that = this;
    that.config = $.extend({}, that.config, options);
    that.init(true);
  };

  //初始化准备
  Class.prototype.init = function(rerender){
    var that = this
    ,options = that.config
    ,elem = options.elem = $(options.elem);
    
    //若 elem 非唯一
    if(elem.length > 1){
      layui.each(elem, function(){
        dropdown.render($.extend({}, options, {
          elem: this
        }));
      });
      return that;
    }

    //若重复执行 render，则视为 reload 处理
    if(!rerender && elem[0] && elem.data(MOD_INDEX)){;
      var newThat = thisModule.getThis(elem.data(MOD_INDEX));
      if(!newThat) return;

      return newThat.reload(options);
    };
    
    //初始化 id 参数
    options.id = ('id' in options) ? options.id : that.index;
    
    if(options.show) that.render(rerender); //初始即显示
    that.events(); //事件
  };
  
  //渲染
  Class.prototype.render = function(rerender){
    var that = this
    ,options = that.config
    ,elemBody = $('body')
    
    //默认菜单内容
    ,getDefaultView = function(){
      var elemUl = $('<ul class="layui-menu layui-dropdown-menu"></ul>');
      if(options.data.length > 0 ){
        eachItemView(elemUl, options.data)
      } else {
        elemUl.html('<li class="layui-menu-item-none">no menu</li>');
      }
      return elemUl;
    }
    
    //遍历菜单项
    ,eachItemView = function(views, data){
      //var views = [];
      layui.each(data, function(index, item){
        //是否存在子级
        var isChild = item.child && item.child.length > 0
        ,isSpreadItem = ('isSpreadItem' in item) ? item.isSpreadItem : options.isSpreadItem
        ,title = item.templet 
          ? laytpl(item.templet).render(item) 
        : (options.templet ? laytpl(options.templet).render(item) : item.title)
        
        //初始类型
        ,type = function(){
          if(isChild){
            item.type = item.type || 'parent';
          }
          if(item.type){
            return ({
              group: 'group'
              ,parent: 'parent'
              ,'-': '-'
            })[item.type] || 'parent';
          }
          return '';
        }();

        if(type !== '-' && (!item.title && !item.id && !isChild)) return;
        
        //列表元素
        var viewLi = $(['<li'+ function(){
          var className = {
            group: 'layui-menu-item-group'+ (
              options.isAllowSpread ? (
                isSpreadItem ? ' layui-menu-item-down' : ' layui-menu-item-up'
              ) : ''
            )
            ,parent: STR_ITEM_PARENT
            ,'-': 'layui-menu-item-divider'
          };
          if(isChild || type){
            return ' class="'+ className[type] +'"';
          }
          return '';
        }() +'>'
        
          //标题区
          ,function(){
            //是否超文本
            var viewText = ('href' in item) ? (
              '<a href="'+ item.href +'" target="'+ (item.target || '_self') +'">'+ title +'</a>'
            ) : title;
            
            //是否存在子级
            if(isChild){
              return '<div class="'+ STR_MENU_TITLE +'">'+ viewText + function(){
                if(type === 'parent'){
                  return '<i class="layui-icon layui-icon-right"></i>';
                } else if(type === 'group' && options.isAllowSpread){
                  return '<i class="layui-icon layui-icon-'+ (isSpreadItem ? 'up' : 'down') +'"></i>';
                } else {
                  return '';
                }
              }() +'</div>'
              
            }
            return '<div class="'+ STR_MENU_TITLE +'">'+ viewText +'</div>';
          }()
        ,'</li>'].join(''));
        
        viewLi.data('item', item);
        
        //子级区
        if(isChild){
          var elemPanel = $('<div class="layui-panel layui-menu-body-panel"></div>')
          ,elemUl = $('<ul></ul>');

          if(type === 'parent'){
            elemPanel.append(eachItemView(elemUl, item.child));
            viewLi.append(elemPanel);
          } else {
            viewLi.append(eachItemView(elemUl, item.child));
          }
        }

        views.append(viewLi);
      });
      return views;
    }
    
    //主模板
    ,TPL_MAIN = ['<div class="layui-dropdown layui-border-box layui-panel layui-anim layui-anim-downbit">'
    ,'</div>'].join('');
    
    //如果是右键事件，则每次触发事件时，将允许重新渲染
    if(options.trigger === 'contextmenu' || lay.isTopElem(options.elem[0])) rerender = true;
    
    //判断是否已经打开了下拉菜单面板
    if(!rerender && options.elem.data(MOD_INDEX +'_opened')) return;

    //记录模板对象
    that.elemView = $(TPL_MAIN);
    that.elemView.append(options.content || getDefaultView());
    
    //初始化某些属性
    if(options.className) that.elemView.addClass(options.className);
    if(options.style) that.elemView.attr('style', options.style);
    
    
    //记录当前执行的实例索引
    dropdown.thisId = options.id;
    
    //插入视图
    that.remove(); //移除非当前绑定元素的面板
    elemBody.append(that.elemView);
    options.elem.data(MOD_INDEX +'_opened', true);
    
    //坐标定位
    that.position();
    thisModule.prevElem = that.elemView; //记录当前打开的元素，以便在下次关闭
    thisModule.prevElem.data('prevElem', options.elem); //将当前绑定的元素，记录在打开元素的 data 对象中
    
    //阻止全局事件
    that.elemView.find('.layui-menu').on(clickOrMousedown, function(e){
      lay.stope(e);
    });

    //触发菜单列表事件
    that.elemView.find('.layui-menu li').on('click', function(e){
      var othis = $(this)
      ,data = othis.data('item') || {}
      ,isChild = data.child && data.child.length > 0;
      
      if(!isChild && data.type !== '-'){
        that.remove();
        typeof options.click === 'function' && options.click(data, othis);
      }
    });
    
    //触发菜单组展开收缩
    that.elemView.find(STR_GROUP_TITLE).on('click', function(e){
      var othis = $(this)
      ,elemGroup = othis.parent()
      ,data = elemGroup.data('item') || {}
      
      if(data.type === 'group' && options.isAllowSpread){
        thisModule.spread(elemGroup);
      }
    });
    
    //如果是鼠标移入事件，则鼠标移出时自动关闭
    if(options.trigger === 'mouseenter'){
      that.elemView.on('mouseenter', function(){
        clearTimeout(thisModule.timer);
      }).on('mouseleave', function(){
        that.delayRemove();
      });
    }

  };
  
  //位置定位
  Class.prototype.position = function(obj){
    var that = this
    ,options = that.config;
    
    lay.position(options.elem[0], that.elemView[0], {
      position: options.position
      ,e: that.e
      ,clickType: options.trigger === 'contextmenu' ? 'right' : null
    });
  };
  
  //删除视图
  Class.prototype.remove = function(){
    var that = this
    ,options = that.config
    ,elemPrev = thisModule.prevElem;
    
    //若存在已打开的面板元素，则移除
    if(elemPrev){
      elemPrev.data('prevElem') && (
        elemPrev.data('prevElem').data(MOD_INDEX +'_opened', false)
      );
      elemPrev.remove();
    }
  };
  
  //延迟删除视图
  Class.prototype.delayRemove = function(){
    var that = this
    ,options = that.config;
    clearTimeout(thisModule.timer);

    thisModule.timer = setTimeout(function(){
      that.remove();
    }, options.delay);
  };
  
  //事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;
    
    //如果传入 hover，则解析为 mouseenter
    if(options.trigger === 'hover') options.trigger = 'mouseenter';

    //解除上一个事件
    if(that.prevElem) that.prevElem.off(options.trigger, that.prevElemCallback);
    
    //记录被绑定的元素及回调
    that.prevElem = options.elem;
    that.prevElemCallback = function(e){
      clearTimeout(thisModule.timer);
      that.e = e;
      that.render();
      e.preventDefault();
      
      //组件打开完毕的时间
      typeof options.ready === 'function' && options.ready(that.elemView, options.elem, that.e.target);
    };

    //触发元素事件
    options.elem.on(options.trigger, that.prevElemCallback);
    
    //如果是鼠标移入事件
    if(options.trigger === 'mouseenter'){
      //直行鼠标移出事件
      options.elem.on('mouseleave', function(){
        that.delayRemove();
      });
    }
  };
  
  //记录所有实例
  thisModule.that = {}; //记录所有实例对象
  
  //获取当前实例对象
  thisModule.getThis = function(id){
    var that = thisModule.that[id];
    if(!that) hint.error(id ? (MOD_NAME +' instance with ID \''+ id +'\' not found') : 'ID argument required');
    return that;
  };
  
  //设置菜单组展开和收缩状态
  thisModule.spread = function(othis){
    //菜单组展开和收缩
    var elemIcon = othis.children('.'+ STR_MENU_TITLE).find('.layui-icon');
    if(othis.hasClass(STR_ITEM_UP)){
      othis.removeClass(STR_ITEM_UP).addClass(STR_ITEM_DOWN);
      elemIcon.removeClass('layui-icon-down').addClass('layui-icon-up');
    } else {
      othis.removeClass(STR_ITEM_DOWN).addClass(STR_ITEM_UP);
      elemIcon.removeClass('layui-icon-up').addClass('layui-icon-down')
    }
  };
  
  //全局事件
  ;!function(){
    var _WIN = $(window)
    ,_DOC = $(document);
    
    //自适应定位
    _WIN.on('resize', function(){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId);
      if(!that) return;
      
      if(!that.elemView[0] || !$('.'+ STR_ELEM)[0]){
        return false;
      }
      
      var options = that.config;
      
      if(options.trigger === 'contextmenu'){
        that.remove();
      } else {
        that.position();
      }
    });
    
    
      
    //点击任意处关闭
    _DOC.on(clickOrMousedown, function(e){
      if(!dropdown.thisId) return;
      var that = thisModule.getThis(dropdown.thisId)
      if(!that) return;
      
      var options = that.config;
      
      //如果触发的是绑定的元素，或者属于绑定元素的子元素，则不关闭
      //满足条件：当前绑定的元素不是 body document，或者不是鼠标右键事件
      if(!(lay.isTopElem(options.elem[0]) || options.trigger === 'contextmenu')){
        if(
          e.target === options.elem[0] || 
          options.elem.find(e.target)[0] ||
          e.target === that.elemView[0] ||
          (that.elemView && that.elemView.find(e.target)[0])
        ) return;
      }
      
      that.remove();
    });
    
    //基础菜单的静态元素事件
    var ELEM_LI = '.layui-menu:not(.layui-dropdown-menu) li';
    _DOC.on('click', ELEM_LI, function(e){
      var othis = $(this)
      ,parent = othis.parents('.layui-menu').eq(0)
      ,isChild = othis.hasClass(STR_ITEM_GROUP) || othis.hasClass(STR_ITEM_PARENT)
      ,filter = parent.attr('lay-filter') || parent.attr('id')
      ,options = lay.options(this);
      
      //非触发元素
      if(othis.hasClass(STR_ITEM_DIV)) return;

      //非菜单组
      if(!isChild){
        //选中
        parent.find('.'+ STR_ITEM_CHECKED).removeClass(STR_ITEM_CHECKED); //清除选中样式
        parent.find('.'+ STR_ITEM_CHECKED2).removeClass(STR_ITEM_CHECKED2); //清除父级菜单选中样式
        othis.addClass(STR_ITEM_CHECKED); //添加选中样式
        othis.parents('.'+ STR_ITEM_PARENT).addClass(STR_ITEM_CHECKED2); //添加父级菜单选中样式
        
        //触发事件
        layui.event.call(this, MOD_NAME, 'click('+ filter +')', options);
      }
    });
    
    //基础菜单的展开收缩事件
    _DOC.on('click', (ELEM_LI + STR_GROUP_TITLE), function(e){
      var othis = $(this)
      ,elemGroup = othis.parents('.'+ STR_ITEM_GROUP +':eq(0)')
      ,options = lay.options(elemGroup[0]);

      if(('isAllowSpread' in options) ? options.isAllowSpread : true){
        thisModule.spread(elemGroup);
      };
    });
    
    //判断子级菜单是否超出屏幕
    var ELEM_LI_PAR = '.layui-menu .'+ STR_ITEM_PARENT
    _DOC.on('mouseenter', ELEM_LI_PAR, function(e){
      var othis = $(this)
      ,elemPanel = othis.find('.'+ STR_MENU_PANEL);

      if(!elemPanel[0]) return;
      var rect = elemPanel[0].getBoundingClientRect();
      
      //是否超出右侧屏幕
      if(rect.right > _WIN.width()){
        elemPanel.addClass(STR_MENU_PANEL_L);
        //不允许超出左侧屏幕
        rect = elemPanel[0].getBoundingClientRect();
        if(rect.left < 0){
          elemPanel.removeClass(STR_MENU_PANEL_L);
        }
      }
      
      //是否超出底部屏幕
      if(rect.bottom > _WIN.height()){
        elemPanel.eq(0).css('margin-top', -(rect.bottom - _WIN.height()));
      };
    }).on('mouseleave', ELEM_LI_PAR, function(e){
      var othis = $(this)
      ,elemPanel = othis.children('.'+ STR_MENU_PANEL);
      
      elemPanel.removeClass(STR_MENU_PANEL_L);
      elemPanel.css('margin-top', 0);
    });
    
  }();
  
  //重载实例
  dropdown.reload = function(id, options){
    var that = thisModule.getThis(id);
    if(!that) return this;

    that.reload(options);
    return thisModule.call(that);
  };

  //核心入口
  dropdown.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, dropdown);
});
/**

 @Title: slider 滑块组件
 @License：MIT

 */

layui.define('jquery', function(exports){
  "use strict";
  var $ = layui.jquery

  //外部接口
  ,slider = {
    config: {}
    ,index: layui.slider ? (layui.slider.index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }
  
  //操作当前实例
  ,thisSlider = function(){
    var that = this
    ,options = that.config;

    return {
      setValue: function(value, index){ //设置值
        options.value = value;
        return that.slide('set', value, index || 0);
      }
      ,config: options
    }
  }

  //字符常量
  ,MOD_NAME = 'slider', DISABLED = 'layui-disabled', ELEM_VIEW = 'layui-slider', SLIDER_BAR = 'layui-slider-bar', SLIDER_WRAP = 'layui-slider-wrap', SLIDER_WRAP_BTN = 'layui-slider-wrap-btn', SLIDER_TIPS = 'layui-slider-tips', SLIDER_INPUT = 'layui-slider-input', SLIDER_INPUT_TXT = 'layui-slider-input-txt', SLIDER_INPUT_BTN = 'layui-slider-input-btn', ELEM_HOVER = 'layui-slider-hover'

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++slider.index;
    that.config = $.extend({}, that.config, slider.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    type: 'default' //滑块类型，垂直：vertical
    ,min: 0 //最小值
    ,max: 100 //最大值，默认100
    ,value: 0 //初始值，默认为0
    ,step: 1 //间隔值
    ,showstep: false //间隔点开启
    ,tips: true //文字提示，开启
    ,input: false //输入框，关闭
    ,range: false //范围选择，与输入框不能同时开启，默认关闭
    ,height: 200 //配合 type:"vertical" 使用，默认200px
    ,disabled: false //滑块禁用，默认关闭
    ,theme: '#009688' //主题颜色
  };

  //滑块渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;
    
    //间隔值不能小于 1
    if(options.step < 1) options.step = 1;
    
    //最大值不能小于最小值
    if(options.max < options.min) options.max = options.min + options.step;
    
    

    //判断是否开启双滑块
    if(options.range){
      options.value = typeof(options.value) == 'object' ? options.value : [options.min, options.value];
      var minValue = Math.min(options.value[0], options.value[1])
      ,maxValue = Math.max(options.value[0], options.value[1]);
      options.value[0] = minValue > options.min ? minValue : options.min;
      options.value[1] = maxValue > options.min ? maxValue : options.min;
      options.value[0] = options.value[0] > options.max ? options.max : options.value[0];
      options.value[1] = options.value[1] > options.max ? options.max : options.value[1];
      
      var scaleFir = Math.floor((options.value[0] - options.min) / (options.max - options.min) * 100)
      ,scaleSec = Math.floor((options.value[1] - options.min) / (options.max - options.min) * 100)
      ,scale = scaleSec - scaleFir + '%';
      scaleFir = scaleFir + '%';
      scaleSec = scaleSec + '%';
    } else {
      //如果初始值是一个数组，则获取数组的最小值
      if(typeof options.value == 'object'){
        options.value = Math.min.apply(null, options.value);
      }
      
      //初始值不能小于最小值且不能大于最大值
      if(options.value < options.min) options.value = options.min;
      if(options.value > options.max) options.value = options.max;

      var scale = Math.floor((options.value - options.min) / (options.max - options.min) * 100) + '%';
    };
    

    //如果禁用，颜色为统一的灰色
    var theme = options.disabled ? '#c2c2c2' : options.theme;

    //滑块
    var temp = '<div class="layui-slider '+ (options.type === 'vertical' ? 'layui-slider-vertical' : '') +'">'+ (options.tips ? '<div class="layui-slider-tips"></div>' : '') + 
    '<div class="layui-slider-bar" style="background:'+ theme +'; '+ (options.type === 'vertical' ? 'height' : 'width') +':'+ scale +';'+ (options.type === 'vertical' ? 'bottom' : 'left') +':'+ (scaleFir || 0) +';"></div><div class="layui-slider-wrap" style="'+ (options.type === 'vertical' ? 'bottom' : 'left') +':'+ (scaleFir || scale) +';">' +
    '<div class="layui-slider-wrap-btn" style="border: 2px solid '+ theme +';"></div></div>'+ (options.range ? '<div class="layui-slider-wrap" style="'+ (options.type === 'vertical' ? 'bottom' : 'left') +':'+ scaleSec +';"><div class="layui-slider-wrap-btn" style="border: 2px solid '+ theme +';"></div></div>' : '') +'</div>';

    var othis = $(options.elem)
    ,hasRender = othis.next('.' + ELEM_VIEW);
    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender  
    that.elemTemp = $(temp);

    //把数据缓存到滑块上
    if(options.range){
      that.elemTemp.find('.' + SLIDER_WRAP).eq(0).data('value', options.value[0]);
      that.elemTemp.find('.' + SLIDER_WRAP).eq(1).data('value', options.value[1]); 
    }else{
      that.elemTemp.find('.' + SLIDER_WRAP).data('value', options.value);
    };
    
    //插入替代元素
    othis.html(that.elemTemp); 

    //垂直滑块
    if(options.type === 'vertical'){
      that.elemTemp.height(options.height + 'px');
    };

    //显示间断点
    if(options.showstep){
      var number = (options.max - options.min) / options.step, item = '';
      for(var i = 1; i < number + 1; i++) {
        var step = i * 100 / number;
        if(step < 100){
          item += '<div class="layui-slider-step" style="'+ (options.type === 'vertical' ? 'bottom' : 'left') +':'+ step +'%"></div>'
        }
      };
      that.elemTemp.append(item);
    };

    //插入输入框
    if(options.input && !options.range){
      var elemInput = $('<div class="layui-slider-input layui-input"><div class="layui-slider-input-txt"><input type="text" class="layui-input"></div><div class="layui-slider-input-btn"><i class="layui-icon layui-icon-up"></i><i class="layui-icon layui-icon-down"></i></div></div>');
      othis.css("position","relative");
      othis.append(elemInput);
      othis.find('.' + SLIDER_INPUT_TXT).children('input').val(options.value);
      if(options.type === 'vertical'){
        elemInput.css({
          left: 0
          ,top: -48
        });
      } else {
        that.elemTemp.css("margin-right", elemInput.outerWidth() + 15);
      }
    };  

    //给未禁止的滑块滑动事件
    if(!options.disabled){
      that.slide();
    }else{
      that.elemTemp.addClass(DISABLED);
      that.elemTemp.find('.' + SLIDER_WRAP_BTN).addClass(DISABLED);
    };

    //划过滑块显示数值
    that.elemTemp.find('.' + SLIDER_WRAP_BTN).on('mouseover', function(){
      var sliderWidth = options.type === 'vertical' ? options.height : that.elemTemp[0].offsetWidth
      ,sliderWrap = that.elemTemp.find('.' + SLIDER_WRAP)
      ,tipsLeft = options.type === 'vertical' ? (sliderWidth - $(this).parent()[0].offsetTop - sliderWrap.height()) : $(this).parent()[0].offsetLeft
      ,left = tipsLeft / sliderWidth * 100
      ,value = $(this).parent().data('value')
      ,tipsTxt = options.setTips ? options.setTips(value) : value;
      that.elemTemp.find('.' + SLIDER_TIPS).html(tipsTxt);
      if(options.type === 'vertical'){
        that.elemTemp.find('.' + SLIDER_TIPS).css({"bottom":left + '%', "margin-bottom":"20px", "display":"inline-block"});
      }else{
        that.elemTemp.find('.' + SLIDER_TIPS).css({"left":left + '%', "display":"inline-block"});
      };
    }).on('mouseout', function(){
      that.elemTemp.find('.' + SLIDER_TIPS).css("display", "none");
    }); 
  };

  //滑块滑动
  Class.prototype.slide = function(setValue, value, i){
    var that = this
    ,options = that.config
    ,sliderAct = that.elemTemp
    ,sliderWidth = function(){
      return options.type === 'vertical' ? options.height : sliderAct[0].offsetWidth
    }
    ,sliderWrap = sliderAct.find('.' + SLIDER_WRAP)
    ,sliderTxt = sliderAct.next('.' + SLIDER_INPUT)
    ,inputValue = sliderTxt.children('.' + SLIDER_INPUT_TXT).children('input').val()
    ,step = 100 / ((options.max - options.min) / Math.ceil(options.step))
    ,change = function(offsetValue, index){
      if(Math.ceil(offsetValue) * step > 100){
        offsetValue = Math.ceil(offsetValue) * step
      }else{
        offsetValue = Math.round(offsetValue) * step
      };
      offsetValue = offsetValue > 100 ? 100: offsetValue;
      sliderWrap.eq(index).css((options.type === 'vertical' ?'bottom':'left'), offsetValue + '%');
      var firLeft = valueTo(sliderWrap[0].offsetLeft)
      ,secLeft = options.range ? valueTo(sliderWrap[1].offsetLeft) : 0;
      if(options.type === 'vertical'){
        sliderAct.find('.' + SLIDER_TIPS).css({"bottom":offsetValue + '%', "margin-bottom":"20px"});
        firLeft = valueTo(sliderWidth() - sliderWrap[0].offsetTop - sliderWrap.height());
        secLeft = options.range ? valueTo(sliderWidth() - sliderWrap[1].offsetTop - sliderWrap.height()) : 0;
      }else{
        sliderAct.find('.' + SLIDER_TIPS).css("left",offsetValue + '%');
      };
      firLeft = firLeft > 100 ? 100: firLeft;
      secLeft = secLeft > 100 ? 100: secLeft;
      var minLeft = Math.min(firLeft, secLeft)
      ,wrapWidth = Math.abs(firLeft - secLeft);
      if(options.type === 'vertical'){
        sliderAct.find('.' + SLIDER_BAR).css({"height":wrapWidth + '%', "bottom":minLeft + '%'});
      }else{
        sliderAct.find('.' + SLIDER_BAR).css({"width":wrapWidth + '%', "left":minLeft + '%'});
      };
      var selfValue = options.min + Math.round((options.max - options.min) * offsetValue / 100);
      inputValue = selfValue;
      sliderTxt.children('.' + SLIDER_INPUT_TXT).children('input').val(inputValue);
      sliderWrap.eq(index).data('value', selfValue);
      sliderAct.find('.' + SLIDER_TIPS).html(options.setTips ? options.setTips(selfValue) : selfValue);
      
      //如果开启范围选择，则返回数组值
      if(options.range){
        var arrValue = [
          sliderWrap.eq(0).data('value')
          ,sliderWrap.eq(1).data('value')
        ];
        if(arrValue[0] > arrValue[1]) arrValue.reverse(); //如果前面的圆点超过了后面的圆点值，则调换顺序
      }
      
       //回调
      options.change && options.change(options.range ? arrValue : selfValue);
    }
    ,valueTo = function(value){
      var oldLeft = value / sliderWidth() * 100 / step
      ,left =  Math.round(oldLeft) * step;
      if(value == sliderWidth()){
        left =  Math.ceil(oldLeft) * step;
      };
      return left;
    }
    
    //拖拽元素
    ,elemMove = $(['<div class="layui-auxiliar-moving" id="LAY-slider-moving"></div'].join(''))
    ,createMoveElem = function(move, up){
      var upCall = function(){
        up && up();
        elemMove.remove();
      };
      $('#LAY-slider-moving')[0] || $('body').append(elemMove);
      elemMove.on('mousemove', move);
      elemMove.on('mouseup', upCall).on('mouseleave', upCall);
    };
    
    //动态赋值
    if(setValue === 'set') return change(value, i);

    //滑块滑动
    sliderAct.find('.' + SLIDER_WRAP_BTN).each(function(index){
      var othis = $(this);
      othis.on('mousedown', function(e){
        e = e || window.event;
        
        var oldleft = othis.parent()[0].offsetLeft
        ,oldx = e.clientX;
        if(options.type === 'vertical'){
          oldleft = sliderWidth() - othis.parent()[0].offsetTop - sliderWrap.height()
          oldx = e.clientY;
        };
        
        var move = function(e){
          e = e || window.event;
          var left = oldleft + (options.type === 'vertical' ? (oldx - e.clientY) : (e.clientX - oldx));
          if(left < 0)left = 0;
          if(left > sliderWidth())left = sliderWidth();
          var reaLeft = left / sliderWidth() * 100 / step;
          change(reaLeft, index);
          othis.addClass(ELEM_HOVER);
          sliderAct.find('.' + SLIDER_TIPS).show();
          e.preventDefault();
        };
        
        var up = function(){
          othis.removeClass(ELEM_HOVER);
          sliderAct.find('.' + SLIDER_TIPS).hide();
        };
        
        createMoveElem(move, up)
      });
    });
    
    //点击滑块
    sliderAct.on('click', function(e){
      var main = $('.' + SLIDER_WRAP_BTN);
      if(!main.is(event.target) && main.has(event.target).length === 0 && main.length){
        var left = options.type === 'vertical' ? (sliderWidth() - e.clientY + $(this).offset().top):(e.clientX - $(this).offset().left), index;
        if(left < 0)left = 0;
        if(left > sliderWidth())left = sliderWidth();
        var reaLeft = left / sliderWidth() * 100 / step;
        if(options.range){
          if(options.type === 'vertical'){
            index = Math.abs(left - parseInt($(sliderWrap[0]).css('bottom'))) > Math.abs(left -  parseInt($(sliderWrap[1]).css('bottom'))) ? 1 : 0;
          }else{
            index = Math.abs(left - sliderWrap[0].offsetLeft) > Math.abs(left - sliderWrap[1].offsetLeft) ? 1 : 0;
          }
        }else{
          index = 0;
        };
        change(reaLeft, index);
        e.preventDefault();
      }
    });
    
    //点击加减输入框
    sliderTxt.children('.' + SLIDER_INPUT_BTN).children('i').each(function(index){
      $(this).on('click', function(){
        inputValue = sliderTxt.children('.' + SLIDER_INPUT_TXT).children('input').val();
        if(index == 1){ //减
          inputValue = inputValue - options.step < options.min 
            ? options.min 
          : Number(inputValue) - options.step;
        }else{
          inputValue = Number(inputValue) + options.step > options.max 
            ? options.max 
          : Number(inputValue) + options.step;
        };
        var inputScale =  (inputValue - options.min) / (options.max - options.min) * 100 / step;
        change(inputScale, 0);
      });
    });
    
    //获取输入框值
    var getInputValue = function(){
      var realValue = this.value;
      realValue = isNaN(realValue) ? 0 : realValue;
      realValue = realValue < options.min ? options.min : realValue;
      realValue = realValue > options.max ? options.max : realValue;
      this.value = realValue;
      var inputScale =  (realValue - options.min) / (options.max - options.min) * 100 / step;
      change(inputScale, 0);
    };
    sliderTxt.children('.' + SLIDER_INPUT_TXT).children('input').on('keydown', function(e){
      if(e.keyCode === 13){
        e.preventDefault();
        getInputValue.call(this);
      }
    }).on('change', getInputValue);     
  };

  //事件处理
  Class.prototype.events = function(){
     var that = this
    ,options = that.config;
  };

  //核心入口
  slider.render = function(options){
    var inst = new Class(options); 
    return thisSlider.call(inst);
  };
  
  exports(MOD_NAME, slider);
})/**

 @Title: colorpicker 颜色选择器组件
 @License：MIT

 */

layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.jquery

  //外部接口
  ,colorpicker = {
    config: {}
    ,index: layui.colorpicker ? (layui.colorpicker.index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, 'colorpicker', events, callback);
    }
  }
  
  //操作当前实例
  ,thisColorPicker = function(){
    var that = this
    ,options = that.config;

    return {
      config: options
    }
  }

  //字符常量
  ,MOD_NAME = 'colorpicker', SHOW = 'layui-show', THIS = 'layui-this', ELEM = 'layui-colorpicker'
  
  ,ELEM_MAIN = '.layui-colorpicker-main', ICON_PICKER_DOWN = 'layui-icon-down', ICON_PICKER_CLOSE = 'layui-icon-close'
  ,PICKER_TRIG_SPAN = 'layui-colorpicker-trigger-span', PICKER_TRIG_I = 'layui-colorpicker-trigger-i', PICKER_SIDE = 'layui-colorpicker-side', PICKER_SIDE_SLIDER = 'layui-colorpicker-side-slider'
  ,PICKER_BASIS = 'layui-colorpicker-basis', PICKER_ALPHA_BG = 'layui-colorpicker-alpha-bgcolor', PICKER_ALPHA_SLIDER = 'layui-colorpicker-alpha-slider', PICKER_BASIS_CUR = 'layui-colorpicker-basis-cursor', PICKER_INPUT = 'layui-colorpicker-main-input'

  //RGB转HSB
  ,RGBToHSB = function(rgb){
    var hsb = {h:0, s:0, b:0};
    var min = Math.min(rgb.r, rgb.g, rgb.b);
    var max = Math.max(rgb.r, rgb.g, rgb.b);
    var delta = max - min;
    hsb.b = max;
    hsb.s = max != 0 ? 255*delta/max : 0;
    if(hsb.s != 0){
      if(rgb.r == max){
        hsb.h = (rgb.g - rgb.b) / delta;
      }else if(rgb.g == max){
        hsb.h = 2 + (rgb.b - rgb.r) / delta;
      }else{
        hsb.h = 4 + (rgb.r - rgb.g) / delta;
      }
    }else{
      hsb.h = -1;
    };
    if(max == min){ 
      hsb.h = 0;
    };
    hsb.h *= 60;
    if(hsb.h < 0) {
      hsb.h += 360;
    };
    hsb.s *= 100/255;
    hsb.b *= 100/255;
    return hsb;  
  }

  //HEX转HSB
  ,HEXToHSB = function(hex){
    var hex = hex.indexOf('#') > -1 ? hex.substring(1) : hex;
    if(hex.length == 3){
      var num = hex.split("");
      hex = num[0]+num[0]+num[1]+num[1]+num[2]+num[2]
    };
    hex = parseInt(hex, 16);
    var rgb = {r:hex >> 16, g:(hex & 0x00FF00) >> 8, b:(hex & 0x0000FF)};
    return RGBToHSB(rgb);
  }

  //HSB转RGB
  ,HSBToRGB = function(hsb){
    var rgb = {};
    var h = hsb.h;
    var s = hsb.s*255/100;
    var b = hsb.b*255/100;
    if(s == 0){
      rgb.r = rgb.g = rgb.b = b;
    }else{
      var t1 = b;
      var t2 = (255 - s) * b /255;
      var t3 = (t1 - t2) * (h % 60) /60;
      if(h == 360) h = 0;
      if(h < 60) {rgb.r=t1; rgb.b=t2; rgb.g=t2+t3}
      else if(h < 120) {rgb.g=t1; rgb.b=t2; rgb.r=t1-t3}
      else if(h < 180) {rgb.g=t1; rgb.r=t2; rgb.b=t2+t3}
      else if(h < 240) {rgb.b=t1; rgb.r=t2; rgb.g=t1-t3}
      else if(h < 300) {rgb.b=t1; rgb.g=t2; rgb.r=t2+t3}
      else if(h < 360) {rgb.r=t1; rgb.g=t2; rgb.b=t1-t3}
      else {rgb.r=0; rgb.g=0; rgb.b=0}
    }
    return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
  }

  //HSB转HEX
  ,HSBToHEX = function(hsb){
    var rgb = HSBToRGB(hsb);
    var hex = [
      rgb.r.toString(16)
      ,rgb.g.toString(16)
      ,rgb.b.toString(16)
    ];
    $.each(hex, function(nr, val){
      if(val.length == 1){
        hex[nr] = '0' + val;
      }
    });
    return hex.join('');
  }

  //转化成所需rgb格式
  ,RGBSTo = function(rgbs){
    var regexp = /[0-9]{1,3}/g;
    var re = rgbs.match(regexp) || [];
    return {r:re[0], g:re[1], b:re[2]};
  }
  
  ,$win = $(window)
  ,$doc = $(document)
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++colorpicker.index;
    that.config = $.extend({}, that.config, colorpicker.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    color: ''  //默认颜色，默认没有
    ,size: null  //选择器大小
    ,alpha: false  //是否开启透明度
    ,format: 'hex'  //颜色显示/输入格式，可选 rgb,hex
    ,predefine: false //预定义颜色是否开启
    ,colors: [ //默认预定义颜色列表
      '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00','#ffd700'
      ,'#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'
    ]
  };

  //初始颜色选择框
  Class.prototype.render = function(){
    var that = this
    ,options = that.config
    
    //颜色选择框对象
    ,elemColorBox = $(['<div class="layui-unselect layui-colorpicker">'
      ,'<span '+ (options.format == 'rgb' && options.alpha
          ? 'class="layui-colorpicker-trigger-bgcolor"'
        : '') +'>'
        ,'<span class="layui-colorpicker-trigger-span" '
          ,'lay-type="'+ (options.format == 'rgb' ? (options.alpha ? 'rgba' : 'torgb') : '') +'" '
          ,'style="'+ function(){
            var bgstr = '';
            if(options.color){
              bgstr = options.color;
              
              if((options.color.match(/[0-9]{1,3}/g) || []).length > 3){ //需要优化
                if(!(options.alpha && options.format == 'rgb')){
                  bgstr = '#' + HSBToHEX(RGBToHSB(RGBSTo(options.color)))
                }
              }
              
              return 'background: '+ bgstr;
            }
            
            return bgstr;
          }() +'">'
          ,'<i class="layui-icon layui-colorpicker-trigger-i '+ (options.color 
            ? ICON_PICKER_DOWN 
          : ICON_PICKER_CLOSE) +'"></i>'
        ,'</span>'
      ,'</span>'
    ,'</div>'].join(''))

    //初始化颜色选择框
    var othis = $(options.elem);  
    options.size && elemColorBox.addClass('layui-colorpicker-'+ options.size); //初始化颜色选择框尺寸
    
    //插入颜色选择框
    othis.addClass('layui-inline').html(
      that.elemColorBox = elemColorBox
    );
    
    //获取背景色值
    that.color = that.elemColorBox.find('.'+ PICKER_TRIG_SPAN)[0].style.background;
    
    //相关事件
    that.events();
  };

  //渲染颜色选择器
  Class.prototype.renderPicker = function(){
    var that = this
    ,options = that.config
    ,elemColorBox = that.elemColorBox[0]
    
    //颜色选择器对象
    ,elemPicker = that.elemPicker = $(['<div id="layui-colorpicker'+ that.index +'" data-index="'+ that.index +'" class="layui-anim layui-anim-upbit layui-colorpicker-main">'
      //颜色面板
      ,'<div class="layui-colorpicker-main-wrapper">'
        ,'<div class="layui-colorpicker-basis">'
          ,'<div class="layui-colorpicker-basis-white"></div>'
          ,'<div class="layui-colorpicker-basis-black"></div>'
          ,'<div class="layui-colorpicker-basis-cursor"></div>'
        ,'</div>'
        ,'<div class="layui-colorpicker-side">'
          ,'<div class="layui-colorpicker-side-slider"></div>'
        ,'</div>'
      ,'</div>'
      
      //透明度条块
      ,'<div class="layui-colorpicker-main-alpha '+ (options.alpha ? SHOW : '') +'">'
        ,'<div class="layui-colorpicker-alpha-bgcolor">'
          ,'<div class="layui-colorpicker-alpha-slider"></div>'
        ,'</div>'
      ,'</div>'
      
      //预设颜色列表
      ,function(){
        if(options.predefine){
          var list = ['<div class="layui-colorpicker-main-pre">'];
          layui.each(options.colors, function(i, v){
            list.push(['<div class="layui-colorpicker-pre'+ ((v.match(/[0-9]{1,3}/g) || []).length > 3 
              ? ' layui-colorpicker-pre-isalpha' 
            : '') +'">'
              ,'<div style="background:'+ v +'"></div>'
            ,'</div>'].join(''));
          });
          list.push('</div>');
          return list.join('');
        } else {
          return '';
        }
      }()
      
      //底部表单元素区域
      ,'<div class="layui-colorpicker-main-input">'
        ,'<div class="layui-inline">'
          ,'<input type="text" class="layui-input">'
        ,'</div>'
        ,'<div class="layui-btn-container">'
          ,'<button class="layui-btn layui-btn-primary layui-btn-sm" colorpicker-events="clear">清空</button>'
          ,'<button class="layui-btn layui-btn-sm" colorpicker-events="confirm">确定</button>'
        ,'</div'
      ,'</div>'
    ,'</div>'].join(''))
    
    ,elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)[0];
    
    //如果当前点击的颜色盒子已经存在选择器，则关闭
    if($(ELEM_MAIN)[0] && $(ELEM_MAIN).data('index') == that.index){
      that.removePicker(Class.thisElemInd);
    } else { //插入颜色选择器
      that.removePicker(Class.thisElemInd); 
      $('body').append(elemPicker);
    }
    
    Class.thisElemInd = that.index; //记录最新打开的选择器索引
    Class.thisColor =  elemColorBox.style.background //记录最新打开的选择器颜色选中值
    
    that.position();
    that.pickerEvents();
  };

  //颜色选择器移除
  Class.prototype.removePicker = function(index){
    var that = this
    ,options = that.config;
    $('#layui-colorpicker'+ (index || that.index)).remove();
    return that;
  };
  
  //定位算法
  Class.prototype.position = function(){
    var that = this
    ,options = that.config
    ,elem = that.bindElem || that.elemColorBox[0]
    ,elemPicker = that.elemPicker[0]
    ,rect = elem.getBoundingClientRect() //绑定元素的坐标
    ,elemWidth = elemPicker.offsetWidth //控件的宽度
    ,elemHeight = elemPicker.offsetHeight //控件的高度
    
    //滚动条高度
    ,scrollArea = function(type){
      type = type ? 'scrollLeft' : 'scrollTop';
      return document.body[type] | document.documentElement[type];
    }
    ,winArea = function(type){
      return document.documentElement[type ? 'clientWidth' : 'clientHeight']
    }, margin = 5, left = rect.left, top = rect.bottom;
    
    left = left - (elemWidth - elem.offsetWidth)/2;
    top = top + margin

    //如果右侧超出边界
    if(left + elemWidth + margin > winArea('width')){
      left = winArea('width') - elemWidth - margin;
    } else if(left < margin){ //如果左侧超出边界
      left = margin;
    }
    
    //如果底部超出边界
    if(top + elemHeight + margin > winArea()){
      top = rect.top > elemHeight //顶部是否有足够区域显示完全
        ? rect.top - elemHeight 
      : winArea() - elemHeight;
      top = top - margin*2;
    }
    
    if(options.position){
      elemPicker.style.position = options.position;
    }
    elemPicker.style.left = left + (options.position === 'fixed' ? 0 : scrollArea(1)) + 'px';
    elemPicker.style.top = top + (options.position === 'fixed' ? 0 : scrollArea()) + 'px';
  };

  //颜色选择器赋值
  Class.prototype.val = function(){
    var that = this
    ,options = that.config
    
    ,elemColorBox = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
    ,elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT)
    ,e = elemColorBox[0]
    ,bgcolor = e.style.backgroundColor;
    
    //判断是否有背景颜色
    if(bgcolor){
      
      //转化成hsb格式
      var hsb = RGBToHSB(RGBSTo(bgcolor))
      ,type = elemColorBox.attr('lay-type');
      
      //同步滑块的位置及颜色选择器的选择
      that.select(hsb.h, hsb.s, hsb.b);
      
      //如果格式要求为rgb
      if(type === 'torgb'){
        elemPickerInput.find('input').val(bgcolor);
      };
      
      //如果格式要求为rgba
      if(type === 'rgba'){
        var rgb = RGBSTo(bgcolor);
        
        //如果开启透明度而没有设置，则给默认值
        if((bgcolor.match(/[0-9]{1,3}/g) || []).length == 3){
          elemPickerInput.find('input').val('rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 1)');
          that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", 280);
        } else {
          elemPickerInput.find('input').val(bgcolor);
          var left = bgcolor.slice(bgcolor.lastIndexOf(",") + 1, bgcolor.length - 1) * 280;
          that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", left);
        };
        
        //设置span背景色
        that.elemPicker.find('.'+ PICKER_ALPHA_BG)[0].style.background = 'linear-gradient(to right, rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 0), rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +'))';    
      };

    }else{
      //如果没有背景颜色则默认到最初始的状态
      that.select(0,100,100);
      elemPickerInput.find('input').val("");
      that.elemPicker.find('.'+ PICKER_ALPHA_BG)[0].style.background = '';
      that.elemPicker.find('.'+ PICKER_ALPHA_SLIDER).css("left", 280);
    }
  };

  //颜色选择器滑动 / 点击
  Class.prototype.side = function(){
    var that = this
    ,options = that.config
    
    ,span = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
    ,type = span.attr('lay-type')

    ,side = that.elemPicker.find('.' + PICKER_SIDE)
    ,slider = that.elemPicker.find('.' + PICKER_SIDE_SLIDER)
    ,basis = that.elemPicker.find('.' + PICKER_BASIS)
    ,choose = that.elemPicker.find('.' + PICKER_BASIS_CUR)
    ,alphacolor = that.elemPicker.find('.' + PICKER_ALPHA_BG)
    ,alphaslider = that.elemPicker.find('.' + PICKER_ALPHA_SLIDER)
    
    ,_h = slider[0].offsetTop/180*360
    ,_b = 100 - (choose[0].offsetTop + 3)/180*100
    ,_s = (choose[0].offsetLeft + 3)/260*100
    ,_a = Math.round(alphaslider[0].offsetLeft/280*100)/100    
    
    ,i = that.elemColorBox.find('.' + PICKER_TRIG_I)
    ,pre = that.elemPicker.find('.layui-colorpicker-pre').children('div')

    ,change = function(x,y,z,a){
      that.select(x, y, z);
      var rgb = HSBToRGB({h:x, s:y, b:z});
      i.addClass(ICON_PICKER_DOWN).removeClass(ICON_PICKER_CLOSE);
      span[0].style.background = 'rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +')';
      
      if(type === 'torgb'){
        that.elemPicker.find('.' + PICKER_INPUT).find('input').val('rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +')');
      };
      
      if(type  === 'rgba'){
        var left = 0;
        left = a * 280;
        alphaslider.css("left", left);
        that.elemPicker.find('.' + PICKER_INPUT).find('input').val('rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', '+ a +')');
        span[0].style.background = 'rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', '+ a +')';
        alphacolor[0].style.background = 'linear-gradient(to right, rgba('+ rgb.r +', '+ rgb.g +', '+ rgb.b +', 0), rgb('+ rgb.r +', '+ rgb.g +', '+ rgb.b +'))'
      };
      
      //回调更改的颜色
      options.change && options.change(that.elemPicker.find('.' + PICKER_INPUT).find('input').val());
    }

    //拖拽元素
    ,elemMove = $(['<div class="layui-auxiliar-moving" id="LAY-colorpicker-moving"></div'].join(''))
    ,createMoveElem = function(call){
      $('#LAY-colorpicker-moving')[0] || $('body').append(elemMove);
      elemMove.on('mousemove', call);
      elemMove.on('mouseup', function(){
        elemMove.remove();
      }).on('mouseleave', function(){
        elemMove.remove();
      });
    };

    //右侧主色选择
    slider.on('mousedown', function(e){
      var oldtop = this.offsetTop
      ,oldy = e.clientY;
      var move = function(e){
        var top = oldtop + (e.clientY - oldy)
        ,maxh = side[0].offsetHeight;
        if(top < 0)top = 0;
        if(top > maxh)top = maxh;
        var h = top/180*360;
        _h = h;
        change(h, _s, _b, _a);  
        e.preventDefault();
      };
      
      createMoveElem(move);
      e.preventDefault();
    });
    
    side.on('click', function(e){
      var top = e.clientY - $(this).offset().top;
      if(top < 0)top = 0;
      if(top > this.offsetHeight)top = this.offsetHeight;     
      var h = top/180*360;
      _h = h;
      change(h, _s, _b, _a); 
      e.preventDefault();
    });
    
    //中间小圆点颜色选择
    choose.on('mousedown', function(e){
      var oldtop = this.offsetTop
      ,oldleft = this.offsetLeft
      ,oldy = e.clientY
      ,oldx = e.clientX;
      var move = function(e){
        var top = oldtop + (e.clientY - oldy)
        ,left = oldleft + (e.clientX - oldx)
        ,maxh = basis[0].offsetHeight - 3
        ,maxw = basis[0].offsetWidth - 3;
        if(top < -3)top = -3;
        if(top > maxh)top = maxh;
        if(left < -3)left = -3;
        if(left > maxw)left = maxw;
        var s = (left + 3)/260*100
        ,b = 100 - (top + 3)/180*100;
        _b = b;
        _s = s;
        change(_h, s, b, _a); 
        e.preventDefault();
      };
      layui.stope(e);
      createMoveElem(move);
      e.preventDefault();
    });
    
    basis.on('mousedown', function(e){
      var top = e.clientY - $(this).offset().top - 3 + $win.scrollTop()
      ,left = e.clientX - $(this).offset().left - 3 + $win.scrollLeft()
      if(top < -3)top = -3;
      if(top > this.offsetHeight - 3)top = this.offsetHeight - 3;
      if(left < -3)left = -3;
      if(left > this.offsetWidth - 3)left = this.offsetWidth - 3;
      var s = (left + 3)/260*100
      ,b = 100 - (top + 3)/180*100;
      _b = b;
      _s = s;
      change(_h, s, b, _a); 
      e.preventDefault();
      choose.trigger(e, 'mousedown');
    });
    
    //底部透明度选择
    alphaslider.on('mousedown', function(e){
      var oldleft = this.offsetLeft
      ,oldx = e.clientX;
      var move = function(e){
        var left = oldleft + (e.clientX - oldx)
        ,maxw = alphacolor[0].offsetWidth;
        if(left < 0)left = 0;
        if(left > maxw)left = maxw;
        var a = Math.round(left /280*100) /100;
        _a = a;
        change(_h, _s, _b, a); 
        e.preventDefault();
      };
      
      createMoveElem(move);
      e.preventDefault();
    });
    alphacolor.on('click', function(e){
      var left = e.clientX - $(this).offset().left
      if(left < 0)left = 0;
      if(left > this.offsetWidth)left = this.offsetWidth;
      var a = Math.round(left /280*100) /100;
      _a = a;
      change(_h, _s, _b, a); 
      e.preventDefault();
    });
    
    //预定义颜色选择
    pre.each(function(){
      $(this).on('click', function(){
        $(this).parent('.layui-colorpicker-pre').addClass('selected').siblings().removeClass('selected');
        var color = this.style.backgroundColor
        ,hsb = RGBToHSB(RGBSTo(color))
        ,a = color.slice(color.lastIndexOf(",") + 1, color.length - 1),left;
        _h = hsb.h;
        _s = hsb.s;
        _b = hsb.b;
        if((color.match(/[0-9]{1,3}/g) || []).length == 3) a = 1;
        _a = a;
        left = a * 280;
        change(hsb.h, hsb.s, hsb.b, a);
      })
    });
  };

  //颜色选择器hsb转换
  Class.prototype.select = function(h, s, b, type){
    var that = this
    ,options = that.config
    ,hex = HSBToHEX({h:h, s:100, b:100})
    ,color = HSBToHEX({h:h, s:s, b:b})
    ,sidetop = h/360*180
    ,top = 180 - b/100*180 - 3
    ,left = s/100*260 - 3;
    
    that.elemPicker.find('.' + PICKER_SIDE_SLIDER).css("top", sidetop); //滑块的top
    that.elemPicker.find('.' + PICKER_BASIS)[0].style.background = '#' + hex; //颜色选择器的背景
    
    //选择器的top left
    that.elemPicker.find('.' + PICKER_BASIS_CUR).css({
      "top": top
      ,"left": left
    }); 
    
    if(type === 'change') return;
    
    //选中的颜色
    that.elemPicker.find('.' + PICKER_INPUT).find('input').val('#' + color);
  };
  
  Class.prototype.pickerEvents = function(){
    var that = this
    ,options = that.config
    
    ,elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN) //颜色盒子
    ,elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT + ' input') //颜色选择器表单
    
    ,pickerEvents = {
      //清空
      clear: function(othis){
        elemColorBoxSpan[0].style.background ='';
        that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_DOWN).addClass(ICON_PICKER_CLOSE);
        that.color = '';
        
        options.done && options.done('');
        that.removePicker();
      }
      
      //确认
      ,confirm: function(othis, change){
        var value = elemPickerInput.val()
        ,colorValue = value
        ,hsb = {};
        
        if(value.indexOf(',') > -1){
          hsb = RGBToHSB(RGBSTo(value));
          that.select(hsb.h, hsb.s, hsb.b);
          elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb)); 
          
          if((value.match(/[0-9]{1,3}/g) || []).length > 3 && elemColorBoxSpan.attr('lay-type') === 'rgba'){
            var left = value.slice(value.lastIndexOf(",") + 1, value.length - 1) * 280;
            that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", left);
            elemColorBoxSpan[0].style.background = value;
            colorValue = value;
          };
        } else {
          hsb = HEXToHSB(value);
          elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb)); 
          that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_CLOSE).addClass(ICON_PICKER_DOWN);
        };
        
        if(change === 'change'){
          that.select(hsb.h, hsb.s, hsb.b, change);
          options.change && options.change(colorValue);
          return;
        }
        that.color = value;
        
        options.done && options.done(value);
        that.removePicker(); 
      }
    };
    
    //选择器面板点击事件
    that.elemPicker.on('click', '*[colorpicker-events]', function(){
      var othis = $(this)
      ,attrEvent = othis.attr('colorpicker-events');
      pickerEvents[attrEvent] && pickerEvents[attrEvent].call(this, othis);
    });
    
    //输入框事件
    elemPickerInput.on('keyup', function(e){
      var othis = $(this)
      pickerEvents.confirm.call(this, othis, e.keyCode === 13 ?  null : 'change');
    });
  }

  //颜色选择器输入
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    
    ,elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
    
    //弹出颜色选择器
    that.elemColorBox.on('click' , function(){
      that.renderPicker();
      if($(ELEM_MAIN)[0]){
        that.val();
        that.side();
      };   
    });
    
    if(!options.elem[0] || that.elemColorBox[0].eventHandler) return;
    
    //绑定关闭控件事件
    $doc.on('click', function(e){
      //如果点击的元素是颜色框
      if($(e.target).hasClass(ELEM) 
        || $(e.target).parents('.'+ELEM)[0]
      ) return; 
      
      //如果点击的元素是选择器
      if($(e.target).hasClass(ELEM_MAIN.replace(/\./g, '')) 
        || $(e.target).parents(ELEM_MAIN)[0]
      ) return; 
      
      if(!that.elemPicker) return;
      
      if(that.color){
        var hsb = RGBToHSB(RGBSTo(that.color));
        that.select(hsb.h, hsb.s, hsb.b); 
      } else {
        that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(ICON_PICKER_DOWN).addClass(ICON_PICKER_CLOSE);
      }
      elemColorBoxSpan[0].style.background = that.color || '';
      
      that.removePicker();
    });

    //自适应定位
    $win.on('resize', function(){
      if(!that.elemPicker ||  !$(ELEM_MAIN)[0]){
        return false;
      }
      that.position();
    });
    
    that.elemColorBox[0].eventHandler = true;
  };
  
  //核心入口
  colorpicker.render = function(options){
    var inst = new Class(options);
    return thisColorPicker.call(inst);
  };
  
  exports(MOD_NAME, colorpicker);
});
/**

 @Name：form 表单组件
 @License：MIT

 */

layui.define('layer', function(exports){
  "use strict";

  var $ = layui.$
  ,layer = layui.layer
  ,hint = layui.hint()
  ,device = layui.device()
  ,afterAjax = (that,message,formx) => {
    let cnt = that.data('ajaxCnt')
    if(cnt > 0 ){
      that.data('ajaxCnt',cnt-1)
    }
    that.data('verified',message)
    if(that.data('ajaxCnt') === 0){
      that.removeAttr('lay-verifying')
      form.hideLoading(that)
      if((formx || that.data('autoSubmit')) && message === 1){
        console.log('auto submit form after ajax verifying!')
        formx.submit()//提交表单
      }
      if(message !== 1){
        //显示错误信息
        form.showErrors(null,[{
          elem: that,
          error: message
        }])
      }
    }
  }
  ,MOD_NAME = 'form', ELEM = '.layui-form', THIS = 'layui-this'
  ,SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'

  ,Form = function(){
    this.config = {
      verify: {
        required: [
          /[\S]+/
          ,'必填项不能为空'
        ]
        ,phone: [
          /^1\d{10}$/
          ,'请输入正确的手机号'
        ]
        ,email: [
          /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          ,'邮箱格式不正确'
        ]
        ,url: [
          /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/
          ,'链接格式不正确'
        ]
        ,number: function(value){
          if(!value || isNaN(value)) return '只能填写数字'
        }
        ,date: [
          /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/
          ,'日期格式不正确'
        ]
        ,identity: [
          /(^\d{15}$)|(^\d{17}(x|X|\d)$)/
          ,'请输入正确的身份证号'
        ]
        ,checked: function (value,item){
          if(item.type === 'checkbox' && !$(item).prop('checked')){
              return $(item).attr('lay-errText') || '请勾选此项'
          }
        }
        ,ajax: function (value,item,formX){
          var that      = $(item)
              ,url      = that.data('url')
              ,rValue    = that.data('rValue') // 初始值（绘制时获取的值）
              ,ajaxCnt   = that.data('ajaxCnt') || 0 // ajax 请求数
              ,verified = that.data('verified')
          if(!url || rValue === value){
            return;//无需校验
          }
          if(formX && that.attr('lay-verifying') === 'pending'){//正在校验时提交表单
             console.log('it is ajax verifying....')
             that.data('autoSubmit',true)
             return;
          }
          if(verified === '0'){
            that.data('autoSubmit',false)
            //添加正在进行ajax校验属性, ajax 请求数加1
            if(ajaxCnt === 0){
                form.showLoading(that)
            }
            that.data('ajaxCnt',ajaxCnt + 1).attr('lay-verifying','pending')
            let event = $.Event('ajax_verify'),data = {
              value: value
            }
            that.trigger(event)
            if(event.result){
              data = $.extend({},event.result,data)
            }
            $.get(url,data,'json').then((data) => {
              if (typeof data === 'string') {
                try {
                  data =  JSON.parse(data);
                } catch (e) {
                  data = {code:500,message:'error response'}
                }
              }
              if(data && data.code === 200){
                afterAjax(that,1,formX)
              }else if(data && data.message){
                afterAjax(that,data.message,formX)
              }else{
                afterAjax(that,'error response',formX)
              }
            }).fail((xhr) => {
              let result = xhr.responseJSON || {
                message: xhr.responseText || xhr.statusText
              }
              if (!result.message) {
                result.message = xhr.statusText
              }
              afterAjax(that,result.message,formX)
            })
          } else if(verified === 1){
            //已经验证过了，且验证通过
            return;
          } else {// 直接返回出错的信息.
            return verified;
          }
        }
      }
    };
  };

  //全局设置
  Form.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };

  //验证规则设定
  Form.prototype.verify = function(settings){
    var that = this;
    $.extend(true, that.config.verify, settings);
    return that;
  };
  //设置表单错误
  Form.prototype.showErrors = function (elem, errors) {
    layui.each(errors, function (_, err) {
      var input     = err.elem
          , item    = input.get(0)
          , pt      = input.closest('div.layui-form-item')
          , ee      = pt.find('p.layui-error-msg')
          , verType = input.attr('lay-verType')
          ,errorText = err.error
      input.addClass('layui-form-danger')
      if (verType === 'tips') {
        layer.tips(errorText, function () {
          if (typeof input.attr('lay-ignore') !== 'string') {
            if (item.tagName.toLowerCase() === 'select' || /^checkbox|radio$/.test(item.type)) {
              return input.next();
            }
          }
          return input;
        }(), {tips: 1});
      } else if (verType === 'alert') {
        layer.alert(errorText, {title: '提示', shadeClose: true});
      } else if (ee.length > 0) {
        ee.show()
      } else {
        ee = $('<p class="layui-error-msg">' + errorText + '</p>');
        ee.appendTo(pt)
      }
    })
  }

  Form.prototype.hideErrors = function (elem,input) {
    if(input){
      $(input).closest('div.layui-form-item').find('p.layui-error-msg').hide()
    } else {
      elem.find('p.layui-error-msg').hide();
    }
  }
  Form.prototype.showLoading = function (input) {
    let pt   = input.closest('div.layui-form-item')
        , ee = pt.find('div.layui-verifying')
    if (ee.length > 0) {
      ee.show()
    } else {
      ee = $('<div class="layui-verifying text-center"><i class="layui-icon layui-icon-loading layui-anim' +
          ' layui-anim-rotate layui-anim-loop"></i></div>');
      ee.appendTo(pt)
    }
  }

  Form.prototype.hideLoading = function(input){
    let pt   = input.closest('div.layui-form-item')
        , ee = pt.find('div.layui-verifying')
    ee.hide()
  }
  //表单事件监听
  Form.prototype.on = function(events, callback){
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };

  //赋值/取值
  Form.prototype.val = function(filter, object){
    var that = this
    ,formElem = $(ELEM + '[lay-filter="' + filter +'"]');

    //遍历
    formElem.each(function(index, item){
      var itemForm = $(this);

      //赋值
      layui.each(object, function(key, value){
        var itemElem = itemForm.find('[name="'+ key +'"]')
        ,type;

        //如果对应的表单不存在，则不执行
        if(!itemElem[0]) return;
        type = itemElem[0].type;

        //如果为复选框
        if(type === 'checkbox'){
          itemElem[0].checked = value;
        } else if(type === 'radio') { //如果为单选框
          itemElem.each(function(){
            if(this.value == value ){
              this.checked = true
            }
          });
        } else { //其它类型的表单
          itemElem.val(value);
        }
      });
    });

    form.render(null, filter);

    //返回值
    return that.getValue(filter);
  };

  //取值
  Form.prototype.getValue = function(filter, itemForm){
    itemForm = itemForm || $(ELEM + '[lay-filter="' + filter +'"]').eq(0);

    var nameIndex = {} //数组 name 索引
    ,field = {}
    ,fieldElem = itemForm.find('input,select,textarea') //获取所有表单域

    layui.each(fieldElem, function(_, item){
      item.name = (item.name || '').replace(/^\s*|\s*&/, '');

      if(!item.name) return;

      //用于支持数组 name
      if(/^.*\[\]$/.test(item.name)){
        var key = item.name.match(/^(.*)\[\]$/g)[0];
        nameIndex[key] = nameIndex[key] | 0;
        item.name = item.name.replace(/^(.*)\[\]$/, '$1['+ (nameIndex[key]++) +']');
      }

      if(/^checkbox|radio$/.test(item.type) && !item.checked) return;
      field[item.name] = item.value;
    });

    return field;
  };

  //表单控件渲染
  Form.prototype.render = function(type, filter){
    var that = this
    ,elemForm = $(ELEM + function(){
      return filter ? ('[lay-filter="' + filter +'"]') : '';
    }())
    ,items = {

      //下拉选择框
      select: function(){
        var TIPS = '请选择', CLASS = 'layui-form-select', TITLE = 'layui-select-title'
        ,NONE = 'layui-select-none', initValue = '', thatInput
        ,selects = elemForm.find('select')

        //隐藏 select
        ,hide = function(e, clear){
          if(!$(e.target).parent().hasClass(TITLE) || clear){
            $('.'+CLASS).removeClass(CLASS+'ed ' + CLASS+'up');
            thatInput && initValue && thatInput.val(initValue);
          }
          thatInput = null;
        }

        //各种事件
        ,events = function(reElem, disabled, isSearch){
          var select = $(this)
          ,title = reElem.find('.' + TITLE)
          ,input = title.find('input')
          ,dl = reElem.find('dl')
          ,dds = dl.children('dd')
          ,index =  this.selectedIndex //当前选中的索引
          ,nearElem; //select 组件当前选中的附近元素，用于辅助快捷键功能

          if(disabled) return;

          //展开下拉
          var showDown = function(){
            var top = reElem.offset().top + reElem.outerHeight() + 5 - $win.scrollTop()
            ,dlHeight = dl.outerHeight();

            index = select[0].selectedIndex; //获取最新的 selectedIndex
            reElem.addClass(CLASS+'ed');
            dds.removeClass(HIDE);
            nearElem = null;

            //初始选中样式
            dds.eq(index).addClass(THIS).siblings().removeClass(THIS);

            //上下定位识别
            if(top + dlHeight > $win.height() && top >= dlHeight){
              reElem.addClass(CLASS + 'up');
            }

            followScroll();
          }

          //隐藏下拉
          ,hideDown = function(choose){
            reElem.removeClass(CLASS+'ed ' + CLASS+'up');
            input.blur();
            nearElem = null;

            if(choose) return;

            notOption(input.val(), function(none){
              var selectedIndex = select[0].selectedIndex;

              //未查询到相关值
              if(none){
                initValue = $(select[0].options[selectedIndex]).html(); //重新获得初始选中值

                //如果是第一项，且文本值等于 placeholder，则清空初始值
                if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                  initValue = '';
                };

                //如果有选中值，则将输入框纠正为该值。否则清空输入框
                input.val(initValue || '');
              }
            });
          }

          //定位下拉滚动条
          ,followScroll = function(){
            var thisDd = dl.children('dd.'+ THIS);

            if(!thisDd[0]) return;

            var posTop = thisDd.position().top
            ,dlHeight = dl.height()
            ,ddHeight = thisDd.height();

            //若选中元素在滚动条不可见底部
            if(posTop > dlHeight){
              dl.scrollTop(posTop + dl.scrollTop() - dlHeight + ddHeight - 5);
            }

            //若选择玄素在滚动条不可见顶部
            if(posTop < 0){
              dl.scrollTop(posTop + dl.scrollTop() - 5);
            }
          };

          //点击标题区域
          title.on('click', function(e){
            reElem.hasClass(CLASS+'ed') ? (
              hideDown()
            ) : (
              hide(e, true),
              showDown()
            );
            dl.find('.'+NONE).remove();
          });

          //点击箭头获取焦点
          title.find('.layui-edge').on('click', function(){
            input.focus();
          });

          //select 中 input 键盘事件
          input.on('keyup', function(e){ //键盘松开
            var keyCode = e.keyCode;

            //Tab键展开
            if(keyCode === 9){
              showDown();
            }
          }).on('keydown', function(e){ //键盘按下
            var keyCode = e.keyCode;

            //Tab键隐藏
            if(keyCode === 9){
              hideDown();
            }

            //标注 dd 的选中状态
            var setThisDd = function(prevNext, thisElem1){
              var nearDd, cacheNearElem
              e.preventDefault();

              //得到当前队列元素
              var thisElem = function(){
                var thisDd = dl.children('dd.'+ THIS);

                //如果是搜索状态，且按 Down 键，且当前可视 dd 元素在选中元素之前，
                //则将当前可视 dd 元素的上一个元素作为虚拟的当前选中元素，以保证递归不中断
                if(dl.children('dd.'+  HIDE)[0] && prevNext === 'next'){
                  var showDd = dl.children('dd:not(.'+ HIDE +',.'+ DISABLED +')')
                  ,firstIndex = showDd.eq(0).index();
                  if(firstIndex >=0 && firstIndex < thisDd.index() && !showDd.hasClass(THIS)){
                    return showDd.eq(0).prev()[0] ? showDd.eq(0).prev() : dl.children(':last');
                  }
                }

                if(thisElem1 && thisElem1[0]){
                  return thisElem1;
                }
                if(nearElem && nearElem[0]){
                  return nearElem;
                }

                return thisDd;
                //return dds.eq(index);
              }();

              cacheNearElem = thisElem[prevNext](); //当前元素的附近元素
              nearDd =  thisElem[prevNext]('dd:not(.'+ HIDE +')'); //当前可视元素的 dd 元素

              //如果附近的元素不存在，则停止执行，并清空 nearElem
              if(!cacheNearElem[0]) return nearElem = null;

              //记录附近的元素，让其成为下一个当前元素
              nearElem = thisElem[prevNext]();

              //如果附近不是 dd ，或者附近的 dd 元素是禁用状态，则进入递归查找
              if((!nearDd[0] || nearDd.hasClass(DISABLED)) && nearElem[0]){
                return setThisDd(prevNext, nearElem);
              }

              nearDd.addClass(THIS).siblings().removeClass(THIS); //标注样式
              followScroll(); //定位滚动条
            };

            if(keyCode === 38) setThisDd('prev'); //Up 键
            if(keyCode === 40) setThisDd('next'); //Down 键

            //Enter 键
            if(keyCode === 13){
              e.preventDefault();
              dl.children('dd.'+THIS).trigger('click');
            }
          });

          //检测值是否不属于 select 项
          var notOption = function(value, callback, origin){
            var num = 0;
            layui.each(dds, function(){
              var othis = $(this)
              ,text = othis.text()
              ,not = text.indexOf(value) === -1;
              if(value === '' || (origin === 'blur') ? value !== text : not) num++;
              origin === 'keyup' && othis[not ? 'addClass' : 'removeClass'](HIDE);
            });
            var none = num === dds.length;
            return callback(none), none;
          };

          //搜索匹配
          var search = function(e){
            var value = this.value, keyCode = e.keyCode;

            if(keyCode === 9 || keyCode === 13
              || keyCode === 37 || keyCode === 38
              || keyCode === 39 || keyCode === 40
            ){
              return false;
            }

            notOption(value, function(none){
              if(none){
                dl.find('.'+NONE)[0] || dl.append('<p class="'+ NONE +'">无匹配项</p>');
              } else {
                dl.find('.'+NONE).remove();
              }
            }, 'keyup');

            if(value === ''){
              dl.find('.'+NONE).remove();
            }

            followScroll(); //定位滚动条
          };

          if(isSearch){
            input.on('keyup', search).on('blur', function(e){
              var selectedIndex = select[0].selectedIndex;

              thatInput = input; //当前的 select 中的 input 元素
              initValue = $(select[0].options[selectedIndex]).html(); //重新获得初始选中值

              //如果是第一项，且文本值等于 placeholder，则清空初始值
              if(selectedIndex === 0 && initValue === input.attr('placeholder')){
                initValue = '';
              };

              setTimeout(function(){
                notOption(input.val(), function(none){
                  initValue || input.val(''); //none && !initValue
                }, 'blur');
              }, 200);
            });
          }

          //选择
          dds.on('click', function(){
            var othis = $(this), value = othis.attr('lay-value');
            var filter = select.attr('lay-filter'); //获取过滤器

            if(othis.hasClass(DISABLED)) return false;

            if(othis.hasClass('layui-select-tips')){
              input.val('');
            } else {
              input.val(othis.text());
              othis.addClass(THIS);
            }

            othis.siblings().removeClass(THIS);
            select.val(value).removeClass('layui-form-danger')
            layui.event.call(this, MOD_NAME, 'select('+ filter +')', {
              elem: select[0]
              ,value: value
              ,othis: reElem
            });

            hideDown(true);
            return false;
          });

          reElem.find('dl>dt').on('click', function(e){
            return false;
          });

          $(document).off('click', hide).on('click', hide); //点击其它元素关闭 select
        }

        selects.each(function(index, select){
          var othis = $(this)
          ,hasRender = othis.next('.'+CLASS)
          ,disabled = this.disabled
          ,value = select.value
          ,selected = $(select.options[select.selectedIndex]) //获取当前选中项
          ,optionsFirst = select.options[0];

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          var isSearch = typeof othis.attr('lay-search') === 'string'
          ,placeholder = optionsFirst ? (
            optionsFirst.value ? TIPS : (optionsFirst.innerHTML || TIPS)
          ) : TIPS;

          //替代元素
          var reElem = $(['<div class="'+ (isSearch ? '' : 'layui-unselect ') + CLASS
          ,(disabled ? ' layui-select-disabled' : '') +'">'
            ,'<div class="'+ TITLE +'">'
              ,('<input type="text" placeholder="'+ placeholder +'" '
                +('value="'+ (value ? selected.html() : '') +'"') //默认值
                +((!disabled && isSearch) ? '' : ' readonly') //是否开启搜索
                +' class="layui-input'
                +(isSearch ? '' : ' layui-unselect')
              + (disabled ? (' ' + DISABLED) : '') +'">') //禁用状态
            ,'<i class="layui-edge"></i></div>'
            ,'<dl class="layui-anim layui-anim-upbit'+ (othis.find('optgroup')[0] ? ' layui-select-group' : '') +'">'
            ,function(options){
              var arr = [];
              layui.each(options, function(index, item){
                if(index === 0 && !item.value){
                  arr.push('<dd lay-value="" class="layui-select-tips">'+ (item.innerHTML || TIPS) +'</dd>');
                } else if(item.tagName.toLowerCase() === 'optgroup'){
                  arr.push('<dt>'+ item.label +'</dt>');
                } else {
                  arr.push('<dd lay-value="'+ item.value +'" class="'+ (value === item.value ?  THIS : '') + (item.disabled ? (' '+DISABLED) : '') +'">'+ item.innerHTML +'</dd>');
                }
              });
              arr.length === 0 && arr.push('<dd lay-value="" class="'+ DISABLED +'">没有选项</dd>');
              return arr.join('');
            }(othis.find('*')) +'</dl>'
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
          othis.after(reElem);
          events.call(this, reElem, disabled, isSearch);
        });
      }

      //复选框/开关
      ,checkbox: function(){
        var CLASS = {
          checkbox: ['layui-form-checkbox', 'layui-form-checked', 'checkbox']
          ,_switch: ['layui-form-switch', 'layui-form-onswitch', 'switch']
        }
        ,checks = elemForm.find('input[type=checkbox]')

        ,events = function(reElem, RE_CLASS){
          var check = $(this);

          //勾选
          reElem.on('click', function(){
            var filter = check.attr('lay-filter') //获取过滤器
            ,text = (check.attr('lay-text')||'').split('|');

            if(check[0].disabled) return;

            check[0].checked ? (
              check[0].checked = false
              ,reElem.removeClass(RE_CLASS[1]).find('em').text(text[1])
            ) : (
              check[0].checked = true
              ,reElem.addClass(RE_CLASS[1]).find('em').text(text[0])
            );

            layui.event.call(check[0], MOD_NAME, RE_CLASS[2]+'('+ filter +')', {
              elem: check[0]
              ,value: check[0].value
              ,othis: reElem
            });
          });
        }

        checks.each(function(index, check){
          var othis = $(this), skin = othis.attr('lay-skin')
          ,text = (othis.attr('lay-text') || '').split('|'), disabled = this.disabled;
          if(skin === 'switch') skin = '_'+skin;
          var RE_CLASS = CLASS[skin] || CLASS.checkbox;

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();

          //替代元素
          var hasRender = othis.next('.' + RE_CLASS[0])
          ,reElem = $(['<div class="layui-unselect '+ RE_CLASS[0]
            ,(check.checked ? (' '+ RE_CLASS[1]) : '') //选中状态
            ,(disabled ? ' layui-checkbox-disbaled '+ DISABLED : '') //禁用状态
            ,'"'
            ,(skin ? ' lay-skin="'+ skin +'"' : '') //风格
          ,'>'
          ,function(){ //不同风格的内容
            var title = check.title.replace(/\s/g, '')
            ,type = {
              //复选框
              checkbox: [
                (title ? ('<span>'+ check.title +'</span>') : '')
                ,'<i class="layui-icon layui-icon-ok"></i>'
              ].join('')

              //开关
              ,_switch: '<em>'+ ((check.checked ? text[0] : text[1]) || '') +'</em><i></i>'
            };
            return type[skin] || type['checkbox'];
          }()
          ,'</div>'].join(''));

          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
          othis.after(reElem);
          events.call(this, reElem, RE_CLASS);
        });
      }

      //单选框
      ,radio: function(){
        var CLASS = 'layui-form-radio', ICON = ['&#xe643;', '&#xe63f;']
        ,radios = elemForm.find('input[type=radio]')

        ,events = function(reElem){
          var radio = $(this), ANIM = 'layui-anim-scaleSpring';

          reElem.on('click', function(){
            var name = radio[0].name, forms = radio.parents(ELEM);
            var filter = radio.attr('lay-filter'); //获取过滤器
            var sameRadio = forms.find('input[name='+ name.replace(/(\.|#|\[|\])/g, '\\$1') +']'); //找到相同name的兄弟

            if(radio[0].disabled) return;

            layui.each(sameRadio, function(){
              var next = $(this).next('.'+CLASS);
              this.checked = false;
              next.removeClass(CLASS+'ed');
              next.find('.layui-icon').removeClass(ANIM).html(ICON[1]);
            });

            radio[0].checked = true;
            reElem.addClass(CLASS+'ed');
            reElem.find('.layui-icon').addClass(ANIM).html(ICON[0]);

            layui.event.call(radio[0], MOD_NAME, 'radio('+ filter +')', {
              elem: radio[0]
              ,value: radio[0].value
              ,othis: reElem
            });
          });
        };

        radios.each(function(index, radio){
          var othis = $(this), hasRender = othis.next('.' + CLASS), disabled = this.disabled;

          if(typeof othis.attr('lay-ignore') === 'string') return othis.show();
          hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender

          //替代元素
          var reElem = $(['<div class="layui-unselect '+ CLASS
            ,(radio.checked ? (' '+CLASS+'ed') : '') //选中状态
          ,(disabled ? ' layui-radio-disbaled '+DISABLED : '') +'">' //禁用状态
          ,'<i class="layui-anim layui-icon">'+ ICON[radio.checked ? 0 : 1] +'</i>'
          ,'<div>'+ function(){
            var title = radio.title || '';
            if(typeof othis.next().attr('lay-radio') === 'string'){
              title = othis.next().html();
              othis.next().remove();
            }
            return title
          }() +'</div>'
          ,'</div>'].join(''));

          othis.after(reElem);
          events.call(this, reElem);
        });
      }
    };
    type ? (
      items[type] ? items[type]() : hint.error('不支持的'+ type + '表单渲染')
    ) : layui.each(items, function(index, item){
      item();
    });
    return that;
  };
  // 单个输入组件校验
  var verifyIt = function (othis, elem){
    var stop = false
        ,verify = form.config.verify //验证规则
        ,DANGER = 'layui-form-danger' //警示样式
        ,vers = othis.attr('lay-verify').split('|')
        ,verType = othis.attr('lay-verType') //提示方式
        ,value = othis.val()
        ,item  = othis.get(0)
        ,submitting = elem ? true : false //正在提交
        ,elem  = elem?elem:$(othis.parents('form')[0]);

    //遍历元素绑定的验证规则
    layui.each(vers, function(_, thisVer){
      var isTrue //是否失败
          ,errorText = '' //错误提示文本
          ,isFn = typeof verify[thisVer] === 'function';

      //匹配验证规则
      if(!stop && verify[thisVer]){
        isTrue = isFn ? errorText = verify[thisVer](value, item,submitting?elem:false) : !verify[thisVer][0].test(value);
        errorText = errorText || verify[thisVer][1];

        if(thisVer === 'required'){
          errorText = othis.attr('lay-reqText') || errorText;
        }

        if(isTrue){//验证失败
          //提示层风格
          if(verType === 'tips'){
            layer.tips(errorText, function(){
              if(typeof othis.attr('lay-ignore') !== 'string'){
                if(item.tagName.toLowerCase() === 'select' || /^checkbox|radio$/.test(item.type)){
                  return othis.next();
                }
              }
              return othis;
            }(), {tips: 1});
          } else if(verType === 'alert') {
            layer.alert(errorText, {title: '提示', shadeClose: true});
          }
          //如果返回的为字符或数字，则自动弹出默认提示框；否则由 verify 方法中处理提示
          else if(/\bstring|number\b/.test(typeof errorText)){
            form.showErrors(elem,[{
              elem: othis,
              error : errorText
            }])
          }
          return stop = true;
        }
      }
    });

    if(!stop){
      othis.removeClass(DANGER); //移除警示样式
      form.hideErrors(elem, othis)
    }
    return stop;
  }
  //表单提交校验
  var submit = function(){
    var stop = null //验证不通过状态
    ,field = {}  //字段集合
    ,button = $(this) //当前触发的按钮
    ,elem = button.parents(ELEM) //当前所在表单域
    ,verifyElem = elem.find('*[lay-verify]') //获取需要校验的元素
    ,formElem = button.parents('form')[0] //获取当前所在的 form 元素，如果存在的话
    ,filter = button.attr('lay-filter'); //获取过滤器
    //开始校验
    layui.each(verifyElem, function(_, item){
      stop = verifyIt($(item),$(formElem))
      if(stop) return stop
    });
    //则阻止提交
    if(stop) return false;

    if($(formElem).find('*[lay-verifying]').length > 0){
        //还有在进行ajax校验请等待
        return false;
    }
    //获取当前表单值
    field = form.getValue(null, elem);

    //返回字段
    return layui.event.call(this, MOD_NAME, 'submit('+ filter +')', {
      elem: this
      ,form: formElem
      ,field: field
    });
  };
  // 值改变校验
  var cverify = function (){
    verifyIt($(this).data('verified','0'))
  }
  //自动完成渲染
  var form = new Form()
  ,$dom = $(document), $win = $(window);

  $(function(){
    form.render();
  });

  //表单reset重置渲染
  $dom.on('reset', ELEM, function(){
    var that = $(this),filter = that.attr('lay-filter');
    setTimeout(function(){
      form.render(null, filter);
      layui.event.call(this, MOD_NAME, 'reset('+ filter +')', {
        elem: this,form: that,field: form.getValue(null,that)
      });
    }, 50);
  });
  //表单提交事件
  $dom.on('submit', ELEM, submit)
  .on('click', '*[lay-submit]', submit);
  //值改变事件
  $dom.on('change','*[lay-verify]',cverify)

  exports(MOD_NAME, form);
});

 
/**
 
 @Name：tree 树组件
 @License：MIT

 */

layui.define('form', function(exports){
  "use strict";
  
  var $ = layui.$
  ,form = layui.form
  ,layer = layui.layer
  
  //模块名
  ,MOD_NAME = 'tree'

  //外部接口
  ,tree = {
    config: {}
    ,index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作当前实例
  ,thisModule = function(){
    var that = this
    ,options = that.config
    ,id = options.id || that.index;
    
    thisModule.that[id] = that; //记录当前实例对象
    thisModule.config[id] = options; //记录当前实例配置项
    
    return {
      config: options
      //重置实例
      ,reload: function(options){
        that.reload.call(that, options);
      }
      ,getChecked: function(){
        return that.getChecked.call(that);
      }
      ,setChecked: function(id){//设置值
        return that.setChecked.call(that, id);
      }
    }
  }
  
  //获取当前实例配置项
  ,getThisModuleConfig = function(id){
    var config = thisModule.config[id];
    if(!config) hint.error('The ID option was not found in the '+ MOD_NAME +' instance');
    return config || null;
  }

  //字符常量
  ,SHOW = 'layui-show', HIDE = 'layui-hide', NONE = 'layui-none', DISABLED = 'layui-disabled'
  
  ,ELEM_VIEW = 'layui-tree', ELEM_SET = 'layui-tree-set', ICON_CLICK = 'layui-tree-iconClick'
  ,ICON_ADD = 'layui-icon-addition', ICON_SUB = 'layui-icon-subtraction', ELEM_ENTRY = 'layui-tree-entry', ELEM_MAIN = 'layui-tree-main', ELEM_TEXT = 'layui-tree-txt', ELEM_PACK = 'layui-tree-pack', ELEM_SPREAD = 'layui-tree-spread'
  ,ELEM_LINE_SHORT = 'layui-tree-setLineShort', ELEM_SHOW = 'layui-tree-showLine', ELEM_EXTEND = 'layui-tree-lineExtend'
 
  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++tree.index;
    that.config = $.extend({}, that.config, tree.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    data: []  //数据
    
    ,showCheckbox: false  //是否显示复选框
    ,showLine: true  //是否开启连接线
    ,accordion: false  //是否开启手风琴模式
    ,onlyIconControl: false  //是否仅允许节点左侧图标控制展开收缩
    ,isJump: false  //是否允许点击节点时弹出新窗口跳转
    ,edit: false  //是否开启节点的操作图标
    
    ,text: {
      defaultNodeName: '未命名' //节点默认名称
      ,none: '无数据'  //数据为空时的文本提示
    }
  };
  
  //重载实例
  Class.prototype.reload = function(options){
    var that = this;
    
    layui.each(options, function(key, item){
      if(item.constructor === Array) delete that.config[key];
    });
    
    that.config = $.extend(true, {}, that.config, options);
    that.render();
  };

  //主体渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;
    
    that.checkids = [];

    var temp = $('<div class="layui-tree'+ (options.showCheckbox ? " layui-form" : "") + (options.showLine ? " layui-tree-line" : "") +'" lay-filter="LAY-tree-'+ that.index +'"></div>');
    that.tree(temp);

    var othis = options.elem = $(options.elem);
    if(!othis[0]) return;

    //索引
    that.key = options.id || that.index;
    
    //插入组件结构
    that.elem = temp;
    that.elemNone = $('<div class="layui-tree-emptyText">'+ options.text.none +'</div>');
    othis.html(that.elem);

    if(that.elem.find('.layui-tree-set').length == 0){
      return that.elem.append(that.elemNone);
    };
    
    //复选框渲染
    if(options.showCheckbox){
      that.renderForm('checkbox');
    };

    that.elem.find('.layui-tree-set').each(function(){
      var othis = $(this);
      //最外层
      if(!othis.parent('.layui-tree-pack')[0]){
        othis.addClass('layui-tree-setHide');
      };

      //没有下一个节点 上一层父级有延伸线
      if(!othis.next()[0] && othis.parents('.layui-tree-pack').eq(1).hasClass('layui-tree-lineExtend')){
        othis.addClass(ELEM_LINE_SHORT);
      };
      
      //没有下一个节点 外层最后一个
      if(!othis.next()[0] && !othis.parents('.layui-tree-set').eq(0).next()[0]){
        othis.addClass(ELEM_LINE_SHORT);
      };
    });

    that.events();
  };
  
  //渲染表单
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-tree-'+ this.index);
  };

  //节点解析
  Class.prototype.tree = function(elem, children){
    var that = this
    ,options = that.config
    ,data = children || options.data;

    //遍历数据
    layui.each(data, function(index, item){
      var hasChild = item.children && item.children.length > 0
      ,packDiv = $('<div class="layui-tree-pack" '+ (item.spread ? 'style="display: block;"' : '') +'></div>')
      ,entryDiv = $(['<div data-id="'+ item.id +'" class="layui-tree-set'+ (item.spread ? " layui-tree-spread" : "") + (item.checked ? " layui-tree-checkedFirst" : "") +'">'
        ,'<div class="layui-tree-entry">'
          ,'<div class="layui-tree-main">'
            //箭头
            ,function(){
              if(options.showLine){
                if(hasChild){
                  return '<span class="layui-tree-iconClick layui-tree-icon"><i class="layui-icon '+ (item.spread ? "layui-icon-subtraction" : "layui-icon-addition") +'"></i></span>';
                }else{
                  return '<span class="layui-tree-iconClick"><i class="layui-icon layui-icon-file"></i></span>';
                };
              }else{
                return '<span class="layui-tree-iconClick"><i class="layui-tree-iconArrow '+ (hasChild ? "": HIDE) +'"></i></span>';
              };
            }()
            
            //复选框
            ,function(){
              return options.showCheckbox ? '<input type="checkbox" name="'+ (item.field || ('layuiTreeCheck_'+ item.id)) +'" same="layuiTreeCheck" lay-skin="primary" '+ (item.disabled ? "disabled" : "") +' value="'+ item.id +'">' : '';
            }()
            
            //节点
            ,function(){
              if(options.isJump && item.href){
                return '<a href="'+ item.href +'" target="_blank" class="'+ ELEM_TEXT +'">'+ (item.title || item.label || options.text.defaultNodeName) +'</a>';
              }else{
                return '<span class="'+ ELEM_TEXT + (item.disabled ? ' '+ DISABLED : '') +'">'+ (item.title || item.label || options.text.defaultNodeName) +'</span>';
              }
            }()
      ,'</div>'
      
      //节点操作图标
      ,function(){
        if(!options.edit) return '';
        
        var editIcon = {
          add: '<i class="layui-icon layui-icon-add-1"  data-type="add"></i>'
          ,update: '<i class="layui-icon layui-icon-edit" data-type="update"></i>'
          ,del: '<i class="layui-icon layui-icon-delete" data-type="del"></i>'
        }, arr = ['<div class="layui-btn-group layui-tree-btnGroup">'];
        
        if(options.edit === true){
          options.edit = ['update', 'del']
        }
        
        if(typeof options.edit === 'object'){
          layui.each(options.edit, function(i, val){
            arr.push(editIcon[val] || '')
          });
          return arr.join('') + '</div>';
        }
      }()
      ,'</div></div>'].join(''));

      //如果有子节点，则递归继续生成树
      if(hasChild){
        entryDiv.append(packDiv);
        that.tree(packDiv, item.children);
      };

      elem.append(entryDiv);
      
      //若有前置节点，前置节点加连接线
      if(entryDiv.prev('.'+ELEM_SET)[0]){
        entryDiv.prev().children('.layui-tree-pack').addClass('layui-tree-showLine');
      };
      
      //若无子节点，则父节点加延伸线
      if(!hasChild){
        entryDiv.parent('.layui-tree-pack').addClass('layui-tree-lineExtend');
      };

      //展开节点操作
      that.spread(entryDiv, item);
      
      //选择框
      if(options.showCheckbox){
        item.checked && that.checkids.push(item.id);
        that.checkClick(entryDiv, item);
      }
      
      //操作节点
      options.edit && that.operate(entryDiv, item);
      
    });
  };

  //展开节点
  Class.prototype.spread = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN)
    ,elemIcon = entry.find('.'+ ICON_CLICK)
    ,elemText = entry.find('.'+ ELEM_TEXT)
    ,touchOpen = options.onlyIconControl ? elemIcon : elemMain //判断展开通过节点还是箭头图标
    ,state = '';
    
    //展开收缩
    touchOpen.on('click', function(e){
      var packCont = elem.children('.'+ELEM_PACK)
      ,iconClick = touchOpen.children('.layui-icon')[0] ? touchOpen.children('.layui-icon') : touchOpen.find('.layui-tree-icon').children('.layui-icon');

      //若没有子节点
      if(!packCont[0]){
        state = 'normal';
      }else{
        if(elem.hasClass(ELEM_SPREAD)){
          elem.removeClass(ELEM_SPREAD);
          packCont.slideUp(200);
          iconClick.removeClass(ICON_SUB).addClass(ICON_ADD); 
        }else{
          elem.addClass(ELEM_SPREAD);
          packCont.slideDown(200);
          iconClick.addClass(ICON_SUB).removeClass(ICON_ADD);

          //是否手风琴
          if(options.accordion){
            var sibls = elem.siblings('.'+ELEM_SET);
            sibls.removeClass(ELEM_SPREAD);
            sibls.children('.'+ELEM_PACK).slideUp(200);
            sibls.find('.layui-tree-icon').children('.layui-icon').removeClass(ICON_SUB).addClass(ICON_ADD);
          };
        };
      };
    });
    
    //点击回调
    elemText.on('click', function(){
      var othis = $(this);
      
      //判断是否禁用状态
      if(othis.hasClass(DISABLED)) return;
      
      //判断展开收缩状态
      if(elem.hasClass(ELEM_SPREAD)){
        state = options.onlyIconControl ? 'open' : 'close';
      } else {
        state = options.onlyIconControl ? 'close' : 'open';
      }
      
      //点击产生的回调
      options.click && options.click({
        elem: elem
        ,state: state
        ,data: item
      });
    });
  };
  
  //计算复选框选中状态
  Class.prototype.setCheckbox = function(elem, item, elemCheckbox){
    var that = this
    ,options = that.config
    ,checked = elemCheckbox.prop('checked');
    
    if(elemCheckbox.prop('disabled')) return;

    //同步子节点选中状态
    if(typeof item.children === 'object' || elem.find('.'+ELEM_PACK)[0]){
      var childs = elem.find('.'+ ELEM_PACK).find('input[same="layuiTreeCheck"]');
      childs.each(function(){
        if(this.disabled) return; //不可点击则跳过
        this.checked = checked;
      });
    };

    //同步父节点选中状态
    var setParentsChecked = function(thisNodeElem){
      //若无父节点，则终止递归
      if(!thisNodeElem.parents('.'+ ELEM_SET)[0]) return;

      var state
      ,parentPack = thisNodeElem.parent('.'+ ELEM_PACK)
      ,parentNodeElem = parentPack.parent()
      ,parentCheckbox =  parentPack.prev().find('input[same="layuiTreeCheck"]');

      //如果子节点有任意一条选中，则父节点为选中状态
      if(checked){
        parentCheckbox.prop('checked', checked);
      } else { //如果当前节点取消选中，则根据计算“兄弟和子孙”节点选中状态，来同步父节点选中状态
        parentPack.find('input[same="layuiTreeCheck"]').each(function(){
          if(this.checked){
            state = true;
          }
        });
        
        //如果兄弟子孙节点全部未选中，则父节点也应为非选中状态
        state || parentCheckbox.prop('checked', false);
      }
      
      //向父节点递归
      setParentsChecked(parentNodeElem);
    };
    
    setParentsChecked(elem);

    that.renderForm('checkbox');
  };
  
  //复选框选择
  Class.prototype.checkClick = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN);
    
    
    
    //点击复选框
    elemMain.on('click', 'input[same="layuiTreeCheck"]+', function(e){
      layui.stope(e); //阻止点击节点事件

      var elemCheckbox = $(this).prev()
      ,checked = elemCheckbox.prop('checked');
      
      if(elemCheckbox.prop('disabled')) return;
      
      that.setCheckbox(elem, item, elemCheckbox);

      //复选框点击产生的回调
      options.oncheck && options.oncheck({
        elem: elem
        ,checked: checked
        ,data: item
      });
    });
  };

  //节点操作
  Class.prototype.operate = function(elem, item){
    var that = this
    ,options = that.config
    ,entry = elem.children('.'+ ELEM_ENTRY)
    ,elemMain = entry.children('.'+ ELEM_MAIN);

    entry.children('.layui-tree-btnGroup').on('click', '.layui-icon', function(e){
      layui.stope(e);  //阻止节点操作

      var type = $(this).data("type")
      ,packCont = elem.children('.'+ELEM_PACK)
      ,returnObj = {
        data: item
        ,type: type
        ,elem:elem
      };
      //增加
      if(type == 'add'){
        //若节点本身无子节点
        if(!packCont[0]){
          //若开启连接线，更改图标样式
          if(options.showLine){
            elemMain.find('.'+ICON_CLICK).addClass('layui-tree-icon');
            elemMain.find('.'+ICON_CLICK).children('.layui-icon').addClass(ICON_ADD).removeClass('layui-icon-file');
          //若未开启连接线，显示箭头
          }else{
            elemMain.find('.layui-tree-iconArrow').removeClass(HIDE);
          };
          //节点添加子节点容器
          elem.append('<div class="layui-tree-pack"></div>');
        };

        //新增节点
        var key = options.operate && options.operate(returnObj)
        ,obj = {};
        obj.title = options.text.defaultNodeName;
        obj.id = key;
        that.tree(elem.children('.'+ELEM_PACK), [obj]);
        
        //放在新增后面，因为要对元素进行操作
        if(options.showLine){
          //节点本身无子节点
          if(!packCont[0]){
            //遍历兄弟节点，判断兄弟节点是否有子节点
            var siblings = elem.siblings('.'+ELEM_SET), num = 1
            ,parentPack = elem.parent('.'+ELEM_PACK);
            layui.each(siblings, function(index, i){
              if(!$(i).children('.'+ELEM_PACK)[0]){
                num = 0;
              };
            });

            //若兄弟节点都有子节点
            if(num == 1){
              //兄弟节点添加连接线
              siblings.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
              siblings.children('.'+ELEM_PACK).children('.'+ELEM_SET).removeClass(ELEM_LINE_SHORT);
              elem.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
              //父级移除延伸线
              parentPack.removeClass(ELEM_EXTEND);
              //同层节点最后一个更改线的状态
              parentPack.children('.'+ELEM_SET).last().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
            }else{
              elem.children('.'+ELEM_PACK).children('.'+ELEM_SET).addClass(ELEM_LINE_SHORT);
            };
          }else{
            //添加延伸线
            if(!packCont.hasClass(ELEM_EXTEND)){
              packCont.addClass(ELEM_EXTEND);
            };
            //子节点添加延伸线
            elem.find('.'+ELEM_PACK).each(function(){
              $(this).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
            });
            //如果前一个节点有延伸线
            if(packCont.children('.'+ELEM_SET).last().prev().hasClass(ELEM_LINE_SHORT)){
              packCont.children('.'+ELEM_SET).last().prev().removeClass(ELEM_LINE_SHORT);
            }else{
              //若之前的没有，说明处于连接状态
              packCont.children('.'+ELEM_SET).last().removeClass(ELEM_LINE_SHORT);
            };
            //若是最外层，要始终保持相连的状态
            if(!elem.parent('.'+ELEM_PACK)[0] && elem.next()[0]){
              packCont.children('.'+ELEM_SET).last().removeClass(ELEM_LINE_SHORT);
            };
          };
        };
        if(!options.showCheckbox) return;
        //若开启复选框，同步新增节点状态
        if(elemMain.find('input[same="layuiTreeCheck"]')[0].checked){
          var packLast = elem.children('.'+ELEM_PACK).children('.'+ELEM_SET).last();
          packLast.find('input[same="layuiTreeCheck"]')[0].checked = true;
        };
        that.renderForm('checkbox');
      
      //修改
      }else if(type == 'update'){
        var text = elemMain.children('.'+ ELEM_TEXT).html();
        elemMain.children('.'+ ELEM_TEXT).html('');
        //添加输入框，覆盖在文字上方
        elemMain.append('<input type="text" class="layui-tree-editInput">');
        //获取焦点
        elemMain.children('.layui-tree-editInput').val(text).focus();
        //嵌入文字移除输入框
        var getVal = function(input){
          var textNew = input.val().trim();
          textNew = textNew ? textNew : options.text.defaultNodeName;
          input.remove();
          elemMain.children('.'+ ELEM_TEXT).html(textNew);
          
          //同步数据
          returnObj.data.title = textNew;
          
          //节点修改的回调
          options.operate && options.operate(returnObj);
        };
        //失去焦点
        elemMain.children('.layui-tree-editInput').blur(function(){
          getVal($(this));
        });
        //回车
        elemMain.children('.layui-tree-editInput').on('keydown', function(e){
          if(e.keyCode === 13){
            e.preventDefault();
            getVal($(this));
          };
        });

      //删除
      } else {
        layer.confirm('确认删除该节点 "<span style="color: #999;">'+ (item.title || '') +'</span>" 吗？', function(index){
          options.operate && options.operate(returnObj); //节点删除的回调
          returnObj.status = 'remove'; //标注节点删除
          
          layer.close(index);
          
          //若删除最后一个，显示空数据提示
          if(!elem.prev('.'+ELEM_SET)[0] && !elem.next('.'+ELEM_SET)[0] && !elem.parent('.'+ELEM_PACK)[0]){
            elem.remove();
            that.elem.append(that.elemNone);
            return;
          };
          //若有兄弟节点
          if(elem.siblings('.'+ELEM_SET).children('.'+ELEM_ENTRY)[0]){
            //若开启复选框
            if(options.showCheckbox){
              //若开启复选框，进行下步操作
              var elemDel = function(elem){
                //若无父结点，则不执行
                if(!elem.parents('.'+ELEM_SET)[0]) return;
                var siblingTree = elem.siblings('.'+ELEM_SET).children('.'+ELEM_ENTRY)
                ,parentTree = elem.parent('.'+ELEM_PACK).prev()
                ,checkState = parentTree.find('input[same="layuiTreeCheck"]')[0]
                ,state = 1, num = 0;
                //若父节点未勾选
                if(checkState.checked == false){
                  //遍历兄弟节点
                  siblingTree.each(function(i, item1){
                    var input = $(item1).find('input[same="layuiTreeCheck"]')[0]
                    if(input.checked == false && !input.disabled){
                      state = 0;
                    };
                    //判断是否全为不可勾选框
                    if(!input.disabled){
                      num = 1;
                    };
                  });
                  //若有可勾选选择框并且已勾选
                  if(state == 1 && num == 1){
                    //勾选父节点
                    checkState.checked = true;
                    that.renderForm('checkbox');
                    //向上遍历祖先节点
                    elemDel(parentTree.parent('.'+ELEM_SET));
                  };
                };
              };
              elemDel(elem);
            };
            //若开启连接线
            if(options.showLine){
              //遍历兄弟节点，判断兄弟节点是否有子节点
              var siblings = elem.siblings('.'+ELEM_SET), num = 1
              ,parentPack = elem.parent('.'+ELEM_PACK);
              layui.each(siblings, function(index, i){
                if(!$(i).children('.'+ELEM_PACK)[0]){
                  num = 0;
                };
              });
              //若兄弟节点都有子节点
              if(num == 1){
                //若节点本身无子节点
                if(!packCont[0]){
                  //父级去除延伸线，因为此时子节点里没有空节点
                  parentPack.removeClass(ELEM_EXTEND);
                  siblings.children('.'+ELEM_PACK).addClass(ELEM_SHOW);
                  siblings.children('.'+ELEM_PACK).children('.'+ELEM_SET).removeClass(ELEM_LINE_SHORT);
                };
                //若为最后一个节点
                if(!elem.next()[0]){
                  elem.prev().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
                }else{
                  parentPack.children('.'+ELEM_SET).last().children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
                };
                //若为最外层最后一个节点，去除前一个结点的连接线
                if(!elem.next()[0] && !elem.parents('.'+ELEM_SET)[1] && !elem.parents('.'+ELEM_SET).eq(0).next()[0]){
                  elem.prev('.'+ELEM_SET).addClass(ELEM_LINE_SHORT);
                };
              }else{
                //若为最后一个节点且有延伸线
                if(!elem.next()[0] && elem.hasClass(ELEM_LINE_SHORT)){
                  elem.prev().addClass(ELEM_LINE_SHORT);
                };
              };
            };
          
          }else{
            //若无兄弟节点
            var prevDiv = elem.parent('.'+ELEM_PACK).prev();
            //若开启了连接线
            if(options.showLine){
              prevDiv.find('.'+ICON_CLICK).removeClass('layui-tree-icon');
              prevDiv.find('.'+ICON_CLICK).children('.layui-icon').removeClass(ICON_SUB).addClass('layui-icon-file');
              //父节点所在层添加延伸线
              var pare = prevDiv.parents('.'+ELEM_PACK).eq(0);
              pare.addClass(ELEM_EXTEND);

              //兄弟节点最后子节点添加延伸线
              pare.children('.'+ELEM_SET).each(function(){
                $(this).children('.'+ELEM_PACK).children('.'+ELEM_SET).last().addClass(ELEM_LINE_SHORT);
              });
            }else{
            //父节点隐藏箭头
              prevDiv.find('.layui-tree-iconArrow').addClass(HIDE);
            };
            //移除展开属性
            elem.parents('.'+ELEM_SET).eq(0).removeClass(ELEM_SPREAD);
            //移除节点容器
            elem.parent('.'+ELEM_PACK).remove();
          };

          elem.remove();
        });
        
      };
    });
  };

  //部分事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    ,checkWarp = that.elem.find('.layui-tree-checkedFirst');
    
    //初始选中
    that.setChecked(that.checkids);
    
    //搜索
    that.elem.find('.layui-tree-search').on('keyup', function(){
      var input = $(this)
      ,val = input.val()
      ,pack = input.nextAll()
      ,arr = [];

      //遍历所有的值
      pack.find('.'+ ELEM_TEXT).each(function(){
        var entry = $(this).parents('.'+ELEM_ENTRY);
        //若值匹配，加一个类以作标识
        if($(this).html().indexOf(val) != -1){
          arr.push($(this).parent());
          
          var select = function(div){
            div.addClass('layui-tree-searchShow');
            //向上父节点渲染
            if(div.parent('.'+ELEM_PACK)[0]){
              select(div.parent('.'+ELEM_PACK).parent('.'+ELEM_SET));
            };
          };
          select(entry.parent('.'+ELEM_SET));
        };
      });

      //根据标志剔除
      pack.find('.'+ELEM_ENTRY).each(function(){
        var parent = $(this).parent('.'+ELEM_SET);
        if(!parent.hasClass('layui-tree-searchShow')){
          parent.addClass(HIDE);
        };
      });
      if(pack.find('.layui-tree-searchShow').length == 0){
        that.elem.append(that.elemNone);
      };

      //节点过滤的回调
      options.onsearch && options.onsearch({
        elem: arr
      });
    });

    //还原搜索初始状态
    that.elem.find('.layui-tree-search').on('keydown', function(){
      $(this).nextAll().find('.'+ELEM_ENTRY).each(function(){
        var parent = $(this).parent('.'+ELEM_SET);
        parent.removeClass('layui-tree-searchShow '+ HIDE);
      });
      if($('.layui-tree-emptyText')[0]) $('.layui-tree-emptyText').remove();
    });
  };

  //得到选中节点
  Class.prototype.getChecked = function(){
    var that = this
    ,options = that.config
    ,checkId = []
    ,checkData = [];
    
    //遍历节点找到选中索引
    that.elem.find('.layui-form-checked').each(function(){
      checkId.push($(this).prev()[0].value);
    });
    
    //遍历节点
    var eachNodes = function(data, checkNode){
      layui.each(data, function(index, item){
        layui.each(checkId, function(index2, item2){
          if(item.id == item2){
            var cloneItem = $.extend({}, item);
            delete cloneItem.children;
            
            checkNode.push(cloneItem);
            
            if(item.children){
              cloneItem.children = [];
              eachNodes(item.children, cloneItem.children);
            }
            return true
          }
        });
      });
    };

    eachNodes($.extend({}, options.data), checkData);
    
    return checkData;
  };

  //设置选中节点
  Class.prototype.setChecked = function(checkedId){
    var that = this
    ,options = that.config;

    //初始选中
    that.elem.find('.'+ELEM_SET).each(function(i, item){
      var thisId = $(this).data('id')
      ,input = $(item).children('.'+ELEM_ENTRY).find('input[same="layuiTreeCheck"]')
      ,reInput = input.next();
      
      //若返回数字
      if(typeof checkedId === 'number'){
        if(thisId == checkedId){
          if(!input[0].checked){
            reInput.click();
          };
          return false;
        };
      } 
      //若返回数组
      else if(typeof checkedId === 'object'){
        layui.each(checkedId, function(index, value){
          if(value == thisId && !input[0].checked){
            reInput.click();
            return true;
          }
        });
      };
    });
  };

  //记录所有实例
  thisModule.that = {}; //记录所有实例对象
  thisModule.config = {}; //记录所有实例配置项
  
  //重载实例
  tree.reload = function(id, options){
    var that = thisModule.that[id];
    that.reload(options);
    
    return thisModule.call(that);
  };
  
  //获得选中的节点数据
  tree.getChecked = function(id){
    var that = thisModule.that[id];
    return that.getChecked();
  };
  
  //设置选中节点
  tree.setChecked = function(id, checkedId){
    var that = thisModule.that[id];
    return that.setChecked(checkedId);
  };
    
  //核心入口
  tree.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, tree);
})/**
 
 @Name：transfer 穿梭框组件
 @License：MIT

 */

layui.define(['laytpl', 'form'], function(exports){
  "use strict";
  
  var $ = layui.$
  ,laytpl = layui.laytpl
  ,form = layui.form
  
  //模块名
  ,MOD_NAME = 'transfer'

  //外部接口
  ,transfer = {
    config: {}
    ,index: layui[MOD_NAME] ? (layui[MOD_NAME].index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作当前实例
  ,thisModule = function(){
    var that = this
    ,options = that.config
    ,id = options.id || that.index;
    
    thisModule.that[id] = that; //记录当前实例对象
    thisModule.config[id] = options; //记录当前实例配置项
    
    return {
      config: options
      //重置实例
      ,reload: function(options){
        that.reload.call(that, options);
      }
      //获取右侧数据
      ,getData: function(){
        return that.getData.call(that);
      }
    }
  }
  
  //获取当前实例配置项
  ,getThisModuleConfig = function(id){
    var config = thisModule.config[id];
    if(!config) hint.error('The ID option was not found in the '+ MOD_NAME +' instance');
    return config || null;
  }

  //字符常量
  ,ELEM = 'layui-transfer', HIDE = 'layui-hide', DISABLED = 'layui-btn-disabled', NONE = 'layui-none'
  ,ELEM_BOX = 'layui-transfer-box', ELEM_HEADER = 'layui-transfer-header', ELEM_SEARCH = 'layui-transfer-search', ELEM_ACTIVE = 'layui-transfer-active', ELEM_DATA = 'layui-transfer-data'
  
  //穿梭框模板
  ,TPL_BOX = function(obj){
    obj = obj || {};
    return ['<div class="layui-transfer-box" data-index="'+ obj.index +'">'
      ,'<div class="layui-transfer-header">'
        ,'<input type="checkbox" name="'+ obj.checkAllName +'" lay-filter="layTransferCheckbox" lay-type="all" lay-skin="primary" title="{{ d.data.title['+ obj.index +'] || \'list'+ (obj.index + 1) +'\' }}">'
      ,'</div>'
      ,'{{# if(d.data.showSearch){ }}'
      ,'<div class="layui-transfer-search">'
        ,'<i class="layui-icon layui-icon-search"></i>'
        ,'<input type="input" class="layui-input" placeholder="关键词搜索">'
      ,'</div>'
      ,'{{# } }}'
      ,'<ul class="layui-transfer-data"></ul>'
    ,'</div>'].join('');
  }
  
  //主模板
  ,TPL_MAIN = ['<div class="layui-transfer layui-form layui-border-box" lay-filter="LAY-transfer-{{ d.index }}">'
    ,TPL_BOX({
      index: 0
      ,checkAllName: 'layTransferLeftCheckAll'
    })
    ,'<div class="layui-transfer-active">'
      ,'<button type="button" class="layui-btn layui-btn-sm layui-btn-primary layui-btn-disabled" data-index="0">'
        ,'<i class="layui-icon layui-icon-next"></i>'
      ,'</button>'
      ,'<button type="button" class="layui-btn layui-btn-sm layui-btn-primary layui-btn-disabled" data-index="1">'
        ,'<i class="layui-icon layui-icon-prev"></i>'
      ,'</button>'
    ,'</div>'
    ,TPL_BOX({
      index: 1
      ,checkAllName: 'layTransferRightCheckAll'
    })
  ,'</div>'].join('')

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++transfer.index;
    that.config = $.extend({}, that.config, transfer.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    title: ['列表一', '列表二']
    ,width: 200
    ,height: 360
    ,data: [] //数据源
    ,value: [] //选中的数据
    ,showSearch: false //是否开启搜索
    ,id: '' //唯一索引，默认自增 index
    ,text: {
      none: '无数据'
      ,searchNone: '无匹配数据'
    }
  };
  
  //重载实例
  Class.prototype.reload = function(options){
    var that = this;
    that.config = $.extend({}, that.config, options);
    that.render();
  };

  //渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;
    
    //解析模板
    var thisElem = that.elem = $(laytpl(TPL_MAIN).render({
      data: options
      ,index: that.index //索引
    }));
    
    var othis = options.elem = $(options.elem);
    if(!othis[0]) return;
    
    //初始化属性
    options.data = options.data || [];
    options.value = options.value || [];
    
    //索引
    that.key = options.id || that.index;
    
    //插入组件结构
    othis.html(that.elem);
    
    //各级容器
    that.layBox = that.elem.find('.'+ ELEM_BOX)
    that.layHeader = that.elem.find('.'+ ELEM_HEADER)
    that.laySearch = that.elem.find('.'+ ELEM_SEARCH)
    that.layData = thisElem.find('.'+ ELEM_DATA);
    that.layBtn = thisElem.find('.'+ ELEM_ACTIVE + ' .layui-btn');
    
    //初始化尺寸
    that.layBox.css({
      width: options.width
      ,height: options.height
    });
    that.layData.css({
      height: function(){
        return options.height - that.layHeader.outerHeight() - that.laySearch.outerHeight() - 2
      }()
    });
    
    that.renderData(); //渲染数据
    that.events(); //事件
  };
  
  //渲染数据
  Class.prototype.renderData = function(){
    var that = this
    ,options = that.config;
    
    //左右穿梭框差异数据
    var arr = [{
      checkName: 'layTransferLeftCheck'
      ,views: []
    }, {
      checkName: 'layTransferRightCheck'
      ,views: []
    }];
    
    //解析格式
    that.parseData(function(item){      
      //标注为 selected 的为右边的数据
      var _index = item.selected ? 1 : 0
      ,listElem = ['<li>'
        ,'<input type="checkbox" name="'+ arr[_index].checkName +'" lay-skin="primary" lay-filter="layTransferCheckbox" title="'+ item.title +'"'+ (item.disabled ? ' disabled' : '') + (item.checked ? ' checked' : '') +' value="'+ item.value +'">'
      ,'</li>'].join('');
      arr[_index].views.push(listElem);
      delete item.selected;
    });
    
    that.layData.eq(0).html(arr[0].views.join(''));
    that.layData.eq(1).html(arr[1].views.join(''));
    
    that.renderCheckBtn();
  }
  
  //渲染表单
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-transfer-'+ this.index);
  };
  
  //同步复选框和按钮状态
  Class.prototype.renderCheckBtn = function(obj){
    var that = this
    ,options = that.config;
    
    obj = obj || {};
    
    that.layBox.each(function(_index){
      var othis = $(this)
      ,thisDataElem = othis.find('.'+ ELEM_DATA)
      ,allElemCheckbox = othis.find('.'+ ELEM_HEADER).find('input[type="checkbox"]')
      ,listElemCheckbox =  thisDataElem.find('input[type="checkbox"]');
      
      //同步复选框和按钮状态
      var nums = 0
      ,haveChecked = false;
      listElemCheckbox.each(function(){
        var isHide = $(this).data('hide');
        if(this.checked || this.disabled || isHide){
          nums++;
        }
        if(this.checked && !isHide){
          haveChecked = true;
        }
      });
      
      allElemCheckbox.prop('checked', haveChecked && nums === listElemCheckbox.length); //全选复选框状态
      that.layBtn.eq(_index)[haveChecked ? 'removeClass' : 'addClass'](DISABLED); //对应的按钮状态
      
      //无数据视图
      if(!obj.stopNone){
        var isNone = thisDataElem.children('li:not(.'+ HIDE +')').length
        that.noneView(thisDataElem, isNone ? '' : options.text.none);
      }
    });
    
    that.renderForm('checkbox');
  };
  
  //无数据视图
  Class.prototype.noneView = function(thisDataElem, text){
    var createNoneElem = $('<p class="layui-none">'+ (text || '') +'</p>');
    if(thisDataElem.find('.'+ NONE)[0]){
      thisDataElem.find('.'+ NONE).remove();
    }
    text.replace(/\s/g, '') && thisDataElem.append(createNoneElem);
  };
  
  //同步 value 属性值
  Class.prototype.setValue = function(){
    var that = this
    ,options = that.config
    ,arr = [];
    that.layBox.eq(1).find('.'+ ELEM_DATA +' input[type="checkbox"]').each(function(){
      var isHide = $(this).data('hide');
      isHide || arr.push(this.value);
    });
    options.value = arr;
    
    return that;
  };

  //解析数据
  Class.prototype.parseData = function(callback){
    var that = this
    ,options = that.config
    ,newData = [];
    
    layui.each(options.data, function(index, item){
      //解析格式
      item = (typeof options.parseData === 'function' 
        ? options.parseData(item) 
      : item) || item;
      
      newData.push(item = $.extend({}, item))
      
      layui.each(options.value, function(index2, item2){
        if(item2 == item.value){
          item.selected = true;
        }
      });
      callback && callback(item);
    });
   
    options.data = newData;
    return that;
  };
  
  //获得右侧面板数据
  Class.prototype.getData = function(value){
    var that = this
    ,options = that.config
    ,selectedData = [];
    
    that.setValue();
    
    layui.each(value || options.value, function(index, item){
      layui.each(options.data, function(index2, item2){
        delete item2.selected;
        if(item == item2.value){
          selectedData.push(item2);
        };
      });
    });
    return selectedData;
  };
  
  //事件
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;
    
    //左右复选框
    that.elem.on('click', 'input[lay-filter="layTransferCheckbox"]+', function(){ 
      var thisElemCheckbox = $(this).prev()
      ,checked = thisElemCheckbox[0].checked
      ,thisDataElem = thisElemCheckbox.parents('.'+ ELEM_BOX).eq(0).find('.'+ ELEM_DATA);
      
      if(thisElemCheckbox[0].disabled) return;
      
      //判断是否全选
      if(thisElemCheckbox.attr('lay-type') === 'all'){
        thisDataElem.find('input[type="checkbox"]').each(function(){
          if(this.disabled) return;
          this.checked = checked;
        });
      }
      
      that.renderCheckBtn({stopNone: true});
    });
    
    //按钮事件
    that.layBtn.on('click', function(){
      var othis = $(this)
      ,_index = othis.data('index')
      ,thisBoxElem = that.layBox.eq(_index)
      ,arr = [];
      if(othis.hasClass(DISABLED)) return;
      
      that.layBox.eq(_index).each(function(_index){
        var othis = $(this)
        ,thisDataElem = othis.find('.'+ ELEM_DATA);
        
        thisDataElem.children('li').each(function(){
          var thisList = $(this)
          ,thisElemCheckbox = thisList.find('input[type="checkbox"]')
          ,isHide = thisElemCheckbox.data('hide');
          
          if(thisElemCheckbox[0].checked && !isHide){
            thisElemCheckbox[0].checked = false;
            thisBoxElem.siblings('.'+ ELEM_BOX).find('.'+ ELEM_DATA).append(thisList.clone());
            thisList.remove();
            
            //记录当前穿梭的数据
            arr.push(thisElemCheckbox[0].value);
          }
          
          that.setValue();
        });
      });
      
      that.renderCheckBtn();
      
      //穿梭时，如果另外一个框正在搜索，则触发匹配
      var siblingInput = thisBoxElem.siblings('.'+ ELEM_BOX).find('.'+ ELEM_SEARCH +' input')
      siblingInput.val() === '' ||  siblingInput.trigger('keyup');
      
      //穿梭时的回调
      options.onchange && options.onchange(that.getData(arr), _index);
    });
    
    //搜索
    that.laySearch.find('input').on('keyup', function(){
      var value = this.value
      ,thisDataElem = $(this).parents('.'+ ELEM_SEARCH).eq(0).siblings('.'+ ELEM_DATA)
      ,thisListElem = thisDataElem.children('li');

      thisListElem.each(function(){
        var thisList = $(this)
        ,thisElemCheckbox = thisList.find('input[type="checkbox"]')
        ,isMatch = thisElemCheckbox[0].title.indexOf(value) !== -1;

        thisList[isMatch ? 'removeClass': 'addClass'](HIDE);
        thisElemCheckbox.data('hide', isMatch ? false : true);
      });

      that.renderCheckBtn();
      
      //无匹配数据视图
      var isNone = thisListElem.length === thisDataElem.children('li.'+ HIDE).length;
      that.noneView(thisDataElem, isNone ? options.text.searchNone : '');
    });
  };
  
  //记录所有实例
  thisModule.that = {}; //记录所有实例对象
  thisModule.config = {}; //记录所有实例配置项
  
  //重载实例
  transfer.reload = function(id, options){
    var that = thisModule.that[id];
    that.reload(options);
    
    return thisModule.call(that);
  };
  
  //获得选中的数据（右侧面板）
  transfer.getData = function(id){
    var that = thisModule.that[id];
    return that.getData();
  };

  //核心入口
  transfer.render = function(options){
    var inst = new Class(options);
    return thisModule.call(inst);
  };

  exports(MOD_NAME, transfer);
});
/**

 @Name：table 表格操作组件
 @License：MIT

 */

layui.define(['laytpl', 'laypage', 'layer', 'form', 'util'], function(exports){
  "use strict";

  var $ = layui.$
  ,laytpl = layui.laytpl
  ,laypage = layui.laypage
  ,layer = layui.layer
  ,form = layui.form
  ,util = layui.util
  ,hint = layui.hint()
  ,device = layui.device()

  //外部接口
  ,table = {
    config: {
      checkName: 'LAY_CHECKED' //是否选中状态的字段名
      ,indexName: 'LAY_TABLE_INDEX' //初始下标索引名，用于恢复排序
    } //全局配置项
    ,cache: {} //数据缓存
    ,index: layui.table ? (layui.table.index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }

    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作当前实例
  ,thisTable = function(){
    var that = this
    ,options = that.config
    ,id = options.id || options.index;

    if(id){
      thisTable.that[id] = that; //记录当前实例对象
      thisTable.config[id] = options; //记录当前实例配置项
    }

    return {
      config: options
      ,reload: function(options, deep){
        that.reload.call(that, options, deep);
      }
      ,setColsWidth: function(){
        that.setColsWidth.call(that);
      }
      ,resize: function(){ //重置表格尺寸/结构
        that.resize.call(that);
      }
      ,reloadData: function (){
        that.config.lazy = false
        if(that.layPage.length > 0 && that.layPage.find('.layui-input').length > 0){
          that.layPage.find('.layui-input').val(1)
          that.layPage.find('.layui-laypage-btn').click()
        }else {
          that.pullData.call(that, 1);
        }
      }
    }
  }

  //获取当前实例配置项
  ,getThisTableConfig = function(id){
    var config = thisTable.config[id];
    if(!config) hint.error(id ? ('The table instance with ID \''+ id +'\' not found') : 'ID argument required');
    return config || null;
  }

  //解析自定义模板数据
  ,parseTempData = function(item3, content, tplData, text){ //表头数据、原始内容、表体数据、是否只返回文本
    var str = item3.templet ? function(){
      return typeof item3.templet === 'function'
        ? item3.templet(tplData)
      : laytpl($(item3.templet).html() || String(content)).render(tplData)
    }() : content;
    return text ? $('<div>'+ str +'</div>').text() : str;
  }

  //字符常量
  ,MOD_NAME = 'table', ELEM = '.layui-table', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled', NONE = 'layui-none'

  ,ELEM_VIEW = 'layui-table-view', ELEM_TOOL = '.layui-table-tool', ELEM_BOX = '.layui-table-box', ELEM_INIT = '.layui-table-init', ELEM_HEADER = '.layui-table-header', ELEM_BODY = '.layui-table-body', ELEM_MAIN = '.layui-table-main', ELEM_FIXED = '.layui-table-fixed', ELEM_FIXL = '.layui-table-fixed-l', ELEM_FIXR = '.layui-table-fixed-r', ELEM_TOTAL = '.layui-table-total', ELEM_PAGE = '.layui-table-page', ELEM_SORT = '.layui-table-sort', ELEM_EDIT = 'layui-table-edit', ELEM_HOVER = 'layui-table-hover'

  //thead区域模板
  ,TPL_HEADER = function(options){
    var rowCols = '{{#if(item2.colspan){}} colspan="{{item2.colspan}}"{{#} if(item2.rowspan){}} rowspan="{{item2.rowspan}}"{{#}}}';

    options = options || {};
    return ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
      ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
      ,'<thead>'
      ,'{{# layui.each(d.data.cols, function(i1, item1){ }}'
        ,'<tr>'
        ,'{{# layui.each(item1, function(i2, item2){ }}'
          ,'{{# if(item2.fixed && item2.fixed !== "right"){ left = true; } }}'
          ,'{{# if(item2.fixed === "right"){ right = true; } }}'
          ,function(){
            if(options.fixed && options.fixed !== 'right'){
              return '{{# if(item2.fixed && item2.fixed !== "right"){ }}';
            }
            if(options.fixed === 'right'){
              return '{{# if(item2.fixed === "right"){ }}';
            }
            return '';
          }()
          ,'{{# var isSort = !(item2.colGroup) && item2.sort; }}'
          ,'<th data-field="{{ item2.field||i2 }}" data-key="{{d.index}}-{{i1}}-{{i2}}" {{# if( item2.parentKey){ }}data-parentkey="{{ item2.parentKey }}"{{# } }} {{# if(item2.minWidth){ }}data-minwidth="{{item2.minWidth}}"{{# } }} '+ rowCols +' {{# if(item2.unresize || item2.colGroup){ }}data-unresize="true"{{# } }} class="{{# if(item2.hide){ }}layui-hide{{# } }}{{# if(isSort){ }} layui-unselect{{# } }}{{# if(!item2.field){ }} layui-table-col-special{{# } }}">'
            ,'<div class="layui-table-cell laytable-cell-'
              ,'{{# if(item2.colGroup){ }}'
                ,'group'
              ,'{{# } else { }}'
                ,'{{d.index}}-{{i1}}-{{i2}}'
                ,'{{# if(item2.type !== "normal"){ }}'
                  ,' laytable-cell-{{ item2.type }}'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'" {{#if(item2.align){}}align="{{item2.align}}"{{#}}}>'
              ,'{{# if(item2.type === "checkbox"){ }}' //复选框
                ,'<input type="checkbox" name="layTableCheckbox" lay-skin="primary" lay-filter="layTableAllChoose" {{# if(item2[d.data.checkName]){ }}checked{{# }; }}>'
              ,'{{# } else { }}'
                ,'<span>{{item2.title||""}}</span>'
                ,'{{# if(isSort){ }}'
                  ,'<span class="layui-table-sort layui-inline"><i class="layui-edge layui-table-sort-asc" title="升序"></i><i class="layui-edge layui-table-sort-desc" title="降序"></i></span>'
                ,'{{# } }}'
              ,'{{# } }}'
            ,'</div>'
          ,'</th>'
          ,(options.fixed ? '{{# }; }}' : '')
        ,'{{# }); }}'
        ,'</tr>'
      ,'{{# }); }}'
      ,'</thead>'
    ,'</table>'].join('');
  }

  //tbody区域模板
  ,TPL_BODY = ['<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
    ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
    ,'<tbody></tbody>'
  ,'</table>'].join('')

  //主模板
  ,TPL_MAIN = ['<div class="layui-form layui-border-box {{d.VIEW_CLASS}}" lay-filter="LAY-table-{{d.index}}" lay-id="{{ d.data.id }}" style="{{# if(d.data.width){ }}width:{{d.data.width}}px;{{# } }} {{# if(d.data.height){ }}height:{{d.data.height}}px;{{# } }}">'

    ,'{{# if(d.data.toolbar){ }}'
    ,'<div class="layui-table-tool">'
      ,'<div class="layui-table-tool-temp"></div>'
      ,'<div class="layui-table-tool-self"></div>'
    ,'</div>'
    ,'{{# } }}'

    ,'<div class="layui-table-box">'
      ,'{{# if(d.data.loading){ }}'
      ,'<div class="layui-table-init" style="background-color: #fff;">'
        ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
      ,'</div>'
      ,'{{# } }}'

      ,'{{# var left, right; }}'
      ,'<div class="layui-table-header">'
        ,TPL_HEADER()
      ,'</div>'
      ,'<div class="layui-table-body layui-table-main">'
        ,TPL_BODY
      ,'</div>'

      ,'{{# if(left){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-l">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: true})
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'
      ,'</div>'
      ,'{{# }; }}'

      ,'{{# if(right){ }}'
      ,'<div class="layui-table-fixed layui-table-fixed-r">'
        ,'<div class="layui-table-header">'
          ,TPL_HEADER({fixed: 'right'})
          ,'<div class="layui-table-mend"></div>'
        ,'</div>'
        ,'<div class="layui-table-body">'
          ,TPL_BODY
        ,'</div>'
      ,'</div>'
      ,'{{# }; }}'
    ,'</div>'

    ,'{{# if(d.data.totalRow){ }}'
      ,'<div class="layui-table-total">'
        ,'<table cellspacing="0" cellpadding="0" border="0" class="layui-table" '
        ,'{{# if(d.data.skin){ }}lay-skin="{{d.data.skin}}"{{# } }} {{# if(d.data.size){ }}lay-size="{{d.data.size}}"{{# } }} {{# if(d.data.even){ }}lay-even{{# } }}>'
          ,'<tbody><tr><td><div class="layui-table-cell" style="visibility: hidden;">Total</div></td></tr></tbody>'
      , '</table>'
      ,'</div>'
    ,'{{# } }}'

    ,'{{# if(d.data.page){ }}'
    ,'<div class="layui-table-page">'
      ,'<div id="layui-table-page{{d.index}}"></div>'
    ,'</div>'
    ,'{{# } }}'

    ,'<style>'
    ,'{{# layui.each(d.data.cols, function(i1, item1){'
      ,'layui.each(item1, function(i2, item2){ }}'
        ,'.laytable-cell-{{d.index}}-{{i1}}-{{i2}}{ '
        ,'{{# if(item2.width){ }}'
          ,'width: {{item2.width}}px;'
        ,'{{# } }}'
        ,' }'
      ,'{{# });'
    ,'}); }}'
    ,'</style>'
  ,'</div>'].join('')

  ,_WIN = $(window)
  ,_DOC = $(document)

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++table.index;
    that.config = $.extend({}, that.config, table.config, options);
    that.render();
  };

  //初始默认配置
  Class.prototype.config = {
    limit: 10 //每页显示的数量
    ,loading: true //请求数据时，是否显示loading
    ,cellMinWidth: 60 //所有单元格默认最小宽度
    ,defaultToolbar: ['filter', 'exports', 'print'] //工具栏右侧图标
    ,autoSort: true //是否前端自动排序。如果否，则需自主排序（通常为服务端处理好排序）
    ,text: {
      none: '无数据'
    }
    ,lazy: false
  };

  //表格渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    options.where = options.where || {};
    options.id = options.id || options.elem.attr('id') || that.index;

    //请求参数的自定义格式
    options.request = $.extend({
      pageName: 'page'
      ,limitName: 'limit'
    }, options.request)

    //响应数据的自定义格式
    options.response = $.extend({
      statusName: 'code' //规定数据状态的字段名称
      ,statusCode: 0 //规定成功的状态码
      ,msgName: 'msg' //规定状态信息的字段名称
      ,dataName: 'data' //规定数据总数的字段名称
      ,totalRowName: 'totalRow' //规定数据统计的字段名称
      ,countName: 'count'
    }, options.response);

    //如果 page 传入 laypage 对象
    if(typeof options.page === 'object'){
      options.limit = options.page.limit || options.limit;
      options.limits = options.page.limits || options.limits;
      that.page = options.page.curr = options.page.curr || 1;
      delete options.page.elem;
      delete options.page.jump;
    }

    if(!options.elem[0]) return that;

    //高度铺满：full-差距值
    if(options.height && /^full-\d+$/.test(options.height)){
      that.fullHeightGap = options.height.split('-')[1];
      options.height = _WIN.height() - that.fullHeightGap;
    }

    //初始化一些参数
    that.setInit();

    //开始插入替代元素
    var othis = options.elem
    ,hasRender = othis.next('.' + ELEM_VIEW)

    //主容器
    ,reElem = that.elem = $(laytpl(TPL_MAIN).render({
      VIEW_CLASS: ELEM_VIEW
      ,data: options
      ,index: that.index //索引
    }));

    options.index = that.index;
    that.key = options.id || options.index;

    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender
    othis.after(reElem);

    //各级容器
    that.layTool = reElem.find(ELEM_TOOL);
    that.layBox = reElem.find(ELEM_BOX);
    that.layHeader = reElem.find(ELEM_HEADER);
    that.layMain = reElem.find(ELEM_MAIN);
    that.layBody = reElem.find(ELEM_BODY);
    that.layFixed = reElem.find(ELEM_FIXED);
    that.layFixLeft = reElem.find(ELEM_FIXL);
    that.layFixRight = reElem.find(ELEM_FIXR);
    that.layTotal = reElem.find(ELEM_TOTAL);
    that.layPage = reElem.find(ELEM_PAGE);

    //初始化工具栏
    that.renderToolbar();

    //让表格平铺
    that.fullSize();

    //如果多级表头，则填补表头高度
    if(options.cols.length > 1){
      //补全高度
      var th = that.layFixed.find(ELEM_HEADER).find('th');
      th.height(that.layHeader.height() - 1 - parseFloat(th.css('padding-top')) - parseFloat(th.css('padding-bottom')));
    }

    that.pullData(that.page); //请求数据
    that.events(); //事件
  };

  //根据列类型，定制化参数
  Class.prototype.initOpts = function(item){
    var that = this
    ,options = that.config
    ,initWidth = {
      checkbox: 48
      ,radio: 48
      ,space: 15
      ,numbers: 40
    };

    //让 type 参数兼容旧版本
    if(item.checkbox) item.type = "checkbox";
    if(item.space) item.type = "space";
    if(!item.type) item.type = "normal";

    if(item.type !== "normal"){
      item.unresize = true;
      item.width = item.width || initWidth[item.type];
    }
  };

  //初始化一些参数
  Class.prototype.setInit = function(type){
    var that = this
    ,options = that.config;

    options.clientWidth = options.width || function(){ //获取容器宽度
      //如果父元素宽度为0（一般为隐藏元素），则继续查找上层元素，直到找到真实宽度为止
      var getWidth = function(parent){
        var width, isNone;
        parent = parent || options.elem.parent()
        width = parent.width();
        try {
          isNone = parent.css('display') === 'none';
        } catch(e){}
        if(parent[0] && (!width || isNone)) return getWidth(parent.parent());
        return width;
      };
      return getWidth();
    }();

    if(type === 'width') return options.clientWidth;

    //初始化列参数
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){

        //如果列参数为空，则移除
        if(!item2){
          item1.splice(i2, 1);
          return;
        }

        item2.key = i1 + '-' + i2;
        item2.hide = item2.hide || false;

        //设置列的父列索引
        //如果是组合列，则捕获对应的子列
        if(item2.colGroup || item2.colspan > 1){
          var childIndex = 0;
          layui.each(options.cols[i1 + 1], function(i22, item22){
            //如果子列已经被标注为{HAS_PARENT}，或者子列累计 colspan 数等于父列定义的 colspan，则跳出当前子列循环
            if(item22.HAS_PARENT || (childIndex > 1 && childIndex == item2.colspan)) return;

            item22.HAS_PARENT = true;
            item22.parentKey = i1 + '-' + i2;

            childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
          });
          item2.colGroup = true; //标注是组合列
        }

        //根据列类型，定制化参数
        that.initOpts(item2);
      });
    });

  };

  //初始工具栏
  Class.prototype.renderToolbar = function(){
    var that = this
    ,options = that.config

    //添加工具栏左侧模板
    var leftDefaultTemp = [
      '<div class="layui-inline" lay-event="add"><i class="layui-icon layui-icon-add-1"></i></div>'
      ,'<div class="layui-inline" lay-event="update"><i class="layui-icon layui-icon-edit"></i></div>'
      ,'<div class="layui-inline" lay-event="delete"><i class="layui-icon layui-icon-delete"></i></div>'
    ].join('')
    ,elemToolTemp = that.layTool.find('.layui-table-tool-temp');

    if(options.toolbar === 'default'){
      elemToolTemp.html(leftDefaultTemp);
    } else if(typeof options.toolbar === 'string'){
      var toolbarHtml = $(options.toolbar).html() || '';
      toolbarHtml && elemToolTemp.html(
        laytpl(toolbarHtml).render(options)
      );
    }

    //添加工具栏右侧面板
    var layout = {
      filter: {
        title: '筛选列'
        ,layEvent: 'LAYTABLE_COLS'
        ,icon: 'layui-icon-cols'
      }
      ,exports: {
        title: '导出'
        ,layEvent: 'LAYTABLE_EXPORT'
        ,icon: 'layui-icon-export'
      }
      ,print: {
        title: '打印'
        ,layEvent: 'LAYTABLE_PRINT'
        ,icon: 'layui-icon-print'
      }
    }, iconElem = [];

    if(typeof options.defaultToolbar === 'object'){
      layui.each(options.defaultToolbar, function(i, item){
        var thisItem = typeof item === 'string' ? layout[item] : item;
        if(thisItem){
          iconElem.push('<div class="layui-inline" title="'+ thisItem.title +'" lay-event="'+ thisItem.layEvent +'">'
            +'<i class="layui-icon '+ thisItem.icon +'"></i>'
          +'</div>');
        }
      });
    }
    that.layTool.find('.layui-table-tool-self').html(iconElem.join(''));
  }

  //同步表头父列的相关值
  Class.prototype.setParentCol = function(hide, parentKey){
    var that = this
    ,options = that.config

    ,parentTh = that.layHeader.find('th[data-key="'+ options.index +'-'+ parentKey +'"]') //获取父列元素
    ,parentColspan = parseInt(parentTh.attr('colspan')) || 0;

    if(parentTh[0]){
      var arrParentKey = parentKey.split('-')
      ,getThisCol = options.cols[arrParentKey[0]][arrParentKey[1]];

      hide ? parentColspan-- : parentColspan++;

      parentTh.attr('colspan', parentColspan);
      parentTh[parentColspan < 1 ? 'addClass' : 'removeClass'](HIDE);

      getThisCol.colspan = parentColspan; //同步 colspan 参数
      getThisCol.hide = parentColspan < 1; //同步 hide 参数

      //递归，继续往上查询是否有父列
      var nextParentKey = parentTh.data('parentkey');
      nextParentKey && that.setParentCol(hide, nextParentKey);
    }
  };

  //多级表头补丁
  Class.prototype.setColsPatch = function(){
    var that = this
    ,options = that.config

    //同步表头父列的相关值
    layui.each(options.cols, function(i1, item1){
      layui.each(item1, function(i2, item2){
        if(item2.hide){
          that.setParentCol(item2.hide, item2.parentKey);
        }
      });
    });
  };

  //动态分配列宽
  Class.prototype.setColsWidth = function(){
    var that = this
    ,options = that.config
    ,colNums = 0 //列个数
    ,autoColNums = 0 //自动列宽的列个数
    ,autoWidth = 0 //自动列分配的宽度
    ,countWidth = 0 //所有列总宽度和
    ,cntrWidth = that.setInit('width');

    //统计列个数
    that.eachCols(function(i, item){
      item.hide || colNums++;
    });

    //减去边框差和滚动条宽
    cntrWidth = cntrWidth - function(){
      return (options.skin === 'line' || options.skin === 'nob') ? 2 : colNums + 1;
    }() - that.getScrollWidth(that.layMain[0]) - 1;

    //计算自动分配的宽度
    var getAutoWidth = function(back){
      //遍历所有列
      layui.each(options.cols, function(i1, item1){
        layui.each(item1, function(i2, item2){
          var width = 0
          ,minWidth = item2.minWidth || options.cellMinWidth; //最小宽度

          if(!item2){
            item1.splice(i2, 1);
            return;
          }

          if(item2.colGroup || item2.hide) return;

          if(!back){
            width = item2.width || 0;
            if(/\d+%$/.test(width)){ //列宽为百分比
              width = Math.floor((parseFloat(width) / 100) * cntrWidth);
              width < minWidth && (width = minWidth);
            } else if(!width){ //列宽未填写
              item2.width = width = 0;
              autoColNums++;
            }
          } else if(autoWidth && autoWidth < minWidth){
            autoColNums--;
            width = minWidth;
          }

          if(item2.hide) width = 0;
          countWidth = countWidth + width;
        });
      });

      //如果未填充满，则将剩余宽度平分
      (cntrWidth > countWidth && autoColNums) && (
        autoWidth = (cntrWidth - countWidth) / autoColNums
      );
    }

    getAutoWidth();
    getAutoWidth(true); //重新检测分配的宽度是否低于最小列宽

    //记录自动列数
    that.autoColNums = autoColNums;

    //设置列宽
    that.eachCols(function(i3, item3){
      var minWidth = item3.minWidth || options.cellMinWidth;
      if(item3.colGroup || item3.hide) return;

      //给位分配宽的列平均分配宽
      if(item3.width === 0){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor(autoWidth >= minWidth ? autoWidth : minWidth) + 'px';
        });
      }

      //给设定百分比的列分配列宽
      else if(/\d+%$/.test(item3.width)){
        that.getCssRule(options.index +'-'+ item3.key, function(item){
          item.style.width = Math.floor((parseFloat(item3.width) / 100) * cntrWidth) + 'px';
        });
      }
    });

    //填补 Math.floor 造成的数差
    var patchNums = that.layMain.width() - that.getScrollWidth(that.layMain[0])
    - that.layMain.children('table').outerWidth();

    if(that.autoColNums && patchNums >= -colNums && patchNums <= colNums){
      var getEndTh = function(th){
        var field;
        th = th || that.layHeader.eq(0).find('thead th:last-child')
        field = th.data('field');
        if(!field && th.prev()[0]){
          return getEndTh(th.prev())
        }
        return th
      }
      ,th = getEndTh()
      ,key = th.data('key');

      that.getCssRule(key, function(item){
        var width = item.style.width || th.outerWidth();
        item.style.width = (parseFloat(width) + patchNums) + 'px';

        //二次校验，如果仍然出现横向滚动条（通常是 1px 的误差导致）
        if(that.layMain.height() - that.layMain.prop('clientHeight') > 0){
          item.style.width = (parseFloat(item.style.width) - 1) + 'px';
        }
      });
    }

    that.loading(!0);
  };

  //重置表格尺寸/结构
  Class.prototype.resize = function(){
    var that = this;
    that.fullSize(); //让表格铺满
    that.setColsWidth(); //自适应列宽
    that.scrollPatch(); //滚动条补丁
  };

  //表格重载
  Class.prototype.reload = function(options, deep){
    var that = this;

    options = options || {};
    delete that.haveInit;

    //如果直接传入数组 data，则移除原来的数组，以免数组发生深度拷贝
    if(options.data && options.data.constructor === Array) delete that.config.data;

    //对参数进行深度或浅扩展
    that.config = $.extend(deep, {}, that.config, options);

    //执行渲染
    that.render();
  };

  //异常提示
  Class.prototype.errorView = function(html){
    var that = this
    ,elemNone = that.layMain.find('.'+ NONE)
    ,layNone = $('<div class="'+ NONE +'">'+ (html || 'Error') +'</div>');

    if(elemNone[0]){
      that.layNone.remove();
      elemNone.remove();
    }

    that.layFixed.addClass(HIDE);
    that.layMain.find('tbody').html('');

    that.layMain.append(that.layNone = layNone);

    table.cache[that.key] = []; //格式化缓存数据
  };

  //页码
  Class.prototype.page = 1;

  //获得数据
  Class.prototype.pullData = function(curr){
    var that = this
    ,options = that.config
    ,request = options.request
    ,response = options.response
    ,sort = function(){
      if(typeof options.initSort === 'object'){
        that.sort(options.initSort.field, options.initSort.type);
      }
    };

    that.startTime = new Date().getTime(); //渲染开始时间

    if(options.url && !options.lazy){ //Ajax请求
      var params = {};
      params[request.pageName] = curr;
      params[request.limitName] = options.limit;

      //参数
      var data = $.extend(params, options.where);

      //用于参数签名
      if($.isFunction(options.data)){
        data = options.data(data)
      }

      if(options.contentType && options.contentType.indexOf("application/json") == 0){ //提交 json 格式
        data = JSON.stringify(data);
      }

      that.loading();

      $.ajax({
        type: options.method || 'get'
        ,url: options.url
        ,contentType: options.contentType
        ,data: data
        ,dataType: 'json'
        ,headers: options.headers || {}
        ,success: function(res){
          //如果有数据解析的回调，则获得其返回的数据
          if(typeof options.parseData === 'function'){
            res = options.parseData(res) || res;
          }
          //检查数据格式是否符合规范
          if(res[response.statusName] != response.statusCode){
            that.renderForm();
            that.errorView(
              res[response.msgName] ||
              ('返回的数据不符合规范，正确的成功状态码应为："'+ response.statusName +'": '+ response.statusCode)
            );
          } else {
            that.renderData(res, curr, res[response.countName]), sort();
            options.time = (new Date().getTime() - that.startTime) + ' ms'; //耗时（接口请求+视图渲染）
          }
          that.setColsWidth();
          typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
        }
        ,error: function(e, m){
          that.errorView('数据接口请求异常：'+ m);

          that.renderForm();
          that.setColsWidth();

          typeof options.error === 'function' && options.error(e, msg);
        }
      });
    } else if(options.data){ //已知数据
      if(options.lazy && options.data.constructor === Object){
        //如果有数据解析的回调，则获得其返回的数据
        var res = options.data
        if(typeof options.parseData === 'function'){
          res = options.parseData(res) || res;
        }
        //检查数据格式是否符合规范
        if(res[response.statusName] != response.statusCode){
          that.renderForm();
          that.errorView(
              res[response.msgName] ||
              ('返回的数据不符合规范，正确的成功状态码应为："'+ response.statusName +'": '+ response.statusCode)
          );
        } else {
          options.time = (new Date().getTime() - that.startTime) + ' ms'; //耗时（接口请求+视图渲染）
        }
        options.lazy = false
      } else if(options.data.constructor === Array) {
        var res          = {}, startLimit = curr * options.limit - options.limit

        res[response.dataName]  = options.data.concat().splice(startLimit, options.limit);
        res[response.countName] = options.data.length;

        //记录合计行数据
        if (typeof options.totalRow === 'object') {
          res[response.totalRowName] = $.extend({}, options.totalRow);
        }
      } else {
        return
      }

      that.renderData(res, curr, res[response.countName]), sort();
      that.setColsWidth();
      typeof options.done === 'function' && options.done(res, curr, res[response.countName]);
    }
  };

  //遍历表头
  Class.prototype.eachCols = function(callback){
    var that = this;
    table.eachCols(null, callback, that.config.cols);
    return that;
  };

  //数据渲染
  Class.prototype.renderData = function(res, curr, count, sort){
    var that = this
    ,options = that.config
    ,data = res[options.response.dataName] || [] //列表数据
    ,totalRowData = res[options.response.totalRowName] //合计行数据
    ,trs = []
    ,trs_fixed = []
    ,trs_fixed_r = []

    //渲染视图
    ,render = function(){ //后续性能提升的重点
      var thisCheckedRowIndex;
      if(!sort && that.sortKey){
        return that.sort(that.sortKey.field, that.sortKey.sort, true);
      }
      layui.each(data, function(i1, item1){
        var tds = [], tds_fixed = [], tds_fixed_r = []
        ,numbers = i1 + options.limit*(curr - 1) + 1; //序号

        if(item1.length === 0) return;

        if(!sort){
          item1[table.config.indexName] = i1;
        }

        that.eachCols(function(i3, item3){
          var field = item3.field || i3
          ,key = options.index + '-' + item3.key
          ,content = item1[field];

          if(content === undefined || content === null) content = '';
          if(item3.colGroup) return;

          //td内容
          var td = ['<td data-field="'+ field +'" data-key="'+ key +'" '+ function(){ //追加各种属性
            var attr = [];
            if(item3.edit) attr.push('data-edit="'+ item3.edit +'"'); //是否允许单元格编辑
            if(item3.align) attr.push('align="'+ item3.align +'"'); //对齐方式
            if(item3.templet) attr.push('data-content="'+ content +'"'); //自定义模板
            if(item3.toolbar) attr.push('data-off="true"'); //行工具列关闭单元格事件
            if(item3.event) attr.push('lay-event="'+ item3.event +'"'); //自定义事件
            if(item3.style) attr.push('style="'+ item3.style +'"'); //自定义样式
            if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); //单元格最小宽度
            if(item3.with) attr.push('data-with="' + item1[item3.with] + '"');
            return attr.join(' ');
          }() +' class="'+ function(){ //追加样式
            var classNames = [];
            if(item3.hide) classNames.push(HIDE); //插入隐藏列样式
            if(!item3.field) classNames.push('layui-table-col-special'); //插入特殊列样式
            return classNames.join(' ');
          }() +'">'
            ,'<div class="layui-table-cell laytable-cell-'+ function(){ //返回对应的CSS类标识
              return item3.type === 'normal' ? key
              : (key + ' laytable-cell-' + item3.type);
            }() +'">' + function(){
              var tplData = $.extend(true, {
                LAY_INDEX: numbers
              }, item1)
              ,checkName = table.config.checkName;

              //渲染不同风格的列
              switch(item3.type){
                case 'checkbox':
                  return '<input type="checkbox" name="layTableCheckbox" lay-skin="primary" '+ function(){
                    //如果是全选
                    if(item3[checkName]){
                      item1[checkName] = item3[checkName];
                      return item3[checkName] ? 'checked' : '';
                    }
                    return tplData[checkName] ? 'checked' : '';
                  }() +'>';
                break;
                case 'radio':
                  if(tplData[checkName]){
                    thisCheckedRowIndex = i1;
                  }
                  return '<input type="radio" name="layTableRadio_'+ options.index +'" '
                  + (tplData[checkName] ? 'checked' : '') +' lay-type="layTableRadio">';
                break;
                case 'numbers':
                  return numbers;
                break;
              };

              //解析工具列模板
              if(item3.toolbar){
                return laytpl($(item3.toolbar).html()||'').render(tplData);
              }
              return parseTempData(item3, content, tplData);
            }()
          ,'</div></td>'].join('');

          tds.push(td);
          if(item3.fixed && item3.fixed !== 'right') tds_fixed.push(td);
          if(item3.fixed === 'right') tds_fixed_r.push(td);
        });

        trs.push('<tr data-index="'+ i1 +'">'+ tds.join('') + '</tr>');
        trs_fixed.push('<tr data-index="'+ i1 +'">'+ tds_fixed.join('') + '</tr>');
        trs_fixed_r.push('<tr data-index="'+ i1 +'">'+ tds_fixed_r.join('') + '</tr>');
      });

      that.layBody.scrollTop(0);
      that.layMain.find('.'+ NONE).remove();
      that.layMain.find('tbody').html(trs.join(''));
      that.layFixLeft.find('tbody').html(trs_fixed.join(''));
      that.layFixRight.find('tbody').html(trs_fixed_r.join(''));

      that.renderForm();
      typeof thisCheckedRowIndex === 'number' && that.setThisRowChecked(thisCheckedRowIndex);
      that.syncCheckAll();

      //滚动条补丁
      that.haveInit ? that.scrollPatch() : setTimeout(function(){
        that.scrollPatch();
      }, 50);
      that.haveInit = true;

      layer.close(that.tipsIndex);

      //同步表头父列的相关值
      options.HAS_SET_COLS_PATCH || that.setColsPatch();
      options.HAS_SET_COLS_PATCH = true;
    };

    table.cache[that.key] = data; //记录数据

    //显示隐藏分页栏
    that.layPage[(count == 0 || (data.length === 0 && curr == 1)) ? 'addClass' : 'removeClass'](HIDE);

    //如果无数据
    if(data.length === 0){
      that.renderForm();
      return that.errorView(options.text.none);
    } else {
      that.layFixed.removeClass(HIDE);
    }

    //如果执行初始排序
    if(sort){
      return render();
    }

    //正常初始化数据渲染
    render(); //渲染数据
    that.renderTotal(data, totalRowData); //数据合计

    //同步分页状态
    if(options.page){
      options.page = $.extend({
        elem: 'layui-table-page' + options.index
        ,count: count
        ,limit: options.limit
        ,limits: options.limits || [10,20,30,40,50,60,70,80,90]
        ,groups: 3
        ,layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
        ,prev: '<i class="layui-icon">&#xe603;</i>'
        ,next: '<i class="layui-icon">&#xe602;</i>'
        ,jump: function(obj, first){
          if(!first){
            //分页本身并非需要做以下更新，下面参数的同步，主要是因为其它处理统一用到了它们
            //而并非用的是 options.page 中的参数（以确保分页未开启的情况仍能正常使用）
            that.page = obj.curr; //更新页码
            options.limit = obj.limit; //更新每页条数

            that.pullData(obj.curr);
          }
        }
      }, options.page);
      options.page.count = count; //更新总条数
      laypage.render(options.page);
    }
  };

  //数据合计行
  Class.prototype.renderTotal = function(data, totalRowData){
    var that = this
    ,options = that.config
    ,totalNums = {};

    if(!options.totalRow) return;

    layui.each(data, function(i1, item1){
      if(item1.length === 0) return;

      that.eachCols(function(i3, item3){
        var field = item3.field || i3
        ,content = item1[field];

        if(item3.totalRow){
          totalNums[field] = (totalNums[field] || 0) + (parseFloat(content) || 0);
        }
      });
    });

    that.dataTotal = {};

    var tds = [];
    that.eachCols(function(i3, item3){
      var field = item3.field || i3;

      //td内容
      var content = function(){
        var text = item3.totalRowText || ''
        ,thisTotalNum = parseFloat(totalNums[field]).toFixed(2)
        ,tplData = {};

        tplData[field] = thisTotalNum;
        thisTotalNum = parseTempData(item3, thisTotalNum, tplData);

        //如果直接传入了合计行数据，则不输出自动计算的结果
        if(totalRowData){
          return totalRowData[item3.field] || text;
        } else {
          return item3.totalRow ? (thisTotalNum || text) : text;
        }
      }()
      ,td = ['<td data-field="'+ field +'" data-key="'+ options.index + '-'+ item3.key +'" '+ function(){
        var attr = [];
        if(item3.align) attr.push('align="'+ item3.align +'"'); //对齐方式
        if(item3.style) attr.push('style="'+ item3.style +'"'); //自定义样式
        if(item3.minWidth) attr.push('data-minwidth="'+ item3.minWidth +'"'); //单元格最小宽度
        return attr.join(' ');
      }() +' class="'+ function(){ //追加样式
        var classNames = [];
        if(item3.hide) classNames.push(HIDE); //插入隐藏列样式
        if(!item3.field) classNames.push('layui-table-col-special'); //插入特殊列样式
        return classNames.join(' ');
      }() +'">'
        ,'<div class="layui-table-cell laytable-cell-'+ function(){ //返回对应的CSS类标识
          var str = (options.index + '-' + item3.key);
          return item3.type === 'normal' ? str
          : (str + ' laytable-cell-' + item3.type);
        }() +'">' + function(){
          var totalRow = item3.totalRow || options.totalRow;
          //如果 totalRow 参数为字符类型，则解析为自定义模版
          if(typeof totalRow === 'string'){
            return laytpl(totalRow).render($.extend({
              TOTAL_NUMS: content
            }, item3))
          }
          return content;
        }()
      ,'</div></td>'].join('');

      item3.field && (that.dataTotal[field] = content);
      tds.push(td);
    });

    that.layTotal.find('tbody').html('<tr>' + tds.join('') + '</tr>');
  };

  //找到对应的列元素
  Class.prototype.getColElem = function(parent, key){
    var that = this
    ,options = that.config;
    return parent.eq(0).find('.laytable-cell-'+ (options.index + '-' + key) + ':eq(0)');
  };

  //渲染表单
  Class.prototype.renderForm = function(type){
    form.render(type, 'LAY-table-'+ this.index);
  };

  //标记当前行选中状态
  Class.prototype.setThisRowChecked = function(index){
    var that = this
    ,options = that.config
    ,ELEM_CLICK = 'layui-table-click'
    ,tr = that.layBody.find('tr[data-index="'+ index +'"]');

    tr.addClass(ELEM_CLICK).siblings('tr').removeClass(ELEM_CLICK);
  };

  //数据排序
  Class.prototype.sort = function(th, type, pull, formEvent){
    var that = this
    ,field
    ,res = {}
    ,options = that.config
    ,filter = options.elem.attr('lay-filter')
    ,data = table.cache[that.key], thisData;

    //字段匹配
    if(typeof th === 'string'){
      field = th;
      that.layHeader.find('th').each(function(i, item){
        var othis = $(this)
        ,_field = othis.data('field');
        if(_field === th){
          th = othis;
          field = _field;
          return false;
        }
      });
    }

    try {
      var field = field || th.data('field')
      ,key = th.data('key');

      //如果欲执行的排序已在状态中，则不执行渲染
      if(that.sortKey && !pull){
        if(field === that.sortKey.field && type === that.sortKey.sort){
          return;
        }
      }

      var elemSort = that.layHeader.find('th .laytable-cell-'+ key).find(ELEM_SORT);
      that.layHeader.find('th').find(ELEM_SORT).removeAttr('lay-sort'); //清除其它标题排序状态
      elemSort.attr('lay-sort', type || null);
      that.layFixed.find('th')
    } catch(e){
      hint.error('Table modules: sort field \''+ field +'\' not matched');
    }

    //记录排序索引和类型
    that.sortKey = {
      field: field
      ,sort: type
    };

    //默认为前端自动排序。如果否，则需自主排序（通常为服务端处理好排序）
    if(options.autoSort){
      if(type === 'asc'){ //升序
        thisData = layui.sort(data, field);
      } else if(type === 'desc'){ //降序
        thisData = layui.sort(data, field, true);
      } else { //清除排序
        thisData = layui.sort(data, table.config.indexName);
        delete that.sortKey;
      }
    }

    res[options.response.dataName] = thisData || data;
    that.renderData(res, that.page, that.count, true);

    if(formEvent){
      layui.event.call(th, MOD_NAME, 'sort('+ filter +')', {
        field: field
        ,type: type
      });
    }
  };

  //请求loading
  Class.prototype.loading = function(hide){
    var that = this
    ,options = that.config;
    if(options.loading){
      if(hide){
        that.layInit && that.layInit.remove();
        delete that.layInit;
        that.layBox.find(ELEM_INIT).remove();
      } else {
        that.layInit = $(['<div class="layui-table-init">'
          ,'<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>'
        ,'</div>'].join(''));
        that.layBox.append(that.layInit);
      }
    }
  };

  //同步选中值状态
  Class.prototype.setCheckData = function(index, checked){
    var that = this
    ,options = that.config
    ,thisData = table.cache[that.key];
    if(!thisData[index]) return;
    if(thisData[index].constructor === Array) return;
    thisData[index][options.checkName] = checked;
  };

  //同步全选按钮状态
  Class.prototype.syncCheckAll = function(){
    var that = this
    ,options = that.config
    ,checkAllElem = that.layHeader.find('input[name="layTableCheckbox"]')
    ,syncColsCheck = function(checked){
      that.eachCols(function(i, item){
        if(item.type === 'checkbox'){
          item[options.checkName] = checked;
        }
      });
      return checked;
    };

    if(!checkAllElem[0]) return;

    if(table.checkStatus(that.key).isAll){
      if(!checkAllElem[0].checked){
        checkAllElem.prop('checked', true);
        that.renderForm('checkbox');
      }
      syncColsCheck(true);
    } else {
      if(checkAllElem[0].checked){
        checkAllElem.prop('checked', false);
        that.renderForm('checkbox');
      }
      syncColsCheck(false);
    }
  };

  //获取cssRule
  Class.prototype.getCssRule = function(key, callback){
    var that = this
    ,style = that.elem.find('style')[0]
    ,sheet = style.sheet || style.styleSheet || {}
    ,rules = sheet.cssRules || sheet.rules;
    layui.each(rules, function(i, item){
      if(item.selectorText === ('.laytable-cell-'+ key)){
        return callback(item), true;
      }
    });
  };

  //让表格铺满
  Class.prototype.fullSize = function(){
    var that = this
    ,options = that.config
    ,height = options.height, bodyHeight;

    if(that.fullHeightGap){
      height = _WIN.height() - that.fullHeightGap;
      if(height < 135) height = 135;
      that.elem.css('height', height);
    }

    if(!height) return;

    //减去列头区域的高度
    bodyHeight = parseFloat(height) - (that.layHeader.outerHeight() || 38); //此处的数字常量是为了防止容器处在隐藏区域无法获得高度的问题，暂时只对默认尺寸的表格做支持。

    //减去工具栏的高度
    if(options.toolbar){
      bodyHeight = bodyHeight - (that.layTool.outerHeight() || 50);
    }

    //减去统计朗的高度
    if(options.totalRow){
      bodyHeight = bodyHeight - (that.layTotal.outerHeight() || 40);
    }

    //减去分页栏的高度
    if(options.page){
      bodyHeight = bodyHeight - (that.layPage.outerHeight() || 41);
    }

    that.layMain.css('height', bodyHeight - 2);
  };

  //获取滚动条宽度
  Class.prototype.getScrollWidth = function(elem){
    var width = 0;
    if(elem){
      width = elem.offsetWidth - elem.clientWidth;
    } else {
      elem = document.createElement('div');
      elem.style.width = '100px';
      elem.style.height = '100px';
      elem.style.overflowY = 'scroll';

      document.body.appendChild(elem);
      width = elem.offsetWidth - elem.clientWidth;
      document.body.removeChild(elem);
    }
    return width;
  };

  //滚动条补丁
  Class.prototype.scrollPatch = function(){
    var that = this
    ,layMainTable = that.layMain.children('table')
    ,scollWidth = that.layMain.width() - that.layMain.prop('clientWidth') //纵向滚动条宽度
    ,scollHeight = that.layMain.height() - that.layMain.prop('clientHeight') //横向滚动条高度
    ,getScrollWidth = that.getScrollWidth(that.layMain[0]) //获取主容器滚动条宽度，如果有的话
    ,outWidth = layMainTable.outerWidth() - that.layMain.width() //表格内容器的超出宽度

    //添加补丁
    ,addPatch = function(elem){
      if(scollWidth && scollHeight){
        elem = elem.eq(0);
        if(!elem.find('.layui-table-patch')[0]){
          var patchElem = $('<th class="layui-table-patch"><div class="layui-table-cell"></div></th>'); //补丁元素
          patchElem.find('div').css({
            width: scollWidth
          });
          elem.find('tr').append(patchElem);
        }
      } else {
        elem.find('.layui-table-patch').remove();
      }
    }

    addPatch(that.layHeader);
    addPatch(that.layTotal);

    //固定列区域高度
    var mainHeight = that.layMain.height()
    ,fixHeight = mainHeight - scollHeight;
    that.layFixed.find(ELEM_BODY).css('height', layMainTable.height() >= fixHeight ? fixHeight : 'auto');

    //表格宽度小于容器宽度时，隐藏固定列
    that.layFixRight[outWidth > 0 ? 'removeClass' : 'addClass'](HIDE);

    //操作栏
    that.layFixRight.css('right', scollWidth - 1);
  };

  //事件处理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config
    ,_BODY = $('body')
    ,dict = {}
    ,th = that.layHeader.find('th')
    ,resizing
    ,ELEM_CELL = '.layui-table-cell'
    ,filter = options.elem.attr('lay-filter');

    //工具栏操作事件
    that.layTool.on('click', '*[lay-event]', function(e){
      var othis = $(this)
      ,events = othis.attr('lay-event')
      ,openPanel = function(sets){
        var list = $(sets.list)
        ,panel = $('<ul class="layui-table-tool-panel"></ul>');

        panel.html(list);

        //限制最大高度
        if(options.height){
          panel.css('max-height', options.height - (that.layTool.outerHeight() || 50));
        }

        //插入元素
        othis.find('.layui-table-tool-panel')[0] || othis.append(panel);
        that.renderForm();

        panel.on('click', function(e){
          layui.stope(e);
        });

        sets.done && sets.done(panel, list)
      };

      layui.stope(e);
      _DOC.trigger('table.tool.panel.remove');
      layer.close(that.tipsIndex);

      switch(events){
        case 'LAYTABLE_COLS': //筛选列
          openPanel({
            list: function(){
              var lis = [];
              that.eachCols(function(i, item){
                if(item.field && item.type == 'normal'){
                  lis.push('<li><input type="checkbox" name="'+ item.field +'" data-key="'+ item.key +'" data-parentkey="'+ (item.parentKey||'') +'" lay-skin="primary" '+ (item.hide ? '' : 'checked') +' title="'+ (item.title || item.field) +'" lay-filter="LAY_TABLE_TOOL_COLS"></li>');
                }
              });
              return lis.join('');
            }()
            ,done: function(){
              form.on('checkbox(LAY_TABLE_TOOL_COLS)', function(obj){
                var othis = $(obj.elem)
                ,checked = this.checked
                ,key = othis.data('key')
                ,parentKey = othis.data('parentkey');

                layui.each(options.cols, function(i1, item1){
                  layui.each(item1, function(i2, item2){
                    if(i1+ '-'+ i2 === key){
                      var hide = item2.hide;

                      //同步勾选列的 hide 值和隐藏样式
                      item2.hide = !checked;
                      that.elem.find('*[data-key="'+ options.index +'-'+ key +'"]')
                      [checked ? 'removeClass' : 'addClass'](HIDE);

                      //根据列的显示隐藏，同步多级表头的父级相关属性值
                      if(hide != item2.hide){
                        that.setParentCol(!checked, parentKey);
                      }

                      //重新适配尺寸
                      that.resize();
                    }
                  });
                });
              });
            }
          });
        break;
        case 'LAYTABLE_EXPORT': //导出
          if(device.ie){
            layer.tips('导出功能不支持 IE，请用 Chrome 等高级浏览器导出', this, {
              tips: 3
            })
          } else {
            openPanel({
              list: function(){
                return [
                  '<li data-type="csv">导出到 Csv 文件</li>'
                  ,'<li data-type="xls">导出到 Excel 文件</li>'
                ].join('')
              }()
              ,done: function(panel, list){
                list.on('click', function(){
                  var type = $(this).data('type')
                  table.exportFile.call(that, options.id, null, type);
                });
              }
            });
          }
        break;
        case 'LAYTABLE_PRINT': //打印
          var printWin = window.open('打印窗口', '_blank')
          ,style = ['<style>'
            ,'body{font-size: 12px; color: #666;}'
            ,'table{width: 100%; border-collapse: collapse; border-spacing: 0;}'
            ,'th,td{line-height: 20px; padding: 9px 15px; border: 1px solid #ccc; text-align: left; font-size: 12px; color: #666;}'
            ,'a{color: #666; text-decoration:none;}'
            ,'*.layui-hide{display: none}'
          ,'</style>'].join('')
          ,html = $(that.layHeader.html()); //输出表头

          html.append(that.layMain.find('table').html()); //输出表体
          html.append(that.layTotal.find('table').html()) //输出合计行

          html.find('th.layui-table-patch').remove(); //移除补丁
          html.find('.layui-table-col-special').remove(); //移除特殊列

          printWin.document.write(style + html.prop('outerHTML'));
          printWin.document.close();
          printWin.print();
          printWin.close();
        break;
      }

      layui.event.call(this, MOD_NAME, 'toolbar('+ filter +')', $.extend({
        event: events
        ,config: options
      },{}));
    });

    //拖拽调整宽度
    th.on('mousemove', function(e){
      var othis = $(this)
      ,oLeft = othis.offset().left
      ,pLeft = e.clientX - oLeft;
      if(othis.data('unresize') || dict.resizeStart){
        return;
      }
      dict.allowResize = othis.width() - pLeft <= 10; //是否处于拖拽允许区域
      _BODY.css('cursor', (dict.allowResize ? 'col-resize' : ''));
    }).on('mouseleave', function(){
      var othis = $(this);
      if(dict.resizeStart) return;
      _BODY.css('cursor', '');
    }).on('mousedown', function(e){
      var othis = $(this);
      if(dict.allowResize){
        var key = othis.data('key');
        e.preventDefault();
        dict.resizeStart = true; //开始拖拽
        dict.offset = [e.clientX, e.clientY]; //记录初始坐标

        that.getCssRule(key, function(item){
          var width = item.style.width || othis.outerWidth();
          dict.rule = item;
          dict.ruleWidth = parseFloat(width);
          dict.minWidth = othis.data('minwidth') || options.cellMinWidth;
        });
      }
    });

    //拖拽中
    _DOC.on('mousemove', function(e){
      if(dict.resizeStart){
        e.preventDefault();
        if(dict.rule){
          var setWidth = dict.ruleWidth + e.clientX - dict.offset[0];
          if(setWidth < dict.minWidth) setWidth = dict.minWidth;
          dict.rule.style.width = setWidth + 'px';
          layer.close(that.tipsIndex);
        }
        resizing = 1
      }
    }).on('mouseup', function(e){
      if(dict.resizeStart){
        dict = {};
        _BODY.css('cursor', '');
        that.scrollPatch();
      }
      if(resizing === 2){
        resizing = null;
      }
    });

    //排序
    th.on('click', function(e){
      var othis = $(this)
      ,elemSort = othis.find(ELEM_SORT)
      ,nowType = elemSort.attr('lay-sort')
      ,type;

      if(!elemSort[0] || resizing === 1) return resizing = 2;

      if(nowType === 'asc'){
        type = 'desc';
      } else if(nowType === 'desc'){
        type = null;
      } else {
        type = 'asc';
      }
      that.sort(othis, type, null, true);
    }).find(ELEM_SORT+' .layui-edge ').on('click', function(e){
      var othis = $(this)
      ,index = othis.index()
      ,field = othis.parents('th').eq(0).data('field')
      layui.stope(e);
      if(index === 0){
        that.sort(field, 'asc', null, true);
      } else {
        that.sort(field, 'desc', null, true);
      }
    });

    //数据行中的事件监听返回的公共对象成员
    var commonMember = function(sets){
      var othis = $(this)
      ,index = othis.parents('tr').eq(0).data('index')
      ,tr = that.layBody.find('tr[data-index="'+ index +'"]')
      ,data = table.cache[that.key] || [];


      data = data[index] || {};

      return $.extend({
        tr: tr //行元素
        ,data: table.clearCacheKey(data) //当前行数据
        ,del: function(){ //删除行数据
          table.cache[that.key][index] = [];
          tr.remove();
          that.scrollPatch();
        }
        ,update: function(fields){ //修改行数据
          fields = fields || {};
          layui.each(fields, function(key, value){
            if(key in data){
              var templet, td = tr.children('td[data-field="'+ key +'"]');
              data[key] = value;
              that.eachCols(function(i, item2){
                if(item2.field == key && item2.templet){
                  templet = item2.templet;
                }
              });
              td.children(ELEM_CELL).html(parseTempData({
                templet: templet
              }, value, data));
              td.data('content', value);
            }
          });
        }
      }, sets);
    };

    //复选框选择
    that.elem.on('click', 'input[name="layTableCheckbox"]+', function(){ //替代元素的 click 事件
      var checkbox = $(this).prev()
      ,childs = that.layBody.find('input[name="layTableCheckbox"]')
      ,index = checkbox.parents('tr').eq(0).data('index')
      ,checked = checkbox[0].checked
      ,isAll = checkbox.attr('lay-filter') === 'layTableAllChoose';

      //全选
      if(isAll){
        childs.each(function(i, item){
          item.checked = checked;
          that.setCheckData(i, checked);
        });
        that.syncCheckAll();
        that.renderForm('checkbox');
      } else {
        that.setCheckData(index, checked);
        that.syncCheckAll();
      }

      layui.event.call(checkbox[0], MOD_NAME, 'checkbox('+ filter +')', commonMember.call(checkbox[0], {
        checked: checked
        ,type: isAll ? 'all' : 'one'
      }));
    });

    //单选框选择
    that.elem.on('click', 'input[lay-type="layTableRadio"]+', function(){
      var radio = $(this).prev()
      ,checked = radio[0].checked
      ,thisData = table.cache[that.key]
      ,index = radio.parents('tr').eq(0).data('index');

      //重置数据单选属性
      layui.each(thisData, function(i, item){
        if(index === i){
          item[options.checkName] = true;
        } else {
          delete item[options.checkName];
        }
      });
      that.setThisRowChecked(index);

      layui.event.call(this, MOD_NAME, 'radio('+ filter +')', commonMember.call(this, {
        checked: checked
      }));
    });

    //行事件
    that.layBody.on('mouseenter', 'tr', function(){ //鼠标移入行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不触发事件
      that.layBody.find('tr:eq('+ index +')').addClass(ELEM_HOVER)
    }).on('mouseleave', 'tr', function(){ //鼠标移出行
      var othis = $(this)
      ,index = othis.index();
      if(othis.data('off')) return; //不触发事件
      that.layBody.find('tr:eq('+ index +')').removeClass(ELEM_HOVER)
    }).on('click', 'tr', function(){ //单击行
      setRowEvent.call(this, 'row');
    }).on('dblclick', 'tr', function(){ //双击行
      setRowEvent.call(this, 'rowDouble');
    });

    //创建行单击、双击事件监听
    var setRowEvent = function(eventType){
      var othis = $(this);
      if(othis.data('off')) return; //不触发事件
      layui.event.call(this,
        MOD_NAME, eventType + '('+ filter +')'
        ,commonMember.call(othis.children('td')[0])
      );
    };

    //单元格编辑
    that.layBody.on('change', '.'+ELEM_EDIT, function(){
      var othis = $(this)
      ,value = this.value
      ,field = othis.parent().data('field')
      ,index = othis.parents('tr').eq(0).data('index')
      ,data = table.cache[that.key][index];

      data[field] = value; //更新缓存中的值

      layui.event.call(this, MOD_NAME, 'edit('+ filter +')', commonMember.call(this, {
        value: value
        ,field: field
      }));
    }).on('blur', '.'+ELEM_EDIT, function(){
      var templet
      ,othis = $(this)
      ,thisElem = this
      ,field = othis.parent().data('field')
      ,index = othis.parents('tr').eq(0).data('index')
      ,data = table.cache[that.key][index];
      that.eachCols(function(i, item){
        if(item.field == field && item.templet){
          templet = item.templet;
        }
      });
      othis.siblings(ELEM_CELL).html(function(value){
        return parseTempData({
          templet: templet
        }, value, data);
      }(thisElem.value));
      othis.parent().data('content', thisElem.value);
      othis.remove();
    });

    //单元格单击事件
    that.layBody.on('click', 'td', function(e){
      var othis = $(this)
      ,field = othis.data('field')
      ,editType = othis.data('edit')
      ,elemCell = othis.children(ELEM_CELL);

      if(othis.data('off')) return; //不触发事件

      //显示编辑表单
      if(editType){
        var input = $('<input class="layui-input '+ ELEM_EDIT +'">');
        input[0].value = othis.data('content') || elemCell.text();
        othis.find('.'+ELEM_EDIT)[0] || othis.append(input);
        input.focus();
        layui.stope(e);
        return;
      }
    }).on('mouseenter', 'td', function(){
      gridExpand.call(this)
    }).on('mouseleave', 'td', function(){
       gridExpand.call(this, 'hide');
    });

    //单元格展开图标
    var ELEM_GRID = 'layui-table-grid', ELEM_GRID_DOWN = 'layui-table-grid-down', ELEM_GRID_PANEL = 'layui-table-grid-panel'
    ,gridExpand = function(hide){
      var othis = $(this)
      ,elemCell = othis.children(ELEM_CELL);

      if(othis.data('off')) return; //不触发事件

      if(hide){
        othis.find('.layui-table-grid-down').remove();
      } else if(elemCell.prop('scrollWidth') > elemCell.outerWidth()){
        if(elemCell.find('.'+ ELEM_GRID_DOWN)[0]) return;
        othis.append('<div class="'+ ELEM_GRID_DOWN +'"><i class="layui-icon layui-icon-down"></i></div>');
      }
    };

    //单元格展开事件
    that.layBody.on('click', '.'+ ELEM_GRID_DOWN, function(e){
      var othis = $(this)
      ,td = othis.parent()
      ,elemCell = td.children(ELEM_CELL);

      that.tipsIndex = layer.tips([
        '<div class="layui-table-tips-main" style="margin-top: -'+ (elemCell.height() + 16) +'px;'+ function(){
          if(options.size === 'sm'){
            return 'padding: 4px 15px; font-size: 12px;';
          }
          if(options.size === 'lg'){
            return 'padding: 14px 15px;';
          }
          return '';
        }() +'">'
          ,elemCell.html()
        ,'</div>'
        ,'<i class="layui-icon layui-table-tips-c layui-icon-close"></i>'
      ].join(''), elemCell[0], {
        tips: [3, '']
        ,time: -1
        ,anim: -1
        ,maxWidth: (device.ios || device.android) ? 300 : that.elem.width()/2
        ,isOutAnim: false
        ,skin: 'layui-table-tips'
        ,success: function(layero, index){
          layero.find('.layui-table-tips-c').on('click', function(){
            layer.close(index);
          });
        }
      });

      layui.stope(e);
    });

    //行工具条操作事件
    that.layBody.on('click', '*[lay-event]', function(){
      var othis = $(this)
      ,index = othis.parents('tr').eq(0).data('index');
      layui.event.call(this, MOD_NAME, 'tool('+ filter +')', commonMember.call(this, {
        event: othis.attr('lay-event')
      }));
      that.setThisRowChecked(index);
    });

    //同步滚动条
    that.layMain.on('scroll', function(){
      var othis = $(this)
      ,scrollLeft = othis.scrollLeft()
      ,scrollTop = othis.scrollTop();

      that.layHeader.scrollLeft(scrollLeft);
      that.layTotal.scrollLeft(scrollLeft);
      that.layFixed.find(ELEM_BODY).scrollTop(scrollTop);

      layer.close(that.tipsIndex);
    });

    //自适应
    _WIN.on('resize', function(){
      that.resize();
    });
  };

  //一次性事件
  ;(function(){
    //全局点击
    _DOC.on('click', function(){
      _DOC.trigger('table.remove.tool.panel');
    });

    //工具面板移除事件
    _DOC.on('table.remove.tool.panel', function(){
      $('.layui-table-tool-panel').remove();
    });
  })();

  //初始化
  table.init = function(filter, settings){
    settings = settings || {};
    var that = this
    ,elemTable = filter ? $('table[lay-filter="'+ filter +'"]') : $(ELEM + '[lay-data]')
    ,errorTips = 'Table element property lay-data configuration item has a syntax error: ';

    //遍历数据表格
    elemTable.each(function(){
      var othis = $(this), tableData = othis.attr('lay-data');

      try{
        tableData = new Function('return '+ tableData)();
      } catch(e){
        hint.error(errorTips + tableData, 'error')
      }

      var cols = [], options = $.extend({
        elem: this
        ,cols: []
        ,data: []
        ,skin: othis.attr('lay-skin') //风格
        ,size: othis.attr('lay-size') //尺寸
        ,even: typeof othis.attr('lay-even') === 'string' //偶数行背景
      }, table.config, settings, tableData);

      filter && othis.hide();

      //获取表头数据
      othis.find('thead>tr').each(function(i){
        options.cols[i] = [];
        $(this).children().each(function(ii){
          var th = $(this), itemData = th.attr('lay-data');

          try{
            itemData = new Function('return '+ itemData)();
          } catch(e){
            return hint.error(errorTips + itemData)
          }

          var row = $.extend({
            title: th.text()
            ,colspan: th.attr('colspan') || 0 //列单元格
            ,rowspan: th.attr('rowspan') || 0 //行单元格
          }, itemData);

          if(row.colspan < 2) cols.push(row);
          options.cols[i].push(row);
        });
      });

      //获取表体数据
      othis.find('tbody>tr').each(function(i1){
        var tr = $(this), row = {};
        //如果定义了字段名
        tr.children('td').each(function(i2, item2){
          var td = $(this)
          ,field = td.data('field');
          if(field){
            return row[field] = td.html();
          }
        });
        //如果未定义字段名
        layui.each(cols, function(i3, item3){
          var td = tr.children('td').eq(i3);
          row[item3.field] = td.html();
        });
        options.data[i1] = row;
      });
      table.render(options);
    });

    return that;
  };

  //记录所有实例
  thisTable.that = {}; //记录所有实例对象
  thisTable.config = {}; //记录所有实例配置项

  //遍历表头
  table.eachCols = function(id, callback, cols){
    var config = thisTable.config[id] || {}
    ,arrs = [], index = 0;

    cols = $.extend(true, [], cols || config.cols);

    //重新整理表头结构
    layui.each(cols, function(i1, item1){
      layui.each(item1, function(i2, item2){

        //如果是组合列，则捕获对应的子列
        if(item2.colGroup){
          var childIndex = 0;
          index++
          item2.CHILD_COLS = [];

          layui.each(cols[i1 + 1], function(i22, item22){
            //如果子列已经被标注为{PARENT_COL_INDEX}，或者子列累计 colspan 数等于父列定义的 colspan，则跳出当前子列循环
            if(item22.PARENT_COL_INDEX || (childIndex > 1 && childIndex == item2.colspan)) return;

            item22.PARENT_COL_INDEX = index;

            item2.CHILD_COLS.push(item22);
            childIndex = childIndex + parseInt(item22.colspan > 1 ? item22.colspan : 1);
          });
        }

        if(item2.PARENT_COL_INDEX) return; //如果是子列，则不进行追加，因为已经存储在父列中
        arrs.push(item2)
      });
    });

    //重新遍历列，如果有子列，则进入递归
    var eachArrs = function(obj){
      layui.each(obj || arrs, function(i, item){
        if(item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
        typeof callback === 'function' && callback(i, item);
      });
    };

    eachArrs();
  };

  //表格选中状态
  table.checkStatus = function(id){
    var nums = 0
    ,invalidNum = 0
    ,arr = []
    ,data = table.cache[id] || [];
    //计算全选个数
    layui.each(data, function(i, item){
      if(item.constructor === Array){
        invalidNum++; //无效数据，或已删除的
        return;
      }
      if(item[table.config.checkName]){
        nums++;
        arr.push(table.clearCacheKey(item));
      }
    });
    return {
      data: arr //选中的数据
      ,isAll: data.length ? (nums === (data.length - invalidNum)) : false //是否全选
    };
  };

  //获取表格当前页的所有行数据
  table.getData = function(id){
    var arr = []
    ,data = table.cache[id] || [];
    layui.each(data, function(i, item){
      if(item.constructor === Array){
        return;
      };
      arr.push(table.clearCacheKey(item));
    });
    return arr;
  };

  //表格导出
  table.exportFile = function(id, data, type){
    var that = this;

    data = data || table.clearCacheKey(table.cache[id]);
    type = type || 'csv';

    var config = thisTable.config[id] || {}
    ,textType = ({
      csv: 'text/csv'
      ,xls: 'application/vnd.ms-excel'
    })[type]
    ,alink = document.createElement("a");

    if(device.ie) return hint.error('IE_NOT_SUPPORT_EXPORTS');

    alink.href = 'data:'+ textType +';charset=utf-8,\ufeff'+ encodeURIComponent(function(){
      var dataTitle = [], dataMain = [], dataTotal = [];

      //表头和表体
      layui.each(data, function(i1, item1){
        var vals = [];
        if(typeof id === 'object'){ //如果 id 参数直接为表头数据
          layui.each(id, function(i, item){
            i1 == 0 && dataTitle.push(item || '');
          });
          layui.each(table.clearCacheKey(item1), function(i2, item2){
            vals.push('"'+ (item2 || '') +'"');
          });
        } else {
          table.eachCols(id, function(i3, item3){
            if(item3.field && item3.type == 'normal' && !item3.hide){
              var content = item1[item3.field];
              if(content === undefined || content === null) content = '';

              i1 == 0 && dataTitle.push(item3.title || '');
              vals.push('"'+ parseTempData(item3, content, item1, 'text') + '"');
            }
          });
        }
        dataMain.push(vals.join(','));
      });

      //表合计
      layui.each(that.dataTotal, function(key, value){
        dataTotal.push(value);
      });

      return dataTitle.join(',') + '\r\n' + dataMain.join('\r\n') + '\r\n' + dataTotal.join(',');
    }());

    alink.download = (config.title || 'table_'+ (config.index || '')) + '.' + type;
    document.body.appendChild(alink);
    alink.click();
    document.body.removeChild(alink);
  };

  //重置表格尺寸结构
  table.resize = function(id){
    //如果指定表格唯一 id，则只执行该 id 对应的表格实例
    if(id){
      var config = getThisTableConfig(id); //获取当前实例配置项
      if(!config) return;

      thisTable.that[id].resize();

    } else { //否则重置所有表格实例尺寸
      layui.each(thisTable.that, function(){
        this.resize();
      });
    }
  };

  //表格重载
  table.reload = function(id, options, deep){
    var config = getThisTableConfig(id); //获取当前实例配置项
    if(!config) return;

    var that = thisTable.that[id];
    that.reload(options, deep);

    return thisTable.call(that);
  };

  //核心入口
  table.render = function(options){
    var inst = new Class(options);
    //return thisTable.call(inst);

    var cinst = thisTable.call(inst);
    $(options.elem).data('reloadObj',cinst);
    return cinst;
  };

  //清除临时Key
  table.clearCacheKey = function(data){
    data = $.extend({}, data);
    delete data[table.config.checkName];
    delete data[table.config.indexName];
    return data;
  };

  //自动完成渲染
  table.init();

  exports(MOD_NAME, table);
});

 
/**

 @Name：carousel 轮播模块
 @License：MIT
    
 */
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.$
  ,hint = layui.hint()
  ,device = layui.device()

  //外部接口
  ,carousel = {
    config: {} //全局配置项

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }
  
  //字符常量
  ,MOD_NAME = 'carousel', ELEM = '.layui-carousel', THIS = 'layui-this', SHOW = 'layui-show', HIDE = 'layui-hide', DISABLED = 'layui-disabled'
  
  ,ELEM_ITEM = '>*[carousel-item]>*', ELEM_LEFT = 'layui-carousel-left', ELEM_RIGHT = 'layui-carousel-right', ELEM_PREV = 'layui-carousel-prev', ELEM_NEXT = 'layui-carousel-next', ELEM_ARROW = 'layui-carousel-arrow', ELEM_IND = 'layui-carousel-ind'
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.config = $.extend({}, that.config, carousel.config, options);
    that.render();
  };
  
  //默认配置
  Class.prototype.config = {
    width: '600px'
    ,height: '280px'
    ,full: false //是否全屏
    ,arrow: 'hover' //切换箭头默认显示状态：hover/always/none
    ,indicator: 'inside' //指示器位置：inside/outside/none
    ,autoplay: true //是否自动切换
    ,interval: 3000 //自动切换的时间间隔，不能低于800ms
    ,anim: '' //动画类型：default/updown/fade
    ,trigger: 'click' //指示器的触发方式：click/hover
    ,index: 0 //初始开始的索引
  };
  
  //轮播渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    if(!options.elem[0]) return;
    that.elemItem = options.elem.find(ELEM_ITEM);
    
    if(options.index < 0) options.index = 0;
    if(options.index >= that.elemItem.length) options.index = that.elemItem.length - 1;
    if(options.interval < 800) options.interval = 800;

    //是否全屏模式
    if(options.full){
      options.elem.css({
        position: 'fixed'
        ,width: '100%'
        ,height: '100%'
        ,zIndex: 9999
      });
    } else {
      options.elem.css({
        width: options.width
        ,height: options.height
      });
    }
    
    options.elem.attr('lay-anim', options.anim);
    
    //初始焦点状态
    that.elemItem.eq(options.index).addClass(THIS);

    //指示器等动作
    if(that.elemItem.length <= 1) return;
    that.indicator();
    that.arrow();
    that.autoplay();
    that.events();
  };
  
  //重置轮播
  Class.prototype.reload = function(options){
    var that = this;
    clearInterval(that.timer);
    that.config = $.extend({}, that.config, options);
    that.render();
  };
  
  //获取上一个等待条目的索引
  Class.prototype.prevIndex = function(){
    var that = this
    ,options = that.config;
    
    var prevIndex = options.index - 1;
    if(prevIndex < 0){
      prevIndex = that.elemItem.length - 1;
    }
    return prevIndex;
  };
  
  //获取下一个等待条目的索引
  Class.prototype.nextIndex = function(){
    var that = this
    ,options = that.config;
    
    var nextIndex = options.index + 1;
    if(nextIndex >= that.elemItem.length){
      nextIndex = 0;
    }
    return nextIndex;
  };
  
  //索引递增
  Class.prototype.addIndex = function(num){
    var that = this
    ,options = that.config;
    
    num = num || 1;
    options.index = options.index + num;
      
    //index不能超过轮播总数量
    if(options.index >= that.elemItem.length){
      options.index = 0;
    }
  };
  
  //索引递减
  Class.prototype.subIndex = function(num){
    var that = this
    ,options = that.config;
    
    num = num || 1;
    options.index = options.index - num;
      
    //index不能超过轮播总数量
    if(options.index < 0){
      options.index = that.elemItem.length - 1;
    }
  };
  
  //自动轮播
  Class.prototype.autoplay = function(){
    var that = this
    ,options = that.config;
    
    if(!options.autoplay) return;
    clearInterval(that.timer);
    
    that.timer = setInterval(function(){
      that.slide();
    }, options.interval);
  };
  
  //箭头
  Class.prototype.arrow = function(){
    var that = this
    ,options = that.config;
    
    //模板
    var tplArrow = $([
      '<button class="layui-icon '+ ELEM_ARROW +'" lay-type="sub">'+ (options.anim === 'updown' ? '&#xe619;' : '&#xe603;') +'</button>'
      ,'<button class="layui-icon '+ ELEM_ARROW +'" lay-type="add">'+ (options.anim === 'updown' ? '&#xe61a;' : '&#xe602;') +'</button>'
    ].join(''));
    
    //预设基础属性
    options.elem.attr('lay-arrow', options.arrow);
    
    //避免重复插入
    if(options.elem.find('.'+ELEM_ARROW)[0]){
      options.elem.find('.'+ELEM_ARROW).remove();
    };
    options.elem.append(tplArrow);
    
    //事件
    tplArrow.on('click', function(){
      var othis = $(this)
      ,type = othis.attr('lay-type')
      that.slide(type);
    });
  };
  
  //指示器
  Class.prototype.indicator = function(){
    var that = this
    ,options = that.config;
    
    //模板
    var tplInd = that.elemInd = $(['<div class="'+ ELEM_IND +'"><ul>'
      ,function(){
        var li = [];
        layui.each(that.elemItem, function(index){
          li.push('<li'+ (options.index === index ? ' class="layui-this"' : '') +'></li>');
        });
        return li.join('');
      }()
    ,'</ul></div>'].join(''));
    
    //预设基础属性
    options.elem.attr('lay-indicator', options.indicator);
    
    //避免重复插入
    if(options.elem.find('.'+ELEM_IND)[0]){
      options.elem.find('.'+ELEM_IND).remove();
    };
    options.elem.append(tplInd);
    
    if(options.anim === 'updown'){
      tplInd.css('margin-top', -(tplInd.height()/2));
    }
    
    //事件
    tplInd.find('li').on(options.trigger === 'hover' ? 'mouseover' : options.trigger, function(){
      var othis = $(this)
      ,index = othis.index();
      if(index > options.index){
        that.slide('add', index - options.index);
      } else if(index < options.index){
        that.slide('sub', options.index - index);
      }
    });
  };
  
  //滑动切换
  Class.prototype.slide = function(type, num){
    var that = this
    ,elemItem = that.elemItem
    ,options = that.config
    ,thisIndex = options.index
    ,filter = options.elem.attr('lay-filter');
    
    if(that.haveSlide) return;
    
    //滑动方向
    if(type === 'sub'){
      that.subIndex(num);
      elemItem.eq(options.index).addClass(ELEM_PREV);
      setTimeout(function(){
        elemItem.eq(thisIndex).addClass(ELEM_RIGHT);
        elemItem.eq(options.index).addClass(ELEM_RIGHT);
      }, 50);
    } else { //默认递增滑
      that.addIndex(num);
      elemItem.eq(options.index).addClass(ELEM_NEXT);
      setTimeout(function(){
        elemItem.eq(thisIndex).addClass(ELEM_LEFT);
        elemItem.eq(options.index).addClass(ELEM_LEFT);
      }, 50);  
    };
    
    //移除过度类
    setTimeout(function(){
      elemItem.removeClass(THIS + ' ' + ELEM_PREV + ' ' + ELEM_NEXT + ' ' + ELEM_LEFT + ' ' + ELEM_RIGHT);
      elemItem.eq(options.index).addClass(THIS);
      that.haveSlide = false; //解锁
    }, 300);
    
    //指示器焦点
    that.elemInd.find('li').eq(options.index).addClass(THIS)
    .siblings().removeClass(THIS);
    
    that.haveSlide = true;
    
    layui.event.call(this, MOD_NAME, 'change('+ filter +')', {
      index: options.index
      ,prevIndex: thisIndex
      ,item: elemItem.eq(options.index)
    });
  };
  
  //事件处理
  Class.prototype.events = function(){
    var that = this
    ,options = that.config;
    
    if(options.elem.data('haveEvents')) return;
    
    //移入移出容器
    options.elem.on('mouseenter', function(){
      clearInterval(that.timer);
    }).on('mouseleave', function(){
      that.autoplay();
    });
    
    options.elem.data('haveEvents', true);
  };
  
  //核心入口
  carousel.render = function(options){
    var inst = new Class(options);
    return inst;
  };
  
  exports(MOD_NAME, carousel);
});

 
/**

 @Title: rate 评分评星组件
 @License：MIT

 */

layui.define('jquery',function(exports){
  "use strict";
  var $ = layui.jquery

  //外部接口
  ,rate = {
    config: {}
    ,index: layui.rate ? (layui.rate.index + 10000) : 0

    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }

  //操作当前实例
  ,thisRate = function(){
    var that = this
    ,options = that.config;
    
    return {
      setvalue: function(value){
        that.setvalue.call(that, value);
      }
      ,config: options
    }
  }

  //字符常量
  ,MOD_NAME = 'rate',ELEM_VIEW = 'layui-rate', ICON_RATE = 'layui-icon-rate', ICON_RATE_SOLID = 'layui-icon-rate-solid', ICON_RATE_HALF = 'layui-icon-rate-half'
  
  ,ICON_SOLID_HALF = 'layui-icon-rate-solid layui-icon-rate-half',  ICON_SOLID_RATE = 'layui-icon-rate-solid layui-icon-rate',  ICON_HALF_RATE = 'layui-icon-rate layui-icon-rate-half'

  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++rate.index;
    that.config = $.extend({}, that.config, rate.config, options);
    that.render();
  };

  //默认配置
  Class.prototype.config = {
    length: 5  //初始长度
    ,text: false  //是否显示评分等级
    ,readonly: false  //是否只读
    ,half: false  //是否可以半星
    ,value: 0 //星星选中个数
    ,theme: ''
  };

  //评分渲染
  Class.prototype.render = function(){
    var that = this
    ,options = that.config
    ,style = options.theme ? ('style="color: '+ options.theme + ';"') : '';

    options.elem = $(options.elem);
    
    //最大值不能大于总长度
    if(options.value > options.length){
      options.value = options.length;
    }

    //如果没有选择半星的属性，却给了小数的数值，统一向上或向下取整
    if(parseInt(options.value) !== options.value){
      if(!options.half){
        options.value = (Math.ceil(options.value) - options.value) < 0.5 ? Math.ceil(options.value): Math.floor(options.value)
      }
    }

    //组件模板
    var temp = '<ul class="layui-rate" '+ (options.readonly ? 'readonly' : '') +'>';
    for(var i = 1;i <= options.length;i++){
      var item = '<li class="layui-inline"><i class="layui-icon '
        + (i>Math.floor(options.value)?ICON_RATE:ICON_RATE_SOLID)
      + '" '+ style +'></i></li>';

      if(options.half){
        if(parseInt(options.value) !== options.value){
          if(i == Math.ceil(options.value)){
            temp = temp + '<li><i class="layui-icon layui-icon-rate-half" '+ style +'></i></li>';
          }else{
            temp = temp + item 
          } 
        }else{
          temp = temp + item
        }
      }else{
        temp = temp +item;
      }
    }
    temp += '</ul>' + (options.text ? ('<span class="layui-inline">'+ options.value + '星') : '') + '</span>';

    //开始插入替代元素
    var othis = options.elem
    ,hasRender = othis.next('.' + ELEM_VIEW);
    
    //生成替代元素
    hasRender[0] && hasRender.remove(); //如果已经渲染，则Rerender

    that.elemTemp = $(temp);
    
    options.span = that.elemTemp.next('span');

    options.setText && options.setText(options.value);

    othis.html(that.elemTemp);

    othis.addClass("layui-inline");

    //如果不是只读，那么进行触控事件
    if(!options.readonly) that.action(); 

  };

  //评分重置
  Class.prototype.setvalue = function(value){
    var that = this
    ,options = that.config ;

    options.value = value ;
    that.render();
  };

  //li触控事件
  Class.prototype.action = function(){
    var that = this
    ,options = that.config
    ,_ul = that.elemTemp
    ,wide = _ul.find("i").width();

    _ul.children("li").each(function(index){
      var ind = index + 1
      ,othis = $(this);

      //点击
      othis.on('click', function(e){
        //将当前点击li的索引值赋给value
        options.value = ind;
        if(options.half){
          //获取鼠标在li上的位置
          var x = e.pageX - $(this).offset().left;
          if(x <= wide / 2){
            options.value = options.value - 0.5;
          }
        }

        if(options.text)  _ul.next("span").text(options.value + "星");

        options.choose && options.choose(options.value);
        options.setText && options.setText(options.value);
      });

      //移入
      othis.on('mousemove', function(e){
        _ul.find("i").each(function(){      
          $(this).addClass(ICON_RATE).removeClass(ICON_SOLID_HALF)
        });
        _ul.find("i:lt(" + ind + ")").each(function(){
          $(this).addClass(ICON_RATE_SOLID).removeClass(ICON_HALF_RATE)
        });
        // 如果设置可选半星，那么判断鼠标相对li的位置
        if(options.half){
          var x = e.pageX - $(this).offset().left;
          if(x <= wide / 2){
            othis.children("i").addClass(ICON_RATE_HALF).removeClass(ICON_RATE_SOLID)
          }
        }         
      })

      //移出
      othis.on('mouseleave', function(){
        _ul.find("i").each(function(){
          $(this).addClass(ICON_RATE).removeClass(ICON_SOLID_HALF)
        });
        _ul.find("i:lt(" + Math.floor(options.value) + ")").each(function(){
          $(this).addClass(ICON_RATE_SOLID).removeClass(ICON_HALF_RATE)
        });
        //如果设置可选半星，根据分数判断是否有半星
        if(options.half){
          if(parseInt(options.value) !== options.value){
            _ul.children("li:eq(" + Math.floor(options.value) + ")").children("i").addClass(ICON_RATE_HALF).removeClass(ICON_SOLID_RATE)             
          }
        } 
      })

    })
  };
  
  //事件处理
  Class.prototype.events = function(){
     var that = this
    ,options = that.config;
  };

  //核心入口
  rate.render = function(options){
    var inst = new Class(options);
    return thisRate.call(inst);
  };
  
  exports(MOD_NAME, rate);
})/**

 @Name flow 流加载组件
 @License：MIT
    
 */
 
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.$, Flow = function(options){}
  ,ELEM_MORE = 'layui-flow-more'
  ,ELEM_LOAD = '<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon ">&#xe63e;</i>';

  //主方法
  Flow.prototype.load = function(options){
    var that = this, page = 0, lock, isOver, lazyimg, timer;
    options = options || {};
    
    var elem = $(options.elem); if(!elem[0]) return;
    var scrollElem = $(options.scrollElem || document); //滚动条所在元素
    var mb = options.mb || 50; //与底部的临界距离
    var isAuto = 'isAuto' in options ? options.isAuto : true; //是否自动滚动加载
    var end = options.end || '没有更多了'; //“末页”显示文案
    
    //滚动条所在元素是否为document
    var notDocment = options.scrollElem && options.scrollElem !== document;
    
    //加载更多
    var ELEM_TEXT = '<cite>加载更多</cite>'
    ,more = $('<div class="layui-flow-more"><a href="javascript:;">'+ ELEM_TEXT +'</a></div>');
    
    if(!elem.find('.layui-flow-more')[0]){
      elem.append(more);
    }
    
    //加载下一个元素
    var next = function(html, over){ 
      html = $(html);
      more.before(html);
      over = over == 0 ? true : null;
      over ? more.html(end) : more.find('a').html(ELEM_TEXT);
      isOver = over;
      lock = null;
      lazyimg && lazyimg();
    };
    
    //触发请求
    var done = function(){
      lock = true;
      more.find('a').html(ELEM_LOAD);
      typeof options.done === 'function' && options.done(++page, next);
    };
    
    done();
    
    //不自动滚动加载
    more.find('a').on('click', function(){
      var othis = $(this);
      if(isOver) return;
      lock || done();
    });
    
    //如果允许图片懒加载
    if(options.isLazyimg){
      var lazyimg = that.lazyimg({
        elem: options.elem + ' img'
        ,scrollElem: options.scrollElem
      });
    }
    
    if(!isAuto) return that;
    
    scrollElem.on('scroll', function(){
      var othis = $(this), top = othis.scrollTop();
      
      if(timer) clearTimeout(timer);
      if(isOver || !elem.width()) return; //如果已经结束，或者元素处于隐藏状态，则不执行滚动加载
      
      timer = setTimeout(function(){
        //计算滚动所在容器的可视高度
        var height = notDocment ? othis.height() : $(window).height();
        
        //计算滚动所在容器的实际高度
        var scrollHeight = notDocment
          ? othis.prop('scrollHeight')
        : document.documentElement.scrollHeight;

        //临界点
        if(scrollHeight - top - height <= mb){
          lock || done();
        }
      }, 100);
    });
    
    return that;
  };
  
  //图片懒加载
  Flow.prototype.lazyimg = function(options){
    var that = this, index = 0, haveScroll;
    options = options || {};
    
    var scrollElem = $(options.scrollElem || document); //滚动条所在元素
    var elem = options.elem || 'img';
    
    //滚动条所在元素是否为document
    var notDocment = options.scrollElem && options.scrollElem !== document;
    
    //显示图片
    var show = function(item, height){
      var start = scrollElem.scrollTop(), end = start + height;
      var elemTop = notDocment ? function(){
        return item.offset().top - scrollElem.offset().top + start;
      }() : item.offset().top;

      /* 始终只加载在当前屏范围内的图片 */
      if(elemTop >= start && elemTop <= end){
        if(!item.attr('src')){
          var src = item.attr('lay-src');
          layui.img(src, function(){
            var next = that.lazyimg.elem.eq(index);
            item.attr('src', src).removeAttr('lay-src');
            
            /* 当前图片加载就绪后，检测下一个图片是否在当前屏 */
            next[0] && render(next);
            index++;
          });
        }
      }
    }, render = function(othis, scroll){
      
      //计算滚动所在容器的可视高度
      var height = notDocment ? (scroll||scrollElem).height() : $(window).height();
      var start = scrollElem.scrollTop(), end = start + height;

      that.lazyimg.elem = $(elem);

      if(othis){
        show(othis, height);
      } else {
        //计算未加载过的图片
        for(var i = 0; i < that.lazyimg.elem.length; i++){
          var item = that.lazyimg.elem.eq(i), elemTop = notDocment ? function(){
            return item.offset().top - scrollElem.offset().top + start;
          }() : item.offset().top;
          
          show(item, height);
          index = i;
          
          //如果图片的top坐标，超出了当前屏，则终止后续图片的遍历
          if(elemTop > end) break;
        }
      }
    };
    
    render();
    
    if(!haveScroll){
      var timer;
      scrollElem.on('scroll', function(){
        var othis = $(this);
        if(timer) clearTimeout(timer)
        timer = setTimeout(function(){
          render(null, othis);
        }, 50);
      }); 
      haveScroll = true;
    }
    return render;
  };
  
  //暴露接口
  exports('flow', new Flow());
});
/**

 @Name：layedit 富文本编辑器
 @License：MIT
    
 */
 
layui.define(['layer', 'form'], function(exports){
  "use strict";
  
  var $ = layui.$
  ,layer = layui.layer
  ,form = layui.form
  ,hint = layui.hint()
  ,device = layui.device()
  
  ,MOD_NAME = 'layedit', THIS = 'layui-this', SHOW = 'layui-show', ABLED = 'layui-disabled'
  
  ,Edit = function(){
    var that = this;
    that.index = 0;
    
    //全局配置
    that.config = {
      //默认工具bar
      tool: [
        'strong', 'italic', 'underline', 'del'
        ,'|'
        ,'left', 'center', 'right'
        ,'|'
        ,'link', 'unlink', 'face', 'image'
      ]
      ,hideTool: []
      ,height: 280 //默认高
    };
  };
  
  //全局设置
  Edit.prototype.set = function(options){
    var that = this;
    $.extend(true, that.config, options);
    return that;
  };
  
  //事件
  Edit.prototype.on = function(events, callback){
    return layui.onevent(MOD_NAME, events, callback);
  };
  
  //建立编辑器
  Edit.prototype.build = function(id, settings){
    settings = settings || {};
    
    var that = this
    ,config = that.config
    ,ELEM = 'layui-layedit', textArea = $(typeof(id)=='string'?'#'+id:id)
    ,name =  'LAY_layedit_'+ (++that.index)
    ,haveBuild = textArea.next('.'+ELEM)
    
    ,set = $.extend({}, config, settings)
    
    ,tool = function(){
      var node = [], hideTools = {};
      layui.each(set.hideTool, function(_, item){
        hideTools[item] = true;
      });
      layui.each(set.tool, function(_, item){
        if(tools[item] && !hideTools[item]){
          node.push(tools[item]);
        }
      });
      return node.join('');
    }()
 
    
    ,editor = $(['<div class="'+ ELEM +'">'
      ,'<div class="layui-unselect layui-layedit-tool">'+ tool +'</div>'
      ,'<div class="layui-layedit-iframe">'
        ,'<iframe id="'+ name +'" name="'+ name +'" textarea="'+ id +'" frameborder="0"></iframe>'
      ,'</div>'
    ,'</div>'].join(''))
    
    //编辑器不兼容ie8以下
    if(device.ie && device.ie < 8){
      return textArea.removeClass('layui-hide').addClass(SHOW);
    }

    haveBuild[0] && (haveBuild.remove());

    setIframe.call(that, editor, textArea[0], set)
    textArea.addClass('layui-hide').after(editor);

    return that.index;
  };
  
  //获得编辑器中内容
  Edit.prototype.getContent = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return toLower(iframeWin[0].document.body.innerHTML);
  };
  
  //获得编辑器中纯文本内容
  Edit.prototype.getText = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    return $(iframeWin[0].document.body).text();
  };
  /**
   * 设置编辑器内容
   * @param {[type]} index   编辑器索引
   * @param {[type]} content 要设置的内容
   * @param {[type]} flag    是否追加模式
   */
  Edit.prototype.setContent = function(index, content, flag){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    if(flag){
      $(iframeWin[0].document.body).append(content)
    }else{
      $(iframeWin[0].document.body).html(content)
    };
    layedit.sync(index)
  };
  //将编辑器内容同步到textarea（一般用于异步提交时）
  Edit.prototype.sync = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var textarea = $('#'+iframeWin[1].attr('textarea'));
    textarea.val(toLower(iframeWin[0].document.body.innerHTML));
  };
  
  //获取编辑器选中内容
  Edit.prototype.getSelection = function(index){
    var iframeWin = getWin(index);
    if(!iframeWin[0]) return;
    var range = Range(iframeWin[0].document);
    return document.selection ? range.text : range.toString();
  };

  //iframe初始化
  var setIframe = function(editor, textArea, set){
    var that = this, iframe = editor.find('iframe');

    iframe.css({
      height: set.height
    }).on('load', function(){
      var conts = iframe.contents()
      ,iframeWin = iframe.prop('contentWindow')
      ,head = conts.find('head')
      ,style = $(['<style>'
        ,'*{margin: 0; padding: 0;}'
        ,'body{padding: 10px; line-height: 20px; overflow-x: hidden; word-wrap: break-word; font: 14px Helvetica Neue,Helvetica,PingFang SC,Microsoft YaHei,Tahoma,Arial,sans-serif; -webkit-box-sizing: border-box !important; -moz-box-sizing: border-box !important; box-sizing: border-box !important;}'
        ,'a{color:#01AAED; text-decoration:none;}a:hover{color:#c00}'
        ,'p{margin-bottom: 10px;}'
        ,'img{display: inline-block; border: none; vertical-align: middle;}'
        ,'pre{margin: 10px 0; padding: 10px; line-height: 20px; border: 1px solid #ddd; border-left-width: 6px; background-color: #F2F2F2; color: #333; font-family: Courier New; font-size: 12px;}'
      ,'</style>'].join(''))
      ,body = conts.find('body');
      
      head.append(style);
      body.attr('contenteditable', 'true').css({
        'min-height': set.height
      }).html(textArea.value||'');

      hotkey.apply(that, [iframeWin, iframe, textArea, set]); //快捷键处理
      toolActive.call(that, iframeWin, editor, set); //触发工具

    });
  }
  
  //获得iframe窗口对象
  ,getWin = function(index){
    var iframe = $('#LAY_layedit_'+ index)
    ,iframeWin = iframe.prop('contentWindow');
    return [iframeWin, iframe];
  }
  
  //IE8下将标签处理成小写
  ,toLower = function(html){
    if(device.ie == 8){
      html = html.replace(/<.+>/g, function(str){
        return str.toLowerCase();
      });
    }
    return html;
  }
  
  //快捷键处理
  ,hotkey = function(iframeWin, iframe, textArea, set){
    var iframeDOM = iframeWin.document, body = $(iframeDOM.body);
    body.on('keydown', function(e){
      var keycode = e.keyCode;
      //处理回车
      if(keycode === 13){
        var range = Range(iframeDOM);
        var container = getContainer(range)
        ,parentNode = container.parentNode;
        
        if(parentNode.tagName.toLowerCase() === 'pre'){
          if(e.shiftKey) return
          layer.msg('请暂时用shift+enter');
          return false;
        }
        iframeDOM.execCommand('formatBlock', false, '<p>');
      }
    });
    
    //给textarea同步内容
    $(textArea).parents('form').on('submit', function(){
      var html = body.html();
      //IE8下将标签处理成小写
      if(device.ie == 8){
        html = html.replace(/<.+>/g, function(str){
          return str.toLowerCase();
        });
      }
      textArea.value = html;
    });
    
    //处理粘贴
    body.on('paste', function(e){
      iframeDOM.execCommand('formatBlock', false, '<p>');
      setTimeout(function(){
        filter.call(iframeWin, body);
        textArea.value = body.html();
      }, 100); 
    });
  }
  
  //标签过滤
  ,filter = function(body){
    var iframeWin = this
    ,iframeDOM = iframeWin.document;
    
    //清除影响版面的css属性
    body.find('*[style]').each(function(){
      var textAlign = this.style.textAlign;
      this.removeAttribute('style');
      $(this).css({
        'text-align': textAlign || ''
      })
    });
    
    //修饰表格
    body.find('table').addClass('layui-table');
    
    //移除不安全的标签
    body.find('script,link').remove();
  }
  
  //Range对象兼容性处理
  ,Range = function(iframeDOM){
    return iframeDOM.selection 
      ? iframeDOM.selection.createRange()
    : iframeDOM.getSelection().getRangeAt(0);
  }
  
  //当前Range对象的endContainer兼容性处理
  ,getContainer = function(range){
    return range.endContainer || range.parentElement().childNodes[0]
  }
  
  //在选区插入内联元素
  ,insertInline = function(tagName, attr, range){
    var iframeDOM = this.document
    ,elem = document.createElement(tagName)
    for(var key in attr){
      elem.setAttribute(key, attr[key]);
    }
    elem.removeAttribute('text');

    if(iframeDOM.selection){ //IE
      var text = range.text || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.pasteHTML($(elem).prop('outerHTML')); 
      range.select();
    } else { //非IE
      var text = range.toString() || attr.text;
      if(tagName === 'a' && !text) return;
      if(text){
        elem.innerHTML = text;
      }
      range.deleteContents();
      range.insertNode(elem);
    }
  }
  
  //工具选中
  ,toolCheck = function(tools, othis){
    var iframeDOM = this.document
    ,CHECK = 'layedit-tool-active'
    ,container = getContainer(Range(iframeDOM))
    ,item = function(type){
      return tools.find('.layedit-tool-'+type)
    }

    if(othis){
      othis[othis.hasClass(CHECK) ? 'removeClass' : 'addClass'](CHECK);
    }
    
    tools.find('>i').removeClass(CHECK);
    item('unlink').addClass(ABLED);

    $(container).parents().each(function(){
      var tagName = this.tagName.toLowerCase()
      ,textAlign = this.style.textAlign;

      //文字
      if(tagName === 'b' || tagName === 'strong'){
        item('b').addClass(CHECK)
      }
      if(tagName === 'i' || tagName === 'em'){
        item('i').addClass(CHECK)
      }
      if(tagName === 'u'){
        item('u').addClass(CHECK)
      }
      if(tagName === 'strike'){
        item('d').addClass(CHECK)
      }
      
      //对齐
      if(tagName === 'p'){
        if(textAlign === 'center'){
          item('center').addClass(CHECK);
        } else if(textAlign === 'right'){
          item('right').addClass(CHECK);
        } else {
          item('left').addClass(CHECK);
        }
      }
      
      //超链接
      if(tagName === 'a'){
        item('link').addClass(CHECK);
        item('unlink').removeClass(ABLED);
      }
    });
  }

  //触发工具
  ,toolActive = function(iframeWin, editor, set){
    var iframeDOM = iframeWin.document
    ,body = $(iframeDOM.body)
    ,toolEvent = {
      //超链接
      link: function(range){
        var container = getContainer(range)
        ,parentNode = $(container).parent();
        
        link.call(body, {
          href: parentNode.attr('href')
          ,target: parentNode.attr('target')
        }, function(field){
          var parent = parentNode[0];
          if(parent.tagName === 'A'){
            parent.href = field.url;
          } else {
            insertInline.call(iframeWin, 'a', {
              target: field.target
              ,href: field.url
              ,text: field.url
            }, range);
          }
        });
      }
      //清除超链接
      ,unlink: function(range){
        iframeDOM.execCommand('unlink');
      }
      //表情
      ,face: function(range){
        face.call(this, function(img){
          insertInline.call(iframeWin, 'img', {
            src: img.src
            ,alt: img.alt
          }, range);
        });
      }
      //图片
      ,image: function(range){
        var that = this;
        layui.use('upload', function(upload){
          var uploadImage = set.uploadImage || {};
          upload.render({
            url: uploadImage.url
            ,method: uploadImage.type
            ,elem: $(that).find('input')[0]
            ,done: function(res){
              if(res.code == 0){
                res.data = res.data || {};
                insertInline.call(iframeWin, 'img', {
                  src: res.data.src
                  ,alt: res.data.title
                }, range);
              } else {
                layer.msg(res.msg||'上传失败');
              }
            }
          });
        });
      }
      //插入代码
      ,code: function(range){
        code.call(body, function(pre){
          insertInline.call(iframeWin, 'pre', {
            text: pre.code
            ,'lay-lang': pre.lang
          }, range);
        });
      }
      //帮助
      ,help: function(){
        layer.open({
          type: 2
          ,title: '帮助'
          ,area: ['600px', '380px']
          ,shadeClose: true
          ,shade: 0.1
          ,skin: 'layui-layer-msg'
          ,content: ['', 'no']
        });
      }
    }
    ,tools = editor.find('.layui-layedit-tool')
    
    ,click = function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event')
      ,command = othis.attr('lay-command');
      
      if(othis.hasClass(ABLED)) return;

      body.focus();
      
      var range = Range(iframeDOM)
      ,container = range.commonAncestorContainer
      
      if(command){
        iframeDOM.execCommand(command);
        if(/justifyLeft|justifyCenter|justifyRight/.test(command)){
          iframeDOM.execCommand('formatBlock', false, '<p>');
        }
        setTimeout(function(){
          body.focus();
        }, 10);
      } else {
        toolEvent[events] && toolEvent[events].call(this, range);
      }
      toolCheck.call(iframeWin, tools, othis);
    }
    
    ,isClick = /image/

    tools.find('>i').on('mousedown', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(isClick.test(events)) return;
      click.call(this)
    }).on('click', function(){
      var othis = $(this)
      ,events = othis.attr('layedit-event');
      if(!isClick.test(events)) return;
      click.call(this)
    });
    
    //触发内容区域
    body.on('click', function(){
      toolCheck.call(iframeWin, tools);
      layer.close(face.index);
    });
  }
  
  //超链接面板
  ,link = function(options, callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_link'
      ,area: '350px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: '超链接'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">URL</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input name="url" lay-verify="url" value="'+ (options.href||'') +'" autofocus="true" autocomplete="off" class="layui-input">'
            ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label" style="width: 60px;">打开方式</label>'
          ,'<div class="layui-input-block" style="margin-left: 90px">'
            ,'<input type="radio" name="target" value="_self" class="layui-input" title="当前窗口"'
            + ((options.target==='_self' || !options.target) ? 'checked' : '') +'>'
            ,'<input type="radio" name="target" value="_blank" class="layui-input" title="新窗口" '
            + (options.target==='_blank' ? 'checked' : '') +'>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-link-yes" class="layui-btn"> 确定 </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-link-yes)';
        form.render('radio');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(link.index);
          callback && callback(data.field);
        });
      }
    });
    link.index = index;
  }
  
  //表情面板
  ,face = function(callback){
    //表情库
    var faces = function(){
      var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
      layui.each(alt, function(index, item){
        arr[item] = layui.cache.dir + 'images/face/'+ index + '.gif';
      });
      return arr;
    }();
    face.hide = face.hide || function(e){
      if($(e.target).attr('layedit-event') !== 'face'){
        layer.close(face.index);
      }
    }
    return face.index = layer.tips(function(){
      var content = [];
      layui.each(faces, function(key, item){
        content.push('<li title="'+ key +'"><img src="'+ item +'" alt="'+ key +'"></li>');
      });
      return '<ul class="layui-clear">' + content.join('') + '</ul>';
    }(), this, {
      tips: 1
      ,time: 0
      ,skin: 'layui-box layui-util-face'
      ,maxWidth: 500
      ,success: function(layero, index){
        layero.css({
          marginTop: -4
          ,marginLeft: -10
        }).find('.layui-clear>li').on('click', function(){
          callback && callback({
            src: faces[this.title]
            ,alt: this.title
          });
          layer.close(index);
        });
        $(document).off('click', face.hide).on('click', face.hide);
      }
    });
  }
  
  //插入代码面板
  ,code = function(callback){
    var body = this, index = layer.open({
      type: 1
      ,id: 'LAY_layedit_code'
      ,area: '550px'
      ,shade: 0.05
      ,shadeClose: true
      ,moveType: 1
      ,title: '插入代码'
      ,skin: 'layui-layer-msg'
      ,content: ['<ul class="layui-form layui-form-pane" style="margin: 15px;">'
        ,'<li class="layui-form-item">'
          ,'<label class="layui-form-label">请选择语言</label>'
          ,'<div class="layui-input-block">'
            ,'<select name="lang">'
              ,'<option value="JavaScript">JavaScript</option>'
              ,'<option value="HTML">HTML</option>'
              ,'<option value="CSS">CSS</option>'
              ,'<option value="Java">Java</option>'
              ,'<option value="PHP">PHP</option>'
              ,'<option value="C#">C#</option>'
              ,'<option value="Python">Python</option>'
              ,'<option value="Ruby">Ruby</option>'
              ,'<option value="Go">Go</option>'
            ,'</select>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item layui-form-text">'
          ,'<label class="layui-form-label">代码</label>'
          ,'<div class="layui-input-block">'
            ,'<textarea name="code" lay-verify="required" autofocus="true" class="layui-textarea" style="height: 200px;"></textarea>'
          ,'</div>'
        ,'</li>'
        ,'<li class="layui-form-item" style="text-align: center;">'
          ,'<button type="button" lay-submit lay-filter="layedit-code-yes" class="layui-btn"> 确定 </button>'
          ,'<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
        ,'</li>'
      ,'</ul>'].join('')
      ,success: function(layero, index){
        var eventFilter = 'submit(layedit-code-yes)';
        form.render('select');  
        layero.find('.layui-btn-primary').on('click', function(){
          layer.close(index);
          body.focus();
        });
        form.on(eventFilter, function(data){
          layer.close(code.index);
          callback && callback(data.field);
        });
      }
    });
    code.index = index;
  }
  
  //全部工具
  ,tools = {
    html: '<i class="layui-icon layedit-tool-html" title="HTML源代码" lay-command="html" layedit-event="html"">&#xe64b;</i><span class="layedit-tool-mid"></span>'
    ,strong: '<i class="layui-icon layedit-tool-b" title="加粗" lay-command="Bold" layedit-event="b"">&#xe62b;</i>'
    ,italic: '<i class="layui-icon layedit-tool-i" title="斜体" lay-command="italic" layedit-event="i"">&#xe644;</i>'
    ,underline: '<i class="layui-icon layedit-tool-u" title="下划线" lay-command="underline" layedit-event="u"">&#xe646;</i>'
    ,del: '<i class="layui-icon layedit-tool-d" title="删除线" lay-command="strikeThrough" layedit-event="d"">&#xe64f;</i>'
    
    ,'|': '<span class="layedit-tool-mid"></span>'
    
    ,left: '<i class="layui-icon layedit-tool-left" title="左对齐" lay-command="justifyLeft" layedit-event="left"">&#xe649;</i>'
    ,center: '<i class="layui-icon layedit-tool-center" title="居中对齐" lay-command="justifyCenter" layedit-event="center"">&#xe647;</i>'
    ,right: '<i class="layui-icon layedit-tool-right" title="右对齐" lay-command="justifyRight" layedit-event="right"">&#xe648;</i>'
    ,link: '<i class="layui-icon layedit-tool-link" title="插入链接" layedit-event="link"">&#xe64c;</i>'
    ,unlink: '<i class="layui-icon layedit-tool-unlink layui-disabled" title="清除链接" lay-command="unlink" layedit-event="unlink"">&#xe64d;</i>'
    ,face: '<i class="layui-icon layedit-tool-face" title="表情" layedit-event="face"">&#xe650;</i>'
    ,image: '<i class="layui-icon layedit-tool-image" title="图片" layedit-event="image">&#xe64a;<input type="file" name="file"></i>'
    ,code: '<i class="layui-icon layedit-tool-code" title="插入代码" layedit-event="code">&#xe64e;</i>'
    
    ,help: '<i class="layui-icon layedit-tool-help" title="帮助" layedit-event="help">&#xe607;</i>'
  }
  
  ,edit = new Edit();

  exports(MOD_NAME, edit);
});
/**

 @Name：code 代码修饰器
 @License：MIT
    
 */
 
layui.define('jquery', function(exports){
  "use strict";
  
  var $ = layui.$;
  
  exports('code', function(options){
    var elems = [];
    options = options || {};
    options.elem = $(options.elem||'.layui-code');
    options.lang = 'lang' in options ? options.lang : 'code';
    
    options.elem.each(function(){
      elems.push(this);
    });
    
    layui.each(elems.reverse(), function(index, item){
      var othis = $(item), html = othis.html();
      
      //转义HTML标签
      if(othis.attr('lay-encode') || options.encode){
        html = html.replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')
      }
      
      othis.html('<ol class="layui-code-ol"><li>' + html.replace(/[\r\t\n]+/g, '</li><li>') + '</li></ol>')
      
      if(!othis.find('>.layui-code-h3')[0]){
        othis.prepend('<h3 class="layui-code-h3">'+ (othis.attr('lay-title')||options.title||'&lt;/&gt;') + '<a href="javascript:;">'+ (othis.attr('lay-lang')||options.lang||'') +'</a>' + '</h3>');
      }
      
      var ol = othis.find('>.layui-code-ol');
      othis.addClass('layui-box layui-code-view');
      
      //识别皮肤
      if(othis.attr('lay-skin') || options.skin){
        othis.addClass('layui-code-' +(othis.attr('lay-skin') || options.skin));
      }
      
      //按行数适配左边距
      if((ol.find('li').length/100|0) > 0){
        ol.css('margin-left', (ol.find('li').length/100|0) + 'px');
      }
      
      //设置最大高度
      if(othis.attr('lay-height') || options.height){
        ol.css('max-height', othis.attr('lay-height') || options.height);
      }

    });
    
  });
}).addcss('modules/code.css?v=1', 'skincodecss');

layui.config({
    version          : '3.0.1',
    base             : window.wulacfg.mBase + '/backend/assets/addon/',
    dir              : window.wulacfg.mBase + '/backend/assets/',
    module           : window.wulacfg.mBase,
    ajaxSuccessBefore: function (data, url, opts) {
        var $d = layui.$(document)
        switch (opts.xhr.status) {
            case 390:
                $d.trigger('auth.user.blocked');
                return false;
            case 391:
                $d.trigger('auth.user.locked');
                return false;
            case 401:
                $d.trigger('auth.need.login');
                return false;
            case 403:
                $d.trigger('auth.perm.denied', data);
                return true
            case 422:
                $d.trigger('form.data.invalid', data);
                return true
            default:
                if (data && typeof data === 'object') {
                    if (data.message) {
                        switch (data.code) {
                            case 500:
                                window.$notice.error(data.message)
                                break;
                            case 400:
                                window.$notice.warning(data.message)
                                break;
                            case 300:
                                window.$notice.info(data.message)
                                break;
                            case 200:
                                window.$notice.success(data.message)
                                break;
                        }
                    }
                    switch (data.action) {
                        case 'redirect':
                            window.location = data.target;
                            return false;
                        case 'reload':
                            if (data.target) {
                                layui.$(data.target).data('loaderObj').reloadData();
                            } else {
                                window.location.reload(true)
                            }
                            return false;
                        case 'click':
                            if (data.target) {
                                layui.$(data.target).click();
                                return false;
                            }
                    }
                }
                return true;
        }
    }
}).extend({
    steps     : 'steps/steps',
    notice    : 'notice/notice',
    cascader  : 'cascader/cascader',
    dropdownX : 'dropdown/dropdown',
    fileChoose: 'fileChoose/fileChoose',
    Split     : 'Split/Split',
    Cropper   : 'Cropper/Cropper',
    tagsInput : 'tagsInput/tagsInput',
    citypicker: 'city-picker/city-picker',
    introJs   : 'introJs/introJs',
    zTree     : 'zTree/zTree'
});

/*!
 * @Title: xm-select
 * @Version: 1.1.8
 * @Description：基于layui的多选解决方案
 * @Site: https://gitee.com/maplemei/xm-select
 * @Author: maplemei
 * @License：Apache License 2.0
 */!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="./",n(n.s=213)}({104:function(e,t){e.exports=function(e){var t="undefined"!=typeof window&&window.location;if(!t)throw new Error("fixUrls requires window.location");if(!e||"string"!=typeof e)return e;var n=t.protocol+"//"+t.host,o=n+t.pathname.replace(/\/[^\/]*$/,"/");return e.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,(function(e,t){var r,i=t.trim().replace(/^"(.*)"$/,(function(e,t){return t})).replace(/^'(.*)'$/,(function(e,t){return t}));return/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(i)?e:(r=0===i.indexOf("//")?i:0===i.indexOf("/")?n+i:o+i.replace(/^\.\//,""),"url("+JSON.stringify(r)+")")}))}},213:function(e,t,n){"use strict";n.r(t),function(e){n(215),n(216),n(218);var t=n(65);window.addEventListener("click",(function(){Object.keys(t.b).forEach((function(e){var n=t.b[e];n&&n.closed&&n.closed()}))})),"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?e.exports=t.c:"function"==typeof define&&n(220)?define(xmSelect):window.layui&&layui.define&&layui.define((function(e){e("xmSelect",t.c)})),window.xmSelect=t.c}.call(this,n(214)(e))},214:function(e,t){e.exports=function(e){if(!e.webpackPolyfill){var t=Object.create(e);t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),Object.defineProperty(t,"exports",{enumerable:!0}),t.webpackPolyfill=1}return t}},215:function(e,t){Array.prototype.map||(Array.prototype.map=function(e,t){var n,o,r,i=Object(this),l=i.length>>>0;for(t&&(n=t),o=new Array(l),r=0;r<l;){var a,s;r in i&&(a=i[r],s=e.call(n,a,r,i),o[r]=s),r++}return o}),Array.prototype.forEach||(Array.prototype.forEach=function(e,t){var n,o;if(null==this)throw new TypeError("this is null or not defined");var r=Object(this),i=r.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(arguments.length>1&&(n=t),o=0;o<i;){var l;o in r&&(l=r[o],e.call(n,l,o,r)),o++}}),Array.prototype.filter||(Array.prototype.filter=function(e){if(null==this)throw new TypeError;var t=Object(this),n=t.length>>>0;if("function"!=typeof e)throw new TypeError;for(var o=[],r=arguments[1],i=0;i<n;i++)if(i in t){var l=t[i];e.call(r,l,i,t)&&o.push(l)}return o}),Array.prototype.find||(Array.prototype.find=function(e){return e&&(this.filter(e)||[])[0]}),Array.prototype.findIndex||(Array.prototype.findIndex=function(e){for(var t,n=Object(this),o=n.length>>>0,r=arguments[1],i=0;i<o;i++)if(t=n[i],e.call(r,t,i,n))return i;return-1})},216:function(e,t,n){var o=n(217);"string"==typeof o&&(o=[[e.i,o,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};n(27)(o,r);o.locals&&(e.exports=o.locals)},217:function(e,t,n){(e.exports=n(26)(!1)).push([e.i,"@-webkit-keyframes xm-upbit {\n  from {\n    -webkit-transform: translate3d(0, 30px, 0);\n    opacity: 0.3;\n  }\n  to {\n    -webkit-transform: translate3d(0, 0, 0);\n    opacity: 1;\n  }\n}\n@keyframes xm-upbit {\n  from {\n    transform: translate3d(0, 30px, 0);\n    opacity: 0.3;\n  }\n  to {\n    transform: translate3d(0, 0, 0);\n    opacity: 1;\n  }\n}\n@-webkit-keyframes loader {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes loader {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\nxm-select {\n  background-color: #FFF;\n  position: relative;\n  border: 1px solid #E6E6E6;\n  border-radius: 2px;\n  display: block;\n  width: 100%;\n  cursor: pointer;\n  outline: none;\n}\nxm-select * {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  font-size: 14px;\n  font-weight: 400;\n  text-overflow: ellipsis;\n  user-select: none;\n  -ms-user-select: none;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n}\nxm-select:hover {\n  border-color: #C0C4CC;\n}\nxm-select > .xm-tips {\n  color: #999999;\n  padding: 0 10px;\n  position: absolute;\n  display: flex;\n  height: 100%;\n  align-items: center;\n}\nxm-select > .xm-icon {\n  display: inline-block;\n  overflow: hidden;\n  position: absolute;\n  width: 0;\n  height: 0;\n  right: 10px;\n  top: 50%;\n  margin-top: -3px;\n  cursor: pointer;\n  border: 6px dashed transparent;\n  border-top-color: #C2C2C2;\n  border-top-style: solid;\n  transition: all 0.3s;\n  -webkit-transition: all 0.3s;\n}\nxm-select > .xm-icon-expand {\n  margin-top: -9px;\n  transform: rotate(180deg);\n}\nxm-select > .xm-label.single-row {\n  position: absolute;\n  top: 0;\n  bottom: 0px;\n  left: 0px;\n  right: 30px;\n  overflow: auto hidden;\n}\nxm-select > .xm-label.single-row .scroll {\n  overflow-y: hidden;\n}\nxm-select > .xm-label.single-row .label-content {\n  flex-wrap: nowrap;\n}\nxm-select > .xm-label.auto-row .label-content {\n  flex-wrap: wrap;\n}\nxm-select > .xm-label.auto-row .xm-label-block > span {\n  white-space: unset;\n  height: 100%;\n}\nxm-select > .xm-label .scroll .label-content {\n  display: flex;\n  padding: 3px 30px 3px 10px;\n}\nxm-select > .xm-label .xm-label-block {\n  display: flex;\n  position: relative;\n  padding: 0px 5px;\n  margin: 2px 5px 2px 0;\n  border-radius: 3px;\n  align-items: baseline;\n  color: #FFF;\n}\nxm-select > .xm-label .xm-label-block > span {\n  display: flex;\n  color: #FFF;\n  white-space: nowrap;\n}\nxm-select > .xm-label .xm-label-block > i {\n  color: #FFF;\n  margin-left: 8px;\n  font-size: 12px;\n  cursor: pointer;\n  display: flex;\n}\nxm-select > .xm-label .xm-label-block.disabled {\n  background-color: #C2C2C2 !important;\n  cursor: no-drop !important;\n}\nxm-select > .xm-label .xm-label-block.disabled > i {\n  cursor: no-drop !important;\n}\nxm-select > .xm-body {\n  position: absolute;\n  left: 0;\n  top: 42px;\n  padding: 5px 0;\n  z-index: 999;\n  width: 100%;\n  min-width: fit-content;\n  border: 1px solid #E6E6E6;\n  background-color: #fff;\n  border-radius: 2px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);\n  animation-name: xm-upbit;\n  animation-duration: 0.3s;\n  animation-fill-mode: both;\n}\nxm-select > .xm-body .scroll-body {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\nxm-select > .xm-body .scroll-body::-webkit-scrollbar {\n  width: 8px;\n}\nxm-select > .xm-body .scroll-body::-webkit-scrollbar-track {\n  -webkit-border-radius: 2em;\n  -moz-border-radius: 2em;\n  -ms-border-radius: 2em;\n  border-radius: 2em;\n  background-color: #FFF;\n}\nxm-select > .xm-body .scroll-body::-webkit-scrollbar-thumb {\n  -webkit-border-radius: 2em;\n  -moz-border-radius: 2em;\n  -ms-border-radius: 2em;\n  border-radius: 2em;\n  background-color: #C2C2C2;\n}\nxm-select > .xm-body.up {\n  top: auto;\n  bottom: 42px;\n}\nxm-select > .xm-body.relative {\n  position: relative;\n  display: block !important;\n  top: 0;\n  box-shadow: none;\n  border: none;\n  animation-name: none;\n  animation-duration: 0;\n  min-width: 100%;\n}\nxm-select > .xm-body .xm-group {\n  cursor: default;\n}\nxm-select > .xm-body .xm-group-item {\n  display: inline-block;\n  cursor: pointer;\n  padding: 0 10px;\n  color: #999;\n  font-size: 12px;\n}\nxm-select > .xm-body .xm-option {\n  display: flex;\n  align-items: center;\n  position: relative;\n  padding: 0 10px;\n  cursor: pointer;\n}\nxm-select > .xm-body .xm-option-icon {\n  color: transparent;\n  display: flex;\n  border: 1px solid #E6E6E6;\n  border-radius: 3px;\n  justify-content: center;\n  align-items: center;\n}\nxm-select > .xm-body .xm-option-icon.xm-icon-danx {\n  border-radius: 100%;\n}\nxm-select > .xm-body .xm-option-content {\n  display: flex;\n  position: relative;\n  padding-left: 15px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  color: #666;\n  width: calc(100% - 20px);\n}\nxm-select > .xm-body .xm-option.hide-icon .xm-option-content {\n  padding-left: 0;\n}\nxm-select > .xm-body .xm-option.selected.hide-icon .xm-option-content {\n  color: #FFF !important;\n}\nxm-select > .xm-body .xm-option .loader {\n  width: 0.8em;\n  height: 0.8em;\n  margin-right: 6px;\n  color: #C2C2C2;\n}\nxm-select > .xm-body .xm-select-empty {\n  text-align: center;\n  color: #999;\n}\nxm-select > .xm-body .disabled {\n  cursor: no-drop;\n}\nxm-select > .xm-body .disabled:hover {\n  background-color: #FFF;\n}\nxm-select > .xm-body .disabled .xm-option-icon {\n  border-color: #C2C2C2 !important;\n}\nxm-select > .xm-body .disabled .xm-option-content {\n  color: #C2C2C2 !important;\n}\nxm-select > .xm-body .disabled.selected > .xm-option-icon {\n  color: #C2C2C2 !important;\n}\nxm-select > .xm-body .xm-search {\n  background-color: #FFF !important;\n  position: relative;\n  padding: 0 10px;\n  margin-bottom: 5px;\n  cursor: pointer;\n}\nxm-select > .xm-body .xm-search > i {\n  position: absolute;\n  color: #666;\n}\nxm-select > .xm-body .xm-search-input {\n  border: none;\n  border-bottom: 1px solid #E6E6E6;\n  padding-left: 27px;\n  cursor: text;\n}\nxm-select > .xm-body .xm-paging {\n  padding: 0 10px;\n  display: flex;\n  margin-top: 5px;\n}\nxm-select > .xm-body .xm-paging > span:first-child {\n  border-radius: 2px 0 0 2px;\n}\nxm-select > .xm-body .xm-paging > span:last-child {\n  border-radius: 0 2px 2px 0;\n}\nxm-select > .xm-body .xm-paging > span {\n  display: flex;\n  flex: auto;\n  justify-content: center;\n  vertical-align: middle;\n  margin: 0 -1px 0 0;\n  background-color: #fff;\n  color: #333;\n  font-size: 12px;\n  border: 1px solid #e2e2e2;\n  flex-wrap: nowrap;\n  width: 100%;\n  overflow: hidden;\n  min-width: 50px;\n}\nxm-select > .xm-body .xm-toolbar {\n  padding: 0 10px;\n  display: flex;\n  margin: -3px 0;\n  cursor: default;\n}\nxm-select > .xm-body .xm-toolbar .toolbar-tag {\n  cursor: pointer;\n  display: flex;\n  margin-right: 20px;\n  color: #666;\n  align-items: baseline;\n}\nxm-select > .xm-body .xm-toolbar .toolbar-tag:hover {\n  opacity: 0.8;\n}\nxm-select > .xm-body .xm-toolbar .toolbar-tag:active {\n  opacity: 1;\n}\nxm-select > .xm-body .xm-toolbar .toolbar-tag > i {\n  margin-right: 2px;\n  font-size: 14px;\n}\nxm-select > .xm-body .xm-toolbar .toolbar-tag:last-child {\n  margin-right: 0;\n}\nxm-select > .xm-body .xm-body-custom {\n  line-height: initial;\n  cursor: default;\n}\nxm-select > .xm-body .xm-body-custom * {\n  box-sizing: initial;\n}\nxm-select > .xm-body .xm-tree {\n  position: relative;\n}\nxm-select > .xm-body .xm-tree-icon {\n  display: inline-block;\n  margin-right: 3px;\n  cursor: pointer;\n  border: 6px dashed transparent;\n  border-left-color: #C2C2C2;\n  border-left-style: solid;\n  transition: all 0.3s;\n  -webkit-transition: all 0.3s;\n  z-index: 2;\n  visibility: hidden;\n}\nxm-select > .xm-body .xm-tree-icon.expand {\n  margin-top: 3px;\n  margin-right: 5px;\n  margin-left: -2px;\n  transform: rotate(90deg);\n}\nxm-select > .xm-body .xm-tree-icon.xm-visible {\n  visibility: visible;\n}\nxm-select > .xm-body .xm-tree .left-line {\n  position: absolute;\n  left: 13px;\n  width: 0;\n  z-index: 1;\n  border-left: 1px dotted #c0c4cc !important;\n}\nxm-select > .xm-body .xm-tree .top-line {\n  position: absolute;\n  left: 13px;\n  height: 0;\n  z-index: 1;\n  border-top: 1px dotted #c0c4cc !important;\n}\nxm-select > .xm-body .xm-tree .xm-tree-icon + .top-line {\n  margin-left: 1px;\n}\nxm-select > .xm-body .scroll-body > .xm-tree > .xm-option > .top-line,\nxm-select > .xm-body .scroll-body > .xm-option > .top-line {\n  width: 0 !important;\n}\nxm-select > .xm-body .xm-cascader-box {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  padding: 5px 0;\n  border: 1px solid #E6E6E6;\n  background-color: #fff;\n  border-radius: 2px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);\n  margin: -1px;\n}\nxm-select > .xm-body .xm-cascader-box::before {\n  content: ' ';\n  position: absolute;\n  width: 0;\n  height: 0;\n  border: 6px solid transparent;\n  border-right-color: #E6E6E6;\n  top: 10px;\n  left: -12px;\n}\nxm-select > .xm-body .xm-cascader-box::after {\n  content: ' ';\n  position: absolute;\n  width: 0;\n  height: 0;\n  border: 6px solid transparent;\n  border-right-color: #fff;\n  top: 10px;\n  left: -11px;\n}\nxm-select > .xm-body .xm-cascader-scroll {\n  height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n}\nxm-select > .xm-body.cascader {\n  width: unset;\n  min-width: unset;\n}\nxm-select > .xm-body.cascader .xm-option-content {\n  padding-left: 8px;\n}\nxm-select > .xm-body.cascader .disabled .xm-right-arrow {\n  color: #C2C2C2 !important;\n}\nxm-select .xm-input {\n  cursor: pointer;\n  border-radius: 2px;\n  border-width: 1px;\n  border-style: solid;\n  border-color: #E6E6E6;\n  display: block;\n  width: 100%;\n  box-sizing: border-box;\n  background-color: #FFF;\n  line-height: 1.3;\n  padding-left: 10px;\n  outline: 0;\n  user-select: text;\n  -ms-user-select: text;\n  -moz-user-select: text;\n  -webkit-user-select: text;\n}\nxm-select .dis {\n  display: none;\n}\nxm-select .loading {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(255, 255, 255, 0.6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\nxm-select .loader {\n  border: 0.2em dotted currentcolor;\n  border-radius: 50%;\n  -webkit-animation: 1s loader linear infinite;\n  animation: 1s loader linear infinite;\n  display: inline-block;\n  width: 1em;\n  height: 1em;\n  color: inherit;\n  vertical-align: middle;\n  pointer-events: none;\n}\nxm-select .xm-select-default {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  border: none;\n  visibility: hidden;\n}\nxm-select .xm-select-disabled {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  cursor: no-drop;\n  z-index: 2;\n  opacity: 0.3;\n  background-color: #FFF;\n}\nxm-select .item--divided {\n  border-top: 1px solid #ebeef5;\n  width: calc(100% - 20px);\n  cursor: initial;\n}\nxm-select .xm-right-arrow {\n  position: absolute;\n  color: #666;\n  right: 5px;\n  top: -1px;\n  font-weight: 700;\n  transform: scale(0.6, 1);\n}\nxm-select .xm-right-arrow::after {\n  content: '>';\n}\nxm-select[size='large'] {\n  min-height: 40px;\n  line-height: 40px;\n}\nxm-select[size='large'] .xm-input {\n  height: 40px;\n}\nxm-select[size='large'] .xm-label .scroll .label-content {\n  line-height: 34px;\n}\nxm-select[size='large'] .xm-label .xm-label-block {\n  height: 30px;\n  line-height: 30px;\n}\nxm-select[size='large'] .xm-body .xm-option .xm-option-icon {\n  height: 20px;\n  width: 20px;\n  font-size: 20px;\n}\nxm-select[size='large'] .xm-paging > span {\n  height: 34px;\n  line-height: 34px;\n}\nxm-select[size='large'] .xm-tree .left-line {\n  height: 100%;\n  bottom: 20px;\n}\nxm-select[size='large'] .xm-tree .left-line-group {\n  height: calc(100% - 40px);\n}\nxm-select[size='large'] .xm-tree .xm-tree-icon.xm-hidden + .top-line {\n  top: 19px;\n}\nxm-select[size='large'] .item--divided {\n  margin: 10px;\n}\nxm-select {\n  min-height: 36px;\n  line-height: 36px;\n}\nxm-select .xm-input {\n  height: 36px;\n}\nxm-select .xm-label .scroll .label-content {\n  line-height: 30px;\n}\nxm-select .xm-label .xm-label-block {\n  height: 26px;\n  line-height: 26px;\n}\nxm-select .xm-body .xm-option .xm-option-icon {\n  height: 18px;\n  width: 18px;\n  font-size: 18px;\n}\nxm-select .xm-paging > span {\n  height: 30px;\n  line-height: 30px;\n}\nxm-select .xm-tree .left-line {\n  height: 100%;\n  bottom: 18px;\n}\nxm-select .xm-tree .left-line-group {\n  height: calc(100% - 36px);\n}\nxm-select .xm-tree .xm-tree-icon.xm-hidden + .top-line {\n  top: 17px;\n}\nxm-select .item--divided {\n  margin: 9px;\n}\nxm-select[size='small'] {\n  min-height: 32px;\n  line-height: 32px;\n}\nxm-select[size='small'] .xm-input {\n  height: 32px;\n}\nxm-select[size='small'] .xm-label .scroll .label-content {\n  line-height: 26px;\n}\nxm-select[size='small'] .xm-label .xm-label-block {\n  height: 22px;\n  line-height: 22px;\n}\nxm-select[size='small'] .xm-body .xm-option .xm-option-icon {\n  height: 16px;\n  width: 16px;\n  font-size: 16px;\n}\nxm-select[size='small'] .xm-paging > span {\n  height: 26px;\n  line-height: 26px;\n}\nxm-select[size='small'] .xm-tree .left-line {\n  height: 100%;\n  bottom: 16px;\n}\nxm-select[size='small'] .xm-tree .left-line-group {\n  height: calc(100% - 32px);\n}\nxm-select[size='small'] .xm-tree .xm-tree-icon.xm-hidden + .top-line {\n  top: 15px;\n}\nxm-select[size='small'] .item--divided {\n  margin: 8px;\n}\nxm-select[size='mini'] {\n  min-height: 28px;\n  line-height: 28px;\n}\nxm-select[size='mini'] .xm-input {\n  height: 28px;\n}\nxm-select[size='mini'] .xm-label .scroll .label-content {\n  line-height: 22px;\n}\nxm-select[size='mini'] .xm-label .xm-label-block {\n  height: 18px;\n  line-height: 18px;\n}\nxm-select[size='mini'] .xm-body .xm-option .xm-option-icon {\n  height: 14px;\n  width: 14px;\n  font-size: 14px;\n}\nxm-select[size='mini'] .xm-paging > span {\n  height: 22px;\n  line-height: 22px;\n}\nxm-select[size='mini'] .xm-tree .left-line {\n  height: 100%;\n  bottom: 14px;\n}\nxm-select[size='mini'] .xm-tree .left-line-group {\n  height: calc(100% - 28px);\n}\nxm-select[size='mini'] .xm-tree .xm-tree-icon.xm-hidden + .top-line {\n  top: 13px;\n}\nxm-select[size='mini'] .item--divided {\n  margin: 7px;\n}\n.layui-form-pane xm-select {\n  margin: -1px -1px -1px 0;\n}\n",""])},218:function(e,t,n){var o=n(219);"string"==typeof o&&(o=[[e.i,o,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};n(27)(o,r);o.locals&&(e.exports=o.locals)},219:function(e,t,n){(e.exports=n(26)(!1)).push([e.i,'@font-face {\n  font-family: "xm-iconfont";\n  src: url(\'//at.alicdn.com/t/font_792691_ptvyboo0bno.eot?t=1574048839056\');\n  /* IE9 */\n  src: url(\'//at.alicdn.com/t/font_792691_ptvyboo0bno.eot?t=1574048839056#iefix\') format(\'embedded-opentype\'), /* IE6-IE8 */ url(\'data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAksAAsAAAAAEYAAAAjeAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCEUgqTXI8lATYCJAM0CxwABCAFhG0HgTwbZQ4jEbaCkVIj+4sD3sS6BFAp9ka91ulVG4leTC/+h+3V+zyRYCTyREKkcZ+D5/u137lPdveLGJBMunoiNPOQPBMq0/FQtEKIkMRDZng69d+hOiQumAr7bJdBOEzMTU77s78mhbI58aCg7ebCs4LBTgCk+cD/4ZqWUHebipp7al3tyKOjwCV/hVyw9PdzaktxI7IMQs26/1N8gV4DI0bVut3UhCaflGGgwM3oTXg1IfRMbCsmrEnriJVeYM2eXHII4KdMMzL4OoACHgZBCTasITcReDUBE8kWPLMTCGoQaDV+eKpUPQI49r8vP6BTPIDCaiBSml3oOQX0voNPebv/u2P0AUfP1w0s5EADzYBZsNdByylo2eVq/NtRdgFpovQR5x2CIwmIZeik6/u0T/m/A7RJP00sCmmyksj/kwc+LC5BFBqDEMDDjwPiANDB9MpJTXwHmsO3YyBwWDA4OFwwJLRcRgAOBUYMDg0mHRwGTAYozsV0AgWYruDwwExDHfzwKWf4OurQ9jzQDtoF+wpistfBfluQ5bQiiJa4ZQoKhShLiMayBbyg05AIkYBoIBJEEApQy/FwYv4HchADIUBXl61dW6mpwIgyp7p8PrHddieSjhY9oqTxyPB/FGNYDklpfYh8VtaoqSgb0bKoGB17CuVUp9Ll2nS2UpNGMSw9hyirA7C6+QLyByIQS0sSSmxvArC5odZmYZMxZSiBR5OkQl0uiufxMH5eL8t3u0d4XKyuq6EMdcpNe2+oXA8p9yPa+4T1PM7+A54tc7tpl2vcAHAftnhZj2chy1CyaCRFsyMqQ5nkNnskEt2yxxZinPsOZjFm4+XWvKqLkfCGS1k4MNP82isxSMf7ZsGYvQVCNAeSSVtzWCxRdXGxyZlA2CvCEevuO7y9M2z2NWH8icydzq/qAJSp1lGvDWFp6Nw3xChJowPD+76nU+upQk6Kw9jI0Rgym9Ct8VlxMI3CSIaDCZja5tDYt0/EYra4tn0Kp3v8Rdezk8svcy1mKhoSvNcZz3LKlUe777Gmval0s7bzAc0k13LGk896V9DuvNn34N0ebKgItkQgOomuJtgQPChNI4cwa7CEWCvfk5QjJFlem6i3SfVShWi5LTFRG+JwdCNpSqbpRFwrtb1TbcRkJi/AbJJQOmfCdnswLNGVM7qqSRO1zO0Q0j5Vr3cYQ07HB0MX6KoIZhx+D9Djs2C5bXtVwvbgJHtSCIL7hjFJme4sZDdS5IlJdKUO1Qt8opn0trBafz3AX933kmCRgyMEWGZjMAkRKhwmIHJGR4ruwFCdWKYzrap2R/mvd2UKajzRAZu88pGAD90Y+02kTFCKrBSXwGGJ3wRcPCdIppTxSmHOfESRwIli0S5J/8AYDCxTGh4XZua4xvfvGx320rDK2qA8g5FlS7pWNLx71+BwgA/KZ5I0aeKmNeCNoNPl8qNHu8uHHzqaKc86fHi4vPuRI4ny+I/vjxw+clh4HXVCFvVnVFx07EHZwVhSRliTTMWSEi0h6YuS6DxCRmiin0B3L4ry6cvR0ijYexFdBL3wGQM0YOrUAZCBkLOBBtQ+xdk7omfgUv+u++admyUeXduyxLM+r/+49rPfhgEZor6GymToNYksNsZyC7ntwAH0928UpgMpxpF0ydNlsMMBw7QsxTCmu0Hf3F+/+vb99Yumhb+e9R0LBNm+4O+hu7lQ5bGjI9j5G88qQ5SLFyuEC7cwd25xoYo2j4eA4bhpM7TZhPtmc+uhVEVSMYXLWh0bfjI8dvUpvDUocPZmU4kwwOfc83wB5wPehrpD3waApbwW+fgRrZXcxw+mB/3woZT+8JFMYwRMIy2k/18qhqcKpjYeYSnIACaUoRDu0e3kQFh98R5fiI8oJqwwGZSJDSbehLzZs7zIeWTQ4UGOIs2c4j2/Q/tn7n7j9juO33On6WhURCT/wO6Y3QdmWFY0Ef6JUeGRggO7ZbtaZlh5RYKWXbLPBLc3l/5h4A0mu3ZXTZ+u6t6VHMAzZhxak50T+24NnRuaOmehRkXlqVR5lIpuwezUUDUdCuJysv8Z/0/8uNE1s7jIJIubFWnI/x7g4nAZx79yYpFoAOU3a9iwT1O/GxUxPY0ljVPv9EukI3qNrl/So2YfzasqHCroNjS0+w0tlPlsYfC6v/01ixquizJH1Kd/VK+OS3iS3rTJWmqsMPdU3B3oFyC9RSumWE/0gG36IjTysfH51IJ/5oOgNYu6p4yb5Fdufhr/Kjtu0oSyYP/WJQrz35aNFnMhtFcwb55NlNnH8Wdu1b+XZA9zqlZrhdPo/V3uBhiUlQ66h0LhbAmFYIncdFOpVMh6Fl7peqy5Z2ZdQBITO2x1Asj1dRFjIBMC3hbuUh8Ooc4W03EjAdo8UL/t0oUfyU8630bmMcw/vqDNAsC9BQD4OqCgH+ljy0UhJB8AAJA+8EmArxk5gnRLik90AElf8rBm+IMvBTWnucb3+0o0ARk+r0ZBv8sU01nnSmP45/H8Dp8C8X+iE9e+ZvXymK/sQJ5/DuqhYKebPnKmPqLYuDcIMWS2/Rjxp2s8Do821LVn6A/xMK1RKvBLK5gyDsZ5uQ6bYusmx2yqLFe4lECHDPcFhojmckuAbnCI6Cn308RI6AAJdtCICQLQyBHKhSgX5YowN6BBPIEB8VxuSfNncpAuutzPnCSiDHDEo+DsKQBPoJi4MpRktepIs2zjO5h84IEMM3ffECKSZU1ZHxfewEI4h494MuuUNNOBjuw18QKHAzEXaAcylS3m3baq9MpnKenYmfEUgCdbXTHEtTVKsvruNGv9/DuYfOAhcuKu9TeEiA9nNJTUDOUbbVkn3sv2eDJrEnVrpvcHOjJeqRsOcpYYLuxoBzKVtCOm3ZaKbtJcurw+e/zN6c7Pd6r4gqUo0WLEiiOueOITvwQkKCEJM9nO3F60y5HkqLhdqUyXZtK3lqwReQ+G40O92UhOt0x/KmKM+u7LTPMzoEBOCYtiUPfSjODiuFXjSDm2idzAoc4Tj9bs2eJYDOU7HQA=\') format(\'woff2\'), url(\'//at.alicdn.com/t/font_792691_ptvyboo0bno.woff?t=1574048839056\') format(\'woff\'), url(\'//at.alicdn.com/t/font_792691_ptvyboo0bno.ttf?t=1574048839056\') format(\'truetype\'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */ url(\'//at.alicdn.com/t/font_792691_ptvyboo0bno.svg?t=1574048839056#iconfont\') format(\'svg\');\n  /* iOS 4.1- */\n}\n.xm-iconfont {\n  font-family: "xm-iconfont" !important;\n  font-size: 16px;\n  font-style: normal;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.xm-icon-quanxuan:before {\n  content: "\\e62c";\n}\n.xm-icon-caidan:before {\n  content: "\\e610";\n}\n.xm-icon-fanxuan:before {\n  content: "\\e837";\n}\n.xm-icon-pifu:before {\n  content: "\\e668";\n}\n.xm-icon-qingkong:before {\n  content: "\\e63e";\n}\n.xm-icon-sousuo:before {\n  content: "\\e600";\n}\n.xm-icon-danx:before {\n  content: "\\e62b";\n}\n.xm-icon-duox:before {\n  content: "\\e613";\n}\n.xm-icon-close:before {\n  content: "\\e601";\n}\n.xm-icon-expand:before {\n  content: "\\e641";\n}\n.xm-icon-banxuan:before {\n  content: "\\e60d";\n}\n',""])},220:function(e,t){(function(t){e.exports=t}).call(this,{})},26:function(e,t,n){"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=function(e,t){var n=e[1]||"",o=e[3];if(!o)return n;if(t&&"function"==typeof btoa){var r=function(e){var t=btoa(unescape(encodeURIComponent(JSON.stringify(e)))),n="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(t);return"/*# ".concat(n," */")}(o),i=o.sources.map((function(e){return"/*# sourceURL=".concat(o.sourceRoot).concat(e," */")}));return[n].concat(i).concat([r]).join("\n")}return[n].join("\n")}(t,e);return t[2]?"@media ".concat(t[2],"{").concat(n,"}"):n})).join("")},t.i=function(e,n){"string"==typeof e&&(e=[[null,e,""]]);for(var o={},r=0;r<this.length;r++){var i=this[r][0];null!=i&&(o[i]=!0)}for(var l=0;l<e.length;l++){var a=e[l];null!=a[0]&&o[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="(".concat(a[2],") and (").concat(n,")")),t.push(a))}},t}},27:function(e,t,n){var o,r,i={},l=(o=function(){return window&&document&&document.all&&!window.atob},function(){return void 0===r&&(r=o.apply(this,arguments)),r}),a=function(e,t){return t?t.querySelector(e):document.querySelector(e)},s=function(e){var t={};return function(e,n){if("function"==typeof e)return e();if(void 0===t[e]){var o=a.call(this,e,n);if(window.HTMLIFrameElement&&o instanceof window.HTMLIFrameElement)try{o=o.contentDocument.head}catch(e){o=null}t[e]=o}return t[e]}}(),c=null,u=0,p=[],d=n(104);function f(e,t){for(var n=0;n<e.length;n++){var o=e[n],r=i[o.id];if(r){r.refs++;for(var l=0;l<r.parts.length;l++)r.parts[l](o.parts[l]);for(;l<o.parts.length;l++)r.parts.push(v(o.parts[l],t))}else{var a=[];for(l=0;l<o.parts.length;l++)a.push(v(o.parts[l],t));i[o.id]={id:o.id,refs:1,parts:a}}}}function h(e,t){for(var n=[],o={},r=0;r<e.length;r++){var i=e[r],l=t.base?i[0]+t.base:i[0],a={css:i[1],media:i[2],sourceMap:i[3]};o[l]?o[l].parts.push(a):n.push(o[l]={id:l,parts:[a]})}return n}function m(e,t){var n=s(e.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var o=p[p.length-1];if("top"===e.insertAt)o?o.nextSibling?n.insertBefore(t,o.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),p.push(t);else if("bottom"===e.insertAt)n.appendChild(t);else{if("object"!=typeof e.insertAt||!e.insertAt.before)throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");var r=s(e.insertAt.before,n);n.insertBefore(t,r)}}function b(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e);var t=p.indexOf(e);t>=0&&p.splice(t,1)}function x(e){var t=document.createElement("style");if(void 0===e.attrs.type&&(e.attrs.type="text/css"),void 0===e.attrs.nonce){var o=function(){0;return n.nc}();o&&(e.attrs.nonce=o)}return y(t,e.attrs),m(e,t),t}function y(e,t){Object.keys(t).forEach((function(n){e.setAttribute(n,t[n])}))}function v(e,t){var n,o,r,i;if(t.transform&&e.css){if(!(i="function"==typeof t.transform?t.transform(e.css):t.transform.default(e.css)))return function(){};e.css=i}if(t.singleton){var l=u++;n=c||(c=x(t)),o=w.bind(null,n,l,!1),r=w.bind(null,n,l,!0)}else e.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=function(e){var t=document.createElement("link");return void 0===e.attrs.type&&(e.attrs.type="text/css"),e.attrs.rel="stylesheet",y(t,e.attrs),m(e,t),t}(t),o=C.bind(null,n,t),r=function(){b(n),n.href&&URL.revokeObjectURL(n.href)}):(n=x(t),o=k.bind(null,n),r=function(){b(n)});return o(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;o(e=t)}else r()}}e.exports=function(e,t){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");(t=t||{}).attrs="object"==typeof t.attrs?t.attrs:{},t.singleton||"boolean"==typeof t.singleton||(t.singleton=l()),t.insertInto||(t.insertInto="head"),t.insertAt||(t.insertAt="bottom");var n=h(e,t);return f(n,t),function(e){for(var o=[],r=0;r<n.length;r++){var l=n[r];(a=i[l.id]).refs--,o.push(a)}e&&f(h(e,t),t);for(r=0;r<o.length;r++){var a;if(0===(a=o[r]).refs){for(var s=0;s<a.parts.length;s++)a.parts[s]();delete i[a.id]}}}};var g,_=(g=[],function(e,t){return g[e]=t,g.filter(Boolean).join("\n")});function w(e,t,n,o){var r=n?"":o.css;if(e.styleSheet)e.styleSheet.cssText=_(t,r);else{var i=document.createTextNode(r),l=e.childNodes;l[t]&&e.removeChild(l[t]),l.length?e.insertBefore(i,l[t]):e.appendChild(i)}}function k(e,t){var n=t.css,o=t.media;if(o&&e.setAttribute("media",o),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}function C(e,t,n){var o=n.css,r=n.sourceMap,i=void 0===t.convertToAbsoluteUrls&&r;(t.convertToAbsoluteUrls||i)&&(o=d(o)),r&&(o+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */");var l=new Blob([o],{type:"text/css"}),a=e.href;e.href=URL.createObjectURL(l),a&&URL.revokeObjectURL(a)}},40:function(e){e.exports=JSON.parse('{"a":"xm-select","b":"1.1.8"}')},65:function(e,t,n){"use strict";var o=n(40);function r(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function i(e){return e.nodeType?e:document.querySelector(e)}function l(){for(var e=[],t=0;t<arguments.length;t++)e.push("".concat(t+1,". ").concat(arguments[t]));console.warn(e.join("\n"))}function a(e){return"[object Array]"==Object.prototype.toString.call(e)}function s(e){return"[object Function]"==Object.prototype.toString.call(e)}function c(e,t){var n;for(n in t)e[n]=e[n]&&"[object Object]"===e[n].toString()&&t[n]&&"[object Object]"===t[n].toString()?c(e[n],t[n]):e[n]=t[n];return e}function u(e,t,n){for(var o=n.value,i=r(t),l=function(n){var r=e[n];t.find((function(e){return e[o]==r[o]}))||i.push(r)},a=0;a<e.length;a++)l(a);return i}var p,d,f,h,m,b={},x=[],y=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;function v(e,t){for(var n in t)e[n]=t[n];return e}function g(e){var t=e.parentNode;t&&t.removeChild(e)}function _(e,t,n){var o,r,i,l,a=arguments;if(t=v({},t),arguments.length>3)for(n=[n],o=3;o<arguments.length;o++)n.push(a[o]);if(null!=n&&(t.children=n),null!=e&&null!=e.defaultProps)for(r in e.defaultProps)void 0===t[r]&&(t[r]=e.defaultProps[r]);return l=t.key,null!=(i=t.ref)&&delete t.ref,null!=l&&delete t.key,w(e,t,l,i)}function w(e,t,n,o){var r={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__d:null,__c:null,constructor:void 0};return p.vnode&&p.vnode(r),r}function k(e){return e.children}function C(e,t){this.props=e,this.context=t}function O(e,t){if(null==t)return e.__?O(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e)return n.__e;return"function"==typeof e.type?O(e):null}function S(e){var t,n;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e){e.__e=e.__c.base=n.__e;break}return S(e)}}function j(e){(!e.__d&&(e.__d=!0)&&1===d.push(e)||h!==p.debounceRendering)&&((h=p.debounceRendering)||f)(E)}function E(){var e,t,n,o,r,i,l;for(d.sort((function(e,t){return t.__v.__b-e.__v.__b}));e=d.pop();)e.__d&&(n=void 0,o=void 0,i=(r=(t=e).__v).__e,(l=t.__P)&&(n=[],o=M(l,r,v({},r),t.__n,void 0!==l.ownerSVGElement,null,n,null==i?O(r):i),T(n,r),o!=i&&S(r)))}function A(e,t,n,o,r,i,l,a,s){var c,u,p,d,f,h,m,y=n&&n.__k||x,v=y.length;if(a==b&&(a=null!=i?i[0]:v?O(n,0):null),c=0,t.__k=R(t.__k,(function(n){if(null!=n){if(n.__=t,n.__b=t.__b+1,null===(p=y[c])||p&&n.key==p.key&&n.type===p.type)y[c]=void 0;else for(u=0;u<v;u++){if((p=y[u])&&n.key==p.key&&n.type===p.type){y[u]=void 0;break}p=null}if(d=M(e,n,p=p||b,o,r,i,l,a,s),(u=n.ref)&&p.ref!=u&&(m||(m=[]),p.ref&&m.push(p.ref,null,n),m.push(u,n.__c||d,n)),null!=d){if(null==h&&(h=d),null!=n.__d)d=n.__d,n.__d=null;else if(i==p||d!=a||null==d.parentNode){e:if(null==a||a.parentNode!==e)e.appendChild(d);else{for(f=a,u=0;(f=f.nextSibling)&&u<v;u+=2)if(f==d)break e;e.insertBefore(d,a)}"option"==t.type&&(e.value="")}a=d.nextSibling,"function"==typeof t.type&&(t.__d=d)}}return c++,n})),t.__e=h,null!=i&&"function"!=typeof t.type)for(c=i.length;c--;)null!=i[c]&&g(i[c]);for(c=v;c--;)null!=y[c]&&V(y[c],y[c]);if(m)for(c=0;c<m.length;c++)L(m[c],m[++c],m[++c])}function R(e,t,n){if(null==n&&(n=[]),null==e||"boolean"==typeof e)t&&n.push(t(null));else if(Array.isArray(e))for(var o=0;o<e.length;o++)R(e[o],t,n);else n.push(t?t("string"==typeof e||"number"==typeof e?w(null,e,null,null):null!=e.__e||null!=e.__c?w(e.type,e.props,e.key,null):e):e);return n}function P(e,t,n){"-"===t[0]?e.setProperty(t,n):e[t]="number"==typeof n&&!1===y.test(t)?n+"px":null==n?"":n}function I(e,t,n,o,r){var i,l,a,s,c;if(r?"className"===t&&(t="class"):"class"===t&&(t="className"),"key"===t||"children"===t);else if("style"===t)if(i=e.style,"string"==typeof n)i.cssText=n;else{if("string"==typeof o&&(i.cssText="",o=null),o)for(l in o)n&&l in n||P(i,l,"");if(n)for(a in n)o&&n[a]===o[a]||P(i,a,n[a])}else"o"===t[0]&&"n"===t[1]?(s=t!==(t=t.replace(/Capture$/,"")),c=t.toLowerCase(),t=(c in e?c:t).slice(2),n?(o||e.addEventListener(t,D,s),(e.l||(e.l={}))[t]=n):e.removeEventListener(t,D,s)):"list"!==t&&"tagName"!==t&&"form"!==t&&!r&&t in e?e[t]=null==n?"":n:"function"!=typeof n&&"dangerouslySetInnerHTML"!==t&&(t!==(t=t.replace(/^xlink:?/,""))?null==n||!1===n?e.removeAttributeNS("http://www.w3.org/1999/xlink",t.toLowerCase()):e.setAttributeNS("http://www.w3.org/1999/xlink",t.toLowerCase(),n):null==n||!1===n?e.removeAttribute(t):e.setAttribute(t,n))}function D(e){this.l[e.type](p.event?p.event(e):e)}function M(e,t,n,o,r,i,l,a,s){var c,u,d,f,h,m,b,x,y,g,_=t.type;if(void 0!==t.constructor)return null;(c=p.__b)&&c(t);try{e:if("function"==typeof _){if(x=t.props,y=(c=_.contextType)&&o[c.__c],g=c?y?y.props.value:c.__:o,n.__c?b=(u=t.__c=n.__c).__=u.__E:("prototype"in _&&_.prototype.render?t.__c=u=new _(x,g):(t.__c=u=new C(x,g),u.constructor=_,u.render=F),y&&y.sub(u),u.props=x,u.state||(u.state={}),u.context=g,u.__n=o,d=u.__d=!0,u.__h=[]),null==u.__s&&(u.__s=u.state),null!=_.getDerivedStateFromProps&&(u.__s==u.state&&(u.__s=v({},u.__s)),v(u.__s,_.getDerivedStateFromProps(x,u.__s))),f=u.props,h=u.state,d)null==_.getDerivedStateFromProps&&null!=u.componentWillMount&&u.componentWillMount(),null!=u.componentDidMount&&u.__h.push(u.componentDidMount);else{if(null==_.getDerivedStateFromProps&&null==u.__e&&null!=u.componentWillReceiveProps&&u.componentWillReceiveProps(x,g),!u.__e&&null!=u.shouldComponentUpdate&&!1===u.shouldComponentUpdate(x,u.__s,g)){for(u.props=x,u.state=u.__s,u.__d=!1,u.__v=t,t.__e=n.__e,t.__k=n.__k,u.__h.length&&l.push(u),c=0;c<t.__k.length;c++)t.__k[c]&&(t.__k[c].__=t);break e}null!=u.componentWillUpdate&&u.componentWillUpdate(x,u.__s,g),null!=u.componentDidUpdate&&u.__h.push((function(){u.componentDidUpdate(f,h,m)}))}u.context=g,u.props=x,u.state=u.__s,(c=p.__r)&&c(t),u.__d=!1,u.__v=t,u.__P=e,c=u.render(u.props,u.state,u.context),t.__k=R(null!=c&&c.type==k&&null==c.key?c.props.children:c),null!=u.getChildContext&&(o=v(v({},o),u.getChildContext())),d||null==u.getSnapshotBeforeUpdate||(m=u.getSnapshotBeforeUpdate(f,h)),A(e,t,n,o,r,i,l,a,s),u.base=t.__e,u.__h.length&&l.push(u),b&&(u.__E=u.__=null),u.__e=null}else t.__e=z(n.__e,t,n,o,r,i,l,s);(c=p.diffed)&&c(t)}catch(e){p.__e(e,t,n)}return t.__e}function T(e,t){p.__c&&p.__c(t,e),e.some((function(t){try{e=t.__h,t.__h=[],e.some((function(e){e.call(t)}))}catch(e){p.__e(e,t.__v)}}))}function z(e,t,n,o,r,i,l,a){var s,c,u,p,d,f=n.props,h=t.props;if(r="svg"===t.type||r,null==e&&null!=i)for(s=0;s<i.length;s++)if(null!=(c=i[s])&&(null===t.type?3===c.nodeType:c.localName===t.type)){e=c,i[s]=null;break}if(null==e){if(null===t.type)return document.createTextNode(h);e=r?document.createElementNS("http://www.w3.org/2000/svg",t.type):document.createElement(t.type),i=null}if(null===t.type)null!=i&&(i[i.indexOf(e)]=null),f!==h&&(e.data=h);else if(t!==n){if(null!=i&&(i=x.slice.call(e.childNodes)),u=(f=n.props||b).dangerouslySetInnerHTML,p=h.dangerouslySetInnerHTML,!a){if(f===b)for(f={},d=0;d<e.attributes.length;d++)f[e.attributes[d].name]=e.attributes[d].value;(p||u)&&(p&&u&&p.__html==u.__html||(e.innerHTML=p&&p.__html||""))}(function(e,t,n,o,r){var i;for(i in n)i in t||I(e,i,null,n[i],o);for(i in t)r&&"function"!=typeof t[i]||"value"===i||"checked"===i||n[i]===t[i]||I(e,i,t[i],n[i],o)})(e,h,f,r,a),t.__k=t.props.children,p||A(e,t,n,o,"foreignObject"!==t.type&&r,i,l,b,a),a||("value"in h&&void 0!==h.value&&h.value!==e.value&&(e.value=null==h.value?"":h.value),"checked"in h&&void 0!==h.checked&&h.checked!==e.checked&&(e.checked=h.checked))}return e}function L(e,t,n){try{"function"==typeof e?e(t):e.current=t}catch(e){p.__e(e,n)}}function V(e,t,n){var o,r,i;if(p.unmount&&p.unmount(e),(o=e.ref)&&L(o,null,t),n||"function"==typeof e.type||(n=null!=(r=e.__e)),e.__e=e.__d=null,null!=(o=e.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(e){p.__e(e,t)}o.base=o.__P=null}if(o=e.__k)for(i=0;i<o.length;i++)o[i]&&V(o[i],t,n);null!=r&&g(r)}function F(e,t,n){return this.constructor(e,n)}function U(e,t,n){var o,r,i;p.__&&p.__(e,t),r=(o=n===m)?null:n&&n.__k||t.__k,e=_(k,null,[e]),i=[],M(t,(o?t:n||t).__k=e,r||b,b,void 0!==t.ownerSVGElement,n&&!o?[n]:r?null:x.slice.call(t.childNodes),i,n||b,o),T(i,e)}function B(e){return(B="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function N(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function H(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function K(e,t){return!t||"object"!==B(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function q(e){return(q=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function Y(e,t){return(Y=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}p={__e:function(e,t){for(var n;t=t.__;)if((n=t.__c)&&!n.__)try{if(n.constructor&&null!=n.constructor.getDerivedStateFromError)n.setState(n.constructor.getDerivedStateFromError(e));else{if(null==n.componentDidCatch)continue;n.componentDidCatch(e)}return j(n.__E=n)}catch(t){e=t}throw e}},C.prototype.setState=function(e,t){var n;n=this.__s!==this.state?this.__s:this.__s=v({},this.state),"function"==typeof e&&(e=e(n,this.props)),e&&v(n,e),null!=e&&this.__v&&(this.__e=!1,t&&this.__h.push(t),j(this))},C.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),j(this))},C.prototype.render=k,d=[],f="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,m=b;var Z=function(e){function t(e){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),K(this,q(t).call(this,e))}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Y(e,t)}(t,e),n=t,(o=[{key:"iconClick",value:function(e,t,n,o){this.props.ck(e,t,n,!0),o.stopPropagation()}},{key:"scrollFunc",value:function(e){if(0==e.wheelDeltaX){for(var t=this.labelRef.getElementsByClassName("xm-label-block"),n=10,o=0;o<t.length;o++)n+=t[o].getBoundingClientRect().width+5;var r=this.labelRef.getBoundingClientRect().width,i=n>r?n-r:r,l=this.labelRef.scrollLeft+e.deltaY;l<0&&(l=0),l>i&&(l=i),this.labelRef.scrollLeft=l}}},{key:"componentDidMount",value:function(){this.labelRef.addEventListener&&this.labelRef.addEventListener("DOMMouseScroll",this.scrollFunc.bind(this),!1),this.labelRef.attachEvent&&this.labelRef.attachEvent("onmousewheel",this.scrollFunc.bind(this)),this.labelRef.onmousewheel=this.scrollFunc.bind(this)}},{key:"render",value:function(e){var t=this,n=e.data,o=e.prop,r=e.theme,i=e.model,l=e.sels,a=e.autoRow,c=o.name,u=o.disabled,p=i.label,d=p.type,f=p[d],h="",m=!0,b=l.map((function(e){return e[c]})).join(",");if("text"===d)h=l.map((function(e){return"".concat(f.left).concat(e[c]).concat(f.right)})).join(f.separator);else if("block"===d){m=!1;var x=N(l),y={backgroundColor:r.color},v=f.showCount<=0?x.length:f.showCount;h=x.splice(0,v).map((function(e){var n={width:f.showIcon?"calc(100% - 20px)":"100%"};return _("div",{class:["xm-label-block",e[u]?"disabled":""].join(" "),style:y},f.template&&s(f.template)?_("span",{style:n,dangerouslySetInnerHTML:{__html:f.template(e,x)}}):_("span",{style:n},e[c]),f.showIcon&&_("i",{class:"xm-iconfont xm-icon-close",onClick:t.iconClick.bind(t,e,!0,e[u])}))})),x.length&&h.push(_("div",{class:"xm-label-block",style:y},"+ ",x.length))}else h=l.length&&f&&f.template?f.template(n,l):l.map((function(e){return e[c]})).join(",");return _("div",{class:["xm-label",a?"auto-row":"single-row"].join(" ")},_("div",{class:"scroll",ref:function(e){return t.labelRef=e}},m?_("div",{class:"label-content",dangerouslySetInnerHTML:{__html:h}}):_("div",{class:"label-content",title:b},h)))}}])&&H(n.prototype,o),r&&H(n,r),t}(C);function Q(e){return(Q="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function J(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function W(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function G(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function X(e,t){return!t||"object"!==Q(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function $(e){return($=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function ee(e,t){return(ee=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var te={},ne=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=X(this,$(t).call(this,e))).setState({filterValue:"",remote:!0,loading:!1,pageIndex:1,totalSize:0,val:te}),n.searchCid=0,n.inputOver=!0,n.__value="",n.tempData=[],n.size=0,n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ee(e,t)}(t,e),n=t,(o=[{key:"optionClick",value:function(e,t,n,o){this.props.ck(e,t,n),this.focus(),this.blockClick(o)}},{key:"groupClick",value:function(e,t){var n=this.props.prop,o=n.click,r=n.children,i=n.disabled,l=e[o],a=e[r].filter((function(e){return!e[i]}));"SELECT"===l?this.props.onReset(a,"append"):"CLEAR"===l?this.props.onReset(a,"delete"):"AUTO"===l?this.props.onReset(a,"auto"):s(l)&&l(e),this.focus(),this.blockClick(t)}},{key:"blockClick",value:function(e){e.stopPropagation()}},{key:"pagePrevClick",value:function(){arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.size;var e=this.state.pageIndex;e<=1||(this.changePageIndex(e-1),this.props.pageRemote&&this.postData(e-1,!0))}},{key:"pageNextClick",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.size,t=this.state.pageIndex;t>=e||(this.changePageIndex(t+1),this.props.pageRemote&&this.postData(t+1,!0))}},{key:"changePageIndex",value:function(e){this.setState({pageIndex:e})}},{key:"searchInput",value:function(e){var t=this,n=e.target.value;n!==this.__value&&(clearTimeout(this.searchCid),this.inputOver&&(this.__value=n,this.searchCid=setTimeout((function(){t.callback=!0,t.setState({filterValue:t.__value,remote:!0,pageIndex:1})}),this.props.delay)))}},{key:"focus",value:function(){this.searchInputRef&&this.searchInputRef.focus()}},{key:"blur",value:function(){this.searchInputRef&&this.searchInputRef.blur()}},{key:"handleComposition",value:function(e){var t=e.type;"compositionstart"===t?(this.inputOver=!1,clearTimeout(this.searchCid)):"compositionend"===t&&(this.inputOver=!0,this.searchInput(e))}},{key:"postData",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.pageIndex,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];(this.state.remote||n)&&(this.callback=!1,this.setState({loading:!0,remote:!1}),this.blur(),this.props.remoteMethod(this.state.filterValue,(function(t,n){e.focus(),e.callback=!0,e.setState({loading:!1,totalSize:n}),e.props.onReset(t,"data")}),this.props.show,t))}},{key:"keydown",value:function(e,t){var n=this,o=t.keyCode;"div"===e&&(27===o||9===o?this.props.onReset(!1,"close"):37===o?this.pagePrevClick():39===o&&this.pageNextClick());var r=this.props.prop,i=r.value,l=r.optgroup,a=r.disabled,s=this.tempData.filter((function(e){return!e[l]&&!e[a]})),c=s.length-1;if(-1!==c){var u=s.findIndex((function(e){return e[i]===n.state.val}));if(38===o){u<=0?u=c:u>0&&(u-=1);var p=s[u][i];this.setState({val:p})}else if(40===o){-1===u||u===c?u=0:u<c&&(u+=1);var d=s[u][i];this.setState({val:d})}else if(13===o&&this.state.val!=te){var f=s[u];this.optionClick(f,-1!=this.props.sels.findIndex((function(e){return e[i]===n.state.val})),f[a],t)}}}},{key:"componentWillReceiveProps",value:function(e){var t=this;this.props.show!=e.show&&(e.show?setTimeout((function(){e.filterable?t.focus():t.base.focus()}),0):(this.setState({filterValue:"",val:te}),this.__value="",this.searchInputRef&&(this.searchInputRef.value="")))}},{key:"render",value:function(e){var t,n=this,o=e.data,r=e.flatData,i=e.prop,l=e.template,a=e.theme,p=e.radio,d=e.sels,f=e.empty,h=e.filterable,m=e.filterMethod,b=e.remoteSearch,x=(e.remoteMethod,e.delay,e.searchTips),y=e.create,v=e.pageRemote,g=i.name,w=i.value,k=i.disabled,C=i.children,O=i.optgroup,S=c([],r);if(h)if(b)this.postData();else{S=S.filter((function(e,t){return e[O]?(delete e.__del,!0):m(n.state.filterValue,e,t,i)}));for(var j=0;j<S.length-1;j++){var E=S[j],A=S[j+1];E[O]&&A[O]&&(S[j].__del=!0)}S.length&&S[S.length-1][O]&&(S[S.length-1].__del=!0),S=S.filter((function(e){return!e.__del})),t=this.state.filterValue&&s(y)}v&&this.postData();var R=_("div",{class:h?"xm-search":"xm-search dis"},_("i",{class:"xm-iconfont xm-icon-sousuo"}),_("input",{class:"xm-input xm-search-input",placeholder:x})),P={};S.filter((function(e){return e[O]})).forEach((function(e){e[C].forEach((function(t){return P[t[w]]=e}))})),S=S.filter((function(e){return!e[O]}));var I="";if(e.paging){var D=v?this.state.totalSize:Math.floor((S.length-1)/e.pageSize)+1;D<=0&&(D=1);var M=this.state.pageIndex;if(M>D&&(M=D),D>0&&M<=0&&(M=1),!v){var T=(M-1)*e.pageSize,z=T+e.pageSize;S=S.slice(T,z)}var L={cursor:"no-drop",color:"#d2d2d2"},V={},F={};M<=1&&(V=L),M==D&&(F=L),this.state.pageIndex!==M&&this.changePageIndex(M),this.size=D,I=_("div",{class:"xm-paging"},_("span",{style:V,onClick:this.pagePrevClick.bind(this,D)},"上一页"),_("span",null,this.state.pageIndex," / ",D),_("span",{style:F,onClick:this.pageNextClick.bind(this,D)},"下一页"))}else e.showCount>0&&(S=S.slice(0,e.showCount));var U,B=[],N={__tmp:!0};N[O]=!0,S.forEach((function(e){var t=P[e[w]];U&&!t&&(t=N),t!=U&&(U=t,t&&B.push(U)),B.push(e)})),S=B,t&&(t=y(this.state.filterValue,c([],S)))&&S.splice(0,0,function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?J(Object(n),!0).forEach((function(t){W(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):J(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},t,{__node:{}}));var H=c([],S);this.tempData=H;var K=_("div",{class:"xm-toolbar"},e.toolbar.list.map((function(t){var o,r=e.languageProp.toolbar[t];o="ALL"===t?{icon:"xm-iconfont xm-icon-quanxuan",name:r,method:function(e){var t=i.optgroup,o=i.disabled,r=e.filter((function(e){return!e[t]})).filter((function(e){return!e[o]}));n.props.onReset(p?r.slice(0,1):u(r,d,i),"sels")}}:"CLEAR"===t?{icon:"xm-iconfont xm-icon-qingkong",name:r,method:function(e){n.props.onReset(d.filter((function(e){return e[i.disabled]})),"sels")}}:"REVERSE"===t?{icon:"xm-iconfont xm-icon-fanxuan",name:r,method:function(e){var t=i.optgroup,o=i.disabled,r=e.filter((function(e){return!e[t]})).filter((function(e){return!e[o]})),l=[];d.forEach((function(e){var t=r.findIndex((function(t){return t[w]===e[w]}));-1==t?l.push(e):r.splice(t,1)})),n.props.onReset(p?l.slice(0,1):u(r,l,i),"sels")}}:t;var l=function(e){"mouseenter"===e.type&&(e.target.style.color=a.color),"mouseleave"===e.type&&(e.target.style.color="")};return _("div",{class:"toolbar-tag",style:{},onClick:function(){s(o.method)&&o.method(H),n.focus()},onMouseEnter:l,onMouseLeave:l},e.toolbar.showIcon&&_("i",{class:o.icon}),_("span",null,o.name))})).filter((function(e){return e}))),q="hidden"!=e.model.icon;return(S=S.map((function(e){return e[O]?e.__tmp?_("div",{class:"item--divided"}):_("div",{class:"xm-group"},_("div",{class:"xm-group-item",onClick:n.groupClick.bind(n,e)},e[g])):function(e){var t=!!d.find((function(t){return t[w]==e[w]})),r=t?{color:a.color,border:"none"}:{borderColor:a.color},i={};e[w]===n.state.val&&(i.backgroundColor=a.hover),!q&&t&&(i.backgroundColor=a.color,e[k]&&(i.backgroundColor="#C2C2C2"));var s=["xm-option",e[k]?" disabled":"",t?" selected":"",q?"show-icon":"hide-icon"].join(" "),c=["xm-option-icon xm-iconfont",p?"xm-icon-danx":"xm-icon-duox"].join(" "),u=function(t){"mouseenter"===t.type&&(e[k]||n.setState({val:e[w]}))};return _("div",{class:s,style:i,value:e[w],onClick:n.optionClick.bind(n,e,t,e[k]),onMouseEnter:u,onMouseLeave:u},q&&_("i",{class:c,style:r}),_("div",{class:"xm-option-content",dangerouslySetInnerHTML:{__html:l({data:o,item:e,arr:d,name:e[g],value:e[w]})}}))}(e)}))).length||(!e.pageEmptyShow&&(I=""),S.push(_("div",{class:"xm-select-empty"},f))),_("div",{onClick:this.blockClick,tabindex:"1",style:"outline: none;"},_("div",null,e.toolbar.show&&K,R,_("div",{class:"scroll-body",style:{maxHeight:e.height}},S),e.paging&&I),this.state.loading&&_("div",{class:"loading"},_("span",{class:"loader"})))}},{key:"componentDidMount",value:function(){var e=this.base.querySelector(".xm-search-input");e&&(e.addEventListener("compositionstart",this.handleComposition.bind(this)),e.addEventListener("compositionupdate",this.handleComposition.bind(this)),e.addEventListener("compositionend",this.handleComposition.bind(this)),e.addEventListener("input",this.searchInput.bind(this)),this.searchInputRef=e),this.base.addEventListener("keydown",this.keydown.bind(this,"div"))}},{key:"componentDidUpdate",value:function(){if(this.callback){this.callback=!1;var e=this.props.filterDone;s(e)&&e(this.state.filterValue,this.tempData||[])}}}])&&G(n.prototype,o),r&&G(n,r),t}(C);function oe(e){return(oe="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function re(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function ie(e,t){return!t||"object"!==oe(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function le(e){return(le=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function ae(e,t){return(ae=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var se=function(e){function t(e){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),ie(this,le(t).call(this,e))}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ae(e,t)}(t,e),n=t,(o=[{key:"blockClick",value:function(e){e.stopPropagation()}},{key:"shouldComponentUpdate",value:function(){return!this.prepare}},{key:"render",value:function(e){return this.prepare=!0,_("div",{onClick:this.blockClick,class:"xm-body-custom"},_("div",{class:"scroll-body",style:{maxHeight:e.height}},_("div",{style:"margin: 5px 0",dangerouslySetInnerHTML:{__html:e.content}})))}}])&&re(n.prototype,o),r&&re(n,r),t}(C);function ce(e){return(ce="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function ue(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function pe(e,t){return!t||"object"!==ce(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function de(e){return(de=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function fe(e,t){return(fe=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var he={},me=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=pe(this,de(t).call(this,e))).state={expandedKeys:[],filterValue:"",remote:!0,loading:!1,val:he},n.searchCid=0,n.inputOver=!0,n.__value="",n.tempData=[],n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&fe(e,t)}(t,e),n=t,(o=[{key:"init",value:function(e){var t=e.tree,n=e.dataObj,o=e.flatData,r=e.prop,i=r.value,l=r.optgroup,a=[];!0===t.expandedKeys?a=o.filter((function(e){return!0===e[l]})).map((function(e){return e[i]})):t.expandedKeys.forEach((function(e){a.push(e);for(var t=n[e],o=function(){var e=t[i];-1===a.findIndex((function(t){return t===e}))&&a.push(e),t=t.__node.parent};t;)o()})),this.setState({expandedKeys:a})}},{key:"blockClick",value:function(e){e.stopPropagation()}},{key:"optionClick",value:function(e,t,n,o,r){var i=this;if("line"===o){if(!0===e.__node.loading)return;var l=this.props,a=l.tree,s=l.prop,c=l.sels;if(!a.lazy&&!e[s.optgroup])return void this.props.ck(e,t,n);var u=e[this.props.prop.value],p=this.state.expandedKeys,d=p.findIndex((function(e){return e===u}));-1===d?p.push(u):p.splice(d,1),this.setState({expandedKeys:p});var f=e[s.children];a.lazy&&f&&0===f.length&&!1!==e.__node.loading&&(e.__node.loading=!0,a.load(e,(function(t){e.__node.loading=!1,e[s.children]=i.handlerData(t,s.children),e[s.selected]=-1!=c.findIndex((function(t){return t[s.value]===e[s.value]})),i.props.onReset(c,"treeData")})))}else"checkbox"===o&&this.props.ck(e,t,n);this.blockClick(r)}},{key:"handlerData",value:function(e,t){var n=this;return e.map((function(e){return e.__node={},e[t]&&(e[t]=n.handlerData(e[t],t)),e}))}},{key:"searchInput",value:function(e){var t=this,n=e.target.value;n!==this.__value&&(clearTimeout(this.searchCid),this.inputOver&&(this.__value=n,this.searchCid=setTimeout((function(){t.callback=!0,t.setState({filterValue:t.__value,remote:!0})}),this.props.delay)))}},{key:"focus",value:function(){this.searchInputRef&&this.searchInputRef.focus()}},{key:"blur",value:function(){this.searchInputRef&&this.searchInputRef.blur()}},{key:"handleComposition",value:function(e){var t=e.type;"compositionstart"===t?(this.inputOver=!1,clearTimeout(this.searchCid)):"compositionend"===t&&(this.inputOver=!0,this.searchInput(e))}},{key:"filterData",value:function(e,t){var n=this,o=this.props,r=o.prop,i=o.filterMethod,l=o.tree,a=r.children,s=r.optgroup,c=(r.name,r.value);return e.forEach((function(e,o){if(e[s]){var u=n.filterData(e[a],t);if(e.__node.hidn=!!t&&0===u.filter((function(e){return!e.__node.hidn})).length,!e.__node.hidn){var p=n.state.expandedKeys;return void(t&&-1===p.findIndex((function(t){return t===e[c]}))&&(p.push(e[c]),n.setState({expandedKeys:p})))}if(l.strict)return}e.__node.hidn=!!t&&!i(t,e,o,r)})),e}},{key:"postData",value:function(){var e=this;this.state.remote&&(this.callback=!1,this.setState({loading:!0,remote:!1}),this.blur(),this.props.remoteMethod(this.state.filterValue,(function(t,n){e.focus(),e.callback=!0,e.setState({loading:!1,totalSize:n}),e.props.onReset(t,"data")}),this.props.show,1))}},{key:"componentWillReceiveProps",value:function(e){var t=this;this.props.show!=e.show&&(e.show?setTimeout((function(){return t.focus()}),0):(this.setState({filterValue:"",val:he}),this.__value="",this.searchInputRef&&(this.searchInputRef.value="")))}},{key:"componentWillMount",value:function(){this.init(this.props)}},{key:"render",value:function(e,t){var n=this,o=(t.expandedKeys,e.prop),r=e.empty,i=e.sels,l=e.theme,a=e.radio,p=e.template,d=e.data,f=e.tree,h=e.filterable,m=e.remoteSearch,b=e.searchTips,x=o.name,y=o.value,v=o.disabled,g=o.children,w=o.optgroup,k="hidden"!=e.model.icon,C=function(e,t,o){var r=!!i.find((function(t){return t[y]==e[y]})),s=e[v],c=!0===e.__node.half;f.strict&&(r=r||c||e.__node.selected,s=s||e.__node.disabled);var u=r?{color:l.color,border:"none"}:{borderColor:l.color},h={paddingLeft:t+"px"};e[y]===n.state.val&&(h.backgroundColor=l.hover),!k&&r&&(h.backgroundColor=l.color,s&&(h.backgroundColor="#C2C2C2"));var m=["xm-option",s?" disabled":"",r?" selected":"",k?"show-icon":"hide-icon"].join(" "),b=["xm-option-icon xm-iconfont",a?"xm-icon-danx":f.strict&&c?"xm-icon-banxuan":"xm-icon-duox"].join(" "),w=["xm-tree-icon",o?"expand":"",e[g]&&(e[g].length>0||f.lazy&&!1!==e.__node.loading)?"xm-visible":"xm-hidden"].join(" "),C=[];f.showFolderIcon&&(C.push(_("i",{class:w})),f.showLine&&(o&&C.push(_("i",{class:"left-line",style:{left:t-f.indent+3+"px"}})),C.push(_("i",{class:"top-line",style:{left:t-f.indent+3+"px",width:f.indent+(0===o?10:-2)+"px"}}))));var O=function(t){"mouseenter"===t.type&&(e[v]||n.setState({val:e[y]}))};return _("div",{class:m,style:h,value:e[y],onClick:n.optionClick.bind(n,e,r,e[v],"line"),onMouseEnter:O,onMouseLeave:O},C,e.__node.loading&&_("span",{class:"loader"}),k&&_("i",{class:b,style:u,onClick:n.optionClick.bind(n,e,r,e[v],"checkbox")}),_("div",{class:"xm-option-content",dangerouslySetInnerHTML:{__html:p({data:d,item:e,arr:i,name:e[x],value:e[y]})}}))};h&&(m?this.postData():this.filterData(d,this.state.filterValue));var O=c([],d),S=c([],i);this.tempData=O;var j=d.map((function(e){return function e(t,o){if(!t.__node.hidn){var r=t[g];if(o+=f.indent,r){var i=-1!==n.state.expandedKeys.findIndex((function(e){return t[y]===e}));return 0===r.length&&(i=!1),_("div",{class:"xm-tree"},f.showFolderIcon&&f.showLine&&i&&r.length>0&&_("i",{class:"left-line left-line-group",style:{left:o+3+"px"}}),C(t,o,0===r.length&&(!f.lazy||f.lazy&&!1===t.__node.loading)?0:i),i&&_("div",{class:"xm-tree-box"},r.map((function(t){return e(t,o)}))))}return C(t,o,0)}}(e,10-f.indent)})).filter((function(e){return e}));function E(e,t){t.forEach((function(t){return t[w]?(!f.strict&&e.push(t),E(e,t[g])):e.push(t)}))}var A=_("div",{class:"xm-toolbar"},e.toolbar.list.map((function(t){var r,c=e.languageProp.toolbar[t];r="ALL"===t?{icon:"xm-iconfont xm-icon-quanxuan",name:c,method:function(e){var t=[];E(t,e),t=t.filter((function(e){return!e[v]})),n.props.onReset(a?t.slice(0,1):u(t,i,o),"treeData")}}:"CLEAR"===t?{icon:"xm-iconfont xm-icon-qingkong",name:c,method:function(e){n.props.onReset(i.filter((function(e){return e[o.disabled]})),"treeData")}}:"REVERSE"===t?{icon:"xm-iconfont xm-icon-fanxuan",name:c,method:function(e){var t=[];E(t,e),t=t.filter((function(e){return!e[v]}));var r=[];i.forEach((function(e){var n=t.findIndex((function(t){return t[y]===e[y]}));-1==n?r.push(e):t.splice(n,1)})),n.props.onReset(a?r.slice(0,1):u(t,r,o),"treeData")}}:t;var p=function(e){"mouseenter"===e.type&&(e.target.style.color=l.color),"mouseleave"===e.type&&(e.target.style.color="")};return _("div",{class:"toolbar-tag",onClick:function(){s(r.method)&&r.method(O,S)},onMouseEnter:p,onMouseLeave:p},e.toolbar.showIcon&&_("i",{class:r.icon}),_("span",null,r.name))})).filter((function(e){return e}))),R=_("div",{class:h?"xm-search":"xm-search dis"},_("i",{class:"xm-iconfont xm-icon-sousuo"}),_("input",{class:"xm-input xm-search-input",placeholder:b}));return j.length||j.push(_("div",{class:"xm-select-empty"},r)),_("div",{onClick:this.blockClick,class:"xm-body-tree"},e.toolbar.show&&A,R,_("div",{class:"scroll-body",style:{maxHeight:e.height}},j),this.state.loading&&_("div",{class:"loading"},_("span",{class:"loader"})))}},{key:"componentDidMount",value:function(){var e=this.base.querySelector(".xm-search-input");e&&(e.addEventListener("compositionstart",this.handleComposition.bind(this)),e.addEventListener("compositionupdate",this.handleComposition.bind(this)),e.addEventListener("compositionend",this.handleComposition.bind(this)),e.addEventListener("input",this.searchInput.bind(this)),this.searchInputRef=e)}},{key:"componentDidUpdate",value:function(){if(this.callback){this.callback=!1;var e=this.props.filterDone;s(e)&&e(this.state.filterValue,this.tempData||[])}}}])&&ue(n.prototype,o),r&&ue(n,r),t}(C);function be(e){return(be="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function xe(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function ye(e,t){return!t||"object"!==be(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function ve(e){return(ve=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function ge(e,t){return(ge=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var _e=function(e){function t(e){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),(n=ye(this,ve(t).call(this,e))).state={expand:[]},n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ge(e,t)}(t,e),n=t,(o=[{key:"blockClick",value:function(e){e.stopPropagation()}},{key:"optionClick",value:function(e,t,n,o,r,i){if("line"===o){if(n)return;if(!0===e.__node.loading)return;var l=this.props,a=l.cascader,s=l.prop;if(l.sels,!a.lazy&&!e[s.optgroup])return void this.props.ck(e,t,n);var c=this.state.expand.slice(0,r+1);c[r]=e[this.props.prop.value],this.setState({expand:c})}else"checkbox"===o&&this.props.ck(e,t,n);this.blockClick(i)}},{key:"componentWillReceiveProps",value:function(e){}},{key:"componentWillMount",value:function(){}},{key:"render",value:function(e,t){var n=this,o=e.prop,r=e.empty,i=e.sels,l=e.theme,a=e.radio,s=e.template,c=e.data,u=e.cascader,p=o.name,d=o.value,f=o.disabled,h=o.children,m="hidden"!=e.model.icon,b=[],x=function e(t,o,r){var x=t[h];o=o+u.indent+6;var y=x&&n.state.expand[r]===t[d];return y&&b.push(_("div",{class:"xm-cascader-box",index:r%4,style:{left:o+"px",width:u.indent+"px"}},_("div",{class:"xm-cascader-scroll"},x.map((function(t){return e(t,o,r+1)}))))),function(e,t,o,r){var b=!!i.find((function(t){return t[d]==e[d]})),x=e[f],y=!0===e.__node.half;u.strict&&(b=b||y||e.__node.selected,x=x||e.__node.disabled);var v=b?{color:l.color,border:"none"}:{borderColor:l.color},g={backgroundColor:"transparent"},w=["xm-option",x?" disabled":"",b?" selected":"",m?"show-icon":"hide-icon"].join(" "),k=["xm-option-icon xm-iconfont",a?"xm-icon-danx":u.strict&&y?"xm-icon-banxuan":"xm-icon-duox"].join(" ");e[d]===n.state.val&&(g.backgroundColor=l.hover);var C={},O={};r&&(C.color=l.color,C.fontWeight=700,O.color=l.color);var S=function(t){"mouseenter"===t.type?e[f]||n.setState({val:e[d]}):"mouseleave"===t.type&&n.setState({val:""})};return _("div",{class:w,style:g,value:e[d],onClick:n.optionClick.bind(n,e,b,x,"line",o),onMouseEnter:S,onMouseLeave:S},m&&_("i",{class:k,style:v,onClick:n.optionClick.bind(n,e,b,x,"checkbox",o)}),_("div",{class:"xm-option-content",style:C,dangerouslySetInnerHTML:{__html:s({data:c,item:e,arr:i,name:e[p],value:e[d]})}}),e[h]&&_("div",{class:"xm-right-arrow",style:O}))}(t,0,r,y)},y=c.map((function(e){return x(e,2,0)})).concat(b).filter((function(e){return e}));return y.length||y.push(_("div",{class:"xm-select-empty"},r)),_("div",{onClick:this.blockClick,class:"xm-body-cascader",style:{width:u.indent+"px",height:e.height}},y)}},{key:"componentDidMount",value:function(){this.props.onReset("cascader","class")}},{key:"componentDidUpdate",value:function(){}}])&&xe(n.prototype,o),r&&xe(n,r),t}(C);function we(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function ke(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function Ce(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?ke(Object(n),!0).forEach((function(t){Oe(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ke(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Oe(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Se(e){return(Se="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function je(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function Ee(e){return(Ee=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function Ae(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function Re(e,t){return(Re=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var Pe=function(e){function t(e){var n,o,r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),o=this,n=!(r=Ee(t).call(this,e))||"object"!==Se(r)&&"function"!=typeof r?Ae(o):r,He[e.el]=Ae(n),n.state=n.initState(),n.bodyView=null,n}var n,o,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Re(e,t)}(t,e),n=t,(o=[{key:"initState",value:function(){return{data:[],dataObj:{},flatData:[],sels:[],show:!1,tmpColor:"",bodyClass:""}}},{key:"init",value:function(e,t){var n,o=e.data,r=e.prop,i=e.initValue,l=e.radio;if(t){var a={},s=[];this.load(o,a,s),n=this.exchangeValue(i||Object.keys(a).filter((function(e){return!0===a[e][r.selected]})),a),l&&n.length>1&&(n=n.slice(0,1)),this.setState({sels:n,dataObj:a,flatData:s})}return this.setState({data:o}),n}},{key:"exchangeValue",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.state.dataObj,o=e.map((function(e){return"object"===Se(e)?Ce({},e,{__node:{}}):n[e]})).filter((function(e){return e})),r=!0,i=this.props.tree;return i.show&&!1===i.strict&&(r=!1),r&&(o=o.filter((function(e){return!0!==e[t.props.prop.optgroup]}))),o}},{key:"value",value:function(e,t,n){!1!==t&&!0!==t&&(t=this.state.show);var o=this.props,r=o.prop,i=o.tree,l=this.exchangeValue(e);if(i.show&&i.strict){var a=this.state.data;this.clearAndReset(a,l),l=this.init({data:a,prop:r},!0)}this.resetSelectValue(l,l,!0,n),this.setState({show:t})}},{key:"clearAndReset",value:function(e,t){var n=this,o=this.props.prop,r=o.selected,i=o.children,l=o.value;e.forEach((function(e){e[r]=-1!=t.findIndex((function(t){return t[l]===e[l]}));var o=e[i];o&&a(o)&&n.clearAndReset(o,t)}))}},{key:"load",value:function(e,t,n,o){var r=this,i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,l=this.props,s=l.prop,c=l.tree,u=s.children,p=s.optgroup,d=s.value,f=s.selected,h=s.disabled;e.forEach((function(e){e.__node={parent:o,level:i,loading:e.__node&&e.__node.loading},t[e[d]]=e,n.push(e);var l=e[u];if(l&&a(l)){var s=l.length;if(s>0){r.load(l,t,n,e,i+1),e[p]=!0,c.strict&&(!0===e[f]&&(delete e[f],l.forEach((function(e){return e[f]=!0}))),!0===e[h]&&(delete e[h],l.forEach((function(e){return e[h]=!0}))));var m=l.filter((function(e){return!0===e[f]||!0===e.__node.selected})).length;e.__node.selected=m===s,e.__node.half=m>0&&m<s||l.filter((function(e){return!0===e.__node.half})).length>0,e.__node.disabled=l.filter((function(e){return!0===e[h]||!0===e.__node.disabled})).length===s}}}))}},{key:"resetSelectValue",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2?arguments[2]:void 0,o=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=this.props.on;if(s(r)&&this.prepare&&o){var i=r({arr:e,change:t,isAdd:n});if(a(i))return this.value(i,null,!1)}this.setState({sels:e})}},{key:"updateBorderColor",value:function(e){this.setState({tmpColor:e})}},{key:"treeHandler",value:function(e,t,n,o){var r=this,i=this.props.prop,l=i.value,a=(i.selected,i.disabled),s=i.children,c=i.optgroup,u=t[s];u.filter((function(e){return!(e[a]||e.__node.disabled)})).forEach((function(t){if(t[c])r.treeHandler(e,t,n,o);else{var i=e.findIndex((function(e){return e[l]==t[l]}));"del"===o?-1!=i&&(e.splice(i,1),n.push(t)):"half"!==o&&"add"!==o||-1==i&&(e.push(t),n.push(t))}}));var p=u.length,d=u.filter((function(t){return-1!==e.findIndex((function(e){return e[l]===t[l]}))||!0===t.__node.selected})).length;t.__node.selected=d===p,t.__node.half=d>0&&d<p}},{key:"itemClick",value:function(e,t,n,o){var r=this.props,i=r.theme,l=r.prop,a=r.radio,c=r.repeat,u=r.clickClose,p=r.max,d=r.maxMethod,f=r.tree,h=this.state.sels,m=l.value,b=(l.selected,l.disabled,l.children),x=l.optgroup;if(!n){if(e[x]&&f.strict){e[b];var y=[],v=!0;e.__node.selected?(this.treeHandler(h,e,y,"del"),v=!1):e.__node.half?(this.treeHandler(h,e,y,"half"),0===y.length&&(this.treeHandler(h,e,y,"del"),v=!1)):this.treeHandler(h,e,y,"add"),this.resetSelectValue(h,y,v),this.setState({data:this.state.data})}else if(!t||c&&!o){var g=(w=p,w-=0,isNaN(w)&&(w=0),w);if(g>0&&h.length>=g)return this.updateBorderColor(i.maxColor),void(d&&s(d)&&d(h,e));h=a?[e]:[].concat(we(h),[e]),this.resetSelectValue(h,[e],!t)}else{var _=h.findIndex((function(t){return t[m]==e[m]}));-1!=_&&(h.splice(_,1),this.resetSelectValue(h,[e],!t))}var w,k=e.__node.parent;if(k){for(;k;){var C=k[b],O=C.length,S=C.filter((function(e){return-1!==h.findIndex((function(t){return t[m]===e[m]}))||!0===e.__node.selected})).length;k.__node.selected=S===O,k.__node.half=S>0&&S<O||C.filter((function(e){return!0===e.__node.half})).length>0,k=k.__node.parent}this.setState({data:this.state.data})}u&&!o&&this.onClick()}}},{key:"onClick",value:function(e){var t=this;if("relative"!==this.props.model.type)if(this.props.disabled)!1!==this.state.show&&this.setState({show:!1});else{var n=!this.state.show;if(n){if(this.props.show&&0==this.props.show())return;Object.keys(Be).filter((function(e){return e!=t.props.el})).forEach((function(e){return Be[e].closed()}))}else{if(this.props.hide&&0==this.props.hide())return;this.bodyView.scroll&&this.bodyView.scroll(0,0)}this.setState({show:n}),e&&e.stopPropagation()}}},{key:"onReset",value:function(e,t){var n=this;if("data"===t){var o=e.filter((function(e){return!0===e[n.props.prop.selected]}));this.resetSelectValue(u(o,this.state.sels,this.props.prop),o,!0);var r=[];this.load(e,{},r),this.setState({data:e,flatData:r})}else"sels"===t?this.resetSelectValue(e,e,!0):"append"===t?this.append(e):"delete"===t?this.del(e):"auto"===t?this.auto(e):"treeData"===t?this.value(e,null,!0):"close"===t?this.onClick():"class"===t&&this.setState({bodyClass:e})}},{key:"append",value:function(e){var t=this.exchangeValue(e);this.resetSelectValue(u(t,this.state.sels,this.props.prop),t,!0)}},{key:"del",value:function(e){var t=this.props.prop.value,n=this.state.sels;(e=this.exchangeValue(e)).forEach((function(e){var o=n.findIndex((function(n){return n[t]===e[t]}));-1!=o&&n.splice(o,1)})),this.resetSelectValue(n,e,!1)}},{key:"auto",value:function(e){var t=this,n=this.props.prop.value;e.filter((function(e){return-1!=t.state.sels.findIndex((function(t){return t[n]===e[n]}))})).length==e.length?this.del(e):this.append(e)}},{key:"componentWillReceiveProps",value:function(e){this.init(e,e.updateData)}},{key:"componentWillMount",value:function(){this.init(this.props,!0)}},{key:"render",value:function(e,t){var n=this,o=e.theme,r=e.prop,i=(e.radio,e.repeat,e.clickClose,e.on,e.max,e.maxMethod,e.content),l=e.disabled,a=e.tree,s={borderColor:o.color},c=t.data,u=t.dataObj,p=t.flatData,d=t.sels,f=t.show,h=t.tmpColor,m=t.bodyClass;l&&(f=!1);var b={style:Ce({},e.style,{},f?s:{}),onClick:this.onClick.bind(this),ua:-1!=navigator.userAgent.indexOf("Mac OS")?"mac":"win",size:e.size,tabindex:1};h&&(b.style.borderColor=h,setTimeout((function(){b.style.borderColor="",n.updateBorderColor("")}),300)),r.value;var x=Ce({},e,{data:c,sels:d,ck:this.itemClick.bind(this),title:d.map((function(e){return e[r.name]})).join(",")}),y=Ce({},e,{data:c,dataObj:u,flatData:p,sels:d,ck:this.itemClick.bind(this),show:f,onReset:this.onReset.bind(this)}),v=i?_(se,y):a.show?_(me,y):e.cascader.show?_(_e,y):_(ne,y);return _("xm-select",b,_("input",{class:"xm-select-default","lay-verify":e.layVerify,"lay-verType":e.layVerType,name:e.name,value:d.map((function(e){return e[r.value]})).join(",")}),_("i",{class:f?"xm-icon xm-icon-expand":"xm-icon"}),0===d.length&&_("div",{class:"xm-tips"},e.tips),_(Z,x),_("div",{class:["xm-body",m,e.model.type,f?"":"dis"].join(" "),ref:function(e){return n.bodyView=e}},v),l&&_("div",{class:"xm-select-disabled"}))}},{key:"componentDidMount",value:function(){var e=this;this.prepare=!0,this.base.addEventListener("keydown",(function(t){13===t.keyCode&&e.onClick()})),this.input=this.base.querySelector(".xm-select-default");var t=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;t&&new t((function(t){t.forEach((function(t){"attributes"==t.type&&"class"===t.attributeName&&-1!==e.input.className.indexOf("layui-form-danger")&&(e.input.className="xm-select-default",e.base.style.borderColor=e.props.theme.maxColor)}))})).observe(this.input,{attributes:!0});for(var n=this.base;n;){if("FORM"===n.tagName){var o=n.querySelector('button[type="reset"]');o&&o.addEventListener("click",(function(t){e.init(e.props,!0)}));break}n=n.parentElement}}},{key:"componentDidUpdate",value:function(){var e=this.props,t=e.direction;if("relative"!==e.model.type){var n=this.base.getBoundingClientRect();if("auto"===t){this.bodyView.style.display="block",this.bodyView.style.visibility="hidden";var o=this.bodyView.getBoundingClientRect().height;this.bodyView.style.display="",this.bodyView.style.visibility="";var r=n.y||n.top||0,i=document.documentElement.clientHeight-r-n.height-20;t=i>o||r<i?"down":"up"}"down"==t?(this.bodyView.style.top=n.height+4+"px",this.bodyView.style.bottom="auto"):(this.bodyView.style.top="auto",this.bodyView.style.bottom=n.height+4+"px")}}}])&&je(n.prototype,o),r&&je(n,r),t}(C),Ie={tips:"请选择",empty:"暂无数据",searchTips:"请选择",toolbar:{ALL:"全选",CLEAR:"清空",REVERSE:"反选",SEARCH:"搜索"}},De={zn:Ie,en:{tips:"please selected",empty:"no data",searchTips:"please search",toolbar:{ALL:"select all",CLEAR:"clear",REVERSE:"invert select",SEARCH:"search"}}};function Me(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function Te(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function ze(){return(ze=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e}).apply(this,arguments)}function Le(e){return(Le="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function Ve(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var Fe=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.init(t)}var t,n,o;return t=e,(n=[{key:"init",value:function(e){this.options=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"zn",t=De[e]||Ie;return{language:e,languageProp:t,data:[],content:"",name:"select",layVerify:"",layVerType:"",size:"medium",disabled:!1,initValue:null,create:null,tips:t.tips,empty:t.empty,delay:500,searchTips:t.searchTips,filterable:!1,filterMethod:function(e,t,n,o){return!e||-1!=t[o.name].indexOf(e)},remoteSearch:!1,remoteMethod:function(e,t){t([])},direction:"auto",style:{},height:"200px",autoRow:!1,paging:!1,pageSize:10,pageEmptyShow:!0,pageRemote:!1,radio:!1,repeat:!1,clickClose:!1,max:0,maxMethod:function(e,t){},showCount:0,toolbar:{show:!1,showIcon:!0,list:["ALL","CLEAR"]},tree:{show:!1,showFolderIcon:!0,showLine:!0,indent:20,expandedKeys:[],strict:!0,lazy:!1,load:null},cascader:{show:!1,indent:100,strict:!0},prop:{name:"name",value:"value",selected:"selected",disabled:"disabled",children:"children",optgroup:"optgroup",click:"click"},theme:{color:"#009688",maxColor:"#e54d42",hover:"#f2f2f2"},model:{label:{type:"block",text:{left:"",right:"",separator:", "},block:{showCount:0,showIcon:!0,template:null},count:{template:function(e,t){return"已选中 ".concat(t.length," 项, 共 ").concat(e.length," 项")}}},icon:"show",type:"absolute"},show:function(){},hide:function(){},template:function(e){e.item,e.sels;var t=e.name;return e.value,t},on:function(e){e.arr,e.item,e.selected}}}(e.language),this.update(e)}},{key:"update",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=!!e.data;this.options=c(this.options,e);var n=this.options.dom;if(n){var o=this.options.data||[];if("function"==typeof o&&(o=o(),this.options.data=o),a(o))return U(_(Pe,ze({},this.options,{updateData:t})),n),this;l("data数据必须为数组类型, 不能是".concat("undefined"==typeof data?"undefined":Le(data),"类型"))}else l("没有找到渲染对象: ".concat(e.el,", 请检查"))}},{key:"reset",value:function(){var e=this.options.el;return this.init(Ne[e]),He[e].init(this.options,!0),this}},{key:"opened",value:function(){var e=He[this.options.el];return!e.state.show&&e.onClick(),this}},{key:"closed",value:function(){var e=He[this.options.el];return e.state.show&&e.onClick(),this}},{key:"getValue",value:function(e){var t=this,n=He[this.options.el].state.sels.map((function(e){return delete(e=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Me(Object(n),!0).forEach((function(t){Te(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Me(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},e)).__node,e}));return"name"===e?n.map((function(e){return e[t.options.prop.name]})):"nameStr"===e?n.map((function(e){return e[t.options.prop.name]})).join(","):"value"===e?n.map((function(e){return e[t.options.prop.value]})):"valueStr"===e?n.map((function(e){return e[t.options.prop.value]})).join(","):n}},{key:"setValue",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(a(e))return He[this.options.el].value(this.options.radio?e.slice(0,1):e,t,n),this;l("请传入数组结构...")}},{key:"append",value:function(e){if(a(e))return He[this.options.el].append(e),this;l("请传入数组结构...")}},{key:"delete",value:function(e){if(a(e))return He[this.options.el].del(e),this;l("请传入数组结构...")}},{key:"warning",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=e||this.options.theme.maxColor;return!0===t?He[this.options.el].base.style.borderColor=n:He[this.options.el].updateBorderColor(n),this}}])&&Ve(t.prototype,n),o&&Ve(t,o),e}();function Ue(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}n.d(t,"b",(function(){return Be})),n.d(t,"d",(function(){return Ne})),n.d(t,"a",(function(){return He}));var Be={},Ne={},He={};t.c={name:o.a,version:o.b,render:function(e){var t=e.el;if(e.dom=i(t),t.nodeType){var n="DOM_RENDER_"+Date.now()+"_"+Math.random();t.setAttribute(o.a,n),t="[".concat(o.a,"='").concat(n,"']"),e.el=t}Ne[t]=e;var r=new Fe(e);return r&&(Be[t]=r),r},get:function(e,t){var n;switch(Object.prototype.toString.call(e)){case"[object String]":e&&(n=function(t){return t===e});break;case"[object RegExp]":n=function(t){return e.test(t)};break;case"[object Function]":n=e}var o=Object.keys(Be),r=(n?o.filter(n):o).map((function(e){return Be[e]})).filter((function(e){return i(e.options.el)}));return t?r[0]:r},batch:function(e,t){var n=Array.prototype.slice.call(arguments);return n.splice(0,2),this.get(e).map((function(e){return e[t].apply(e,Ue(n))}))}}}});
/** 右键菜单模块 date:2019-02-08   License By http://easyweb.vip */
layui.define(["jquery"], function (exports) {
    var $ = layui.jquery;

    var contextMenu = {
        // 绑定元素
        bind: function (elem, items) {
            $(elem).bind('contextmenu', function (e) {
                contextMenu.show(items, e.clientX, e.clientY, e);
                return false;
            });
        },
        // 在指定坐标显示菜单
        show: function (items, x, y, e) {
            var xy = 'left: ' + x + 'px; top: ' + y + 'px;';
            var htmlStr = '<div class="ctxMenu" style="' + xy + '">';
            htmlStr += contextMenu.getHtml(items, '');
            htmlStr += '   </div>';
            contextMenu.remove();
            $('body').append(htmlStr);
            // 调整溢出位置
            var $ctxMenu = $('.ctxMenu');
            if (x + $ctxMenu.outerWidth() > contextMenu.getPageWidth()) {
                x -= $ctxMenu.outerWidth();
            }
            if (y + $ctxMenu.outerHeight() > contextMenu.getPageHeight()) {
                y = y - $ctxMenu.outerHeight();
                if (y < 0) {
                    y = 0;
                }
            }
            $ctxMenu.css({'top': y, 'left': x});
            // 添加item点击事件
            contextMenu.setEvents(items, e);
            // 显示子菜单事件
            $('.ctxMenu-item').on('mouseenter', function (e) {
                e.stopPropagation();
                $(this).parent().find('.ctxMenu-sub').css('display', 'none');
                if (!$(this).hasClass('haveMore')) return;
                var $item = $(this).find('>a');
                var $sub = $(this).find('>.ctxMenu-sub');
                var top = $item.offset().top - $('body,html').scrollTop();
                var left = $item.offset().left + $item.outerWidth() - $('body,html').scrollLeft();
                if (left + $sub.outerWidth() > contextMenu.getPageWidth()) {
                    left = $item.offset().left - $sub.outerWidth();
                }
                if (top + $sub.outerHeight() > contextMenu.getPageHeight()) {
                    top = top - $sub.outerHeight() + $item.outerHeight();
                    if (top < 0) {
                        top = 0;
                    }
                }
                $(this).find('>.ctxMenu-sub').css({
                    'top': top,
                    'left': left,
                    'display': 'block'
                });
            })/*.on('mouseleave', function () {
                $(this).find('>.ctxMenu-sub').css('display', 'none');
            })*/;
        },
        // 移除所有
        remove: function () {
            var ifs = parent.window.frames;
            for (var i = 0; i < ifs.length; i++) {
                var tif = ifs[i];
                try {
                    tif.layui.jquery('body>.ctxMenu').remove();
                } catch (e) {
                }
            }
            try {
                parent.layui.jquery('body>.ctxMenu').remove();
            } catch (e) {
            }
        },
        // 设置事件监听
        setEvents: function (items, event) {
            $('.ctxMenu').off('click').on('click', '[lay-id]', function (e) {
                var itemId = $(this).attr('lay-id');
                var item = getItemById(itemId, items);
                item.click && item.click(e, event);
            });

            function getItemById(id, list) {
                for (var i = 0; i < list.length; i++) {
                    var one = list[i];
                    if (id == one.itemId) {
                        return one;
                    } else if (one.subs && one.subs.length > 0) {
                        var temp = getItemById(id, one.subs);
                        if (temp) {
                            return temp;
                        }
                    }
                }
            }
        },
        // 构建无限级
        getHtml: function (items, pid) {
            var htmlStr = '';
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item.itemId = 'ctxMenu-' + pid + i;
                if (item.subs && item.subs.length > 0) {
                    htmlStr += '<div class="ctxMenu-item haveMore" lay-id="' + item.itemId + '">';
                    htmlStr += '<a>';
                    if (item.icon) {
                        htmlStr += '<i class="' + item.icon + ' ctx-icon"></i>';
                    }
                    htmlStr += item.name;
                    htmlStr += '<i class="layui-icon layui-icon-right icon-more"></i>';
                    htmlStr += '</a>';
                    htmlStr += '<div class="ctxMenu-sub" style="display: none;">';
                    htmlStr += contextMenu.getHtml(item.subs, pid + i);
                    htmlStr += '</div>';
                } else {
                    htmlStr += '<div class="ctxMenu-item" lay-id="' + item.itemId + '">';
                    htmlStr += '<a>';
                    if (item.icon) {
                        htmlStr += '<i class="' + item.icon + ' ctx-icon"></i>';
                    }
                    htmlStr += item.name;
                    htmlStr += '</a>';
                }
                htmlStr += '</div>';
                if (item.hr == true) {
                    htmlStr += '<hr/>';
                }
            }
            return htmlStr;
        },
        // 获取css代码
        getCommonCss: function () {
            var cssStr = '.ctxMenu, .ctxMenu-sub {';
            cssStr += '        max-width: 250px;';
            cssStr += '        min-width: 110px;';
            cssStr += '        background: white;';
            cssStr += '        border-radius: 2px;';
            cssStr += '        padding: 5px 0;';
            cssStr += '        white-space: nowrap;';
            cssStr += '        position: fixed;';
            cssStr += '        z-index: 2147483647;';
            cssStr += '        box-shadow: 0 2px 4px rgba(0, 0, 0, .12);';
            cssStr += '        border: 1px solid #d2d2d2;';
            cssStr += '        overflow: visible;';
            cssStr += '   }';

            cssStr += '   .ctxMenu-item {';
            cssStr += '        position: relative;';
            cssStr += '   }';

            cssStr += '   .ctxMenu-item > a {';
            cssStr += '        font-size: 14px;';
            cssStr += '        color: #666;';
            cssStr += '        padding: 0 26px 0 35px;';
            cssStr += '        cursor: pointer;';
            cssStr += '        display: block;';
            cssStr += '        line-height: 36px;';
            cssStr += '        text-decoration: none;';
            cssStr += '        position: relative;';
            cssStr += '   }';

            cssStr += '   .ctxMenu-item > a:hover {';
            cssStr += '        background: #f2f2f2;';
            cssStr += '        color: #666;';
            cssStr += '   }';

            cssStr += '   .ctxMenu-item > a > .icon-more {';
            cssStr += '        position: absolute;';
            cssStr += '        right: 5px;';
            cssStr += '        top: 0;';
            cssStr += '        font-size: 12px;';
            cssStr += '        color: #666;';
            cssStr += '   }';

            cssStr += '   .ctxMenu-item > a > .ctx-icon {';
            cssStr += '        position: absolute;';
            cssStr += '        left: 12px;';
            cssStr += '        top: 0;';
            cssStr += '        font-size: 15px;';
            cssStr += '        color: #666;';
            cssStr += '   }';

            cssStr += '   .ctxMenu hr {';
            cssStr += '        background-color: #e6e6e6;';
            cssStr += '        clear: both;';
            cssStr += '        margin: 5px 0;';
            cssStr += '        border: 0;';
            cssStr += '        height: 1px;';
            cssStr += '   }';

            cssStr += '   .ctx-ic-lg {';
            cssStr += '        font-size: 18px !important;';
            cssStr += '        left: 11px !important;';
            cssStr += '    }';
            return cssStr;
        },
        // 获取浏览器高度
        getPageHeight: function () {
            return document.documentElement.clientHeight || document.body.clientHeight;
        },
        // 获取浏览器宽度
        getPageWidth: function () {
            return document.documentElement.clientWidth || document.body.clientWidth;
        },
    };

    // 点击任意位置关闭菜单
    $(document).off('click.ctxMenu').on('click.ctxMenu', function () {
        contextMenu.remove();
    });

    // 点击有子菜单的节点不关闭菜单
    $(document).off('click.ctxMenuMore').on('click.ctxMenuMore', '.ctxMenu-item', function (e) {
        if ($(this).hasClass('haveMore')) {
            if (e !== void 0) {
                e.preventDefault();
                e.stopPropagation();
            }
        } else {
            contextMenu.remove();
        }
    });

    $('head').append('<style id="ew-css-ctx">' + contextMenu.getCommonCss() + '</style>');
    exports("contextMenu", contextMenu);
});
layui.define([], function (exports) {
    var PLUGIN_NAME = 'iziToast';  // 样式类名
    var BODY = document.querySelector('body');
    var ISMOBILE = (/Mobi/.test(navigator.userAgent)) ? true : false;
    var MOBILEWIDTH = 568;
    var ISCHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var ISFIREFOX = typeof InstallTrigger !== 'undefined';
    var ACCEPTSTOUCH = 'ontouchstart' in document.documentElement;
    // 显示区域
    var POSITIONS = ['bottomRight', 'bottomLeft', 'bottomCenter', 'topRight', 'topLeft', 'topCenter', 'center'];
    // 默认主题
    var THEMES = {
        info: {
            color: 'blue',
            icon: 'ico-info'
        },
        success: {
            color: 'green',
            icon: 'ico-success'
        },
        warning: {
            color: 'orange',
            icon: 'ico-warning'
        },
        error: {
            color: 'red',
            icon: 'ico-error'
        },
        question: {
            color: 'yellow',
            icon: 'ico-question'
        }
    };
    var CONFIG = {};  // 全局配置
    // 默认配置
    var defaults = {
        id: null,
        className: '',  // 自定义class，用空格分割
        title: '',  // 标题
        titleColor: '',  // 标题文字颜色
        titleSize: '',  // 标题文字大小
        titleLineHeight: '',  // 标题高度
        message: '',  // 内容
        messageColor: '',  // 内容文字颜色
        messageSize: '',  // 内容文字大小
        messageLineHeight: '',  // 内容高度
        backgroundColor: '',  // 背景颜色
        theme: 'light', // dark
        color: '', // 背景颜色
        icon: '',  // 图标
        iconText: '',  // 图标文字
        iconColor: '',  // 图标颜色
        iconUrl: null,  // 图标地址
        image: '',  // 是否显示图片
        imageWidth: 60,  // 图片宽度
        maxWidth: null,  // 最大宽度
        zindex: null,  //
        layout: 2,  // 布局类型
        balloon: false,  // 气泡
        close: true,  // 是否显示关闭按钮
        closeOnEscape: false,
        closeOnClick: false,  // 点击关闭
        displayMode: 0,  // 0无限制,1存在就不发出,2销毁之前
        position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
        target: '',  // 显示位置
        targetFirst: null,  // 插入顺序
        timeout: 2200,  // 关闭时间，false不自动关闭
        rtl: false,  // 内容居右
        animateInside: false,  // 进入动画效果
        drag: true,  // 是否可滑动移除
        pauseOnHover: true,  // 鼠标移入暂停进度条时间
        resetOnHover: false,  // 鼠标移入重置进度条时间
        progressBar: true,  // 是否显示进度条
        progressBarColor: '',  // 进度条颜色
        progressBarEasing: 'linear',  // 进度条动画效果
        overlay: false,  // 是否显示遮罩层
        overlayClose: false,  // 点击遮罩层是否关闭
        overlayColor: 'rgba(0, 0, 0, 0.1)',  // 遮罩层颜色
        transitionIn: 'fadeInLeft', // bounceInLeft, bounceInRight, bounceInUp, bounceInDown, fadeIn, fadeInDown, fadeInUp, fadeInLeft, fadeInRight, flipInX
        transitionOut: 'fadeOutRight', // fadeOut, fadeOutUp, fadeOutDown, fadeOutLeft, fadeOutRight, flipOutX
        transitionInMobile: 'bounceInDown',  // 移动端进入动画
        transitionOutMobile: 'fadeOutUp',  // 移动端退出动画
        buttons: {},  // 操作按钮
        inputs: {},  // 输入框
        audio: '',  // 音效
        onOpening: function () {
        },
        onOpened: function () {
        },
        onClosing: function () {
        },
        onClosed: function () {
        }
    };

    var $iziToast = {
        children: {},
        setSetting: function (ref, option, value) {
            $iziToast.children[ref][option] = value;
        },
        getSetting: function (ref, option) {
            return $iziToast.children[ref][option];
        },
        // 全局设置
        settings: function (options) {
            $iziToast.destroy();  // 全部销毁之前的通知
            CONFIG = options;
            defaults = extend(defaults, options || {});
        },
        // 关闭所有通知
        destroy: function () {
            forEach(document.querySelectorAll('.' + PLUGIN_NAME + '-overlay'), function (element, index) {
                element.remove();
            });
            forEach(document.querySelectorAll('.' + PLUGIN_NAME + '-wrapper'), function (element, index) {
                element.remove();
            });
            forEach(document.querySelectorAll('.' + PLUGIN_NAME), function (element, index) {
                element.remove();
            });
            this.children = {};
            // 移除事件监听
            document.removeEventListener(PLUGIN_NAME + '-opened', {}, false);
            document.removeEventListener(PLUGIN_NAME + '-opening', {}, false);
            document.removeEventListener(PLUGIN_NAME + '-closing', {}, false);
            document.removeEventListener(PLUGIN_NAME + '-closed', {}, false);
            document.removeEventListener('keyup', {}, false);
            CONFIG = {};  // 移除全局配置
        },
        // msg类型
        msg: function (msg, options) {
            if (options.icon == 4) {
                options.overlay = true;
                options.timeout = false;
                options.drag = false;
                options.displayMode = 0;
            }
            var icons = ['ico-success', 'ico-error', 'ico-warning', 'ico-load', 'ico-info'];
            options.icon = icons[options.icon - 1];
            var theme = {
                message: msg,
                position: 'topCenter',
                transitionIn: 'bounceInDown',
                transitionOut: 'fadeOut',
                transitionOutMobile: 'fadeOut',
                progressBar: false,
                close: false,
                layout: 1,
                audio: ''
            };
            var settings = extend(CONFIG, options || {});
            settings = extend(theme, settings || {});
            this.show(settings);
        }
    };

    // 关闭指定的通知
    $iziToast.hide = function (options, $toast, closedBy) {
        if (typeof $toast != 'object') {
            $toast = document.querySelector($toast);
        }
        var that = this;
        var settings = extend(this.children[$toast.getAttribute('data-iziToast-ref')], options || {});
        settings.closedBy = closedBy || null;
        delete settings.time.REMAINING;
        $toast.classList.add(PLUGIN_NAME + '-closing');
        // 移除遮罩层
        (function () {
            var $overlay = document.querySelector('.' + PLUGIN_NAME + '-overlay');
            if ($overlay !== null) {
                var refs = $overlay.getAttribute('data-iziToast-ref');
                refs = refs.split(',');
                var index = refs.indexOf(String(settings.ref));
                if (index !== -1) {
                    refs.splice(index, 1);
                }
                $overlay.setAttribute('data-iziToast-ref', refs.join());
                if (refs.length === 0) {
                    $overlay.classList.remove('fadeIn');
                    $overlay.classList.add('fadeOut');
                    setTimeout(function () {
                        $overlay.remove();
                    }, 700);
                }
            }
        })();
        // 移除动画
        if (settings.transitionIn) {
            $toast.classList.remove(settings.transitionIn);
        }
        if (settings.transitionInMobile) {
            $toast.classList.remove(settings.transitionInMobile);
        }
        if (ISMOBILE || window.innerWidth <= MOBILEWIDTH) {
            if (settings.transitionOutMobile)
                $toast.classList.add(settings.transitionOutMobile);
        } else {
            if (settings.transitionOut)
                $toast.classList.add(settings.transitionOut);
        }
        var H = $toast.parentNode.offsetHeight;
        $toast.parentNode.style.height = H + 'px';
        $toast.style.pointerEvents = 'none';
        if (!ISMOBILE || window.innerWidth > MOBILEWIDTH) {
            $toast.parentNode.style.transitionDelay = '0.2s';
        }
        try {
            var event = new CustomEvent(PLUGIN_NAME + '-closing', {detail: settings, bubbles: true, cancelable: true});
            document.dispatchEvent(event);
        } catch (ex) {
            console.warn(ex);
        }
        setTimeout(function () {
            $toast.parentNode.style.height = '0px';
            $toast.parentNode.style.overflow = '';
            setTimeout(function () {
                delete that.children[settings.ref];
                $toast.parentNode.remove();
                try {
                    var event = new CustomEvent(PLUGIN_NAME + '-closed', {
                        detail: settings,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(event);
                } catch (ex) {
                    console.warn(ex);
                }
                if (typeof settings.onClosed !== 'undefined') {
                    settings.onClosed.apply(null, [settings, $toast, closedBy]);
                }
            }, 1000);
        }, 200);
        // 回调关闭事件
        if (typeof settings.onClosing !== 'undefined') {
            settings.onClosing.apply(null, [settings, $toast, closedBy]);
        }
    };

    // 显示通知
    $iziToast.show = function (options) {
        var that = this;
        // Merge user options with defaults
        var settings = extend(CONFIG, options || {});
        settings = extend(defaults, settings);
        settings.time = {};
        if (settings.id === null) {
            settings.id = generateId(settings.title + settings.message + settings.color);
        }
        if (settings.displayMode == 1 || settings.displayMode == 'once') {
            try {
                if (document.querySelectorAll('.' + PLUGIN_NAME + '#' + settings.id).length > 0) {
                    return false;
                }
            } catch (exc) {
                console.warn('[' + PLUGIN_NAME + '] Could not find an element with this selector: ' + '#' + settings.id + '. Try to set an valid id.');
            }
        }
        if (settings.displayMode == 2 || settings.displayMode == 'replace') {
            try {
                forEach(document.querySelectorAll('.' + PLUGIN_NAME + '#' + settings.id), function (element, index) {
                    that.hide(settings, element, 'replaced');
                });
            } catch (exc) {
                console.warn('[' + PLUGIN_NAME + '] Could not find an element with this selector: ' + '#' + settings.id + '. Try to set an valid id.');
            }
        }
        settings.ref = new Date().getTime() + Math.floor((Math.random() * 10000000) + 1);
        $iziToast.children[settings.ref] = settings;
        var $DOM = {
            body: document.querySelector('body'),
            overlay: document.createElement('div'),
            toast: document.createElement('div'),
            toastBody: document.createElement('div'),
            toastTexts: document.createElement('div'),
            toastCapsule: document.createElement('div'),
            cover: document.createElement('div'),
            buttons: document.createElement('div'),
            inputs: document.createElement('div'),
            icon: !settings.iconUrl ? document.createElement('i') : document.createElement('img'),
            wrapper: null
        };
        $DOM.toast.setAttribute('data-iziToast-ref', settings.ref);
        $DOM.toast.appendChild($DOM.toastBody);
        $DOM.toastCapsule.appendChild($DOM.toast);
        // CSS Settings
        (function () {
            $DOM.toast.classList.add(PLUGIN_NAME);
            $DOM.toast.classList.add(PLUGIN_NAME + '-opening');
            $DOM.toastCapsule.classList.add(PLUGIN_NAME + '-capsule');
            $DOM.toastBody.classList.add(PLUGIN_NAME + '-body');
            $DOM.toastTexts.classList.add(PLUGIN_NAME + '-texts');
            if (ISMOBILE || window.innerWidth <= MOBILEWIDTH) {
                if (settings.transitionInMobile)
                    $DOM.toast.classList.add(settings.transitionInMobile);
            } else {
                if (settings.transitionIn)
                    $DOM.toast.classList.add(settings.transitionIn);
            }
            if (settings.className) {
                var classes = settings.className.split(' ');
                forEach(classes, function (value, index) {
                    $DOM.toast.classList.add(value);
                });
            }
            if (settings.id) {
                $DOM.toast.id = settings.id;
            }
            if (settings.rtl) {
                $DOM.toast.classList.add(PLUGIN_NAME + '-rtl');
                $DOM.toast.setAttribute('dir', 'rtl');
            }
            if (settings.layout > 1) {
                $DOM.toast.classList.add(PLUGIN_NAME + '-layout' + settings.layout);
            }
            if (settings.balloon) {
                $DOM.toast.classList.add(PLUGIN_NAME + '-balloon');
            }
            if (settings.maxWidth) {
                if (!isNaN(settings.maxWidth)) {
                    $DOM.toast.style.maxWidth = settings.maxWidth + 'px';
                } else {
                    $DOM.toast.style.maxWidth = settings.maxWidth;
                }
            }
            if (settings.theme !== '' || settings.theme !== 'light') {
                $DOM.toast.classList.add(PLUGIN_NAME + '-theme-' + settings.theme);
            }
            if (settings.color) { //#, rgb, rgba, hsl
                if (isColor(settings.color)) {
                    $DOM.toast.style.background = settings.color;
                } else {
                    $DOM.toast.classList.add(PLUGIN_NAME + '-color-' + settings.color);
                }
            }
            if (settings.backgroundColor) {
                $DOM.toast.style.background = settings.backgroundColor;
                if (settings.balloon) {
                    $DOM.toast.style.borderColor = settings.backgroundColor;
                }
            }
        })();
        // Cover image
        (function () {
            if (settings.image) {
                $DOM.cover.classList.add(PLUGIN_NAME + '-cover');
                $DOM.cover.style.width = settings.imageWidth + 'px';
                if (isBase64(settings.image.replace(/ /g, ''))) {
                    $DOM.cover.style.backgroundImage = 'url(data:image/png;base64,' + settings.image.replace(/ /g, '') + ')';
                } else {
                    $DOM.cover.style.backgroundImage = 'url(' + settings.image + ')';
                }
                if (settings.rtl) {
                    $DOM.toastBody.style.marginRight = (settings.imageWidth) + 'px';
                } else {
                    $DOM.toastBody.style.marginLeft = (settings.imageWidth) + 'px';
                }
                $DOM.toast.appendChild($DOM.cover);
            }
        })();
        // Button close
        (function () {
            if (settings.close) {
                $DOM.buttonClose = document.createElement('button');
                // $DOM.buttonClose.type = 'button';
                $DOM.buttonClose.setAttribute('type', 'button');
                $DOM.buttonClose.classList.add(PLUGIN_NAME + '-close');
                $DOM.buttonClose.addEventListener('click', function (e) {
                    var button = e.target;
                    that.hide(settings, $DOM.toast, 'button');
                });
                $DOM.toast.appendChild($DOM.buttonClose);
            } else {
                if (settings.rtl) {
                    $DOM.toast.style.paddingLeft = '18px';
                } else {
                    $DOM.toast.style.paddingRight = '18px';
                }
            }
        })();
        // Progress Bar & Timeout
        (function () {
            if (settings.progressBar) {
                $DOM.progressBar = document.createElement('div');
                $DOM.progressBarDiv = document.createElement('div');
                $DOM.progressBar.classList.add(PLUGIN_NAME + '-progressbar');
                $DOM.progressBarDiv.style.background = settings.progressBarColor;
                $DOM.progressBar.appendChild($DOM.progressBarDiv);
                $DOM.toast.appendChild($DOM.progressBar);
            }
            if (settings.timeout) {
                if (settings.pauseOnHover && !settings.resetOnHover) {
                    $DOM.toast.addEventListener('mouseenter', function (e) {
                        that.progress(settings, $DOM.toast).pause();
                    });
                    $DOM.toast.addEventListener('mouseleave', function (e) {
                        that.progress(settings, $DOM.toast).resume();
                    });
                }
                if (settings.resetOnHover) {
                    $DOM.toast.addEventListener('mouseenter', function (e) {
                        that.progress(settings, $DOM.toast).reset();
                    });
                    $DOM.toast.addEventListener('mouseleave', function (e) {
                        that.progress(settings, $DOM.toast).start();
                    });
                }
            }
        })();
        // Icon
        (function () {
            if (settings.iconUrl) {
                $DOM.icon.setAttribute('class', PLUGIN_NAME + '-icon');
                $DOM.icon.setAttribute('src', settings.iconUrl);
            } else if (settings.icon) {
                $DOM.icon.setAttribute('class', PLUGIN_NAME + '-icon ' + settings.icon);
                if (settings.iconText) {
                    $DOM.icon.appendChild(document.createTextNode(settings.iconText));
                }
                if (settings.iconColor) {
                    $DOM.icon.style.color = settings.iconColor;
                }
            }
            if (settings.icon || settings.iconUrl) {
                if (settings.rtl) {
                    $DOM.toastBody.style.paddingRight = '33px';
                } else {
                    $DOM.toastBody.style.paddingLeft = '33px';
                }
                $DOM.toastBody.appendChild($DOM.icon);
            }

        })();
        // Title & Message
        (function () {
            if (settings.title.length > 0) {
                $DOM.strong = document.createElement('strong');
                $DOM.strong.classList.add(PLUGIN_NAME + '-title');
                $DOM.strong.appendChild(createFragElem(settings.title));
                $DOM.toastTexts.appendChild($DOM.strong);
                if (settings.titleColor) {
                    $DOM.strong.style.color = settings.titleColor;
                }
                if (settings.titleSize) {
                    if (!isNaN(settings.titleSize)) {
                        $DOM.strong.style.fontSize = settings.titleSize + 'px';
                    } else {
                        $DOM.strong.style.fontSize = settings.titleSize;
                    }
                }
                if (settings.titleLineHeight) {
                    if (!isNaN(settings.titleSize)) {
                        $DOM.strong.style.lineHeight = settings.titleLineHeight + 'px';
                    } else {
                        $DOM.strong.style.lineHeight = settings.titleLineHeight;
                    }
                }
            }
            if (settings.message.length > 0) {
                $DOM.p = document.createElement('p');
                $DOM.p.classList.add(PLUGIN_NAME + '-message');
                $DOM.p.appendChild(createFragElem(settings.message));
                $DOM.toastTexts.appendChild($DOM.p);
                if (settings.messageColor) {
                    $DOM.p.style.color = settings.messageColor;
                }
                if (settings.messageSize) {
                    if (!isNaN(settings.titleSize)) {
                        $DOM.p.style.fontSize = settings.messageSize + 'px';
                    } else {
                        $DOM.p.style.fontSize = settings.messageSize;
                    }
                }
                if (settings.messageLineHeight) {
                    if (!isNaN(settings.titleSize)) {
                        $DOM.p.style.lineHeight = settings.messageLineHeight + 'px';
                    } else {
                        $DOM.p.style.lineHeight = settings.messageLineHeight;
                    }
                }
            }
            if (settings.title.length > 0 && settings.message.length > 0) {
                if (settings.rtl) {
                    $DOM.strong.style.marginLeft = '10px';
                } else if (settings.layout != 2 && !settings.rtl) {
                    $DOM.strong.style.marginRight = '10px';
                    $DOM.strong.style.marginBottom = '0px';
                }
            }
        })();
        $DOM.toastBody.appendChild($DOM.toastTexts);
        // Inputs
        var $inputs;
        (function () {
            if (settings.inputs.length > 0) {
                $DOM.inputs.classList.add(PLUGIN_NAME + '-inputs');
                forEach(settings.inputs, function (value, index) {
                    $DOM.inputs.appendChild(createFragElem(value[0]));
                    $inputs = $DOM.inputs.childNodes;
                    $inputs[index].classList.add(PLUGIN_NAME + '-inputs-child');
                    if (value[3]) {
                        setTimeout(function () {
                            $inputs[index].focus();
                        }, 300);
                    }
                    $inputs[index].addEventListener(value[1], function (e) {
                        var ts = value[2];
                        return ts(that, $DOM.toast, this, e);
                    });
                });
                $DOM.toastBody.appendChild($DOM.inputs);
            }
        })();
        // Buttons
        (function () {
            if (settings.buttons.length > 0) {
                $DOM.buttons.classList.add(PLUGIN_NAME + '-buttons');
                forEach(settings.buttons, function (value, index) {
                    $DOM.buttons.appendChild(createFragElem(value[0]));
                    var $btns = $DOM.buttons.childNodes;
                    $btns[index].classList.add(PLUGIN_NAME + '-buttons-child');
                    if (value[2]) {
                        setTimeout(function () {
                            $btns[index].focus();
                        }, 300);
                    }
                    $btns[index].addEventListener('click', function (e) {
                        e.preventDefault();
                        var ts = value[1];
                        return ts(that, $DOM.toast, this, e, $inputs);
                    });
                });
            }
            $DOM.toastTexts.appendChild($DOM.buttons);
        })();
        if (settings.message.length > 0 && (settings.inputs.length > 0 || settings.buttons.length > 0)) {
            $DOM.p.style.marginBottom = '0';
        }
        if (settings.inputs.length > 0 || settings.buttons.length > 0) {
            if (settings.rtl) {
                $DOM.toastTexts.style.marginLeft = '10px';
            } else {
                $DOM.toastTexts.style.marginRight = '10px';
            }
            if (settings.inputs.length > 0 && settings.buttons.length > 0) {
                if (settings.rtl) {
                    $DOM.inputs.style.marginLeft = '8px';
                } else {
                    $DOM.inputs.style.marginRight = '8px';
                }
            }
        }
        // Wrap
        (function () {
            $DOM.toastCapsule.style.visibility = 'hidden';
            setTimeout(function () {
                var H = $DOM.toast.offsetHeight;
                var style = $DOM.toast.currentStyle || window.getComputedStyle($DOM.toast);
                var marginTop = style.marginTop;
                marginTop = marginTop.split('px');
                marginTop = parseInt(marginTop[0]);
                var marginBottom = style.marginBottom;
                marginBottom = marginBottom.split('px');
                marginBottom = parseInt(marginBottom[0]);

                $DOM.toastCapsule.style.visibility = '';
                $DOM.toastCapsule.style.height = (H + marginBottom + marginTop) + 'px';

                setTimeout(function () {
                    $DOM.toastCapsule.style.height = 'auto';
                    if (settings.target) {
                        $DOM.toastCapsule.style.overflow = 'visible';
                    }
                }, 500);

                if (settings.timeout) {
                    that.progress(settings, $DOM.toast).start();
                }
            }, 100);
        })();
        // Target
        (function () {
            var position = settings.position;
            if (settings.target) {
                $DOM.wrapper = document.querySelector(settings.target);
                $DOM.wrapper.classList.add(PLUGIN_NAME + '-target');
                if (settings.targetFirst) {
                    $DOM.wrapper.insertBefore($DOM.toastCapsule, $DOM.wrapper.firstChild);
                } else {
                    $DOM.wrapper.appendChild($DOM.toastCapsule);
                }
            } else {
                if (POSITIONS.indexOf(settings.position) == -1) {
                    console.warn('[' + PLUGIN_NAME + '] Incorrect position.\nIt can be › ' + POSITIONS);
                    return;
                }
                if (ISMOBILE || window.innerWidth <= MOBILEWIDTH) {
                    if (settings.position == 'bottomLeft' || settings.position == 'bottomRight' || settings.position == 'bottomCenter') {
                        position = PLUGIN_NAME + '-wrapper-bottomCenter';
                    } else if (settings.position == 'topLeft' || settings.position == 'topRight' || settings.position == 'topCenter') {
                        position = PLUGIN_NAME + '-wrapper-topCenter';
                    } else {
                        position = PLUGIN_NAME + '-wrapper-center';
                    }
                } else {
                    position = PLUGIN_NAME + '-wrapper-' + position;
                }
                $DOM.wrapper = document.querySelector('.' + PLUGIN_NAME + '-wrapper.' + position);
                if (!$DOM.wrapper) {
                    $DOM.wrapper = document.createElement('div');
                    $DOM.wrapper.classList.add(PLUGIN_NAME + '-wrapper');
                    $DOM.wrapper.classList.add(position);
                    document.body.appendChild($DOM.wrapper);
                }
                var targetFirst = settings.targetFirst;
                if ((targetFirst == undefined || targetFirst == null) && (settings.position == 'topLeft' || settings.position == 'topCenter' || settings.position == 'topRight')) {
                    targetFirst = true;
                }
                if (targetFirst) {
                    $DOM.wrapper.insertBefore($DOM.toastCapsule, $DOM.wrapper.firstChild);
                } else {
                    $DOM.wrapper.appendChild($DOM.toastCapsule);
                }
            }
            if (!isNaN(settings.zindex)) {
                $DOM.wrapper.style.zIndex = settings.zindex;
            } else {
                console.warn('[' + PLUGIN_NAME + '] Invalid zIndex.');
            }
        })();
        // Overlay
        (function () {
            if (settings.overlay) {
                if (document.querySelector('.' + PLUGIN_NAME + '-overlay.fadeIn') !== null) {
                    $DOM.overlay = document.querySelector('.' + PLUGIN_NAME + '-overlay');
                    $DOM.overlay.setAttribute('data-iziToast-ref', $DOM.overlay.getAttribute('data-iziToast-ref') + ',' + settings.ref);
                    if (!isNaN(settings.zindex) && settings.zindex !== null) {
                        $DOM.overlay.style.zIndex = settings.zindex - 1;
                    }
                } else {
                    $DOM.overlay.classList.add(PLUGIN_NAME + '-overlay');
                    $DOM.overlay.classList.add('fadeIn');
                    $DOM.overlay.style.background = settings.overlayColor;
                    $DOM.overlay.setAttribute('data-iziToast-ref', settings.ref);
                    if (!isNaN(settings.zindex) && settings.zindex !== null) {
                        $DOM.overlay.style.zIndex = settings.zindex - 1;
                    }
                    document.querySelector('body').appendChild($DOM.overlay);
                }
                if (settings.overlayClose) {
                    $DOM.overlay.removeEventListener('click', {});
                    $DOM.overlay.addEventListener('click', function (e) {
                        that.hide(settings, $DOM.toast, 'overlay');
                    });
                } else {
                    $DOM.overlay.removeEventListener('click', {});
                }
            }
        })();
        // Inside animations
        (function () {
            if (settings.animateInside) {
                $DOM.toast.classList.add(PLUGIN_NAME + '-animateInside');
                var animationTimes = [200, 100, 300];
                if (settings.transitionIn == 'bounceInLeft' || settings.transitionIn == 'bounceInRight') {
                    animationTimes = [400, 200, 400];
                }
                if (settings.title.length > 0) {
                    setTimeout(function () {
                        $DOM.strong.classList.add('slideIn');
                    }, animationTimes[0]);
                }
                if (settings.message.length > 0) {
                    setTimeout(function () {
                        $DOM.p.classList.add('slideIn');
                    }, animationTimes[1]);
                }
                if (settings.icon || settings.iconUrl) {
                    setTimeout(function () {
                        $DOM.icon.classList.add('revealIn');
                    }, animationTimes[2]);
                }
                var counter = 150;
                if (settings.buttons.length > 0 && $DOM.buttons) {
                    setTimeout(function () {
                        forEach($DOM.buttons.childNodes, function (element, index) {
                            setTimeout(function () {
                                element.classList.add('revealIn');
                            }, counter);
                            counter = counter + 150;
                        });
                    }, settings.inputs.length > 0 ? 150 : 0);
                }
                if (settings.inputs.length > 0 && $DOM.inputs) {
                    counter = 150;
                    forEach($DOM.inputs.childNodes, function (element, index) {
                        setTimeout(function () {
                            element.classList.add('revealIn');
                        }, counter);
                        counter = counter + 150;
                    });
                }
            }
        })();
        settings.onOpening.apply(null, [settings, $DOM.toast]);
        try {
            var event = new CustomEvent(PLUGIN_NAME + '-opening', {detail: settings, bubbles: true, cancelable: true});
            document.dispatchEvent(event);
        } catch (ex) {
            console.warn(ex);
        }
        setTimeout(function () {
            $DOM.toast.classList.remove(PLUGIN_NAME + '-opening');
            $DOM.toast.classList.add(PLUGIN_NAME + '-opened');
            try {
                var event = new CustomEvent(PLUGIN_NAME + '-opened', {
                    detail: settings,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            } catch (ex) {
                console.warn(ex);
            }
            settings.onOpened.apply(null, [settings, $DOM.toast]);
        }, 1000);
        if (settings.drag) {
            if (ACCEPTSTOUCH) {
                $DOM.toast.addEventListener('touchstart', function (e) {
                    drag.startMoving(this, that, settings, e);
                }, false);
                $DOM.toast.addEventListener('touchend', function (e) {
                    drag.stopMoving(this, e);
                }, false);
            } else {
                $DOM.toast.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    drag.startMoving(this, that, settings, e);
                }, false);
                $DOM.toast.addEventListener('mouseup', function (e) {
                    e.preventDefault();
                    drag.stopMoving(this, e);
                }, false);
            }
        }
        if (settings.closeOnEscape) {
            document.addEventListener('keyup', function (evt) {
                evt = evt || window.event;
                if (evt.keyCode == 27) {
                    that.hide(settings, $DOM.toast, 'esc');
                }
            });
        }
        if (settings.closeOnClick) {
            $DOM.toast.addEventListener('click', function (evt) {
                that.hide(settings, $DOM.toast, 'toast');
            });
        }
        // 播放声音
        if (settings.audio) {
            that.playSound(settings.audio);
        }
        that.toast = $DOM.toast;
    };

    // 控制进度条
    $iziToast.progress = function (options, $toast, callback) {
        var that = this,
            ref = $toast.getAttribute('data-iziToast-ref'),
            settings = extend(this.children[ref], options || {}),
            $elem = $toast.querySelector('.' + PLUGIN_NAME + '-progressbar div');
        return {
            start: function () {
                if (typeof settings.time.REMAINING == 'undefined') {
                    $toast.classList.remove(PLUGIN_NAME + '-reseted');
                    if ($elem !== null) {
                        $elem.style.transition = 'width ' + settings.timeout + 'ms ' + settings.progressBarEasing;
                        $elem.style.width = '0%';
                    }
                    settings.time.START = new Date().getTime();
                    settings.time.END = settings.time.START + settings.timeout;
                    settings.time.TIMER = setTimeout(function () {
                        clearTimeout(settings.time.TIMER);
                        if (!$toast.classList.contains(PLUGIN_NAME + '-closing')) {
                            that.hide(settings, $toast, 'timeout');
                            if (typeof callback === 'function') {
                                callback.apply(that);
                            }
                        }
                    }, settings.timeout);
                    that.setSetting(ref, 'time', settings.time);
                }
            },
            pause: function () {
                if (typeof settings.time.START !== 'undefined' && !$toast.classList.contains(PLUGIN_NAME + '-paused') && !$toast.classList.contains(PLUGIN_NAME + '-reseted')) {
                    $toast.classList.add(PLUGIN_NAME + '-paused');
                    settings.time.REMAINING = settings.time.END - new Date().getTime();
                    clearTimeout(settings.time.TIMER);
                    that.setSetting(ref, 'time', settings.time);
                    if ($elem !== null) {
                        var computedStyle = window.getComputedStyle($elem),
                            propertyWidth = computedStyle.getPropertyValue('width');
                        $elem.style.transition = 'none';
                        $elem.style.width = propertyWidth;
                    }
                    if (typeof callback === 'function') {
                        setTimeout(function () {
                            callback.apply(that);
                        }, 10);
                    }
                }
            },
            resume: function () {
                if (typeof settings.time.REMAINING !== 'undefined') {
                    $toast.classList.remove(PLUGIN_NAME + '-paused');
                    if ($elem !== null) {
                        $elem.style.transition = 'width ' + settings.time.REMAINING + 'ms ' + settings.progressBarEasing;
                        $elem.style.width = '0%';
                    }
                    settings.time.END = new Date().getTime() + settings.time.REMAINING;
                    settings.time.TIMER = setTimeout(function () {
                        clearTimeout(settings.time.TIMER);
                        if (!$toast.classList.contains(PLUGIN_NAME + '-closing')) {
                            that.hide(settings, $toast, 'timeout');
                            if (typeof callback === 'function') {
                                callback.apply(that);
                            }
                        }
                    }, settings.time.REMAINING);
                    that.setSetting(ref, 'time', settings.time);
                } else {
                    this.start();
                }
            },
            reset: function () {
                clearTimeout(settings.time.TIMER);
                delete settings.time.REMAINING;
                that.setSetting(ref, 'time', settings.time);
                $toast.classList.add(PLUGIN_NAME + '-reseted');
                $toast.classList.remove(PLUGIN_NAME + '-paused');
                if ($elem !== null) {
                    $elem.style.transition = 'none';
                    $elem.style.width = '100%';
                }
                if (typeof callback === 'function') {
                    setTimeout(function () {
                        callback.apply(that);
                    }, 10);
                }
            }
        };
    };

    // 判断是否是ie9以下版本
    var isIE9_ = function () {
        return false;
    };

    // 给Element添加remove方法
    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }

    // 自定义事件
    if (typeof window.CustomEvent !== 'function') {
        var CustomEventPolyfill = function (event, params) {
            params = params || {bubbles: false, cancelable: false, detail: undefined};
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        CustomEventPolyfill.prototype = window.Event.prototype;
        window.CustomEvent = CustomEventPolyfill;
    }

    // 遍历数据
    var forEach = function (collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            if (collection) {
                for (var i = 0, len = collection.length; i < len; i++) {
                    callback.call(scope, collection[i], i, collection);
                }
            }
        }
    };

    // 合并自定义参数和默认参数
    var extend = function (defaults, options) {
        var extended = {};
        forEach(defaults, function (value, prop) {
            extended[prop] = defaults[prop];
        });
        forEach(options, function (value, prop) {
            extended[prop] = options[prop];
        });
        return extended;
    };

    // 创建新的文档片段
    var createFragElem = function (htmlStr) {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    };

    // 生成ID
    var generateId = function (params) {
        var newId = btoa(encodeURIComponent(params));
        return newId.replace(/=/g, "");
    };

    // 判断是否是颜色字符串
    var isColor = function (color) {
        if (color.substring(0, 1) == '#' || color.substring(0, 3) == 'rgb' || color.substring(0, 3) == 'hsl') {
            return true;
        } else {
            return false;
        }
    };

    // 判断是否是base64字符串
    var isBase64 = function (str) {
        try {
            return btoa(atob(str)) == str;
        } catch (err) {
            return false;
        }
    };

    // 拖拽方法
    var drag = function () {
        return {
            move: function (toast, instance, settings, xpos) {
                var opacity,
                    opacityRange = 0.3,
                    distance = 180;
                if (xpos !== 0) {
                    toast.classList.add(PLUGIN_NAME + '-dragged');
                    toast.style.transform = 'translateX(' + xpos + 'px)';
                    if (xpos > 0) {
                        opacity = (distance - xpos) / distance;
                        if (opacity < opacityRange) {
                            instance.hide(extend(settings, {
                                transitionOut: 'fadeOutRight',
                                transitionOutMobile: 'fadeOutRight'
                            }), toast, 'drag');
                        }
                    } else {
                        opacity = (distance + xpos) / distance;
                        if (opacity < opacityRange) {
                            instance.hide(extend(settings, {
                                transitionOut: 'fadeOutLeft',
                                transitionOutMobile: 'fadeOutLeft'
                            }), toast, 'drag');
                        }
                    }
                    toast.style.opacity = opacity;
                    if (opacity < opacityRange) {
                        if (ISCHROME || ISFIREFOX)
                            toast.style.left = xpos + 'px';
                        toast.parentNode.style.opacity = opacityRange;
                        this.stopMoving(toast, null);
                    }
                }
            },
            startMoving: function (toast, instance, settings, e) {
                e = e || window.event;
                var posX = ((ACCEPTSTOUCH) ? e.touches[0].clientX : e.clientX),
                    toastLeft = toast.style.transform.replace('px)', '');
                toastLeft = toastLeft.replace('translateX(', '');
                var offsetX = posX - toastLeft;
                if (settings.transitionIn) {
                    toast.classList.remove(settings.transitionIn);
                }
                if (settings.transitionInMobile) {
                    toast.classList.remove(settings.transitionInMobile);
                }
                toast.style.transition = '';
                if (ACCEPTSTOUCH) {
                    document.ontouchmove = function (e) {
                        e.preventDefault();
                        e = e || window.event;
                        var posX = e.touches[0].clientX,
                            finalX = posX - offsetX;
                        drag.move(toast, instance, settings, finalX);
                    };
                } else {
                    document.onmousemove = function (e) {
                        e.preventDefault();
                        e = e || window.event;
                        var posX = e.clientX,
                            finalX = posX - offsetX;
                        drag.move(toast, instance, settings, finalX);
                    };
                }
            },
            stopMoving: function (toast, e) {
                if (ACCEPTSTOUCH) {
                    document.ontouchmove = function () {
                    };
                } else {
                    document.onmousemove = function () {
                    };
                }
                toast.style.opacity = '';
                toast.style.transform = '';
                if (toast.classList.contains(PLUGIN_NAME + '-dragged')) {
                    toast.classList.remove(PLUGIN_NAME + '-dragged');
                    toast.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                    setTimeout(function () {
                        toast.style.transition = '';
                    }, 400);
                }
            }
        };
    }();

    // 兼容IE
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            }
            return t
        }, decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = Base64._utf8_decode(t);
            return t
        }, _utf8_encode: function (e) {
            e = e.replace(/rn/g, "n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128)
                } else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        }, _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    };

    // 播放声音
    $iziToast.playSound = function (src) {
        if (!(src.indexOf('http') == 0)) {
            src = layui.cache.base + 'notice/' + src + '.wav';
        }
        if (!!window.ActiveXObject || "ActiveXObject" in window) {  // IE
            var embed = document.noticePlay;
            if (embed) {
                embed.remove();
            }
            embed = document.createElement('embed');
            embed.setAttribute('name', 'noticePlay');
            embed.setAttribute('src', src);
            embed.setAttribute('autostart', true);
            embed.setAttribute('loop', false);
            embed.setAttribute('hidden', true);
            document.body.appendChild(embed);
            embed = document.noticePlay;
            embed.volume = 100;
        } else {   // 非IE
            var audio = document.createElement('audio');
            audio.setAttribute('hidden', true);
            audio.setAttribute('src', src);
            document.body.appendChild(audio);
            audio.addEventListener('ended', function () {
                audio.parentNode.removeChild(audio);
            }, false);
            audio.play();
        }
    };

    // 不同主题的通知
    forEach(THEMES, function (theme, name) {
        $iziToast[name] = function (options,title) {
            if(typeof options === 'string'){
                options = {
                    message: options
                }
                if(title){
                    options.title = title
                }
            }
            var settings = extend(CONFIG, options || {});
            settings = extend(theme, settings || {});
            this.show(settings);
        };
    });

    layui.link(layui.cache.base + 'notice/notice.css');  // 加载css
    exports('notice', $iziToast);
});

/** EasyWeb iframe v3.1.8 date:2020-05-04 License By http://easyweb.vip */

layui.define(['layer'], function (exports) {
    var $         = layui.jquery;
    var layer     = layui.layer;
    var setter    = layui.cache;
    var bodyDOM   = '.layui-layout-admin>.layui-body';
    var tabDOM    = bodyDOM + '>.layui-tab';
    var sideDOM   = '.layui-layout-admin>.layui-side>.layui-side-scroll';
    var headerDOM = '.layui-layout-admin>.layui-header';
    var navFilter = 'admin-side-nav';
    var admin     = {version: '3.1.8', layerData: {}};

    /** 设置侧栏折叠 */
    admin.flexible = function (expand) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.flexible(expand);
        var $layout  = $('.layui-layout-admin');
        var isExapnd = $layout.hasClass('admin-nav-mini');
        if (expand === undefined) expand = isExapnd;
        if (isExapnd === expand) {
            if (window.sideFlexTimer) clearTimeout(window.sideFlexTimer);
            $layout.addClass('admin-side-flexible');
            window.sideFlexTimer = setTimeout(function () {
                $layout.removeClass('admin-side-flexible');
            }, 600);
            if (expand) {
                admin.hideTableScrollBar();
                $layout.removeClass('admin-nav-mini');
            } else {
                $layout.addClass('admin-nav-mini');
            }
            layui.event.call(this, 'admin', 'flexible({*})', {expand: expand});
        }
    };

    /** 设置导航栏选中 */
    admin.activeNav = function (url) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.activeNav(url);
        if (!url) return console.warn('active url is null');
        $(sideDOM + '>.layui-nav .layui-nav-item .layui-nav-child dd.layui-this').removeClass('layui-this');
        $(sideDOM + '>.layui-nav .layui-nav-item.layui-this').removeClass('layui-this');
        var $a = $(sideDOM + '>.layui-nav a[lay-href="' + url + '"]');
        if ($a.length === 0) return console.warn(url + ' not found');
        var isMini = $('.layui-layout-admin').hasClass('admin-nav-mini');
        if ($(sideDOM + '>.layui-nav').attr('lay-shrink') === '_all') {  // 手风琴效果
            var $pChilds = $a.parent('dd').parents('.layui-nav-child');
            if (!isMini) {
                $(sideDOM + '>.layui-nav .layui-nav-itemed>.layui-nav-child').not($pChilds)
                .css('display', 'block').slideUp('fast', function () {
                    $(this).css('display', '');
                });
            }
            $(sideDOM + '>.layui-nav .layui-nav-itemed').not($pChilds.parent()).removeClass('layui-nav-itemed');
        }
        $a.parent().addClass('layui-this');  // 选中当前
        // 展开所有父级
        var $asParents = $a.parent('dd').parents('.layui-nav-child').parent();
        if (!isMini) {
            var $childs = $asParents.not('.layui-nav-itemed').children('.layui-nav-child');
            $childs.slideDown('fast', function () {
                if ($(this).is($childs.last())) {
                    $childs.css('display', '');
                    // 菜单超出屏幕自动滚动
                    var topBeyond    = $a.offset().top + $a.outerHeight() + 30 - admin.getPageHeight();
                    var topDisparity = 50 + 65 - $a.offset().top;
                    if (topBeyond > 0) {
                        $(sideDOM).animate({'scrollTop': $(sideDOM).scrollTop() + topBeyond}, 300);
                    } else if (topDisparity > 0) {
                        $(sideDOM).animate({'scrollTop': $(sideDOM).scrollTop() - topDisparity}, 300);
                    }
                }
            });
        }
        $asParents.addClass('layui-nav-itemed');
        // 适配多系统模式
        $('ul[lay-filter="' + navFilter + '"]').addClass('layui-hide');
        var $aUl = $a.parents('.layui-nav');
        $aUl.removeClass('layui-hide');
        $(headerDOM + '>.layui-nav>.layui-nav-item').removeClass('layui-this');
        $(headerDOM + '>.layui-nav>.layui-nav-item>a[nav-bind="' + $aUl.attr('nav-id') + '"]').parent().addClass('layui-this');
    };

    /** 右侧弹出 */
    admin.popupRight = function (param) {
        param.anim   = -1;
        param.offset = 'r';
        param.move   = false;
        param.fixed  = true;
        if (param.area === undefined) param.area = '336px';
        if (param.title === undefined) param.title = false;
        if (param.closeBtn === undefined) param.closeBtn = false;
        if (param.shadeClose === undefined) param.shadeClose = true;
        if (param.skin === undefined) param.skin = 'layui-anim layui-anim-rl layui-layer-adminRight';
        return admin.open(param);
    };

    /** 封装layer.open */
    admin.open = function (param) {
        if (param.content && param.type === 2) param.url = undefined;  // 参数纠正
        if (param.url && (param.type === 2 || param.type === undefined)) param.type = 1;  // 参数纠正
        if (param.area === undefined) param.area = param.type === 2 ? ['360px', '300px'] : '360px';
        if (param.offset === undefined) param.offset = '70px';
        if (param.shade === undefined) param.shade = .1;
        if (param.fixed === undefined) param.fixed = false;
        if (param.resize === undefined) param.resize = false;
        if (param.skin === undefined) param.skin = 'layui-layer-admin';
        var eCallBack = param.end;
        param.end     = function () {
            layer.closeAll('tips');  // 关闭表单验证的tips
            eCallBack && eCallBack();
        };
        if (param.url) {
            var sCallBack = param.success, cCallback = param.cancel;
            param.success = function (layero, index) {
                $(layero).data('tpl', param.tpl || '');
                admin.reloadLayer(index, param.url, sCallBack, cCallback);
            };
        } else if (param.tpl && param.content) {
            param.content = admin.util.tpl(param.content, param.data, setter.tplOpen, setter.tplClose);
        }
        var layIndex = layer.open(param);
        if (param.data) admin.layerData['d' + layIndex] = param.data;
        return layIndex;
    };

    /** 获取弹窗数据 */
    admin.getLayerData = function (index, key) {
        if (index === undefined) {
            index = parent.layer.getFrameIndex(window.name);
            if (index === undefined) return null;
            else return parent.layui.admin.getLayerData(parseInt(index), key);
        } else if (isNaN(index)) {
            index = admin.getLayerIndex(index);
        }
        if (index === undefined) return;
        var layerData = admin.layerData['d' + index];
        if (key && layerData) return layerData[key];
        return layerData;
    };

    /** 放入弹窗数据 */
    admin.putLayerData = function (key, value, index) {
        if (index === undefined) {
            index = parent.layer.getFrameIndex(window.name);
            if (index === undefined) return;
            else return parent.layui.admin.putLayerData(key, value, parseInt(index));
        } else if (isNaN(index)) {
            index = admin.getLayerIndex(index);
        }
        if (index === undefined) return;
        var layerData = admin.getLayerData(index);
        if (!layerData) layerData = {};
        layerData[key]               = value;
        admin.layerData['d' + index] = layerData;
    };

    /** 刷新url方式的layer */
    admin.reloadLayer = function (index, url, success, cancel) {
        if (typeof url === 'function') {
            cancel  = success;
            success = url;
            url     = undefined;

        }
        if (isNaN(index)) index = admin.getLayerIndex(index);
        if (index === undefined) return;
        var $layero = $('#layui-layer' + index);
        if (url === undefined) url = $layero.data('url');
        if (!url) return;
        $layero.data('url', url);
        admin.showLoading($layero);
        admin.ajax({
            url     : url,
            dataType: 'html',
            success : function (res) {
                admin.removeLoading($layero, false);
                if (typeof res !== 'string') res = JSON.stringify(res);
                var tpl = $layero.data('tpl');
                // 模板解析
                if (tpl === true || tpl === 'true') {
                    var data        = admin.getLayerData(index) || {};
                    data.layerIndex = index;
                    // 模板里面有动态模板处理
                    var $html       = $('<div>' + res + '</div>'), tplAll = {};
                    $html.find('script,[tpl-ignore]').each(function (i) {
                        var $this           = $(this);
                        tplAll['temp_' + i] = $this[0].outerHTML;
                        $this.after('${temp_' + i + '}').remove();
                    });
                    res = admin.util.tpl($html.html(), data, setter.tplOpen, setter.tplClose);
                    for (var f in tplAll) res = res.replace('${' + f + '}', tplAll[f]);
                }
                $layero.children('.layui-layer-content').html(res);
                admin.renderTpl('#layui-layer' + index + ' [ew-tpl]');
                success && success($layero[0], index);
            },
            cancel  : function () {
                cancel && cancel($layero[0], index);
            }
        });
    };

    /** 封装layer.alert */
    admin.alert = function (content, options, yes) {
        if (typeof options === 'function') {
            yes     = options;
            options = {};
        }
        options = options || {};
        if (options.skin === undefined) options.skin = 'layui-layer-admin';
        if (options.shade === undefined) options.shade = .1;
        return layer.alert(content, options, yes);
    };

    /** 封装layer.confirm */
    admin.confirm = function (content, options, yes, cancel) {
        if (typeof options === 'function') {
            cancel  = yes;
            yes     = options;
            options = {};
        }
        options = options || {};
        if (options.skin === undefined) options.skin = 'layui-layer-admin';
        if (options.shade === undefined) options.shade = .1;
        return layer.confirm(content, options, yes, cancel);
    };

    /** 封装layer.prompt */
    admin.prompt = function (options, yes) {
        if (typeof options === 'function') {
            yes     = options;
            options = {};
        }
        if (options.skin === undefined) options.skin = 'layui-layer-admin layui-layer-prompt';
        if (options.shade === undefined) options.shade = .1;
        return layer.prompt(options, yes);
    };

    /** 封装ajax请求，返回数据类型为json */
    admin.req = function (url, data, success, method, option) {
        if (typeof data === 'function') {
            option  = method;
            method  = success;
            success = data;
            data    = {};
        }
        if (method !== undefined && typeof method !== 'string') {
            option = method;
            method = undefined;
        }
        if (!method) method = 'GET';
        if (typeof data === 'string') {
            option = option || {};
            if (!option.contentType) option.contentType = 'application/json';
        } else if (setter.reqPutToPost) {
            if ('put' === method.toLowerCase()) {
                method       = 'POST';
                data._method = 'PUT';
            } else if ('delete' === method.toLowerCase()) {
                method       = 'GET';
                data._method = 'DELETE';
            }
        }
        return admin.ajax($.extend({
            url: admin.url(url), data: data, type: method, dataType: 'json', success: success
        }, option));
    };
    admin.req1      = function (type, url, data, option) {
        var promise = $.Deferred();
        if (typeof option === 'function') {
            option = {
                success: option
            }
        }
        admin.req(url, data, function (data, status, xhr) {
            if (status === 'success') {
                promise.resolve(data);
            } else {
                promise.reject(data, xhr);
            }
        }, type, option);
        return promise;
    };
    admin.postJson  = function (url, jsonData, option) {
        return admin.req1('POST', url, JSON.stringify(jsonData), option);
    }
    admin.putJson   = function (url, jsonData, option) {
        return admin.req1('PUT', url, JSON.stringify(jsonData), option);
    }
    admin.patchJson = function (url, jsonData, option) {
        return admin.req1('PATCH', url, JSON.stringify(jsonData), option);
    }
    admin.post      = function (url, data, option) {
        return admin.req1('POST', url, data, option);
    };
    admin.get       = function (url, data, option) {
        return admin.req1('GET', url, data, option);
    };
    /** 封装ajax请求 */
    admin.ajax = function (param) {
        var oldParam = admin.util.deepClone(param);
        if (!param.dataType) param.dataType = 'json';
        if (!param.headers) param.headers = {};
        // 统一设置header
        var headers = setter.getAjaxHeaders(param.url);
        if (headers) {
            for (var i = 0; i < headers.length; i++) {
                if (param.headers[headers[i].name] === undefined) param.headers[headers[i].name] = headers[i].value;
            }
        }
        // success预处理
        var success   = param.success;
        param.success = function (result, status, xhr) {
            var before = setter.ajaxSuccessBefore(admin.parseJSON(result), param.url, {
                param    : oldParam, reload: function (p) {
                    admin.ajax($.extend(true, oldParam, p));
                }, update: function (r) {
                    result = r;
                }, xhr   : xhr
            });
            if (before !== false) success && success(result, status, xhr);
            else param.cancel && param.cancel();
        };
        if (!param.error) {
            param.error = function (xhr, status) {
                var result = xhr.responseJSON || {
                    code   : xhr.status,
                    message: xhr.responseText || xhr.statusText
                };
                if (!result.code) {
                    result.code = xhr.status
                }
                if (!result.message) {
                    result.message = xhr.statusText
                }
                param.success(result, status, xhr);
            }
        }
        // 解决缓存问题
        if (layui.cache.version && (!setter.apiNoCache || param.dataType.toLowerCase() !== 'json')) {
            if (param.url.indexOf('?') === -1) param.url += '?v=';
            else param.url += '&v=';
            if (layui.cache.version === true) param.url += new Date().getTime();
            else param.url += layui.cache.version;
        }
        return $.ajax(param);
    };

    /** 解析json */
    admin.parseJSON = function (str) {
        if (typeof str === 'string') {
            try {
                return JSON.parse(str);
            } catch (e) {
            }
        }
        return str;
    };

    /** 显示加载动画 */
    admin.showLoading = function (elem, type, opacity, size) {
        if (elem !== undefined && (typeof elem !== 'string') && !(elem instanceof $)) {
            type    = elem.type;
            opacity = elem.opacity;
            size    = elem.size;
            elem    = elem.elem;
        }
        if (type === undefined) type = setter.defaultLoading || 1;
        if (size === undefined) size = 'sm';
        if (elem === undefined) elem = 'body';
        var loader = [
            '<div class="ball-loader ' + size + '"><span></span><span></span><span></span><span></span></div>',
            '<div class="rubik-loader ' + size + '"></div>',
            '<div class="signal-loader ' + size + '"><span></span><span></span><span></span><span></span></div>',
            '<div class="layui-loader ' + size + '"><i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i></div>'
        ];
        $(elem).addClass('page-no-scroll');  // 禁用滚动条
        $(elem).scrollTop(0);
        var $loading = $(elem).children('.page-loading');
        if ($loading.length <= 0) {
            $(elem).append('<div class="page-loading">' + loader[type - 1] + '</div>');
            $loading = $(elem).children('.page-loading');
        }
        if (opacity !== undefined) $loading.css('background-color', 'rgba(255,255,255,' + opacity + ')');
        $loading.show();
    };

    /** 移除加载动画 */
    admin.removeLoading = function (elem, fade, del) {
        if (elem === undefined) elem = 'body';
        if (fade === undefined) fade = true;
        var $loading = $(elem).children('.page-loading');
        if (del) $loading.remove();
        else if (fade) $loading.fadeOut('fast');
        else $loading.hide();
        $(elem).removeClass('page-no-scroll');
    };

    /** 缓存临时数据 */
    admin.putTempData = function (key, value, local) {
        var tableName = local ? setter.tableName : setter.tableName + '_tempData';
        if (value === undefined || value === null) {
            if (local) layui.data(tableName, {key: key, remove: true});
            else layui.sessionData(tableName, {key: key, remove: true});
        } else {
            if (local) layui.data(tableName, {key: key, value: value});
            else layui.sessionData(tableName, {key: key, value: value});
        }
    };

    /** 获取缓存临时数据 */
    admin.getTempData = function (key, local) {
        if (typeof key === 'boolean') {
            local = key;
            key   = undefined;
        }
        var tableName = local ? setter.tableName : setter.tableName + '_tempData';
        var tempData  = local ? layui.data(tableName) : layui.sessionData(tableName);
        if (!key) return tempData;
        return tempData ? tempData[key] : undefined;
    };

    /** 滑动选项卡 */
    admin.rollPage = function (d) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.rollPage(d);
        var $tabTitle = $(tabDOM + '>.layui-tab-title');
        var left      = $tabTitle.scrollLeft();
        if ('left' === d) {
            $tabTitle.animate({'scrollLeft': left - 120}, 100);
        } else if ('auto' === d) {
            var autoLeft = 0;
            $tabTitle.children("li").each(function () {
                if ($(this).hasClass('layui-this')) return false;
                else autoLeft += $(this).outerWidth();
            });
            $tabTitle.animate({'scrollLeft': autoLeft - 120}, 100);
        } else {
            $tabTitle.animate({'scrollLeft': left + 120}, 100);
        }
    };

    /** 刷新当前选项卡 */
    admin.refresh = function (url, isIndex) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.refresh(url);
        var $iframe;
        if (!url) {
            $iframe = $(tabDOM + '>.layui-tab-content>.layui-tab-item.layui-show>.admin-iframe');
            if (!$iframe || $iframe.length <= 0) $iframe = $(bodyDOM + '>div>.admin-iframe');
        } else {
            $iframe = $(tabDOM + '>.layui-tab-content>.layui-tab-item>.admin-iframe[lay-id="' + url + '"]');
            if (!$iframe || $iframe.length <= 0) $iframe = $(bodyDOM + '>.admin-iframe');
        }
        if (!$iframe || !$iframe[0]) return console.warn(url + ' is not found');
        try {
            if (isIndex && $iframe[0].contentWindow.refreshTab) {
                $iframe[0].contentWindow.refreshTab();
            } else {
                admin.showLoading({elem: $iframe.parent(), size: ''});
                $iframe[0].contentWindow.location.reload();
            }
        } catch (e) {
            console.warn(e);
            $iframe.attr('src', $iframe.attr('src'));
        }
    };

    /** 关闭当前选项卡 */
    admin.closeThisTabs = function (url) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.closeThisTabs(url);
        admin.closeTabOperNav();
        var $title = $(tabDOM + '>.layui-tab-title');
        if (!url) {
            if ($title.find('li').first().hasClass('layui-this')) return layer.msg('主页不能关闭', {icon: 2});
            $title.find('li.layui-this').find('.layui-tab-close').trigger('click');
        } else {
            if (url === $title.find('li').first().attr('lay-id')) return layer.msg('主页不能关闭', {icon: 2});
            $title.find('li[lay-id="' + url + '"]').find('.layui-tab-close').trigger('click');
        }
    };

    /** 关闭其他选项卡 */
    admin.closeOtherTabs = function (url) {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.closeOtherTabs(url);
        if (!url) {
            $(tabDOM + '>.layui-tab-title li:gt(0):not(.layui-this)').find('.layui-tab-close').trigger('click');
        } else {
            $(tabDOM + '>.layui-tab-title li:gt(0)').each(function () {
                if (url !== $(this).attr('lay-id')) $(this).find('.layui-tab-close').trigger('click');
            });
        }
        admin.closeTabOperNav();
    };

    /** 关闭所有选项卡 */
    admin.closeAllTabs = function () {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.closeAllTabs();
        $(tabDOM + '>.layui-tab-title li:gt(0)').find('.layui-tab-close').trigger('click');
        $(tabDOM + '>.layui-tab-title li:eq(0)').trigger('click');
        admin.closeTabOperNav();
    };

    /** 关闭选项卡操作菜单 */
    admin.closeTabOperNav = function () {
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.closeTabOperNav();
        $('.layui-icon-down .layui-nav .layui-nav-child').removeClass('layui-show');
    };

    /** 设置主题 */
    admin.changeTheme = function (theme, win, noCache, noChild) {
        if (!noCache) admin.putSetting('defaultTheme', theme);
        if (!win) win = top;
        admin.removeTheme(win);
        if (theme) {
            try {
                var $body = win.layui.jquery('body');
                $body.addClass(theme);
                $body.data('theme', theme);
                admin.addCookie('_uit',theme)
            } catch (e) {
            }
        }
        if (noChild) return;
        var ifs = win.frames;
        for (var i = 0; i < ifs.length; i++) admin.changeTheme(theme, ifs[i], true, false);
    };

    /** 移除主题 */
    admin.removeTheme = function (w) {
        if (!w) w = window;
        try {
            var $body = w.layui.jquery('body');
            var theme = $body.data('theme');
            if (theme) $body.removeClass(theme);
            $body.removeData('theme');
        } catch (e) {
        }
        admin.addCookie('_uit','')
    };

    /** 关闭当前iframe层弹窗 */
    admin.closeThisDialog = function () {
        return admin.closeDialog();
    };

    /** 关闭elem所在的页面层弹窗 */
    admin.closeDialog = function (elem) {
        if (elem) layer.close(admin.getLayerIndex(elem));
        else parent.layer.close(parent.layer.getFrameIndex(window.name));
    };

    /** 获取页面层弹窗的index */
    admin.getLayerIndex = function (elem) {
        if (!elem) return parent.layer.getFrameIndex(window.name);
        var id = $(elem).parents('.layui-layer').first().attr('id');
        if (id && id.length >= 11) return id.substring(11);
    };

    /** 让当前的iframe弹层自适应高度 */
    admin.iframeAuto = function () {
        return parent.layer.iframeAuto(parent.layer.getFrameIndex(window.name));
    };

    /** 获取浏览器高度 */
    admin.getPageHeight = function () {
        return document.documentElement.clientHeight || document.body.clientHeight;
    };

    /** 获取浏览器宽度 */
    admin.getPageWidth = function () {
        return document.documentElement.clientWidth || document.body.clientWidth;
    };

    /** 绑定表单弹窗 */
    admin.modelForm = function (layero, btnFilter, formFilter) {
        var $layero = $(layero);
        $layero.addClass('layui-form');
        if (formFilter) $layero.attr('lay-filter', formFilter);
        // 确定按钮绑定submit
        var $btnSubmit = $layero.find('.layui-layer-btn .layui-layer-btn0');
        $btnSubmit.attr('lay-submit', '');
        $btnSubmit.attr('lay-filter', btnFilter);
    };

    /** loading按钮 */
    admin.btnLoading = function (elem, text, loading) {
        if (text !== undefined && (typeof text === 'boolean')) {
            loading = text;
            text    = undefined;
        }
        if (text === undefined) text = '&nbsp;加载中';
        if (loading === undefined) loading = true;
        var $elem = $(elem);
        if (loading) {
            $elem.addClass('ew-btn-loading');
            $elem.prepend('<span class="ew-btn-loading-text"><i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>' + text + '</span>');
            $elem.attr('disabled', 'disabled').prop('disabled', true);
        } else {
            $elem.removeClass('ew-btn-loading');
            $elem.children('.ew-btn-loading-text').remove();
            $elem.removeProp('disabled').removeAttr('disabled');
        }
    };

    /** 鼠标移入侧边栏自动展开 */
    admin.openSideAutoExpand = function () {
        var $side = $('.layui-layout-admin>.layui-side');
        $side.off('mouseenter.openSideAutoExpand').on("mouseenter.openSideAutoExpand", function () {
            if (!$(this).parent().hasClass('admin-nav-mini')) return;
            admin.flexible(true);
            $(this).addClass('side-mini-hover');
        });
        $side.off('mouseleave.openSideAutoExpand').on("mouseleave.openSideAutoExpand", function () {
            if (!$(this).hasClass('side-mini-hover')) return;
            admin.flexible(false);
            $(this).removeClass('side-mini-hover');
        });
    };

    /** 表格单元格超出内容自动展开 */
    admin.openCellAutoExpand = function () {
        var $body = $('body');
        $body.off('mouseenter.openCellAutoExpand').on('mouseenter.openCellAutoExpand', '.layui-table-view td', function () {
            $(this).find('.layui-table-grid-down').trigger('click');
        });
        $body.off('mouseleave.openCellAutoExpand').on('mouseleave.openCellAutoExpand', '.layui-table-tips>.layui-layer-content', function () {
            $('.layui-table-tips-c').trigger('click');
        });
    };

    /** open事件解析layer参数 */
    admin.parseLayerOption = function (option) {
        // 数组类型进行转换
        for (var f in option) {
            if (!option.hasOwnProperty(f)) continue;
            if (option[f] && option[f].toString().indexOf(',') !== -1) option[f] = option[f].toString().split(',');
        }
        // function类型参数转换
        var fs = {'success': 'layero,index', 'cancel': 'index,layero', 'end': '', 'full': '', 'min': '', 'restore': ''};
        for (var k in fs) {
            if (!fs.hasOwnProperty(k) || !option[k]) continue;
            try {
                if (/^[a-zA-Z_]+[a-zA-Z0-9_]+$/.test(option[k])) option[k] += '()';
                option[k] = new Function(fs[k], option[k]);
            } catch (e) {
                option[k] = undefined;
            }
        }
        // content取内容
        if (option.content && (typeof option.content === 'string') && option.content.indexOf('#') === 0) {
            if ($(option.content).is('script')) option.content = $(option.content).html();
            else option.content = $(option.content);
        }
        if (option.type === undefined && option.url === undefined) option.type = 2;  // 默认为iframe类型
        return option;
    };

    /** 字符串形式的parent.parent转window对象 */
    admin.strToWin = function (str) {
        var win = window;
        if (!str) return win;
        var ws = str.split('.');
        for (var i = 0; i < ws.length; i++) win = win[ws[i]];
        return win;
    };

    /** 解决折叠侧边栏表格滚动条闪现 */
    admin.hideTableScrollBar = function (win) {
        if (admin.getPageWidth() <= 768) return;
        if (!win) {
            var $iframe = $(tabDOM + '>.layui-tab-content>.layui-tab-item.layui-show>.admin-iframe');
            if ($iframe.length <= 0) $iframe = $(bodyDOM + '>div>.admin-iframe');
            if ($iframe.length > 0) win = $iframe[0].contentWindow;
        }
        try {  // 可能会跨域
            if (window.hsbTimer) clearTimeout(window.hsbTimer);
            win.layui.jquery('.layui-table-body.layui-table-main').addClass('no-scrollbar');
            window.hsbTimer = setTimeout(function () {
                win.layui.jquery('.layui-table-body.layui-table-main').removeClass('no-scrollbar');
            }, 800);
        } catch (e) {
        }
    };

    /** 判断是否是主框架 */
    admin.isTop = function () {
        return $(bodyDOM).length > 0;
    };

    /** admin提供的事件 */
    admin.events = {
        /* 折叠侧导航 */
        flexible: function () {
            admin.strToWin($(this).data('window')).layui.admin.flexible();
        },
        /* 刷新主体部分 */
        refresh: function () {
            admin.strToWin($(this).data('window')).layui.admin.refresh();
        },
        /* 后退 */
        back: function () {
            admin.strToWin($(this).data('window')).history.back();
        },
        /* 设置主题 */
        theme: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.popupRight($.extend({
                id: 'layer-theme', url: option.url || 'page/tpl/tpl-theme.html'
            }, admin.parseLayerOption(option)));
        },
        /* 打开便签 */
        note: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.popupRight($.extend({
                id: 'layer-note', url: option.url || 'page/tpl/tpl-note.html'
            }, admin.parseLayerOption(option)));
        },
        /* 打开消息 */
        message: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.popupRight($.extend({
                id: 'layer-notice', url: option.url || 'page/tpl/tpl-message.html'
            }, admin.parseLayerOption(option)));
        },
        /* 打开修改密码弹窗 */
        psw: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.open($.extend({
                id: 'layer-psw', title: '修改密码', shade: 0, url: option.url || 'page/tpl/tpl-password.html'
            }, admin.parseLayerOption(option)));
        },
        /* 退出登录 */
        logout: function () {
            var option = admin.util.deepClone($(this).data());

            function doLogout() {
                if (option.ajax) {
                    var loadIndex = layer.load(2);
                    admin.req(option.ajax, function (res) {
                        layer.close(loadIndex);
                        if (option.parseData) {
                            try {
                                var parseData = new Function('res', option.parseData);
                                res           = parseData(res);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        if (res.code == (option.code || 0)) {
                            setter.removeToken && setter.removeToken();
                            location.replace(option.url || '/');
                        } else {
                            layer.msg(res.msg, {icon: 2});
                        }
                    }, option.method || 'delete');
                } else {
                    setter.removeToken && setter.removeToken();
                    location.replace(option.url || '/');
                }
            }

            if (false === option.confirm || 'false' === option.confirm) return doLogout();
            admin.strToWin(option.window).layui.layer.confirm(option.content || '确定要退出登录吗？', $.extend({
                title: '温馨提示', skin: 'layui-layer-admin', shade: .1
            }, admin.parseLayerOption(option)), function () {
                doLogout();
            });
        },
        /* 打开弹窗 */
        open: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.open(admin.parseLayerOption(option));
        },
        /* 打开右侧弹窗 */
        popupRight: function () {
            var option = admin.util.deepClone($(this).data());
            admin.strToWin(option.window).layui.admin.popupRight(admin.parseLayerOption(option));
        },
        /* 全屏 */
        fullScreen: function () {
            var ac           = 'layui-icon-screen-full', ic = 'layui-icon-screen-restore';
            var $ti          = $(this).find('i');
            var isFullscreen = document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || false;
            if (isFullscreen) {
                var efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (efs) {
                    efs.call(document);
                } else if (window.ActiveXObject) {
                    var ws = new ActiveXObject('WScript.Shell');
                    ws && ws.SendKeys('{F11}');
                }
                $ti.addClass(ac).removeClass(ic);
            } else {
                var el  = document.documentElement;
                var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (rfs) {
                    rfs.call(el);
                } else if (window.ActiveXObject) {
                    var wss = new ActiveXObject('WScript.Shell');
                    wss && wss.SendKeys('{F11}');
                }
                $ti.addClass(ic).removeClass(ac);
            }
        },
        /* 左滑动tab */
        leftPage: function () {
            admin.strToWin($(this).data('window')).layui.admin.rollPage('left');
        },
        /* 右滑动tab */
        rightPage: function () {
            admin.strToWin($(this).data('window')).layui.admin.rollPage();
        },
        /* 关闭当前选项卡 */
        closeThisTabs: function () {
            var url = $(this).data('url');
            admin.strToWin($(this).data('window')).layui.admin.closeThisTabs(url);
        },
        /* 关闭其他选项卡 */
        closeOtherTabs: function () {
            admin.strToWin($(this).data('window')).layui.admin.closeOtherTabs();
        },
        /* 关闭所有选项卡 */
        closeAllTabs: function () {
            admin.strToWin($(this).data('window')).layui.admin.closeAllTabs();
        },
        /* 关闭当前弹窗(智能) */
        closeDialog: function () {
            if ($(this).parents('.layui-layer').length > 0) admin.closeDialog(this);
            else admin.closeDialog();
        },
        /* 关闭当前iframe弹窗 */
        closeIframeDialog: function () {
            admin.closeDialog();
        },
        /* 关闭当前页面层弹窗 */
        closePageDialog: function () {
            admin.closeDialog(this);
        },
        /* 锁屏 */
        lockScreen: function () {
            admin.strToWin($(this).data('window')).layui.admin.lockScreen($(this).data('url'));
        }
    };

    /** 选择位置 */
    admin.chooseLocation = function (param) {
        var dialogTitle    = param.title;  // 弹窗标题
        var onSelect       = param.onSelect;  // 选择回调
        var needCity       = param.needCity;  // 是否返回行政区
        var mapCenter      = param.center;  // 地图中心
        var defaultZoom    = param.defaultZoom;  // 地图默认缩放级别
        var pointZoom      = param.pointZoom;  // 选中时地图缩放级别
        var searchKeywords = param.keywords;  // poi检索关键字
        var searchPageSize = param.pageSize;  // poi检索最大数量
        var mapJsUrl       = param.mapJsUrl;  // 高德地图js的url
        if (dialogTitle === undefined) dialogTitle = '选择位置';
        if (defaultZoom === undefined) defaultZoom = 11;
        if (pointZoom === undefined) pointZoom = 17;
        if (searchKeywords === undefined) searchKeywords = '';
        if (searchPageSize === undefined) searchPageSize = 30;
        if (mapJsUrl === undefined) mapJsUrl = 'https://webapi.amap.com/maps?v=1.4.14&key=006d995d433058322319fa797f2876f5';
        var isSelMove    = false, selLocation;
        // 搜索附近
        var searchNearBy = function (lat, lng) {
            AMap.service(['AMap.PlaceSearch'], function () {
                var placeSearch = new AMap.PlaceSearch({
                    type: '', pageSize: searchPageSize, pageIndex: 1
                });
                var cpoint      = [lng, lat];
                placeSearch.searchNearBy(searchKeywords, cpoint, 1000, function (status, result) {
                    if (status === 'complete') {
                        var pois     = result.poiList.pois;
                        var htmlList = '';
                        for (var i = 0; i < pois.length; i++) {
                            var poiItem = pois[i];
                            if (poiItem.location !== undefined) {
                                htmlList += '<div data-lng="' + poiItem.location.lng + '" data-lat="' + poiItem.location.lat + '" class="ew-map-select-search-list-item">';
                                htmlList += '     <div class="ew-map-select-search-list-item-title">' + poiItem.name + '</div>';
                                htmlList += '     <div class="ew-map-select-search-list-item-address">' + poiItem.address + '</div>';
                                htmlList += '     <div class="ew-map-select-search-list-item-icon-ok layui-hide"><i class="layui-icon layui-icon-ok-circle"></i></div>';
                                htmlList += '</div>';
                            }
                        }
                        $('#ew-map-select-pois').html(htmlList);
                    }
                });
            });
        };
        // 渲染地图
        var renderMap    = function () {
            var mapOption = {
                resizeEnable: true, // 监控地图容器尺寸变化
                zoom        : defaultZoom  // 初缩放级别
            };
            mapCenter && (mapOption.center = mapCenter);
            var map = new AMap.Map('ew-map-select-map', mapOption);
            // 地图加载完成
            map.on('complete', function () {
                var center = map.getCenter();
                searchNearBy(center.lat, center.lng);
            });
            // 地图移动结束事件
            map.on('moveend', function () {
                if (isSelMove) {
                    isSelMove = false;
                } else {
                    $('#ew-map-select-tips').addClass('layui-hide');
                    $('#ew-map-select-center-img').removeClass('bounceInDown');
                    setTimeout(function () {
                        $('#ew-map-select-center-img').addClass('bounceInDown');
                    });
                    var center = map.getCenter();
                    searchNearBy(center.lat, center.lng);
                }
            });
            // poi列表点击事件
            $('#ew-map-select-pois').off('click').on('click', '.ew-map-select-search-list-item', function () {
                $('#ew-map-select-tips').addClass('layui-hide');
                $('#ew-map-select-pois .ew-map-select-search-list-item-icon-ok').addClass('layui-hide');
                $(this).find('.ew-map-select-search-list-item-icon-ok').removeClass('layui-hide');
                $('#ew-map-select-center-img').removeClass('bounceInDown');
                setTimeout(function () {
                    $('#ew-map-select-center-img').addClass('bounceInDown');
                });
                var lng     = $(this).data('lng');
                var lat     = $(this).data('lat');
                var name    = $(this).find('.ew-map-select-search-list-item-title').text();
                var address = $(this).find('.ew-map-select-search-list-item-address').text();
                selLocation = {name: name, address: address, lat: lat, lng: lng};
                isSelMove   = true;
                map.setZoomAndCenter(pointZoom, [lng, lat]);
            });
            // 确定按钮点击事件
            $('#ew-map-select-btn-ok').click(function () {
                if (selLocation === undefined) {
                    layer.msg('请点击位置列表选择', {icon: 2, anim: 6});
                } else if (onSelect) {
                    if (needCity) {
                        var loadIndex = layer.load(2);
                        map.setCenter([selLocation.lng, selLocation.lat]);
                        map.getCity(function (result) {
                            layer.close(loadIndex);
                            selLocation.city = result;
                            admin.closeDialog('#ew-map-select-btn-ok');
                            onSelect(selLocation);
                        });
                    } else {
                        admin.closeDialog('#ew-map-select-btn-ok');
                        onSelect(selLocation);
                    }
                } else {
                    admin.closeDialog('#ew-map-select-btn-ok');
                }
            });
            // 搜索提示
            var $inputSearch = $('#ew-map-select-input-search');
            $inputSearch.off('input').on('input', function () {
                var keywords    = $(this).val();
                var $selectTips = $('#ew-map-select-tips');
                if (!keywords) {
                    $selectTips.html('');
                    $selectTips.addClass('layui-hide');
                }
                AMap.plugin('AMap.Autocomplete', function () {
                    var autoComplete = new AMap.Autocomplete({city: '全国'});
                    autoComplete.search(keywords, function (status, result) {
                        if (result.tips) {
                            var tips     = result.tips;
                            var htmlList = '';
                            for (var i = 0; i < tips.length; i++) {
                                var tipItem = tips[i];
                                if (tipItem.location !== undefined) {
                                    htmlList += '<div data-lng="' + tipItem.location.lng + '" data-lat="' + tipItem.location.lat + '" class="ew-map-select-search-list-item">';
                                    htmlList += '     <div class="ew-map-select-search-list-item-icon-search"><i class="layui-icon layui-icon-search"></i></div>';
                                    htmlList += '     <div class="ew-map-select-search-list-item-title">' + tipItem.name + '</div>';
                                    htmlList += '     <div class="ew-map-select-search-list-item-address">' + tipItem.address + '</div>';
                                    htmlList += '</div>';
                                }
                            }
                            $selectTips.html(htmlList);
                            if (tips.length === 0) $('#ew-map-select-tips').addClass('layui-hide');
                            else $('#ew-map-select-tips').removeClass('layui-hide');
                        } else {
                            $selectTips.html('');
                            $selectTips.addClass('layui-hide');
                        }
                    });
                });
            });
            $inputSearch.off('blur').on('blur', function () {
                var keywords    = $(this).val();
                var $selectTips = $('#ew-map-select-tips');
                if (!keywords) {
                    $selectTips.html('');
                    $selectTips.addClass('layui-hide');
                }
            });
            $inputSearch.off('focus').on('focus', function () {
                var keywords = $(this).val();
                if (keywords) $('#ew-map-select-tips').removeClass('layui-hide');
            });
            // tips列表点击事件
            $('#ew-map-select-tips').off('click').on('click', '.ew-map-select-search-list-item', function () {
                $('#ew-map-select-tips').addClass('layui-hide');
                var lng     = $(this).data('lng');
                var lat     = $(this).data('lat');
                selLocation = undefined;
                map.setZoomAndCenter(pointZoom, [lng, lat]);
            });
        };
        // 显示弹窗
        var htmlStr      = [
            '<div class="ew-map-select-tool" style="position: relative;">',
            '     搜索：<input id="ew-map-select-input-search" class="layui-input icon-search inline-block" style="width: 190px;" placeholder="输入关键字搜索" autocomplete="off" />',
            '     <button id="ew-map-select-btn-ok" class="layui-btn icon-btn pull-right" type="button"><i class="layui-icon">&#xe605;</i>确定</button>',
            '     <div id="ew-map-select-tips" class="ew-map-select-search-list layui-hide">',
            '     </div>',
            '</div>',
            '<div class="layui-row ew-map-select">',
            '     <div class="layui-col-sm7 ew-map-select-map-group" style="position: relative;">',
            '          <div id="ew-map-select-map"></div>',
            '          <i id="ew-map-select-center-img2" class="layui-icon layui-icon-add-1"></i>',
            '          <img id="ew-map-select-center-img" src="https://3gimg.qq.com/lightmap/components/locationPicker2/image/marker.png" alt=""/>',
            '     </div>',
            '     <div id="ew-map-select-pois" class="layui-col-sm5 ew-map-select-search-list">',
            '     </div>',
            '</div>'].join('');
        admin.open({
            id     : 'ew-map-select', type: 1, title: dialogTitle, area: '750px', content: htmlStr,
            success: function (layero, dIndex) {
                var $content = $(layero).children('.layui-layer-content');
                $content.css('overflow', 'visible');
                admin.showLoading($content);
                if (undefined === window.AMap) {
                    $.getScript(mapJsUrl, function () {
                        renderMap();
                        admin.removeLoading($content);
                    });
                } else {
                    renderMap();
                    admin.removeLoading($content);
                }
            }
        });
    };

    /** 裁剪图片 */
    admin.cropImg = function (param) {
        var uploadedImageType = 'image/jpeg';  // 当前图片的类型
        var aspectRatio       = param.aspectRatio;  // 裁剪比例
        var imgSrc            = param.imgSrc;  // 裁剪图片
        var imgType           = param.imgType;  // 图片类型
        var onCrop            = param.onCrop;  // 裁剪完成回调
        var limitSize         = param.limitSize;  // 限制选择的图片大小
        var acceptMime        = param.acceptMime;  // 限制选择的图片类型
        var imgExts           = param.exts;  // 限制选择的图片类型
        var dialogTitle       = param.title;  // 弹窗的标题
        if (aspectRatio === undefined) aspectRatio = 1;
        if (dialogTitle === undefined) dialogTitle = '裁剪图片';
        if (imgType) uploadedImageType = imgType;
        layui.use(['Cropper', 'upload'], function () {
            var Cropper = layui.Cropper, upload = layui.upload;

            // 渲染组件
            function renderElem() {
                var imgCropper, $cropImg = $('#ew-crop-img');
                // 上传文件按钮绑定事件
                var uploadOptions        = {
                    elem  : '#ew-crop-img-upload', auto: false, drag: false,
                    choose: function (obj) {
                        obj.preview(function (index, file, result) {
                            uploadedImageType = file.type;
                            $cropImg.attr('src', result);
                            if (!imgSrc || !imgCropper) {
                                imgSrc = result;
                                renderElem();
                            } else {
                                imgCropper.destroy();
                                imgCropper = new Cropper($cropImg[0], options);
                            }
                        });
                    }
                };
                if (limitSize !== undefined) uploadOptions.size = limitSize;
                if (acceptMime !== undefined) uploadOptions.acceptMime = acceptMime;
                if (imgExts !== undefined) uploadOptions.exts = imgExts;
                upload.render(uploadOptions);
                // 没有传图片触发上传图片
                if (!imgSrc) return $('#ew-crop-img-upload').trigger('click');
                // 渲染裁剪组件
                var options = {aspectRatio: aspectRatio, preview: '#ew-crop-img-preview'};
                imgCropper  = new Cropper($cropImg[0], options);
                // 操作按钮绑定事件
                $('.ew-crop-tool').on('click', '[data-method]', function () {
                    var data = $(this).data(), cropped, result;
                    if (!imgCropper || !data.method) return;
                    data    = $.extend({}, data);
                    cropped = imgCropper.cropped;
                    switch (data.method) {
                        case 'rotate':
                            if (cropped && options.viewMode > 0) imgCropper.clear();
                            break;
                        case 'getCroppedCanvas':
                            if (uploadedImageType === 'image/jpeg') {
                                if (!data.option) data.option = {};
                                data.option.fillColor = '#FFF';
                            }
                            break;
                    }
                    result = imgCropper[data.method](data.option, data.secondOption);
                    switch (data.method) {
                        case 'rotate':
                            if (cropped && options.viewMode > 0) imgCropper.crop();
                            break;
                        case 'scaleX':
                        case 'scaleY':
                            $(this).data('option', -data.option);
                            break;
                        case 'getCroppedCanvas':
                            if (result) {
                                onCrop && onCrop(result.toDataURL(uploadedImageType));
                                admin.closeDialog('#ew-crop-img');
                            } else {
                                layer.msg('裁剪失败', {icon: 2, anim: 6});
                            }
                            break;
                    }
                });
            }

            // 显示弹窗
            var htmlStr = [
                '<div class="layui-row">',
                '     <div class="layui-col-sm8" style="min-height: 9rem;">',
                '          <img id="ew-crop-img" src="', imgSrc || '', '" style="max-width:100%;" alt=""/>',
                '     </div>',
                '     <div class="layui-col-sm4 layui-hide-xs" style="padding: 15px;text-align: center;">',
                '          <div id="ew-crop-img-preview" style="width: 100%;height: 9rem;overflow: hidden;display: inline-block;border: 1px solid #dddddd;"></div>',
                '     </div>',
                '</div>',
                '<div class="text-center ew-crop-tool" style="padding: 15px 10px 5px 0;">',
                '     <div class="layui-btn-group" style="margin-bottom: 10px;margin-left: 10px;">',
                '          <button title="放大" data-method="zoom" data-option="0.1" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-add-1"></i></button>',
                '          <button title="缩小" data-method="zoom" data-option="-0.1" class="layui-btn icon-btn" type="button"><span style="display: inline-block;width: 12px;height: 2.5px;background: rgba(255, 255, 255, 0.9);vertical-align: middle;margin: 0 4px;"></span></button>',
                '     </div>',
                '     <div class="layui-btn-group layui-hide-xs" style="margin-bottom: 10px;">',
                '          <button title="向左旋转" data-method="rotate" data-option="-45" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh-1" style="transform: rotateY(180deg) rotate(40deg);display: inline-block;"></i></button>',
                '          <button title="向右旋转" data-method="rotate" data-option="45" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh-1" style="transform: rotate(30deg);display: inline-block;"></i></button>',
                '     </div>',
                '     <div class="layui-btn-group" style="margin-bottom: 10px;">',
                '          <button title="左移" data-method="move" data-option="-10" data-second-option="0" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-left"></i></button>',
                '          <button title="右移" data-method="move" data-option="10" data-second-option="0" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-right"></i></button>',
                '          <button title="上移" data-method="move" data-option="0" data-second-option="-10" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-up"></i></button>',
                '          <button title="下移" data-method="move" data-option="0" data-second-option="10" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-down"></i></button>',
                '     </div>',
                '     <div class="layui-btn-group" style="margin-bottom: 10px;">',
                '          <button title="左右翻转" data-method="scaleX" data-option="-1" class="layui-btn icon-btn" type="button" style="position: relative;width: 41px;"><i class="layui-icon layui-icon-triangle-r" style="position: absolute;left: 9px;top: 0;transform: rotateY(180deg);font-size: 16px;"></i><i class="layui-icon layui-icon-triangle-r" style="position: absolute; right: 3px; top: 0;font-size: 16px;"></i></button>',
                '          <button title="上下翻转" data-method="scaleY" data-option="-1" class="layui-btn icon-btn" type="button" style="position: relative;width: 41px;"><i class="layui-icon layui-icon-triangle-d" style="position: absolute;left: 11px;top: 6px;transform: rotateX(180deg);line-height: normal;font-size: 16px;"></i><i class="layui-icon layui-icon-triangle-d" style="position: absolute; left: 11px; top: 14px;line-height: normal;font-size: 16px;"></i></button>',
                '     </div>',
                '     <div class="layui-btn-group" style="margin-bottom: 10px;">',
                '          <button title="重新开始" data-method="reset" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh"></i></button>',
                '          <button title="选择图片" id="ew-crop-img-upload" class="layui-btn icon-btn" type="button" style="border-radius: 0 2px 2px 0;"><i class="layui-icon layui-icon-upload-drag"></i></button>',
                '     </div>',
                '     <button data-method="getCroppedCanvas" data-option="{ &quot;maxWidth&quot;: 4096, &quot;maxHeight&quot;: 4096 }" class="layui-btn icon-btn" type="button" style="margin-left: 10px;margin-bottom: 10px;"><i class="layui-icon">&#xe605;</i>完成</button>',
                '</div>'].join('');
            admin.open({
                title  : dialogTitle, area: '665px', type: 1, content: htmlStr,
                success: function (layero, dIndex) {
                    $(layero).children('.layui-layer-content').css('overflow', 'visible');
                    renderElem();
                }
            });
        });
    };

    /** 工具类 */
    admin.util = {
        format: function (source, params) {
            if (arguments.length === 1) {
                return function () {
                    let args = $.makeArray(arguments);
                    args.unshift(source);
                    return admin.util.format(args);
                };
            }
            if (params === undefined) {
                return source;
            }
            if (arguments.length > 2 && params.constructor !== Array) {
                params = $.makeArray(arguments).slice(1);
            }
            if (params.constructor !== Array) {
                params = [params];
            }
            $.each(params, function (i, n) {
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                    return n;
                });
            });
            return source;
        },
        /* 百度地图坐标转高德地图坐标 */
        Convert_BD09_To_GCJ02: function (point) {
            var x_pi  = (3.14159265358979324 * 3000.0) / 180.0;
            var x     = point.lng - 0.0065, y = point.lat - 0.006;
            var z     = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
            return {lng: z * Math.cos(theta), lat: z * Math.sin(theta)};
        },
        /* 高德地图坐标转百度地图坐标 */
        Convert_GCJ02_To_BD09: function (point) {
            var x_pi  = (3.14159265358979324 * 3000.0) / 180.0;
            var x     = point.lng, y = point.lat;
            var z     = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
            return {lng: z * Math.cos(theta) + 0.0065, lat: z * Math.sin(theta) + 0.006};
        },
        /* 动态数字 */
        animateNum: function (elem, isThd, delay, grain) {
            isThd       = isThd === null || isThd === undefined || isThd === true || isThd === 'true';  // 是否是千分位
            delay       = isNaN(delay) ? 500 : delay;   // 动画延迟
            grain       = isNaN(grain) ? 100 : grain;   // 动画粒度
            var getPref = function (str) {
                var pref = '';
                for (var i = 0; i < str.length; i++) if (!isNaN(str.charAt(i))) return pref; else pref += str.charAt(i);
            }, getSuf   = function (str) {
                var suf = '';
                for (var i = str.length - 1; i >= 0; i--) if (!isNaN(str.charAt(i))) return suf; else suf = str.charAt(i) + suf;
            }, toThd    = function (num, isThd) {
                if (!isThd) return num;
                if (!/^[0-9]+.?[0-9]*$/.test(num)) return num;
                num = num.toString();
                return num.replace(num.indexOf('.') > 0 ? /(\d)(?=(\d{3})+(?:\.))/g : /(\d)(?=(\d{3})+(?:$))/g, '$1,');
            };
            $(elem).each(function () {
                var $this = $(this);
                var num   = $this.data('num');
                if (!num) {
                    num = $this.text().replace(/,/g, '');  // 内容
                    $this.data('num', num);
                }
                var flag   = 'INPUT,TEXTAREA'.indexOf($this.get(0).tagName) >= 0;  // 是否是输入框
                var pref   = getPref(num.toString()), suf = getSuf(num.toString());
                var strNum = num.toString().replace(pref, '').replace(suf, '');
                if (isNaN(strNum * 1) || strNum === '0') {
                    flag ? $this.val(num) : $this.html(num);
                    return console.error('not a number');
                }
                var int_dec  = strNum.split('.');
                var deciLen  = int_dec[1] ? int_dec[1].length : 0;
                var startNum = 0.0, endNum = strNum;
                if (Math.abs(endNum * 1) > 10) startNum = parseFloat(int_dec[0].substring(0, int_dec[0].length - 1) + (int_dec[1] ? '.0' + int_dec[1] : ''));
                var oft   = (endNum - startNum) / grain, temp = 0;
                var mTime = setInterval(function () {
                    var str = pref + toThd(startNum.toFixed(deciLen), isThd) + suf;
                    flag ? $this.val(str) : $this.html(str);
                    startNum += oft;
                    temp++;
                    if (Math.abs(startNum) >= Math.abs(endNum * 1) || temp > 5000) {
                        str = pref + toThd(endNum, isThd) + suf;
                        flag ? $this.val(str) : $this.html(str);
                        clearInterval(mTime);
                    }
                }, delay / grain);
            });
        },
        /* 深度克隆对象 */
        deepClone: function (obj) {
            var result;
            var oClass = admin.util.isClass(obj);
            if (oClass === 'Object') result = {};
            else if (oClass === 'Array') result = [];
            else return obj;
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                var copy = obj[key], cClass = admin.util.isClass(copy);
                if (cClass === 'Object') result[key] = arguments.callee(copy); // 递归调用
                else if (cClass === 'Array') result[key] = arguments.callee(copy);
                else result[key] = obj[key];
            }
            return result;
        },
        /* 获取变量类型 */
        isClass: function (o) {
            if (o === null) return 'Null';
            if (o === undefined) return 'Undefined';
            return Object.prototype.toString.call(o).slice(8, -1);
        },
        /* 判断富文本是否为空 */
        fullTextIsEmpty: function (text) {
            if (!text) return true;
            var noTexts = ['img', 'audio', 'video', 'iframe', 'object'];
            for (var i = 0; i < noTexts.length; i++) {
                if (text.indexOf('<' + noTexts[i]) > -1) return false;
            }
            var str = text.replace(/\s*/g, '');  // 去掉所有空格
            if (!str) return true;
            str = str.replace(/&nbsp;/ig, '');  // 去掉所有&nbsp;
            if (!str) return true;
            str = str.replace(/<[^>]+>/g, '');   // 去掉所有html标签
            return !str;
        },
        /* 移除元素的style */
        removeStyle: function (elem, names) {
            if (typeof names === 'string') names = [names];
            for (var i = 0; i < names.length; i++) $(elem).css(names[i], '');
        },
        /* 滚动到顶部 */
        scrollTop: function (elem) {
            $(elem || 'html,body').animate({scrollTop: 0}, 300);
        },
        /* 模板解析 */
        tpl: function (html, data, openCode, closeCode) {
            if (html === undefined || html === null || typeof html !== 'string') return html;
            if (!data) data = {};
            if (!openCode) openCode = '{{';
            if (!closeCode) closeCode = '}}';
            var tool = {
                exp: function (str) {
                    return new RegExp(str, 'g');
                },
                // 匹配满足规则内容
                query : function (type, _, __) {
                    var types = ['#([\\s\\S])+?', '([^{#}])*?'][type || 0];
                    return tool.exp((_ || '') + openCode + types + closeCode + (__ || ''));
                },
                escape: function (str) {
                    return String(str || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
                    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
                },
                error : function (e, tplog) {
                    console.error('Laytpl Error：' + e + '\n' + (tplog || ''));
                },
                parse : function (tpl, data) {
                    var tplog = tpl;
                    try {
                        var jss = tool.exp('^' + openCode + '#'), jsse = tool.exp(closeCode + '$');
                        tpl     = tpl.replace(tool.exp(openCode + '#'), openCode + '# ')
                        .replace(tool.exp(closeCode + '}'), '} ' + closeCode).replace(/\\/g, '\\\\')
                        // 不匹配指定区域的内容
                        .replace(tool.exp(openCode + '!(.+?)!' + closeCode), function (str) {
                            str = str.replace(tool.exp('^' + openCode + '!'), '')
                            .replace(tool.exp('!' + closeCode), '')
                            .replace(tool.exp(openCode + '|' + closeCode), function (tag) {
                                return tag.replace(/(.)/g, '\\$1')
                            });
                            return str
                        })
                        // 匹配JS规则内容
                        .replace(/(?="|')/g, '\\').replace(tool.query(), function (str) {
                            str = str.replace(jss, '').replace(jsse, '');
                            return '";' + str.replace(/\\/g, '') + ';view+="';
                        })
                        // 匹配普通字段
                        .replace(tool.query(1), function (str) {
                            var start = '"+(';
                            if (str.replace(/\s/g, '') === openCode + closeCode) return '';
                            str = str.replace(tool.exp(openCode + '|' + closeCode), '');
                            if (/^=/.test(str)) {
                                str   = str.replace(/^=/, '');
                                start = '"+_escape_(';
                            }
                            return start + str.replace(/\\/g, '') + ')+"';
                        })
                        // 换行符处理
                        .replace(/\r\n/g, '\\r\\n" + "').replace(/\n/g, '\\n" + "').replace(/\r/g, '\\r" + "');
                        tpl     = '"use strict";var view = "' + tpl + '";return view;';
                        tpl     = new Function('d, _escape_', tpl);
                        return tpl(data, tool.escape);
                    } catch (e) {
                        tool.error(e, tplog);
                        return tplog;
                    }
                }
            };
            return tool.parse(html, data);
        },
        /* 渲染动态模板 */
        render: function (option) {
            if (typeof option.url === 'string') {
                option.success = function (res) {
                    admin.util.render($.extend({}, option, {url: res}));
                };
                if (option.ajax === 'ajax') admin.ajax(option);
                else admin.req(option.url, option.where, option.success, option.method, option);
                return;
            }
            var html = admin.util.tpl(option.tpl, option.url,
                option.open || setter.tplOpen, option.close || setter.tplClose);
            $(option.elem).next('[ew-tpl-rs]').remove();
            $(option.elem).after(html);
            $(option.elem).next().attr('ew-tpl-rs', '');
            option.done && option.done(option.url);
        }
    };

    /** 锁屏功能 */
    admin.lockScreen = function (url) {
        if (window !== top) {
            top.location = url;
        } else {
            window.location = url;
        }
    };

    /** 解除锁屏 */
    admin.unlockScreen = function (url, data, isRemove) {
        var promise = $.Deferred()
        if (!url) {
            return promise;
        }
        if (window !== top && !admin.isTop() && top.layui && top.layui.admin) return top.layui.admin.unlockScreen(url, data, isRemove);
        var $lock = $('#ew-lock-screen-group');
        admin.ajax({
            url    : url,
            method : 'post',
            data   : data,
            success: function (data) {
                if (data && data.code === 200) {
                    promise.resolve();
                } else {
                    promise.reject(data);
                }
            }
        });
        return promise;
    };

    /** tips方法封装 */
    admin.tips = function (option) {
        return layer.tips(option.text, option.elem, {
            tips    : [option.direction || 1, option.bg || '#191A23'],
            tipsMore: option.tipsMore, time: option.time || -1,
            success : function (layero) {
                var $content = $(layero).children('.layui-layer-content');
                if (option.padding || option.padding === 0) $content.css('padding', option.padding);
                if (option.color) $content.css('color', option.color);
                if (option.bgImg) $content.css('background-image', option.bgImg).children('.layui-layer-TipsG').css('z-index', '-1');
                if (option.fontSize) $content.css('font-size', option.fontSize);
                if (!option.offset) return;
                var offset = option.offset.split(',');
                var top    = offset[0], left = offset.length > 1 ? offset[1] : undefined;
                if (top) $(layero).css('margin-top', top);
                if (left) $(layero).css('margin-left', left);
            }
        });
    };

    /** 渲染动态模板 */
    admin.renderTpl = function (elem) {
        if (!layui.admin) layui.admin = admin;

        // 解析数据
        function parseData(data) {
            if (!data) return;
            try {
                return new Function('return ' + data + ';')();
            } catch (e) {
                console.error(e + '\nlay-data: ' + data);
            }
        }

        $(elem || '[ew-tpl]').each(function () {
            var $this      = $(this);
            var option     = $(this).data();
            option.elem    = $this;
            option.tpl     = $this.html();
            option.url     = parseData($this.attr('ew-tpl'));
            option.headers = parseData(option.headers);
            option.where   = parseData(option.where);
            if (option.done) {
                try {
                    option.done = new Function('res', option.done);
                } catch (e) {
                    console.error(e + '\nlay-data:' + option.done);
                    option.done = undefined;
                }
            }
            admin.util.render(option);
        });
    };

    /** 修改配置信息 */
    admin.putSetting = function (key, value) {
        setter[key] = value;
        admin.putTempData(key, value, true);
    };

    /** 恢复配置信息 */
    admin.recoverState = function () {
        setter.recoverState(admin);
        // 恢复配置的主题
        if (setter.defaultTheme) admin.changeTheme(setter.defaultTheme, window, true, true);
        // 恢复页脚状态、导航箭头
        if (setter.closeFooter) $('body').addClass('close-footer');
        if (setter.navArrow !== undefined) {
            var $nav = $(sideDOM + '>.layui-nav-tree');
            $nav.removeClass('arrow2 arrow3');
            if (setter.navArrow) $nav.addClass(setter.navArrow);
        }
        // 恢复tab自动刷新
        if (setter.pageTabs && setter.tabAutoRefresh == 'true') $(tabDOM).attr('lay-autoRefresh', 'true');
    };

    /* 事件监听 */
    admin.on = function (events, callback) {
        return layui.onevent.call(this, 'admin', events, callback);
    };
    //写Cookie
    admin.addCookie = function (objName, objValue, objHours) {
        var str = objName + "=" + escape(objValue); //编码
        if (objHours > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失
            var date = new Date();
            var ms = objHours * 3600 * 1000;
            date.setTime(date.getTime() + ms);
            str += "; expires=" + date.toGMTString();
        }
        document.cookie = str;
    }

    //读Cookie
    admin.getCookie = function (objName) {//获取指定名称的cookie的值
        var arrStr = document.cookie.split("; ");
        for (var i = 0; i < arrStr.length; i++) {
            var temp = arrStr[i].split("=");
            if (temp[0] == objName) return unescape(temp[1]);  //解码
        }
        return "";
    }
    /** 侧导航折叠状态下鼠标经过无限悬浮效果 */
    var navItemDOM = '.layui-layout-admin.admin-nav-mini>.layui-side .layui-nav .layui-nav-item';
    $(document).on('mouseenter', navItemDOM + ',' + navItemDOM + ' .layui-nav-child>dd', function () {
        if (admin.getPageWidth() > 768) {
            var $that = $(this), $navChild = $that.find('>.layui-nav-child');
            if ($navChild.length > 0) {
                $that.addClass('admin-nav-hover');
                $navChild.css('left', $that.offset().left + $that.outerWidth());
                var top = $that.offset().top;
                if (top + $navChild.outerHeight() > admin.getPageHeight()) {
                    top = top - $navChild.outerHeight() + $that.outerHeight();
                    if (top < 60) top = 60;
                    $navChild.addClass('show-top');
                }
                $navChild.css('top', top);
                $navChild.addClass('ew-anim-drop-in');
            } else if ($that.hasClass('layui-nav-item')) {
                admin.tips({elem: $that, text: $that.find('cite').text(), direction: 2, offset: '12px'});
            }
        }
    }).on('mouseleave', navItemDOM + ',' + navItemDOM + ' .layui-nav-child>dd', function () {
        layer.closeAll('tips');
        var $this = $(this);
        $this.removeClass('admin-nav-hover');
        var $child = $this.find('>.layui-nav-child');
        $child.removeClass('show-top ew-anim-drop-in');
        $child.css({'left': 'auto', 'top': 'auto'});
    });

    /** 所有ew-event */
    $(document).on('click', '*[ew-event]', function () {
        var te = admin.events[$(this).attr('ew-event')];
        te && te.call(this, $(this));
    });

    /** 所有lay-tips处理 */
    $(document).on('mouseenter', '*[lay-tips]', function () {
        var $this = $(this);
        admin.tips({
            elem   : $this, text: $this.attr('lay-tips'), direction: $this.attr('lay-direction'),
            bg     : $this.attr('lay-bg'), offset: $this.attr('lay-offset'),
            padding: $this.attr('lay-padding'), color: $this.attr('lay-color'),
            bgImg  : $this.attr('lay-bgImg'), fontSize: $this.attr('lay-fontSize')
        });
    }).on('mouseleave', '*[lay-tips]', function () {
        layer.closeAll('tips');
    });

    /** 表单搜索展开更多 */
    $(document).on('click', '.form-search-expand,[search-expand]', function () {
        var $this  = $(this);
        var $form  = $this.parents('.layui-form').first();
        var expand = $this.data('expand');
        var change = $this.attr('search-expand');
        if (expand === undefined || expand === true) {
            expand = true;
            $this.data('expand', false);
            $this.html('收起 <i class="layui-icon layui-icon-up"></i>');
            var $elem = $form.find('.form-search-show-expand');
            $elem.attr('expand-show', '');
            $elem.removeClass('form-search-show-expand');
        } else {
            expand = false;
            $this.data('expand', true);
            $this.html('展开 <i class="layui-icon layui-icon-down"></i>');
            $form.find('[expand-show]').addClass('form-search-show-expand');
        }
        if (!change) return;
        new Function('d', change)({expand: expand, elem: $this});
    });

    /** select使用fixed定位显示 */
    $(document).on('click.ew-sel-fixed', '.ew-select-fixed .layui-form-select .layui-select-title', function () {
        var $this  = $(this), $dl = $this.parent().children('dl'), tTop = $this.offset().top;
        var tWidth = $this.outerWidth(), tHeight = $this.outerHeight(), scrollT = $(document).scrollTop();
        var dWidth = $dl.outerWidth(), dHeight = $dl.outerHeight();
        var top    = tTop + tHeight + 5 - scrollT, left = $this.offset().left;
        if (top + dHeight > admin.getPageHeight()) top = top - dHeight - tHeight - 10;
        if (left + dWidth > admin.getPageWidth()) left = left - dWidth + tWidth;
        $dl.css({'left': left, 'top': top, 'min-width': tWidth});
    });

    /** 用于滚动时关闭一些fixed的组件 */
    admin.hideFixedEl = function () {
        $('.ew-select-fixed .layui-form-select').removeClass('layui-form-selected layui-form-selectup');  // select
        $('body>.layui-laydate').remove();  // laydate
    };

    /** 垂直导航栏展开折叠增加过渡效果 */
    $(document).on('click', '.layui-nav-tree>.layui-nav-item a', function () {
        var $this = $(this), $child = $this.siblings('.layui-nav-child'), $parent = $this.parent();
        if ($child.length === 0) return;
        if ($parent.hasClass('admin-nav-hover')) return;
        if ($parent.hasClass('layui-nav-itemed')) {  // 因为layui会处理一遍所以这里状态是相反的
            $child.css('display', 'none').slideDown('fast', function () {
                $(this).css('display', '');
            });
        } else {
            $child.css('display', 'block').slideUp('fast', function () {
                $(this).css('display', '');
            });
        }
        if ($this.parents('.layui-nav').attr('lay-shrink') === '_all') {  // 手风琴效果
            var $siblings = $this.parent().siblings('.layui-nav-itemed');
            $siblings.children('.layui-nav-child').css('display', 'block').slideUp('fast', function () {
                $(this).css('display', '');
            });
            $siblings.removeClass('layui-nav-itemed');
        }
    });
    $('.layui-nav-tree[lay-shrink="all"]').attr('lay-shrink', '_all');  // 让layui不处理手风琴效果

    /** 折叠面板展开折叠增加过渡效果 */
    $(document).on('click', '.layui-collapse>.layui-colla-item>.layui-colla-title', function () {
        var $this       = $(this), $content = $this.siblings('.layui-colla-content')
            , $collapse = $this.parent().parent(), isNone = $content.hasClass('layui-show');
        if (isNone) {  // 因为layui会处理一遍所以这里状态是相反的
            $content.removeClass('layui-show').slideDown('fast').addClass('layui-show');
        } else {
            $content.css('display', 'block').slideUp('fast', function () {
                $(this).css('display', '');
            });
        }
        $this.children('.layui-colla-icon').html('&#xe602;')
        .css({'transition': 'all .3s', 'transform': 'rotate(' + (isNone ? '90deg' : '0deg') + ')'});
        if ($collapse.attr('lay-shrink') === '_all') {  // 手风琴效果
            var $show = $collapse.children('.layui-colla-item').children('.layui-colla-content.layui-show').not($content);
            $show.css('display', 'block').slideUp('fast', function () {
                $(this).css('display', '');
            });
            $show.removeClass('layui-show');
            $show.siblings('.layui-colla-title').children('.layui-colla-icon').html('&#xe602;')
            .css({'transition': 'all .3s', 'transform': 'rotate(0deg)'});
        }
    });
    $('.layui-collapse[lay-accordion]').attr('lay-shrink', '_all').removeAttr('lay-accordion');  // 让layui不处理手风琴效果

    /** 表单验证tips提示样式修改 */
    layer.oldTips = layer.tips;
    layer.tips = function (content, follow, options) {
        options = options || {};
        var $fFip;  // 判断是否是表单验证调用的tips
        if ($(follow).length > 0 && $(follow).parents('.layui-form').length > 0) {
            if ($(follow).is('input') || $(follow).is('textarea')) {
                $fFip = $(follow);
            } else if ($(follow).hasClass('layui-form-select') || $(follow).hasClass('layui-form-radio')
                || $(follow).hasClass('layui-form-checkbox') || $(follow).hasClass('layui-form-switch')) {
                $fFip = $(follow).prev();
            }
        }
        if (!$fFip) return layer.oldTips(content, follow, options);
        options.tips = [$fFip.attr('lay-direction') || 3, $fFip.attr('lay-bg') || '#FF4C4C'];
        setTimeout(function () {
            options.success = function (layero) {
                $(layero).children('.layui-layer-content').css('padding', '6px 12px');
            };
            layer.oldTips(content, follow, options);
        }, 100);
    };

    /** 所有ew-href处理 */
    $(document).on('click', '*[ew-href]', function () {
        var $this = $(this);
        var href  = $this.attr('ew-href');
        if (!href || href === '#') return;
        if (href.indexOf('javascript:') === 0) return new Function(href.substring(11))();
        var title = $this.attr('ew-title') || $this.text();
        var win   = $this.data('window');
        win ? (win = admin.strToWin(win)) : (win = top);
        var end = $this.attr('ew-end');
        try {
            if (end) end = new Function(end);
            else end = undefined;
        } catch (e) {
            console.error(e);
        }
        if (win.layui && win.layui.index) win.layui.index.openTab({title: title || '', url: href, end: end});
        else location.href = href;
    });

    /** 帮助鼠标右键菜单完成点击空白关闭的功能 */
    if (!layui.contextMenu) {
        $(document).off('click.ctxMenu').on('click.ctxMenu', function () {
            try {
                var ifs = top.window.frames;
                for (var i = 0; i < ifs.length; i++) {
                    var tif = ifs[i];
                    try {  // 可能会跨域
                        if (tif.layui && tif.layui.jquery) tif.layui.jquery('body>.ctxMenu').remove();
                    } catch (e) {
                    }
                }
                try {  // 可能会跨域
                    if (top.layui && top.layui.jquery) top.layui.jquery('body>.ctxMenu').remove();
                } catch (e) {
                }
            } catch (e) {
            }
        });
    }

    /** 读取缓存的配置信息 */
    setter = $.extend({
        pageTabs         : true, cacheTab: true, openTabCtxMenu: true, maxTabNum: 20, tableName: 'easyweb-iframe',
        apiNoCache       : true, ajaxSuccessBefore: function (res, url, obj) {
            return admin.ajaxSuccessBefore ? admin.ajaxSuccessBefore(res, url, obj) : true;
        }, getAjaxHeaders: function (res, url, obj) {
            return admin.getAjaxHeaders ? admin.getAjaxHeaders(res, url, obj) : [];
        }, recoverState  : function (admin) {
        }
    }, setter);
    var cache = admin.getTempData(true);
    if (cache) {
        var keys = ['pageTabs', 'cacheTab', 'defaultTheme', 'navArrow', 'closeFooter', 'tabAutoRefresh'];
        for (var i = 0; i < keys.length; i++) if (cache[keys[i]] !== undefined) setter[keys[i]] = cache[keys[i]];
    }
    admin.recoverState();  // 恢复本地配置
    admin.renderTpl();  // 渲染动态模板
    admin.setter = setter;
    if (layui.device().ios) $('body').addClass('ios-iframe-body');  // ios浏览器iframe兼容
    exports('admin', admin);
});


window._t = function () {
    if (arguments.length === 0) return ''
    let msgG = arguments[0].split('@'), msg = msgG[0], gp = msgG.length > 1 ? msgG[1] : false, language, msgStr=msg
    if (gp) {
        language = window.wulacfg.lang['@' + gp]
        if (!language) {
            msgStr = msg
        }
    } else {
        language = window.wulacfg.lang
    }
    if (!msgStr && language[msg]) {
        msgStr = language[msg]
    }

    if (arguments.length > 1) {
        msgStr = msgStr.replaceAll(/%[sd]/g, '{@}')
        for (i = 1; i < arguments.length; i++) {
            msgStr = msgStr.replace('{@}', arguments[i])
        }
    }

    return msgStr
};

layui.use(['admin', 'notice'], function (admin, notice) {
    if (window === top) {
        window.$notice = notice;
    } else {
        window.$notice = top.$notice;
    }
    admin.url    = function (url) {
        if (typeof (url) === "string") {
            if (/^(https?:\/\/|ftps?:\/\/|\/)/.test(url)) {
                return url;
            }
            let config = window.wulacfg,
                chunks = url.split('/');
            if (chunks[0].match(/^([~!@#%^&\*])(.+)$/)) {
                let id     = RegExp.$2,
                    prefix = RegExp.$1;
                if (config.ids && config.ids[id]) {
                    id = config.ids[id];
                }
                if (config.groups && config.groups.char) {
                    for (let i = 0; i < config.groups.char.length; i++) {
                        if (config.groups.char[i] === prefix) {
                            prefix = config.groups.prefix[i];
                            break;
                        }
                    }
                }
                chunks[0] = prefix + id;
            } else {
                let id = chunks[0];
                if (config.ids && config.ids[id]) {
                    id        = config.ids[id];
                    chunks[0] = id;
                }
            }
            chunks[0] = config.base + chunks[0];
            url       = chunks.join('/');
        }
        return url;
    };
    admin.assets = function (url) {
        if (/^(\/|https?:\/\/).+/.test(url)) {
            return url;
        }
        return window.wulacfg.assets + url;
    };
    admin.base   = function (url) {
        if (/^(\/|https?:\/\/).+/.test(url)) {
            return url;
        }
        return window.wulacfg.base + url;
    };
}, [], 'define');