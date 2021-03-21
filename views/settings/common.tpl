<form class="layui-form" id="settingForm" lay-filter="settingForm">
    <div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-header">{$settingName}</div>
            <div class="layui-card-body">
                <div class="layui-form-item layui-row">
                    <div class="layui-inline layui-col-md4 layui-col-sm5">
                        <label class="layui-form-label text-left">网站名称:</label>
                        <div class="layui-input-block">
                            <input name="ckName" value="{$sets.ckName|escape}" placeholder="请输入网站名称" class="layui-input" lay-verType="tips" lay-verify="required"/>
                        </div>
                    </div>
                    <div class="layui-inline layui-col-md4 layui-col-sm5">
                        <label class="layui-form-label text-left">同时登录:</label>
                        <div class="layui-input-block">
                            <input name="ckName1" value="{$sets.ckName1|escape}" placeholder="请输入网站名称" class="layui-input" lay-verType="tips" lay-verify="required"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="form-group-bottom text-right">
        <button type="reset" class="layui-btn layui-btn-primary">{'Reset'|t}</button>
        <button class="layui-btn" lay-filter="saveBtn" lay-submit>{'Save'|t}</button>
    </div>
</form>
<script>
    layui.use(['@backend.settings'], function (setting) {
        setting.init('{$settingId}');
    })
</script>