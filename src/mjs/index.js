layui.define(['&coolay','jquery'], (exports) => {
    'use strict';
    let $ = layui.$,coolay = layui['&coolay']
    let menu = null,app= null,home = {
        init (menu){
            app = new Vue({
                el     : '#index',
                data   : {
                    menu: {
                        show           : 0,
                        listshow       : 0,
                        search_focus   : 0,
                        module_show    : 0,
                        collection_list: [],
                        menu_list      : menu,
                        // menu_list      : [
                        //     {
                        //         title:"系统菜单1",
                        //         lists:[
                        //             {name:"子菜单11",url:'/'},
                        //             {name:"子菜单22",url:'/'},
                        //         ],
                        //     },
                        //     {
                        //         title:"系统菜单2",
                        //         lists:[
                        //             {name:"子菜单22",url:'/'},
                        //             {name:"子菜单33",url:'/'},
                        //         ],
                        //     },
                        //     {
                        //         title:"系统菜单3",
                        //         lists:[
                        //             {name:"子菜单33",url:'/'},
                        //             {name:"子菜单11",url:'/'},
                        //         ],
                        //     }
                        // ],
                        res_list:{
                            title:"搜索结果",
                            lists:[],  
                        },
                        current_menu   : -1,
                    },
                    // 拖动
                    drop: {
                        start  : '',
                        target : '',
                        current: -1,
                    },
                    ajax:{
                        error:0,
                        success:0,
                    },
                    search:{
                        search_val:'',
                        t:"",
                        res:[],
                    }

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
                        this.getHtml(item);
                        history.pushState({comp: item}, item.url, item.url);
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
                    getHtml(item){
                        var $vm=this;
                        $.ajax({
                            url:item.url,
                            method:'GET',
                            timeout:5000,
                            beforeSend: function(req){
                                req.setRequestHeader('PJAX','1')
                                //初始化进度条
                                $vm.ajax.error   = 0;
                                $vm.ajax.success = 0;
                                $('.layui-progress').show();
                                layui.element.progress('install-progress', '0');

                            },
                            success:function(res){
                                var workspace=$('#workspace .view')
                                    workspace.html(res);
                                        layui.element.progress('install-progress', '100%');   
                            },
                            complete:function(XMLHttpRequest,status){    
                                console.log(XMLHttpRequest);                                
                                //删除进度条
                                setTimeout(() => {
                                    layui.element.progress('install-progress', '0');
                                    $('.layui-progress').hide();
                                },2000);
                            },
                            error:function(){
                                //接口请求失败
                                $vm.ajax.error = 1;
                            },
                            dataType:'html'
                        });
                    },
                    pushStateInit(){
                        //初始化根据 pushState 加载对应组件
                        if(history.state){
                            this.getHtml(history.state.comp)
                        }   
                    },
                },
               
                mounted() {
                    console.log('indexjs')
                    var $vm=this;
                    window.onpopstate = function(e) {
                        if(e.state){
                            $vm.getHtml(e.state.comp)   
                        }
                    }
                    this.pushStateInit();
                    

                }
            });
        }
    };

    exports('@backend.index', home);
});
