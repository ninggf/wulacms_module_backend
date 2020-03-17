layui.define(['jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    const app = new Vue({
        el     : '#login',
        data   : {
            winData:window.winData,
            login:{
                username:'',
                passwd:'',
                captcha:'',
                // vcode_show:1,
                vcode_show:window.winData.ent>=3,
                captcha_src:window.winData.captcha+'?size=150x60&font=20',
                autologin:1,
            },
            errormsg:"",
        },
        methods: {
            submit(){
                let $vm=this;
                this.errormsg='';
                //本地检查
                if(!this.login.username){
                    this.errormsg="请输入用户名";
                    return 
                }
                if(!this.login.passwd){
                    this.errormsg="请输入密码";
                    return 
                }
                if(!this.login.captcha && this.login.vcode_show){
                    this.errormsg="请输入验证码";
                    return 
                }

                $.post('./login',$vm.login, function (res) {
                    if(res&&res.code==500){
                        $vm.errormsg=res.message;
                        if(res.args.ent>=3){
                            $vm.vcode_show=1;
                        }
                    }else if(res&&res.code==200){
                        location.href=res.target;
                    }

                });

            },
            updateVcode(){
                var t=Math.random();
            }
        },
        mounted() {
            console.log(this.winData)
        },
        
    });

    exports('@backend.login', app);
});
