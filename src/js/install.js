layui.define((exports) => {
    'use strict';
    const app = new Vue({
        el: '.install',
        data: {
            // 环境监测 
            steps: ['环境检测', '安全码验证', '数据库配置', '安装', '完成'],
            steps_titles: ['环境检测', '安全码验证', '数据库配置', '安装','完成'],
            c_step: 0,
            radios:{
                inputs:{
                    Standard:'Install with commonly used features pre-configured.',
                    Minimal:'Build a custom site without pre-configured functionality. Suitable for advanced users.',
                    Demo:'Build a custom site without pre-configured functionality. Suitable for advanced users.',
                }
            },
            verify: {
                system: {
                    'WEB SERVER': 'Apache/2.4.39 (Win64) OpenSSL/1.1.1b mod_fcgid/2.3.9a mod_log_rotate/1.02',
                    'PHP': '7.3.4',
                    'PHP EXTENSIONS': 'Enabled',
                    'RANDOM NUMBER GENERATION': 'Successful',
                }
            },
            database:{
                option:{
                    show:0,
                }
            },
            install_progress:0,
            
        },
        methods: {},
        mounted() {
            console.log('aa');
        },
        watch: {
            c_step(val){
                var $vm=this;
                var t;
                if(val==4 && $vm.install_progress==0){
                    //开始安装
                    
                    t=setInterval(() => {
                        $vm.install_progress++;
                        layui.element.progress('install-progress',$vm.install_progress+'%');
                        if($vm.install_progress>=100){
                            clearInterval(t);
                        }
                    }, 100);
                    // console.log(layui.element.progress());
                }
            }
        },
    });

    exports('&install', app);
});
