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
                        menu_list      : [
                            {
                                title: '弹性计算',
                                
                                list : [
                                    {name: "111",click:'event:aaaaaaa',},
                                    {name: "222",url:'https://9944.com'},
                                    {name: "333",click:'func:@backend.user#alert'},
                                    {name: "444"},
                                    {name: "555"},
                                    {name: "666"},
                                    {name: "777"},
                                    {name: "888"},
                                    {name: "999"},
                                ],
                            },
                            {
                                title: '分析',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '监控',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '管理',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '数据',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '应用',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '服务',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                            {
                                title: '安全',
                                list : [
                                    {name: "负载均衡"},
                                    {name: "批量计算"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                    {name: "资源编排"},
                                ],
                            },
                        ],
                        current_menu   : -1,
                    },
                    // 拖动
                    drop: {
                        start  : '',
                        target : '',
                        current: -1,
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
                    
                },
                mounted() {
                   
                }
            });
        }
    };

    exports('@backend.index', home);
});
