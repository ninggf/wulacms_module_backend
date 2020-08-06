layui.define(['layer','jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    let module={
        init(wlist){
            return new Vue({
                el     : '#module',
                data   : {
                    list:[],
                    module_list:[],
                    module_r_list:[],
                    //控制侧边栏开启关闭
                    hide_sid:0,
                    sid_show:0,
                    //自定义模块主页面显示
                    mod_show:0,
                },
                methods: {
                    add(m){
                        let el,$vm=this;
                            if(m.isadd){
                                // 删除
                                el=this.module_list.findIndex(function(c){
                                    return c.name==m.name
                                })
                                this.module_list.splice(el,1);
                            }else{
                                //添加
                                layui.use('@'+m.name, function(widget) {
                                    $vm.module_list.push(widget.cfg);
                                }) 
                            }
                            m.isadd=!m.isadd;
                    },
                    saveModule(){
                    },
                    init(){
                        let $vm=this;
                        this.list=wlist;
                        this.mod_show=location.href.split('/')[location.href.split('/').length-1]!='backend'?0:1;

                        this.list.forEach(item=>{
                            if(item.isadd){
                                layui.use('@'+item.name, function(widget) {
                                    widget.cfg.width=item.width;
                                    widget.cfg.pos=item.pos;
                                    $vm.module_list.push(widget.cfg);
                                }) 
                            }
                        })
                       
                    }   
                },
                mounted() {
                    console.log('module')
                    this.init();
                },
            }); 
        }
    }

    exports('@backend.module', module);
});
