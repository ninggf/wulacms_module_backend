<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <script>window !== top ? top.location = location : void 0</script>
    <link href="/favicon.ico" rel="icon"/>
    <title>{'Reset password '|t}{$pageMeta.projectName|default:'App'}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/login.css'|res}"/>
    {foreach $_css_files as $_css_file}
        <link rel="stylesheet" href="{$_css_file}"/>
    {/foreach}
</head>
<body class="{$pageMeta.bodyCls}">
<div id="loginApp">
    <div class="login-wrapper layui-anim layui-anim-scale">
        <form class="layui-form">
            <h2>{'Reset Password'|t}</h2>
            <div class="layui-form-item layui-input-icon-group">
                <i class="layui-icon layui-icon-password"></i>
                <input class="layui-input" name="oldPsw" lay-verType="tips" type="password" placeholder="{'Old Password'|t}" autocomplete="off" lay-verify="required" lay-reqtext="请输入原密码"/>
            </div>
            <div class="layui-form-item layui-input-icon-group">
                <i class="layui-icon layui-icon-password"></i>
                <input class="layui-input" name="newPsw" lay-verType="tips" placeholder="{'Password'|t}" type="password" lay-verify="required" lay-reqtext="请输入新密码"/>
            </div>
            <div class="layui-form-item layui-input-icon-group">
                <i class="layui-icon layui-icon-password"></i>
                <input class="layui-input" name="rePsw" lay-verType="tips" placeholder="{'Confirm Password'|t}" type="password" lay-verify="equalTo" lay-equalto="input[name=newPsw]" lay-equaltotext="两次输入的密码不相同"/>
            </div>
            <div class="layui-form-item">
                <button id="resetBtn" class="layui-btn layui-btn-fluid" lay-filter="resetSubmit" lay-submit>{'Reset'|t}</button>
            </div>
        </form>
    </div>
    <div class="login-copyright">Copyright © 2013-{'Y'|date} wulacms.com all rights reserved.</div>
</div>
{include './../common.tpl' isTop=true}
<script>
    layui.use(['form', 'formX', 'admin', 'layer'], function (form) {
        var layer = layui.layer, admin = layui.admin;
        form.on('submit(resetSubmit)', obj => {
            let loadIndex = layer.load(2);
            admin.ajax({
                url   : admin.url('backend/profile/passwd'),
                method: 'POST',
                data  : obj.field,
                success(data) {
                    layer.close(loadIndex);
                    if (data.code && data.code === 200) {
                        window.location = admin.url('backend');
                        return;
                    }

                    if (data.message) {
                        if (data.args && data.args.elem) {
                            layer.tips(data.message, data.args.elem)
                        } else {
                            layer.msg(data.message, {
                                icon: 2,
                                time: 2000
                            })
                        }
                    }
                }
            })
            return false;
        });
    });
</script>
{foreach $_js_files.foot as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<!--pageEnd-->
</body>
</html>