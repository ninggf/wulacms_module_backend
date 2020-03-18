layui.define(['jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    const app = new Vue({
        el     : '#index',
        data   : {
            menu:{
                show:0,
                listshow:0,
                search_focus:0,
            },
        },
        methods: {
            
        },
        mounted() {
            console.log('index')
        },
    });

    exports('@backend.index', app);
});
