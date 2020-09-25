layui.define(['&coolay','jquery','element'], (exports) => {
    'use strict';
    let $ = layui.$,coolay = layui['&coolay'],element = layui['element'];
    console.log(element)
    let menu = null,app= null,home = {
        init (data){
            app = new Vue({
                el     : '#index',
                data   : {
                    menu: {
                        show           : 0,
                        listshow       : 0,
                        search_focus   : 0,
                        module_show    : 0,
                        collection_list: [],
                        menu_list      :data.naviCfg.menu,
                        res_list:{
                            title:"搜索结果",
                            lists:[],  
                        },
                        current_menu   : -1,
                    },
                    links:data.naviCfg.tmenu,

                    notice:{
                        data:data.naviCfg.notice,
                        list_show:0,
                        list:[],
                    },
                    cart:data.naviCfg.cart,
                    faq:data.naviCfg.faq,
                    uMeta:data.uMeta,
                    pMeta:data.pMeta,
                    path:data.path,
                    //mod:mod,
                    // 拖动
                    drop: {
                        start  : '',
                        target : '',
                        current: -1,
                    },
                    ajax:{
                        error:0,
                        success:0,
                        request:null,
                    },
                    search:{
                        search_val:'',
                        t:"",
                        res:[],
                    },
                    nav:{
                        search_val:"",
                        show:0,
                    },
                    vm:null,
                },
                methods: {
                    // 标签添加到左侧sider
                    collection(item) {
                        let el;
                        if (item.isadd) {
                            // 删除
                            el = this.menu.collection_list.findIndex(function (c) {
                                return c.name == item.name
                            })
                            this.menu.collection_list.splice(el, 1);
                        } else {
                            //添加
                            this.menu.collection_list.push(item);
                        }
                        item.isadd = !item.isadd;
                    },
                    dragstart(item) {
                        this.drop.start = item;
                    },
                    dragend() {
                        //结束拖动
                        let sindex, tindex, $vm = this;
                        if (this.drop.start.name != this.drop.target.name) {
                            sindex = this.menu.collection_list.findIndex(function (c) {
                                return c.name == $vm.drop.start.name
                            });
                            tindex = this.menu.collection_list.findIndex(function (c) {
                                return c.name == $vm.drop.target.name
                            });
                            this.menu.collection_list.splice(sindex, 1, this.drop.target);
                            this.menu.collection_list.splice(tindex, 1, this.drop.start);
                            this.drop.current = -1;
                        }
                    },
                    dragenter(item) {
                        //拖动中 展示拖动效果
                        this.drop.current = this.menu.collection_list.findIndex(function (c) {
                            return c.name == item.name
                        });
                        this.drop.target  = item;
                    },
                    clickMenu(item){
                        //清空workspace
                       
                        // $('#workspace').html('')

                        if(item.url.indexOf('#')!=-1){
                            this.getComp(item.url);
                        }else{
                            if(location.pathname==item.url && !location.hash)return;
                            this.getHtml(item);
                        }
                        this.menu.show=this.menu.listshow=0;
                        history.pushState({comp: item}, item.url, item.url);
                        $('#module').hide();
                    },
                    doSearch(val){
                        let $vm=this;
                        $vm.nav.show=1;
                        $(".nav-right .search").trigger("dosearch",{
                            val:$vm.nav.search_val
                        });
                    },
                    searchMenu(e){
                        let [$vm,arr]=[this,[]]
                        if(!$vm.search.search_val){
                            $vm.search.res=[];
                            return;
                        }
                        if($vm.search.t){
                            window.clearTimeout($vm.search.t);
                            $vm.search.t=0;
                        }
                        //设时延迟0.8s执行
                        $vm.search.t=setTimeout(function(){    
                            $vm.search.t=0;
                            $vm.search.res=[];
                            $vm.search.res=$vm.menu.menu_list.map(function(item,i,arr){
                                arr=item.lists.filter(function(item_sub){
                                    return item_sub.name.includes($vm.search.search_val);
                                })
                                return {
                                    title:item.title,
                                    lists:arr
                                }
                            })
                            $vm.search.res=$vm.search.res.filter(function(item){
                                return item.lists.length;
                            })
                        },800);

                    },
                    getComp(hash){
                        var name=hash.replace('#','@').replace('/','.');
                        var $vm=this;
                        layui.use(name,conf=>{
                            $('#workspace').html(conf.tpl);
                            conf.vue.el='#workspace';
                            $vm.vm=new Vue(conf.vue)
                        })
                    },
                    getHtml(item){
                        var $vm=this;
                        this.ajax.request=$.ajax({
                            url:item.url,
                            method:'GET',
                            timeout:5000,
                            dataType:'html',
                            beforeSend: function(req){
                                req.setRequestHeader('PJAX','1')
                                //初始化进度条
                                $vm.ajax.error   = 0;
                                $vm.ajax.success = 0;
                                $('.layui-progress').show();
                                element.progress('install-progress', '0');

                            },
                            success:function(res){
                                var workspace=$('#workspace')
                                    if (window.vueVm) {
                                        console.log('销毁')
                                        window.vueVm.$destroy();
                                    }
                                    workspace.html(res);
                                    element.progress('install-progress', '100%');   
                                    
                            },
                            complete:function(XMLHttpRequest){    
                                coolay.setPageTitle(XMLHttpRequest.getResponseHeader('PageTitle'))
                                    //删除进度条
                                setTimeout(() => {
                                    element.progress('install-progress', '0');
                                    $('.layui-progress').hide();
                                    $vm.ajax.error = 0;
                                },2000);
                                
                                if(item.url==$vm.path.backend.url){
                                    $('#module').show();
                                }
                                $vm.ajax.request=null;
                            },
                            error:function(res){
                                //接口请求失败
                                new Promise((resovle,reject)=>{
                                    setTimeout(() => {
                                        $('#workspace').html(res.responseText);
                                        element.progress('install-progress', '100%');   
                                        $vm.ajax.error = 1;
                                        reject(res)
                                    }, 500);
                                }).catch(res=>{
                                    $vm.doStatus(res.status);
                                })
                            },
                        });
                    },
                    doStatus(status){
                        var $vm=this;
                        if(status==401){
                            layer.msg('登录失败请重新登录', {
                                time: 2000
                            }, function(){
                                if($vm.path.login.cb){
                                    $vm.path.login.cb();
                                }else{
                                    location.href=$vm.path.login.url;
                                }
                                return
                            });
                        }
                        if(status==403){
                            layer.msg('账号权限不够');
                            return
                        }

                    },
                    goHome(){
                        var $vm=this;
                        if(location.pathname+location.hash==$vm.path.backend.url)return;
                        this.getHtml({url:$vm.path.backend.url})
                        history.pushState({comp: {url:$vm.path.backend.url}},$vm.path.backend.url,$vm.path.backend.url);
                        
                       
                    },
                    showNotice(){
                        var $vm=this;
                        
                        if(!$vm.notice.data.new){
                            return
                        }
                        $vm.notice.list_show=1;

                    },
                },
                mounted() {
                    let $vm=this;
                    
                    if(window.location.hash){
                        history.pushState({comp: {url:window.location.hash,}}, window.location.hash, window.location.hash);
                        $vm.getComp(window.location.hash)  
                    }else{
                        history.pushState({comp: {url:location.pathname,}}, location.pathname, location.pathname);
                    }

                    window.onpopstate = function(e) {
                        console.log($vm.ajax.request)
                        if($vm.ajax.request) $vm.ajax.request.abort();

                        if(e.state){
                            if(e.state.comp.url.indexOf('#')!=-1){
                                $vm.getComp(window.location.hash)  
                            }else{
                                $vm.getHtml(e.state.comp)  
                            }
                        }else if(window.location.hash){
                            $vm.getComp(window.location.hash)  
                        }
                        
                    }
                },
            });
        }
    };

    exports('@backend.index', home);
});
