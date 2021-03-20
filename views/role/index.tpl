<!-- 正文开始 -->
<div class="layui-fluid">
    <div class="layui-card">
        <div class="layui-card-body">
            <!-- 表格工具栏 -->
            <form class="layui-form toolbar">
                <div class="layui-form-item">
                    <div class="layui-inline">
                        <label class="layui-form-label">角色名称:</label>
                        <div class="layui-input-inline">
                            <input name="role" class="layui-input" placeholder="输入角色名"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">角色代码:</label>
                        <div class="layui-input-inline">
                            <input name="name" class="layui-input" placeholder="输入角色代码"/>
                        </div>
                    </div>
                    <div class="layui-inline">&emsp;
                        <button class="layui-btn icon-btn" lay-filter="roleTbSearch" lay-submit>
                            <i class="layui-icon">&#xe615;</i>搜索
                        </button>
                    </div>
                </div>
            </form>
            <!-- 数据表格 -->
            <table id="roleTable" lay-filter="roleTable"></table>
        </div>
    </div>
</div>

<!-- 表格操作列 -->
<script type="text/html" id="roleTbBar">
    <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit">修改</a>
    <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a>
    <a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="auth">权限</a>
</script><!-- 表单弹窗 -->
<script type="text/html" id="roleEditDialog">
    <form id="roleEditForm" lay-filter="roleEditForm" class="layui-form model-form">
        <input name="id" type="hidden"/>
        <div class="layui-form-item">
            <label class="layui-form-label layui-form-required">角色名称:</label>
            <div class="layui-input-block">
                <input name="role" placeholder="请输入角色名称" class="layui-input" lay-verType="tips" lay-verify="required" required/>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label layui-form-required">角色代码:</label>
            <div class="layui-input-block">
                <input name="name" placeholder="请输入角色代码" class="layui-input" lay-verType="tips" lay-verify="required" required/>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label layui-form-required">上级角色:</label>
            <div class="layui-input-block">
                <div id="rolesEditParentSel"></div>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">备注:</label>
            <div class="layui-input-block">
                <textarea name="remark" placeholder="请输入备注" class="layui-textarea"></textarea>
            </div>
        </div>
        <div class="layui-form-item text-right">
            <button class="layui-btn" lay-filter="roleEditSubmit" lay-submit>保存</button>
            <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">取消</button>
        </div>
    </form>
</script>
<script>
    layui.use(['jquery', '@backend.role'], function ($, role) {
        $("#user-profile").removeClass('layui-hide');
        role.init();
    });
</script>
