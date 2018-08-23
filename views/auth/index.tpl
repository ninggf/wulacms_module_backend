<!DOCTYPE html>
<html lang="en">
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
    {loaduicss j="jqadmin.css" l='login.css'}
    {if $website.brandImg}
        <style type="text/css">
            .banner > .logo {
                background-image: url("{$website.brandImg|media}")
            }
        </style>
    {/if}
</head>
<body>
<div class="banner containter">
    <h1 class="logo ellipisis">WulaCMS</h1>
</div>
<div class="main">
    <div class="container">
        <form class="sign-in form-inline" data-ajax id="login-form" method="post" action="{'backend/auth'|app}"
              lay-ignore>
            <p class="form-title ellipsis">亲~, 欢迎您回来^_^</p>
            <div class="layui-row layui-col-space15">
                <div class="form-group layui-col-sm1 hidden-xs text-align-center" style="padding-top: 3px;">
                    <i class="layui-icon layui-hide-xs txt-color-white"
                       style="font-size:20px;color:#fff;line-height:38px;">&#xe613;</i>
                </div>
                <div class="form-group layui-col-sm5 layui-col-xs12 ">
                    <div class="input-group username ">
                        <input class="form-control" tabindex="1" placeholder="用户名(或邮箱)" type="text" name="username">
                    </div>
                </div>
                <div class="form-group layui-col-sm4 layui-col-xs12">
                    <div class="input-group password">
                        <input type="password" class="form-control" placeholder="密码" name="passwd" tabindex="2">
                    </div>
                </div>
                <div class="form-group layui-col-xs12 layui-col-sm2 log-btn">
                    <button type="submit" class="layui-btn" id="log" tabindex="3">
                        登录
                    </button>
                </div>
            </div>
            <div class="layui-row">
                <div class="col-xs-12 clearfix for-btn">
                    <a href="https://www.wulacms.com/" target="_blank" class="btn btn-link reset-password">
                        <i class="layui-icon" style="color:red"
                           aria-hidden="true">&#xe756;</i> {'Powered by WulaCMS v%s'|t:$version}
                    </a>
                </div>
            </div>
        </form>
    </div>
</div>
{initjq config=1}
<script type="text/javascript">
    {minify 'js'}
    layui.use(['jquery', 'layer', 'wulaui'], function ($, layer) {
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
        });
    });
    {/minify}
</script>
</body>
</html>