<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{$website.name} - {'wulacms'|t:$version}</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,user-scalable=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    {loaduicss jqadmin="jqadmin.css" theme='black/theme.css'}
</head>
<body>
<div class="layui-layout layui-layout-admin" style="opacity: 0">
    <div class="layui-header">
        <div class="jqadmin-auxiliary-btn">
            <i class="layui-icon">&#xe671;</i>
        </div>
        <!-- logo区域 -->
        <div class="jqadmin-logo-box">
            <a class="logo" href="{'backend'|app}" title="WulaCMS">
                <h1>{if $brandName}{$brandName}{else}
                    W<b class="text-danger">u</b>l<b class="text-success">a</b>C<b class="text-info">M</b>S{/if}<sup
                            style="color: red">&hearts;</sup><sub>{$version}</sub>
                </h1>
            </a>
        </div>
        <!-- 主菜单区域 -->
        <div class="jqadmin-main-menu" id="hd-left-top">
            <ul class="layui-nav clearfix" id="menu" lay-filter="main-menu">
                {foreach $menu.menus as $navi}
                    {if $navi.child}
                        <li class="layui-nav-item head-nav-item" id="navi-{$navi.id}">
                            <a href="javascript:" {$navi.h5datas} class="{$navi.textCls}" style="{$navi.textStyle}"
                               data-title="{$navi.name}">
                                <i class="iconfont {$navi.iconCls}"
                                   style="{$navi.iconStyle}">{$navi.icon|default:'&#xe637;'}</i>
                                <span>{$navi.name}</span>
                            </a>
                        </li>
                        {capture append="submenus"}
                            <ul class="layui-nav layui-nav-tree" data-formenu="navi-{$navi.id}">
                                {foreach $navi.child as $nna}
                                    <li class="layui-nav-item">
                                        <a href="javascript:" {$nna.h5datas} data-title="{$nna.name}"
                                           class="{$nna.textCls}" style="{$nna.textStyle}">
                                            <i class="iconfont {$nna.iconCls}" style="{$nna.iconStyle}"
                                               data-icon="{$nna.icon|default:'&#xe618;'}">{$nna.icon|default:'&#xe618;'}</i><span>{$nna.name}</span>
                                            {if $nna.child}
                                                <em class="layui-nav-more"></em>
                                            {elseif $nna.badge}
                                                <span class="layui-badge-dot"></span>
                                            {/if}
                                        </a>
                                        {if $nna.child}
                                            <dl class="layui-nav-child">
                                                {foreach $nna.child as $ncd}
                                                    <dd>
                                                        <a href="javascript:" {$ncd.h5datas} class="{$ncd.textCls}"
                                                           style="{$ncd.textStyle}" data-title="{$ncd.name}">
                                                            <i class="iconfont {$ncd.iconCls}" style="{$ncd.iconStyle}"
                                                               data-icon="{$ncd.icon|default:'&#xe618;'}">{$ncd.icon|default:'&#xe618;'}</i>
                                                            <span>{$ncd.name}</span>
                                                        </a>
                                                    </dd>
                                                {/foreach}
                                            </dl>
                                        {/if}
                                    </li>
                                {/foreach}
                            </ul>
                        {/capture}
                    {/if}
                {/foreach}
            </ul>
        </div>
        <!-- 头部右侧导航 -->
        <div class="header-right">
            <ul class="layui-nav jqadmin-header-item right-menu cloneDom">
                <li class="layui-nav-item first cloneDom">
                    <a href="javascript:">
                        <img id="my-avatar" src="{$myPassport->avatar|media}" class="layui-nav-img"/>
                        <cite id="username">{$myPassport.nickname}</cite>
                        <span class="layui-nav-more"></span>
                    </a>
                    <dl class="layui-nav-child">
                        <dd class="tab-menu">
                            <a href="javascript:" data-url="{'system/account/profile'|app}" data-title="{'Profile'|t}">
                                <i class="iconfont" data-icon="&#xe623;">&#xe623;</i>
                                <span>{'Profile'|t}</span>
                            </a>
                        </dd>
                        {foreach $user as $um}
                            <dd class="{$navi.textCls}">
                                <a href="javascript:" {$um.h5datas} data-title="{$um.name}" style="{$navi.textStyle}">
                                    <i class="iconfont {$navi.iconCls}" data-icon="{$um.icon|default:'&#xe672;'}"
                                       style="{$navi.iconStyle}">{$um.icon|default:'&#xe672;'}</i>
                                    <span>{$um.name}</span>
                                </a>
                            </dd>
                        {/foreach}
                        <dd>
                            <a href="{'backend/auth/signout'|app}">
                                <i class="iconfont" style="color: red">&#xe64b; </i>
                                <span>{'Logout'|t}</span>
                            </a>
                        </dd>
                    </dl>
                </li>
            </ul>
            <button title="{'Refresh'|t}" class="layui-btn layui-btn-sm  jq-btn-primary fresh-btn">
                <i class="iconfont">&#xe62e; </i>
            </button>
        </div>
    </div>
    <!-- 左侧导航-->
    <div class="layui-side layui-bg-black jqamdin-left-bar">
        <div class="layui-side-scroll">
            <div id="submenu">
                {foreach $submenus as $sm}
                    <div class="sub-menu">
                        {$sm}
                    </div>
                {/foreach}
            </div>
        </div>
    </div>
    <!-- 左侧侧边导航结束 -->
    <!-- 右侧主体内容 -->
    <div class="layui-body jqadmin-body">
        <div class="layui-tab layui-tab-card jqadmin-tab-box" id="jqadmin-tab" lay-filter="tabmenu" lay-notAuto="true">
            <div class="menu-type"><i class="iconfont">&#xe61a;</i></div>
            <ul class="layui-tab-title">
                <li class="layui-this" id="admin-home" lay-id="0" style="min-width:0">
                    <i class="iconfont">&#xe622;</i>
                    <em data-href="{'backend/home'|app}" style="margin-left: 0"></em>
                </li>
            </ul>
            <div class="tab-move-btn">
                <span>{'More'|t}<i class="iconfont">&#xe604;</i></span>
            </div>
            <div class="layui-tab-content">
                <div class="layui-tab-item layui-show">
                    <iframe class="jqadmin-iframe" data-id="0"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>
