<!DOCTYPE html>
<html>
<head>
    <script> if (top !== self) top.location = self.location; </script>
    <meta charset="UTF-8">
    <title>{'Login'|t} - {$website.name} - {'Powered by WulaCMS v%s'|t:$version}</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    {loaduicss login='login.css'}
</head>
<body class="wulaui">
<div class="login-wrap">
    <div class="login-body">
        <div class="login-header">
            <h2>{$website.name}</h2>
            <p>亲~，欢迎您回来，祝你工作愉快 ^_^</p>
        </div>
        <div class="layui-form">
            <form data-ajax id="login-form" method="post" action="{'backend/auth'|app}">
                <div class="layui-form-item">
                    <label class="login-icon layui-icon layui-icon-username" for="login-username"></label>
                    <input type="text" name="username" id="login-username" placeholder="用户名" class="layui-input">
                </div>
                <div class="layui-form-item">
                    <label class="login-icon layui-icon layui-icon-password" for="login-password"></label>
                    <input type="password" name="passwd" id="login-password" placeholder="密码" class="layui-input">
                </div>
                <div id="vercodeWrap" class="layui-form-item" {if !$needCode}style="display: none" data-vercode="0"
                     {else}data-vercode="1"{/if}>
                    <div class="layui-row">
                        <div class="layui-col-xs7">
                            <label class="login-icon layui-icon layui-icon-vercode" for="login-vercode"></label>
                            <input type="text" name="captcha" id="login-vercode" placeholder="图形验证码"
                                   class="layui-input">
                        </div>
                        <div class="layui-col-xs5">
                            <div style="text-align: right" title="点击切换验证码">
                                <img src="{'backend/auth/captcha'|app}" class="login-codeimg" id="get-vercode">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="layui-form-item login-rem">
                    <input type="checkbox" name="remember" lay-skin="primary" title="自动登录">
                    <div class="layui-form-checkbox" lay-skin="primary"><span>自动登录</span><i
                                class="layui-icon layui-icon-ok"></i></div>
                </div>
                <div class="layui-form-item">
                    <button type="submit" class="layui-btn layui-btn-fluid">立即登录</button>
                </div>
                <p class="login-wula">{'Powered by WulaCMS v%s'|t:$version}</p>
            </form>
        </div>
    </div>
    <div class="layui-trans login-footer">
        <p>&copy; 2016 - {'Y'|date} MIT <a href="https://www.wulacms.com/" target="_blank">WULACMS</a></p>
    </div>
</div>
{initjq config=1}
<script type="text/javascript">
    {minify js}
    layui.use(['jquery', 'layer', 'form', 'wulaui'], function ($, layer) {
        var vercodeImg = $('#get-vercode'), imgSrc = vercodeImg.attr('src');
        $('input').on('focus', function () {
            layer.closeAll('tips');
        });
        vercodeImg.on('click', function () {
            vercodeImg.attr('src', imgSrc + '?_' + (new Date()).getTime());
        });
        layui.form.render();
        $('#login-form').on('ajax.before', function () {
            var username = $('input[name=username]'), uv = username.val();
            if (!uv) {
                layer.tips('请填写你的用户名', username, {
                    tips: 1
                });
                return false;
            }
            var passwd = $('input[name=passwd]'), pv = passwd.val();
            if (!pv) {
                layer.tips('请填写你的密码', passwd, {
                    tips: 1
                });
                return false;
            }
            if ($('#vercodeWrap').data('vercode')) {
                var vercode = $('input[name=captcha]'), cd = vercode.val();
                if (!cd) {
                    layer.tips('请填写的验证码', vercode, {
                        tips: 1
                    });
                    return false;
                }
            }
        }).on('ajax.success', function (e, data) {
            if (data.args && data.args.ent > 2) {
                $('#vercodeWrap').data('vercode', 1).show();
            }
        });
    });
    {/minify}
</script>
</body>
</html>