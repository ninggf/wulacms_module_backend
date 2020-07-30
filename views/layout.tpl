<!DOCTYPE html>
<html class="{$htmlCls}">
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
<body style="padding:0;margin:0;">
{literal}
    <header id="index" v-cloak>
        <div class="layui-progress" lay-filter="install-progress">
            <div class="layui-progress-bar "  :class="[ajax.error?'layui-bg-red':'layui-bg-blue']" lay-percent="0%"></div>
        </div>
        <div class="nav">
            <div class="nav-left">
                <div>
                    <img class="icon" src="/modules/backend/images/icon.png" @mouseenter="menu.show=!menu.show;menu.listshow=0">
                </div>
                <img class="logo" src="/modules/backend/images/logo.png" @click="goHome" >
                <p class="logo-name">Cms</p>
            </div>
            <div class="nav-right">
                <input type="text" class="search"  placeholder="搜索文档、控制台、API" ><i class="layui-icon layui-icon-search"></i>
                <ul class="links" >
                    <li v-for="item in links" class="links_menu">
                        <a href="javascript:;">{{item.title}}</a>
                        <ul>
                            <li v-for="sub_item in item.navs"><a @click.stop.prevent="clickMenu(sub_item)" :href="sub_item.url" >{{sub_item.name}}</a></li>
                        </ul>
                    </li>
                    <li v-show="notice.show">
                        <a href="javascript:;" title="消息">
                            <i :class="[notice.new?'has-notice':'','layui-icon layui-icon-notice']" ><span v-show="notice.new" class="layui-badge-dot"></span></i>
                        </a>
                    </li>
                    <li  v-show="cart.show"><a href="javascript:;" title="购物车"><i class="layui-icon layui-icon-cart"></i></a></li>
                    <li  v-show="faq.show"><a href="javascript:;" title="帮助文档"><i class="layui-icon layui-icon-help"></i></a></li>
                </ul>
                <div class="nav-user">
                    <img src="/modules/backend/images/avatar.jpg" >
                    <ul>
                        <li>
                            <img src="/modules/backend/images/avatar.jpg" ><p>账号信息</p>
                        </li>
                        <li>
                            <i class="layui-icon layui-icon-vercode"></i>   
                            <a href="javascript:;">菜单1</a>
                        </li>
                        <li>
                            <i class="layui-icon layui-icon-key"></i>   
                            <a href="javascript:;">菜单1</a>
                        </li>
                        <li>
                            <i class="layui-icon layui-icon-diamond"></i>   
                            <a href="javascript:;">菜单1</a>
                        </li>
                        <li class="logout">
                            <a href="./backend/logout" >退出登录</a>
                        </li>
                    </ul>
                </div>
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
                    <input type="text" placeholder="请输入关键字"  @input="searchMenu($event)" v-model="search.search_val" @focus="menu.search_focus=1" @blur="menu.search_focus=0">
                </div>
                <div class="menu-list--main">
                    <!--有搜索结果 -->
                    <div v-show="search.res.length">
                        <div v-for="(i,index) in search.res" class ="menu-list--item"  >
                            <a :class="{'check':menu.current_menu==index}" :name="i.title" > {{i.title}}</a>
                            <a v-for="item in i.lists" :href="item.url?item.url:'javascript:;'"  @click.stop.prevent="clickMenu(item)" :class="{'isadd':item.isadd}">{{item.name}}
                                <i @click.stop.prevent="collection(item)" :class="[item.isadd?'layui-icon-rate-solid':'layui-icon-rate','layui-icon']" ></i>
                            </a>
                        </div>
                    </div>
                    <!--默认列表-->
                    <div v-show="!search.res.length">
                        <div v-for="(i,index) in menu.menu_list" class="menu-list--item"  >
                            <a :class="{'check':menu.current_menu==index}" :name="i.title" > {{i.title}}</a>
                            <a v-for="item in i.lists" :href="item.url?item.url:'javascript:;'"  @click.stop.prevent="clickMenu(item)" :class="{'isadd':item.isadd}">{{item.name}}
                                <!--添加到左侧列表-->
                                <i @click.stop.prevent="collection(item)" :class="[item.isadd?'layui-icon-rate-solid':'layui-icon-rate','layui-icon']" ></i>
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
{/literal}
<script type="text/javascript">
    var menu={$naviMenus};
    console.log(menu)
    layui.config({
        base: "{'layui'|assets}",
        module: "{'/'|res}",
    });
    {literal}
    layui.use(['@backend.index'], function(home) {
         home.init({
                 menu:menu.naviMenus,
                 links:[
                     {
                        title:"系统菜单1",
                        navs:[
                            {name:"nav1",url:"/backend/test1"},
                            {name:"nav1",url:"/backend/test1"},
                        ]
                     },
                     {
                        title:"系统菜单2",
                        navs:[
                            {name:"nav2",url:"/backend/test2"},
                            {name:"nav2",url:"/backend/test2"},
                        ]
                     },
                 ],
                 notice:{
                     show:1,//显示
                     new:1,//是否有新消息
                     url:"",
                 },
                 cart:{
                     show:0,//显示
                     url:"",
                 },
                 faq:{
                     show:1,//显示
                     url:"",
                 },

         })
    })
    {/literal}
</script>

<div id="workspace">
    <div class="view">
       {include "$workspaceView"}
    </div>
</div>
</body>
</html>