layui.define(['jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    const app = new Vue({
        el     : '#login',
        data   : {
            winData     : window.winData,
            login       : {
                username : '',
                passwd   : '',
                captcha  : '',
                autologin: 0,
            },
            vcode_show  : window.winData.ent >= 3,
            captcha_src : window.winData.captcha + '?size=150x60&font=28',
            captcha_src1: '',
            errormsg    : '',
        },
        methods: {
            submit() {
                let $vm       = this;
                this.errormsg = '';
                //本地检查
                if (!this.login.username) {
                    this.errormsg = "请输入用户名";
                    return
                }
                if (!this.login.passwd) {
                    this.errormsg = "请输入密码";
                    return
                }
                if (!this.login.captcha && this.vcode_show) {
                    this.errormsg = "请输入验证码";
                    return
                }
                $vm.login.autologin=$vm.login.autologin?1:0;
                $.post('./login', $vm.login, function (res) {
                    if (res && res.code == 500) {
                        $vm.errormsg = res.message;
                        if (res.args.ent >= 3 && !$vm.vcode_show) {
                            $vm.captcha_src1 = $vm.captcha_src + '&t=' + Math.random();
                            $vm.vcode_show   = 1;
                        }
                    } else if (res && res.code == 200) {
                        location.href = res.target;
                    }
                });
            }
        },
        mounted() {
            console.log("login.js")
            if (this.vcode_show) {
                this.captcha_src1 = this.captcha_src + '&t=' + Math.random();
            }
        }
    });

    exports('@backend.login', app);
});
