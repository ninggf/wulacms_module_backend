<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{'Sign in to '|t}{$pageMeta.siteName}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/css/layui.css'|res}">
    <link rel="stylesheet" href="{'backend/css/login.css'|res}">
    <script type="text/javascript" src="{'backend/layui.js'|res}"></script>
    <script type="text/javascript" src="{'backend/vue.min.js'|res}"></script>
</head>

<body>

<div id="login">
    <header>
        <div>
            <img src="{'backend/images/logo.png'|res}" alt="wulacms logo"/>
            <p>WulaCms</p>
            <i class="layui-icon layui-icon-home"></i>
        </div>
    </header>
    {literal}
        <form v-cloak>
            <h1>登录 </h1>
            <p class="error" v-show="errormsg">
                <i class="layui-icon layui-icon-tips"></i><span>{{errormsg}}</span>
            </p>
            <div class="form-item">
                <i class="layui-icon layui-icon-username"></i><input type="text" placeholder="登录用户名" v-model="login.username" class="username">
            </div>
            <div class="form-item">
                <i class="layui-icon layui-icon-password"></i><input type="password" placeholder="登录密码" v-model="login.passwd" class="passwd">
            </div>
            <div class="form-item" v-show="vcode_show">
                <i class="layui-icon layui-icon-vercode"></i><input type="text" placeholder="验证码" v-model="login.captcha" class="captcha">
                <img :src="captcha_src1" class="vcode_img" @click="captcha_src1=captcha_src+'&t='+Math.random()">
            </div>
            <div class="form-item" style="text-align:right">
                <input type="checkbox" name="autologin" v-model="login.autologin"/><label for="">自动登陆</label>
            </div>
            <div class="form-item">
                <input type="button" placeholder="登录" value="登 录" @click="submit">
            </div>
        </form>
    {/literal}
    <footer>
        <p>© 2016 - {'Y'|date} MIT <a href="https://www.wulacms.com/" target="_blank">WULACMS</a></p>
    </footer>
</div>

<script type="text/javascript">
    var winData ={$winData|json_encode:320};
    layui.config({
        base  : "{'layui'|assets}",
        module: "{'/'|res}",
    });
    layui.use(['layer', 'element', 'form', '@backend.login'], function (l, w, f) {
        f.render();
    })
</script>
</body>
</html>