<!DOCTYPE html>
<html class="{$pageMeta.htmlCls}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{$page_title|default:$pageMeta.defaultTitle|escape}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/css/layui.css'|res}">
    <link rel="stylesheet" href="{'backend/css/index.css'|res}">
    <script type="text/javascript" src="{'backend/layui.js'|res}"></script>
    <script type="text/javascript" src="{'backend/vue.js'|res}"></script>
</head>
<body style="padding:0;margin:0;{$pageMeta.pageStyle}" class="{$pageMeta.bodyCls}">
{literal}
    <header id="index" v-cloak>
        <div class="layui-progress" lay-filter="install-progress">
            <div class="layui-progress-bar " :class="[ajax.error?'layui-bg-red':'layui-bg-blue']" lay-percent="0%"></div>
        </div>
        <div class="nav">
            <div class="nav-left">
                <div>
                    <img class="icon" src="/modules/backend/images/icon.png" @mouseenter="menu.show=!menu.show;menu.listshow=0">
                </div>
                <img class="logo" src="/modules/backend/images/logo.png" @click="goHome">
                <p class="logo-name">Cms</p>
            </div>
            <div class="nav-right">
                <!--搜索框-->
                <input type="text" class="search" @input="doSearch" v-model="nav.search_val" placeholder="搜索文档、控制台、API"><i class="layui-icon layui-icon-search"></i>
                <!--搜索结果-->
                <ul class="search-result" v-show="nav.show">
                    <li v-for="(item,i) in 5">{{nav.search_val+i}}</li>
                </ul>
                <!--自定义菜单-->
                <ul class="links">
                    <li v-for="item in links" class="links_menu">
                        <a href="javascript:;">{{item.title}}</a>
                        <ul>
                            <li v-for="sub_item in item.navs"><a @click.stop.prevent="clickMenu(sub_item)" :href="sub_item.url">{{sub_item.name}}</a></li>
                        </ul>
                    </li>
                    <li v-show="notice.data.show" class="links_notice">
                        <a href="javascript:;" title="消息" @click="showNotice">
                            <i :class="[notice.data.new?'has-notice':'','layui-icon layui-icon-notice']"><span v-show="notice.data.new" class="layui-badge-dot"></span></i>
                        </a>
                        <ul v-show="1">
                            <li v-for="item in notice.data.list">
                                <fieldset>
                                    <legend>{{item.title+" "+item.time}}</legend>
                                    <p>{{item.msg}}</p>
                                </fieldset>
                            </li>
                        </ul>
                    </li>
                    <li v-show="cart.show"><a href="javascript:;" title="购物车"><i class="layui-icon layui-icon-cart"></i></a></li>
                    <li v-show="faq.show"><a href="javascript:;" title="帮助文档"><i class="layui-icon layui-icon-help"></i></a></li>
                </ul>
                <!--用户信息-->
                <div class="nav-user">
                    <img :src="uMeta.avatar">
                    <ul>
                        <li>
                            <img :src="uMeta.avatar">
                            <p>{{uMeta.username}} [{{uMeta.nickname}}]</p>
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
                            <a :href="path.login.url">退出登录</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div :class="[menu.show?'menu--show':'','menu']">
            <div class="bg" @click="menu.show=!menu.show;menu.listshow=0"></div>
            <!--侧边栏-->
            <aside>
                <p class="more" @click="menu.listshow=!menu.listshow">
                    <i class="layui-icon layui-icon-component icon-left"></i>
                    功能导航
                    <i class="layui-icon layui-icon-right icon-right"></i>
                </p>
                <ul>
                    <li v-for="(i,index) in menu.collection_list" draggable="true" @dragenter="dragenter(i)" @dragstart="dragstart(i)" @dragend="dragend" :class="{'bedrop':drop.current==index}">
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
                    <input type="text" placeholder="请输入关键字" @input="searchMenu($event)" v-model="search.search_val" @focus="menu.search_focus=1" @blur="menu.search_focus=0">
                </div>
                <div class="menu-list--main">
                    <!--有搜索结果 -->
                    <div v-show="search.res.length">
                        <div v-for="(i,index) in search.res" class="menu-list--item">
                            <a :class="{'check':menu.current_menu==index}" :name="i.title"> {{i.title}}</a>
                            <a v-for="item in i.lists" :href="item.url?item.url:'javascript:;'" @click.stop.prevent="clickMenu(item)" :class="{'isadd':item.isadd}">{{item.name}}
                                <i @click.stop.prevent="collection(item)" :class="[item.isadd?'layui-icon-rate-solid':'layui-icon-rate','layui-icon']"></i>
                            </a>
                        </div>
                    </div>
                    <!--默认列表-->
                    <div v-show="!search.res.length">
                        <div v-for="(i,index) in menu.menu_list" class="menu-list--item">
                            <a :class="{'check':menu.current_menu==index}" :name="i.title"> {{i.title}}</a>
                            <a v-for="item in i.items" :href="item.url?item.url:'javascript:;'" @click.stop.prevent="clickMenu(item)" :class="{'isadd':item.isadd}">{{item.name}}
                                <!--添加到左侧列表-->
                                <i @click.stop.prevent="collection(item)" :class="[item.isadd?'layui-icon-rate-solid':'layui-icon-rate','layui-icon']"></i>
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
    layui.config({$layuiCfg|json_encode:64}).use(['&coolay', '@backend.index','jquery'], function (cool, home,$) {
        cool.init({$pageMeta|json_encode:64},{$userMeta|json_encode:64})
        {literal}
        cool.path={
            login:{
                url:'/backend/logout',
                cb:'',
            },
            backend:{
                url:'/backend',
                cb:'',
            }
        }
        cool.naviCfg.notice.list=[
            {title:"消息一",msg:"消息1消息1消息1消息1消息1消息1",time:"17:52"},
            {title:"消息二",msg:"消息2消息2消息2消息2消息2消息2消息2消息2",time:"17:52"},
            {title:"消息三",msg:"消息2消息2消息2消消息2消息2消息2消息2消息2消息2消息2消息2息2消息2消息2消息2消息2",time:"17:52"},
        ]


        console.log(cool)
        home.init(cool)
        $('body').on("dosearch",".nav-right .search",function(res,param){
            console.log(param)
        });
        {/literal}

    })
</script>
<div id="workspace">
    {include "$workspaceView"}
</div>
</body>
</html>