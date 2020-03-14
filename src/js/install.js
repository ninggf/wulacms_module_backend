layui.define(['jquery'], (exports) => {
    'use strict';
    const $   = layui.$;
    const app = new Vue({
        el     : '#install',
        data   : {
            // 环境监测 
            step            : [
                {title: '环境检测', name: 'home'},
                {title: '安全码验证', name: 'verify'},
                {title: '环境选择', name: 'config'},
                {title: '数据库配置', name: 'db'},
                {title: '创建管理员', name: 'user'},
                {title: '安装', name: 'install'},
                {title: '完成', name: 'finfish'},
            ],
            requirements    : window.vueData.requirements,
            dirs            : window.vueData.dirs,
            page_step       : window.vueData.step,
            page_data       : window.vueData.data,
            status          : 0,//0提交验证 1验证中 //2验证通过//3禁止
            current         : 'home',
            install_progress: 0,
            tips            : "",
            verify          : {
                code: '',
            },
            config          : {
                config: 'pro',
            },
            db              : {
                type      : 'MYSQL',
                dbname    : '',
                dbusername: '',
                dbpwd     : '',
                host      : '',
                port      : '',
            },
            user            : {
                name       : '',
                pwd        : '',
                confirm_pwd: '',
                url        : 'backend'
            }
        },
        methods: {
            verifyNext() {
                let flag = 1;
                this.requirements.map(function (v) {
                    if (!(v[1].pass | v[1].optional)) flag = 0;

                })
                this.dirs.map(function (v) {
                    if (!(v[1].pass | v[1].optional)) flag = 0;

                })
                return flag;
            },
            go(type) {
                if (!type) return;

                let $vm    = this;
                $vm.tips   = '';
                $vm.status = 0;
                $("input").removeClass("tips");
                for (var i = 0; i < $vm.step.length; i++) {
                    if ($vm.step[i].name == $vm.current) {
                        $vm.current = type == 'next' ? $vm.step[i + 1].name : $vm.step[i - 1].name;

                        if ($vm.current == 'install') {
                            $vm.doInstall();
                        }
                        return;
                    }
                }
            },
            removeTips(name) {
                $("input." + name).removeClass("tips");
            },

            setup(name) {
                var $vm     = this, api = "installer/setup", tips_arr = [];
                this.status = 1;
                // 本地检查input填写
                if (name == "db" || name == "user") {
                    for (var i in $vm[name]) {
                        if (!$vm[name][i] && i != "port" && i != "host") {
                            tips_arr.push('input.' + i);
                        }
                    }
                    while (tips_arr.length) {
                        $(tips_arr.shift()).addClass('tips');
                        if (tips_arr.length == 0) {
                            $vm.status = 0;
                            return;
                        }
                    }

                }

                if (name == 'verify') {
                    api = 'installer/verify';
                }
                $.post(api, api == "installer/setup" ? {step: name, cfg: $vm[name]} : {
                    step: name,
                    code: $vm.verify.code
                }, function (data) {
                    if (data && data.status) {
                        $vm.status = 1;
                        $vm.go('next');
                    } else {
                        $vm.current = data.step;
                        $vm.tips    = data.msg || 'tips';
                        $vm.status  = 0;
                    }
                });
            },
            doInstall() {
                let $vm = this, response_len = false, data = null;
                $.get({
                    url      : 'installer/install',
                    timeout  : 3000000,
                    dataType : 'text',
                    xhrFields: {
                        onprogress: function (e) {
                            let response, resp = e.currentTarget.response;
                            if (response_len === false) {
                                response     = resp;
                                response_len = resp.length;
                            } else {
                                response     = resp.substring(response_len);
                                response_len = resp.length;
                            }
                            console.log(response);
                            data = JSON.parse(response);
                            console.log(data);
                        }
                    }
                }, (data) => {
                    console.log('install is done')
                });
            }
        },
        mounted() {
            if (this.page_step) {
                for (let i in this.page_data) {
                    if (this.page_data[i] && this[i])
                        this[i] = this.page_data[i];
                }
                this.current = this.page_step;
            }
        }
    });

    exports('&install', app);
});
