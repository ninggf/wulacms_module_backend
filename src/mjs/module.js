layui.define(['jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    const app = new Vue({
        el     : '#module',
        data   : {
            list:[
                {
                    title:"模块一",
                    width:"25%",
                    isadd:0,
                },
                {
                    title:"模块二",
                    width:"50%",
                    isadd:0,
                },
                {
                    title:"模块三",
                    width:"75%",
                    isadd:0,
                },
            ],
            module_list:[],
            //控制侧边栏开启关闭
            hide_sid:0,
            sid_show:0,
        },
        methods: {
            addModule(m){
                let el,item={};
                    item.width=m.width;
                    item.title=m.title;
                    if(m.isadd){
                        // 删除
                        el=this.module_list.findIndex(function(c){
                            return c.title==m.title
                        })
                        this.module_list.splice(el,1);
                    }else{
                        //添加
                        this.module_list.push(item);
                    }
                    m.isadd=!m.isadd;
            }
        },
        mounted() {
            console.log('module')
        },
    });

    exports('@backend.module', app);
});
