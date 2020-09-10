

layui.define(['jquery'],(exports) => {
    const $ = layui.$;
    var decode = decodeURIComponent, up = unescape, ep = escape, doc = document;
    var sc     = function (name, value, expire) {
        doc.cookie = name + "=" + ep(value) + '; path=/' + ((expire == null) ? "" : ("; expires=" + expire.toGMTString()));
    };
    var gc     = function (name) {
        if(window.nativeJs&&(name=='user_info'||name=='web_token')){
            return nativeJs.getUserToken();
        }
        var arr      = doc.cookie.split(';');
        var temp_val = '';
        for (var i = 0; i < arr.length; i++) {
            var temp = arr[i].split('=');
            if ($.trim(temp[0]) == name && temp[1] != '') {
                temp_val = temp[1];
            }
        }
        return up(temp_val);
    };
    exports('&common',gc)
})





