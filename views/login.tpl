<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <script>window !== top ? top.location = location : void 0</script>
    <link href="/favicon.ico" rel="icon"/>
    <title>{'Sign in to '|t}{$pageMeta.projectName|default:'App'}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/login.css'|res}"/>
    {foreach $_css_files as $_css_file}
        <link rel="stylesheet" href="{$_css_file}"/>
    {/foreach}
</head>
<body class="{$pageMeta.bodyCls}">
<div id="loginApp">
    <div class="login-wrapper layui-anim layui-anim-scale layui-hidex">
        <form class="layui-form">
            <h2>{'Sign in'|t}</h2>
            <div class="layui-form-item layui-input-icon-group">
                <i class="layui-icon layui-icon-username"></i>
                <input class="layui-input" name="username" lay-verType="tips" placeholder="{'Username'|t}" autocomplete="off" lay-verify="required"/>
            </div>
            <div class="layui-form-item layui-input-icon-group">
                <i class="layui-icon layui-icon-password"></i>
                <input class="layui-input" name="password" lay-verType="tips" placeholder="{'Password'|t}" type="password" lay-verify="required"/>
            </div>
            <div class="layui-form-item layui-input-icon-group login-captcha-group" {if $ent<3}style="display: none" {/if}>
                <i class="layui-icon layui-icon-auz"></i>
                <input class="layui-input" name="captcha" placeholder="{'Captcha'|t}" autocomplete="off" {if $ent>=3}lay-verify="required" lay-reqText="请填写验证码"{/if}/>
                <img class="login-captcha" alt="" {if $ent>=3}src="{$captcha}"{/if} data-src="{$captcha}"/>
            </div>
            <div class="layui-form-item">
                <input type="checkbox" name="remember" title="{'Remember me'|t}" lay-skin="primary"/>
            </div>
            <div class="layui-form-item">
                <button id="signinbtn" class="layui-btn layui-btn-fluid" lay-filter="loginSubmit" lay-submit>{'Sign in'|t}</button>
            </div>
        </form>
    </div>
    <div class="login-copyright">Copyright © 2013-{'Y'|date} wulacms.com all rights reserved.</div>
</div>
{include './common.tpl' isTop=true}
<script>
    layui.use(['@backend.login'], function (login) {
        login.init()
    });
</script>
{foreach $_js_files.foot as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<!--pageEnd-->
</body>
</html>