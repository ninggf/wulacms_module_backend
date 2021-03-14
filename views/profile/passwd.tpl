<!-- 修改密码表单 -->
<form class="layui-form model-form">
    <div class="layui-form-item">
        <label class="layui-form-label layui-form-required">原始密码:</label>
        <div class="layui-input-block">
            <input type="password" name="oldPsw" placeholder="请输入原始密码" class="layui-input" lay-verType="tips" lay-verify="required" required/>
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label layui-form-required">新的密码:</label>
        <div class="layui-input-block">
            <input type="password" name="newPsw" placeholder="请输入新密码" class="layui-input" lay-verType="tips" lay-verify="required|psw" required/>
        </div>
    </div>
    <div class="layui-form-item">
        <label class="layui-form-label layui-form-required">确认密码:</label>
        <div class="layui-input-block">
            <input type="password" name="rePsw" placeholder="请再次输入新密码" class="layui-input" lay-verType="tips" lay-verify="required|equalTo" lay-equalTo="input[name=newPsw]" required/>
        </div>
    </div>
    <div class="layui-form-item">
        <div class="layui-input-block text-right">
            <button class="layui-btn" lay-filter="submit-psw" lay-submit>确认修改</button>
            <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">取消</button>
        </div>
    </div>
</form>

<!-- js部分 -->
<script>
    layui.use(['layer', 'form', 'admin', 'formX'], function () {
        var form = layui.form;
        var $    = layui.admin;

        // 监听提交
        form.on('submit(submit-psw)', function (data) {
            $.post($.url('backend/profile/passwd'), data.field).then(function (data) {
                if (data.code === 200) {
                    $.closeDialog('[lay-filter="submit-psw"]');
                    $.toast.success('密码修改成功');
                } else {
                    $.toast.tc().error(data.message);
                }
            }).fail(function (data) {
                $.toast.tc().error(data.message);
            });
            return false;
        });
    });
</script>