<ul class="menu-list" id="menu-list"></ul>
{literal}
    <script id="menu-list-tpl" type="text/html">
        {{# layui.each(d.list, function(index, item){ }}
        <li>
            <a href="javascript:;" data-url="{{item.href}}" data-title="{{item.title}}">
                <i class="{{item.cls}}" data-icon='{{item.icon}}'>{{item.icon}}</i>
                <span>{{item.title}}</span>
            </a>
        </li>{{# }); }}
    </script>
{/literal}
{initjq config=1}
<script type="text/javascript">
    {minify type='js'}
	layui.use(['jquery', 'jqmenu', 'layer', 'toastr'], function ($, menu, layer, toast) {
		var mainMenu              = new menu(),
			jqIndex               = function () {
			};
		top.global                = {
			menu : mainMenu,
			toast: toast,
			layer: layer
		};
		jqIndex.prototype.init    = function () {
			mainMenu.init();
			this.refresh();
		};
		jqIndex.prototype.refresh = function () {
			$('.fresh-btn').bind("click", function () {
				var iframe = $('.jqadmin-body .layui-show').children('iframe'), l;
				l          = layer.load(2);
				iframe.animate({
					opacity: 0, marginTop: "50px"
				}, 50, function () {
					iframe[0].contentWindow.location.reload(true);
				}).load(function () {
					$(this).animate({
						opacity: '1', marginTop: "0"
					}, 50);
					layer.close(l);
				}).error(function () {
					$(this).animate({
						opacity: '1', marginTop: "0"
					}, 50);
					layer.close(l);
				});
			});
			$('.menu-type').bind("click", function () {
				mainMenu.menuShowType();
			});
		};
		window.updateUsername     = function (name) {
			$('#username').text(name);
		};
		window.updateAvatar       = function (avatar) {
			$('#my-avatar').attr('src', avatar);
		};
		(new jqIndex()).init();
		$('.layui-layout-admin').animate({
			opacity: 1
		}, 200);
	})
    {/minify}
</script>
</body>
</html>