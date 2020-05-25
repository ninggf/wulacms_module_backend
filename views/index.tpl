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
    <!--顶部、侧边栏-->
    <header id="index"  v-cloak>
            <div class="nav-left">
                <div>
                    <img class="icon" src="/modules/backend/images/icon.png" @mouseenter="menu.show=!menu.show;menu.listshow=0">
                </div>
                <img class="logo" src="/modules/backend/images/logo.png" >
                <p class="logo-name">Cms</p>
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
                <div class="nav-user">
                    <img src="/modules/backend/images/avatar.jpg" >
                    <ul>
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
                </div>
            </div>
            <div  :class="[menu.show?'menu--show':'','menu']" >
                <div class="bg" @click="menu.show=!menu.show;menu.listshow=0"></div>
                <!--侧边栏-->
                <aside>
                    <p class="more" @click="menu.listshow=!menu.listshow">
                        <i class="layui-icon layui-icon-component icon-left"></i>  
                        功能导航
                        <i class="layui-icon layui-icon-right icon-right"></i>  
                    </p>
                    <ul>
                        <li v-for="(i,index) in menu.collection_list" 
                            draggable="true" 
                            @dragenter="dragenter(i)" 
                            @dragstart="dragstart(i)" 
                            @dragend="dragend" :class="{'bedrop':drop.current==index}" >
                            <p>
                                <i class="layui-icon layui-icon-about"></i>  
                                <a>{{i.name}}</a>
                                <i class="layui-icon layui-icon-close" @click="collection(i)"></i>  
                                <i class="layui-icon layui-icon-more-vertical"></i>  
                            </p>
                        </li>
                    </ul>
                </aside>

                <!--应用列表-->
                <div :class="[menu.listshow?'menu-list--show':'','menu-list']">
                    <div class="search">
                        <i class="layui-icon layui-icon-search" :style="{color:(menu.search_focus?'#6e89e4':'')}"></i>
                        <input type="text" placeholder="请输入关键字"  @focus="menu.search_focus=1" @blur="menu.search_focus=0">
                    </div>
                    <div class="menu-list--main">
                        <div>
                            <div v-for="(i,index) in menu.menu_list" class="menu-list--item">
                                <a :class="{'check':menu.current_menu==index}" :name="i.title" > {{i.title}}</a>
                                <a v-for="item in i.list" href="javascript" :class="{'isadd':item.isadd}">{{item.name}}
                                    <!--添加到左侧列表-->
                                    <i @click="collection(item)" :class="[item.isadd?'layui-icon-rate-solid':'layui-icon-rate','layui-icon']" ></i>
                                </a>
                            </div>
                        </div>
                    </div>
                     <div class="menu-list--sub">
                        <ul>
                            <li v-for="(i,index) in menu.menu_list">
                                <a @click="menu.current_menu=index" :href="'#'+i.title">{{i.title}}</a> 
                            </li>
                        </ul>                        
                     </div>
                </div>
            </div>
    </header>
    <!--模块自定义-->
    <div id="module" v-cloak>
        <!--控制自定义模块显示隐藏-->
        <span class="module-show" @click="sid_show=!sid_show;hide_sid=0 ">自定义</span>
        <ul :class="{'hide':hide_sid}" v-show="sid_show">
            <i :class="[hide_sid?'layui-icon-right':'layui-icon-left','layui-icon']" @click="hide_sid=!hide_sid" ></i>  
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

    layui.use(['@backend.index','@backend.module','@backend.user'], function (home,mod) {
        //console.log(home)
        home.init({})
        //widget.init(widgets)
    })
</script>
</body>
</html>