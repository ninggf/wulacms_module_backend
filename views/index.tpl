<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>WulaCms - 欢迎您使用wulacms！</title>
    <link rel="stylesheet" href="{'backend/css/layui.css'|res}">
        <link rel="stylesheet" href="{'backend/css/index.css'|res}">
    <script type="text/javascript" src="{'backend/layui.js'|res}"></script>
    <script type="text/javascript" src="{'backend/vue.min.js'|res}"></script>
</head>
<body>
{literal}
    <header id="index"  v-cloak>
        <div class="nav-left">
            <i class="layui-icon layui-icon-spread-left" @mouseenter="menu.show=!menu.show;menu.listshow=0" ></i>
            <img class="logo" src="/modules/backend/images/logo.png" >
            <p class="logo-name">php</p>
        </div>
        <div class="nav-right">
            <input type="text" class="search" placeholder="搜索文档、控制台、API" ><i class="layui-icon layui-icon-search"></i>
            <ul class="links" >
                <li><a href="javascript:;">功能</a></li>
                <li><a href="javascript:;">功能</a></li>
                <li><a href="javascript:;">功能</a></li>
                <li><a href="javascript:;" title="消息"><i class="layui-icon layui-icon-notice"></i></a></li>
                <li><a href="javascript:;" title="购物车"><i class="layui-icon layui-icon-cart"></i></a></li>
                <li><a href="javascript:;" title="帮助文档"><i class="layui-icon layui-icon-help"></i></a></li>
            </ul>
            <i class="layui-icon layui-icon-user nav-user">
                <ul class="user-menu">
                    <li>
                        <a href="javascript:;">菜单1</a>
                    </li>
                    <li>
                        <a href="javascript:;">菜单1</a>
                    </li>
                    <li>
                        <a href="./backend/logout" >退出登录</a>
                    </li>
                </ul>
            </i>
        </div>
        <div  :class="[menu.show?'menu--show':'','menu']" >
            <div class="bg" @click="menu.show=!menu.show;menu.listshow=0"></div>
            <aside>
                <p class="more" @click="menu.listshow=!menu.listshow">
                    <i class="layui-icon layui-icon-component icon-left"></i>  
                    导航1
                    <i class="layui-icon layui-icon-right icon-right"></i>  
                </p>
                <ul>
                    <li>
                        <i class="layui-icon layui-icon-about"></i>  
                        <a>模块1</a>
                    </li>
                    <li>
                        <i class="layui-icon layui-icon-engine"></i>  
                        <a>模块2</a>
                    </li>
                </ul>
            </aside>
            <div :class="[menu.listshow?'menu-list--show':'','menu-list']">

                <div class="search">
                    <i class="layui-icon layui-icon-search" :style="{color:(menu.search_focus?'#ff6a00':'')}"></i>
                    <input type="text" placeholder="请输入关键字" @focus="menu.search_focus=1" @blur="menu.search_focus=0">
                </div>

                <div class="menu-list--main">
                    <div>
                    <div v-for=" i in 20" class="menu-list--item">
                        <h4>标题</h4>
                        <a href="javascript:;">123123</a>
                        <a href="javascript:;">123123</a>
                        <a href="javascript:;">123123</a>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    


    <!--模块自定义-->
    <div id="module" v-cloak>
        <ul :class="{'hide':hide_sid}">
            <i :class="[hide_sid?'layui-icon-right':'layui-icon-left','layui-icon']" @click="hide_sid=!hide_sid"></i>  
            <li v-for="(item,index) in list" >
                {{item.title}}
                <i  @click="addModule(item,index)" :class="[item.isadd?'layui-icon-ok':'layui-icon-addition','layui-icon']" ></i>
            </li>
            <li @click="hide_sid=1"><span>取消</span><span>保存</span></li>
        </ul>
        <div class="module-list">
            <div v-for="(item,index) in module_list" :style="{'flex-basis':item.width}">{{item.title}}</div>
        </div>
    </div>

{/literal}
<script type="text/javascript">
    layui.config({
        base: "{'layui'|assets}",
        module:"{'/'|res}",
    });
    layui.use(['layer','@backend.index','@backend.module'], function () {
    })
</script>
</body>
</html>