layui.define(['layer', 'form', 'admin'], cb => {
    let $ = layui.$, form = layui.form, layer = layui.layer, admin = layui.admin;

    class Login {
        init() {
            $('.login-captcha').on('click', function () {
                $(this).attr('src', $(this).data('src') + '?_=' + (new Date()).getTime())
            });
            form.on('submit(loginSubmit)', obj => {
                let loadIndex = layer.load(2);
                admin.ajax({
                    url   : admin.url('backend/login'),
                    method: 'POST',
                    data  : obj.field,
                    success(data) {
                        layer.close(loadIndex);
                        if (data.code && data.code === 200) {
                            if (data.target) {
                                window.location = data.target;
                            } else {
                                window.location = admin.url('backend');
                            }
                            return;
                        }
                        if (data.args && data.args.ent >= 3) {
                            $('.login-captcha').click()
                            $('.login-captcha-group').show()
                            $('input[name=captcha]').attr('lay-verify', 'required').attr('lay-reqText', '请填写验证码')
                        }
                        if (data.message) {
                            if (data.args && data.args.elem) {
                                layer.tips(data.message, data.args.elem)
                            } else {
                                layer.msg(data.message, {
                                    icon: 2,
                                    time: 2000
                                })
                            }
                        }
                    }
                })
                return false;
            });
        }
    }

    cb('@backend.login', new Login());
});