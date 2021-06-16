<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <script>if (window !== top) top.location = "{'backend/lock'|app}"</script>
    <link href="/favicon.ico" rel="icon"/>
    <title>{$pageMeta.projectName|escape}{if $pageMeta.brandName} - {$pageMeta.brandName}{/if}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    <style>
        html, body {
            height: 100%;
        }

        .lock-screen-wrapper {
            color: #ffffff;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 50px 60px 0 60px;
            background-color: #000000;
            background-image: url("{'backend/assets/img/bg-screen.jpg'|res}");
            background-repeat: no-repeat;
            background-size: cover;
            position: relative;
        }

        .lock-screen-time {
            font-size: 88px;
        }

        .lock-screen-date {
            font-size: 24px;
            padding: 0 0 0 13px;
        }

        .lock-screen-form {
            position: absolute;
            left: 0;
            right: 0;
            top: 65%;
            width: 100%;
            text-align: center;
        }

        .lock-screen-psw {
            color: #ffffff;
            font-size: 22px;
            width: 0;
            height: 0;
            line-height: 40px;
            border-radius: 40px;
            border: 2px solid transparent;
            background-color: transparent;
            box-sizing: border-box;
            vertical-align: middle;
            -webkit-transition: all .3s;
            transition: all .3s;
            text-align: center;
        }

        .lock-screen-psw::-webkit-input-placeholder {
            color: #F6F6F6;
            font-size: 16px;
        }

        .lock-screen-psw::-moz-placeholder {
            color: #F6F6F6;
            font-size: 16px;
        }

        .lock-screen-psw::-ms-input-placeholder {
            color: #F6F6F6;
            font-size: 16px;
        }

        .lock-screen-enter {
            width: 65px;
            height: 65px;
            line-height: 1;
            font-size: 28px;
            padding-top: 18px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            vertical-align: middle;
            transition: all .3s;
            cursor: pointer;
        }

        .lock-screen-enter:hover {
            background-color: rgba(255, 255, 255, .3);
        }

        .lock-screen-form.show-psw .lock-screen-psw {
            height: 40px;
            width: 180px;
            padding: 0 5px;
            margin-right: 10px;
            border-color: #ffffff;
            background-color: rgba(255, 255, 255, .3);
        }

        .lock-screen-form.show-psw .lock-screen-enter {
            width: 40px;
            height: 40px;
            font-size: 20px;
            padding-top: 8px;
        }

        .lock-screen-form.show-back .lock-screen-enter:before {
            content: "\e603";
        }

        .lock-screen-tip {
            color: red;
            width: 230px;
            padding: 0 3px;
            font-size: 14px;
            text-align: left;
            box-sizing: border-box;
            display: none;
        }

        .lock-screen-form.show-psw .lock-screen-tip {
            display: inline-block;
        }

        .lock-screen-tool {
            width: 20px;
            position: absolute;
            right: 20px;
            bottom: 20px;
        }

        .lock-screen-tool .lock-screen-tool-item {
            position: relative;
            width: 20px;
            height: 20px;
            line-height: 20px;
            margin-top: 15px;
            cursor: pointer;
        }

        .lock-screen-tool .lock-screen-tool-item:hover .layui-icon {
            color: #ffffff;
        }

        .lock-screen-tool .layui-icon {
            font-size: 20px;
        }

        .lock-screen-tool .lock-screen-tool-item .lock-screen-tool-tip {
            position: absolute;
            top: 50%;
            right: 100%;
            height: 24px;
            line-height: 24px;
            width: 60px;
            width: max-content;
            text-align: center;
            margin-right: 10px;
            margin-top: -12px;
            font-size: 12px;
            padding: 0 8px;
            color: #eee;
            border-radius: 3px;
            background-color: rgba(255, 255, 255, .3);
            word-break: break-all;
            display: none;
        }

        .lock-screen-tool .lock-screen-tool-item:hover .lock-screen-tool-tip {
            display: inline-block;
        }

        .lock-screen-tool .lock-screen-tool-item .lock-screen-tool-tip:before {
            content: "";
            border: 4px solid transparent;
            border-left-color: rgba(255, 255, 255, .3);
            position: absolute;
            right: -8px;
            top: 50%;
            margin-top: -4px;
        }
    </style>
</head>
<body class="{$pageMeta.bodyCls}">
<div class="lock-screen-wrapper">
    <div class="lock-screen-time"></div>
    <div class="lock-screen-date"></div>
    <div class="lock-screen-form">
        <input placeholder="{'Password'|t}" class="lock-screen-psw" autocomplete="off" maxlength="20" type="password"/>
        <i class="layui-icon layui-icon-right lock-screen-enter"></i>
        <br/>
        <div class="lock-screen-tip"></div>
    </div>
    <div class="lock-screen-tool">
        <div class="lock-screen-tool-item">
            <i class="layui-icon layui-icon-logout" ew-event="logout" data-confirm="false" data-url="{'backend/signout'|app}"></i>
            <div class="lock-screen-tool-tip">{'Sign out'|t}</div>
        </div>
    </div>
</div>
{include './common.tpl' isTop=true}
<script>
    layui.use(['util', 'admin'], function () {
        var $     = layui.jquery;
        var util  = layui.util;
        var admin = layui.admin;
        // 获取各个组件
        var $form = $('.lock-screen-wrapper .lock-screen-form');
        var $psw  = $form.find('.lock-screen-psw');
        var $tip  = $form.find('.lock-screen-tip');
        var $time = $('.lock-screen-wrapper .lock-screen-time');
        var $date = $('.lock-screen-wrapper .lock-screen-date');

        // 监听enter键
        $(window).keydown(function (event) {
            if (admin.isLockScreen) {
                if (event.keyCode === 13) {
                    doVer();
                } else if (event.keyCode === 8 && !$psw.val()) {
                    restForm();
                    if (event.preventDefault) event.preventDefault();
                    if (event.returnValue) event.returnValue = false;
                }
            }
        });

        // 监听输入
        $psw.on('input', function () {
            var psw = $psw.val();
            if (psw) {
                $form.removeClass('show-back');
                $tip.text('');
            } else {
                $form.addClass('show-back');
            }
        });

        // 监听按钮点击
        $form.find('.lock-screen-enter').click(function (e) {
            doVer(true);
        });

        // 处理事件
        function doVer(emptyRest) {
            if ($form.hasClass('show-psw')) {
                $psw.focus();
                var psw = $psw.val();
                if (!psw) {
                    emptyRest ? restForm() : $tip.text('请输入解锁密码');
                } else {
                    admin.unlockScreen(admin.url('backend/unlock'), {
                        passwd: psw
                    }).then(function () {
                        window.location = admin.url('backend')
                    }).fail(function () {
                        $psw.val('');
                        $tip.text('密码不正确');
                        $form.addClass('show-back');
                    });
                }
            } else {
                $form.addClass('show-psw show-back');
                $psw.focus();
            }
        }

        // 重置
        function restForm() {
            $psw.blur();
            $psw.val('');
            $tip.text('');
            $form.removeClass('show-psw show-back');
        }

        // 时间、日期
        function setDate() {
            var date = new Date();
            $time.text(util.toDateString(date, 'HH:mm'));
            var weeks = ['日', '一', '二', '三', '四', '五', '六'];
            $date.text(util.toDateString(date, 'MM月dd日，星期') + weeks[date.getDay()]);
        }

        setDate();

        setInterval(function () {
            if (admin.isLockScreen) setDate();
        }, 1000);
    });
</script>
</body>
</html>