<!DOCTYPE html>
<html class="{$pageMeta.htmlCls}" lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <link href="/favicon.ico" rel="icon"/>
    <title>{$pageMeta.projectName|escape}{if $pageMeta.brandName} - {$pageMeta.brandName}{/if}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    <script>window !== top ? top.location = window.location : void 0</script>
    {foreach $_css_files as $_css_file}
        <link rel="stylesheet" href="{$_css_file}"/>
    {/foreach}
</head>
<body class="layui-layout-body {$pageMeta.bodyCls}">
<div class="layui-layout layui-layout-admin">
    <!-- 头部 -->
    <div class="layui-header">
        <div class="layui-logo">
            <img alt="" src="{'backend/assets/img/logo.png'|res}"/>
            <cite>&nbsp;{$pageMeta.projectName}</cite>
        </div>
        <ul class="layui-nav layui-layout-left">
            <li class="layui-nav-item" lay-unselect>
                <a ew-event="flexible" title="侧边伸缩"><i class="layui-icon layui-icon-shrink-right"></i></a>
            </li>
            <li class="layui-nav-item" lay-unselect>
                <a ew-event="refresh" title="{'Reload'|t}"><i class="layui-icon layui-icon-refresh-3"></i></a>
            </li>
        </ul>
        <ul class="layui-nav layui-layout-right">
            {foreach $dashboard->topMenu()->menus() as $menu}
                <li class="layui-nav-item {$menu.menuCls}" lay-unselect>
                    <a {$menu.attrs} title="{$menu.name}" {$menu.h5datas}>
                        <i class="layui-icon {$menu.iconCls}"></i>
                        {if $menu.badge}
                            <span class="{$menu.badgeCls|default:'layui-badge-dot'}"></span>
                        {/if}
                    </a>
                </li>
            {/foreach}
            <li class="layui-nav-item layui-hide-xs" lay-unselect>
                <a ew-event="fullScreen" title="{'Fullscreen'|t}"><i class="layui-icon layui-icon-screen-full"></i></a>
            </li>
            <li class="layui-nav-item layui-hide-xs" lay-unselect>
                <a ew-event="lockScreen" data-url="{'backend/lock'|url}" title="{'Lock Screen'|t}"><i class="layui-icon layui-icon-password"></i></a>
            </li>

            <li class="layui-nav-item" lay-unselect>
                <a>
                    <img alt="" src="{$userMeta.avatar}" class="layui-nav-img">
                    <cite>{$userMeta.nickname}</cite>
                </a>
                <dl class="layui-nav-child layui-nav-child-left">
                    {foreach $dashboard->userMenu()->menus() as $menu}
                        {if $menu.name == 'divider'}
                            <hr/>
                        {else}
                            <dd lay-unselect>
                                <a {$menu.attrs} {$menu.h5datas}>
                                    {if $menu.iconCls}
                                        <i class="layui-icon {$menu.iconCls}"></i>
                                    {/if} {$menu.name}
                                </a>
                            </dd>
                        {/if}
                    {/foreach}
                    <dd lay-unselect>
                        <a ew-href="{'backend/profile'|t}">
                            <i class="layui-icon layui-icon-username"></i> {'My Profile'|t}
                        </a>
                    </dd>
                    <dd lay-unselect>
                        <a ew-event="psw" data-url="{'backend/profile/passwd'|url}">
                            <i class="layui-icon layui-icon-password"></i> {'Change Password'|t}
                        </a>
                    </dd>
                    <hr/>
                    <dd lay-unselect>
                        <a ew-event="logout" data-url="{'backend/signout'|url}">
                            <i class="layui-icon layui-icon-logout text-danger"></i> {'Sign out'|t}</a>
                    </dd>
                </dl>
            </li>
            <li class="layui-nav-item" lay-unselect>
                <a ew-event="theme" data-url="{'backend/theme'|url}" title="主题"><i class="layui-icon layui-icon-more-vertical"></i></a>
            </li>
        </ul>
    </div>
    <!-- 侧边栏 -->
    <div class="layui-side">
        <div class="layui-side-scroll">
            <ul class="layui-nav layui-nav-tree arrow2" lay-filter="admin-side-nav" lay-shrink="_all">
                <li class="layui-nav-item" id="navi-menu">
                    <a lay-href="{'backend/home'|url}"><i class="layui-icon layui-icon-home"></i>&emsp;<cite>{'Dashboard'|t}</cite></a>
                </li>
                {foreach $dashboard->naviMenu()->menus() as $menu}
                    <li class="layui-nav-item" id="navi-menu-{$menu.id}">
                        {if $menu.child}
                            <a {$menu.attrs} {$menu.h5datas}><i class="layui-icon {$menu.iconCls|default:'layui-icon-app'}"></i>&emsp;<cite>{$menu.name}</cite></a>
                            <dl class="layui-nav-child">
                                {foreach $menu.child as $cmenu}
                                    {if $cmenu.child}
                                        <dd>
                                            <a {$cmenu.attrs} {$cmenu.h5datas}>
                                                {if $cmenu.iconCls}
                                                    <i class="layui-icon {$cmenu.iconCls}"></i>
                                                {/if}
                                                {$cmenu.name}
                                            </a>
                                            <dl class="layui-nav-child">
                                                {foreach $cmenu.child as $ccmenu}
                                                    <dd>
                                                        <a {$ccmenu.attrs} lay-href="{$ccmenu.url}" {$ccmenu.h5datas}>
                                                            {if $ccmenu.iconCls}
                                                                <i class="layui-icon {$ccmenu.iconCls}"></i>
                                                            {/if}
                                                            {$ccmenu.name}
                                                        </a>
                                                    </dd>
                                                {/foreach}
                                            </dl>
                                        </dd>
                                    {else}
                                        <dd>
                                            <a {$cmenu.attrs} lay-href="{$cmenu.url}" {$cmenu.target} {$cmenu.h5datas}>
                                                {if $cmenu.iconCls}
                                                    <i class="layui-icon {$cmenu.iconCls}"></i>
                                                {/if}
                                                {$cmenu.name}
                                            </a>
                                        </dd>
                                    {/if}
                                {/foreach}
                            </dl>
                        {else}
                            <a lay-href="{$menu.url}" {$menu.target}>
                                <i class="layui-icon {$menu.iconCls|default:'layui-icon-app'}"></i>&emsp; <cite>{$menu.name}</cite>
                            </a>
                        {/if}
                    </li>
                {/foreach}
            </ul>
        </div>
    </div>
    <!-- 主体部分 -->
    <div class="layui-body"></div>
    <!-- 底部 -->
    <div class="layui-footer layui-text">
        Copyright © 2013 - {'Y'|date} <a href="https://wulacms.com" target="_blank">wulacms.com</a> all rights reserved.
        <span class="pull-right">Ver: {$pageMeta.cmsVer}</span>
    </div>
</div>
<!-- 加载动画 -->
<div class="page-loading">
    <div class="ball-loader">
        <span></span><span></span><span></span><span></span>
    </div>
</div>
<!-- js -->
{include './common.tpl' isTop=true}
<script>
    layui.use(['index', 'admin'], function (index) {
        index.loadHome({
            menuPath: "{'backend/home'|url}",
            menuName: '<i class="layui-icon layui-icon-home"></i>'
        });
    });
</script>
{foreach $_js_files.foot as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<!--pageEnd-->
</body>
</html>