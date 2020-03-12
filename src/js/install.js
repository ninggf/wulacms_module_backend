layui.define(['jquery'],(exports) => {
    'use strict';
    const $ = layui.$;
    const app = new Vue({
        el: '.install',
        data: {
            // 环境监测 
            step: [
                {title:'环境检测',name:'home'},
                {title:'安全码验证',name:'verify'},
                {title:'环境选择',name:'config'},
                {title:'数据库配置',name:'db'},
                {title:'创建管理员',name:'user'},
                {title:'安装',name:'install'},
                {title:'完成',name:'finfish'},
            ],
            requirements:window.vueData.requirements,
            dirs:window.vueData.dirs,
            status:0,//0提交验证 1验证中 //2验证通过//3禁止
            data:{
                code:'',
                config:'pro',
                db:'MYSQL',
                dbname:'',
                dbusername:'',
                dbpwd:'',
                host:'',
                port:'',
                username:'',
                userpwd:'',
                confirm_pwd:'',
            },
            current:'home',
            install_progress:0,
            tips:"",
        },
        methods: {
            verifyNext(){
                let flag=1;
                this.requirements.map(function(v){
                    if(!(v[1].pass|v[1].optional))flag=0;
                    
                })
                this.dirs.map(function(v){
                    if(!(v[1].pass|v[1].optional))flag=0;
                    
                })
                return flag;
            },
            go(type){
                let $vm=this;
                    $vm.tips='';
                    $vm.status=0;
                for(var i=0;i<$vm.step.length;i++){
                    if($vm.step[i].name==$vm.current){
                        $vm.current=type=='next'?$vm.step[i+1].name:$vm.step[i-1].name;
                        return;
                    }
                }
            },
            setup(step){
                var $vm=this,data={},api="installer/setup";
                this.status=1;
                switch (step) {
                    case 'config':
                    data.config=$vm.data.config
                    break;
                    case 'db':
                    data.db=$vm.data.db;
                    data.dbname=$vm.data.dbname;
                    data.dbusername=$vm.data.dbusername;
                    data.dbpwd=$vm.data.dbpwd;
                    data.host=$vm.data.host;
                    data.port=$vm.data.port;
                    break;
                    case 'user':
                    data.username=$vm.data.username;
                    data.dbpwd=$vm.data.dbpwd;
                    break;
                    case 'verify':
                    data.code=$vm.data.code;
                    api='installer/verify';
                    break;
                }
                $.post(api,api=="installer/setup"?{step:$vm.current,cfg:data,}:{code:$vm.data.code,step:$vm.current},function (data) {
                    if(data && data.status){
                        $vm.status=1;
                        $vm.go('next');
                    }else{
                        $vm.current=data.step;
                        $vm.tips=data.msg||'tips';
                        $vm.status=0;
                    }
                });
            },
            doInstall(){
                var $vm=this;
                var t;
                t=setInterval(() => {
                    $vm.install_progress++;
                    layui.element.progress('install-progress',$vm.install_progress+'%');
                    if($vm.install_progress>=100){
                        clearInterval(t);
                    }
                }, 50);
            },
        },
        mounted() {
        },
        watch: {
            
        },
    });

    exports('&install', app);
});
