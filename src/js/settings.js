layui.define(['jquery', 'form', 'admin', 'notice', 'layer'], cb => {
    let layer  = layui.layer,
        form   = layui.form,
        admin  = layui.admin,
        notice = layui.notice;

    class Settings {
        init(id, data) {
            form.val('settingForm',data)
            form.on('submit(saveBtn)', (formObj) => {
                let loadIndex = layer.load(2);
                admin.postJson('backend/settings/save/' + id
                    , {setting: formObj.field}
                    , data => {
                        layer.close(loadIndex)
                        if (data.code === 200) {
                            notice.success({
                                title  : 'Success',
                                message: '配置保存成功！'
                            });
                        } else {
                            notice.error({
                                title  : 'Error',
                                message: data.message
                            });
                        }
                    });

                return false;
            })
        }
    }

    cb('@backend.settings', new Settings())
});