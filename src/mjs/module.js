layui.define(['layer','jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    let module={
        init(wlist){
            return new Vue({
                el     : '#module',
                data   : {
                    list:[
                        // {
                        //     id:1,
                        //     name:"模块一",
                        //     width:"25",
                        //     isadd:0,
                        // },
                        // {
                        //     id:2,
                        //     name:"模块二",
                        //     width:"50",
                        //     isadd:0,
                        // },
                        // {
                        //     id:3,
                        //     name:"模块三",
                        //     width:"75",
                        //     isadd:0,
                        // },
                        // {
                        //     id:4,
                        //     name:"模块四",
                        //     width:"100",
                        //     isadd:0,
                        // },
                    ],
                    module_list:[],
                    //控制侧边栏开启关闭
                    hide_sid:0,
                    sid_show:0,
                    //自定义模块主页面显示
                    mod_show:0,
                },
                methods: {
                    addModule(m){
                        let el,item={},$vm=this;
                            item=m;
                            if(m.isadd){
                                // 删除
                                el=this.module_list.findIndex(function(c){
                                    return c.name==m.name
                                })
                                this.module_list.splice(el,1);
                            }else{
                                //添加
                                layui.use('@'+item.name, function(widget) {
                                    $vm.module_list.push(item);
                                }) 
                            }
                            m.isadd=!m.isadd;



                    },
                    saveModule(){
                        //自定义模块保存暂时存入localstrog
                        if(!window.localStorage){
                            alert("浏览器不支持localstorage");
                            return false;
                        }else{
                            window.localStorage.setItem('module_list',JSON.stringify(this.module_list));
                            this.sid_show=1;
                            layer.msg("保存成功")
                        }
                    },
                    initModule(){
                        if(location.href.split('/')[location.href.split('/').length-1]!='backend'){
                            this.mod_show=0;
                        }else{
                            this.mod_show=1;
                        }
                        //获取本地localstorge数据,显示已添加模块
                        let stroge_module_list=JSON.parse(window.localStorage.getItem('module_list'));
                        if(stroge_module_list && stroge_module_list.length){
                            this.module_list=stroge_module_list;
                            for (let item of this.module_list) {
                                let index=this.list.findIndex((val)=>{
                                    return val.id==item.id
                                })
                                this.list[index].isadd=1
                                layui.use('@'+this.list[index].name, function(widget) {}) 
                            }
                        }
                    },
                    rander(){
                        let $vm=this;
                        layui.use(wlist, function(...widget) {
                            console.log(widget)
                            widget.forEach(item => {
                                $vm.list.push(item.cfg)
                            })
                            $vm.initModule();
                        }) 
                    }
                    
                },
                mounted() {
                    console.log('module')
                    this.list=wlist;
                    this.initModule();
                },
            }); 
        }
    }
    exports('@backend.module', module);
});
