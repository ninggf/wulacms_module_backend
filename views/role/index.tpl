<!-- 表格工具栏 -->
<form class="layui-form toolbar">
    <div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-body">
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
            </div>
        </div>
    </div>

</form>

<div class="layui-fluid layui-radius-table layui-no-pt">
    <!-- 数据表格 -->
    <table id="roleTable" lay-filter="roleTable"></table>
</div>

<!-- 表格操作列 -->
<script type="text/html" id="roleTbBar">
    {*<a class="" lay-event="view" title="查看"><i class="layui-icon iconfont layui-extend-view"></i></a>*}
    {if ican('edit:system/account/role')}
        <a class="layui-fg-blue" lay-event="edit" title="编辑"><i class="layui-icon iconfont layui-extend-edit"></i></a>
    {/if}
    {if ican('grant:system/account/role')}
        <a class="layui-fg-orange" lay-event="auth" title="授权"><i class="layui-icon iconfont layui-extend-grant"></i></a>
    {/if}
    {if ican('del:system/account/role')}
        <a class="layui-fg-red" lay-event="del" title="删除"><i class="layui-icon iconfont layui-extend-delete"></i></a>
    {/if}
</script><!-- 表单弹窗 -->

<script type="text/html" id="roleEditDialog">
    <form id="roleEditForm" lay-filter="roleEditForm" class="layui-form model-form">
        <input name="id" type="hidden"/>
        <div class="layui-form-item">
            <label class="layui-form-label layui-form-required">上级角色:</label>
            <div class="layui-input-block">
                <div id="rolesEditParentSel"></div>
            </div>
        </div>
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
<script type="text/html" id="roleDetailDialog">
    <form id="roleDetailForm" lay-filter="roleDetailForm" class="layui-form model-form">
        <input name="id" type="hidden"/>
        <div class="layui-form-item">
            <label class="layui-form-label">上级角色:</label>
            <div class="layui-input-block">
                <div id="rolesEditParentSel"></div>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">角色名称:</label>
            <div class="layui-input-block">
                <input name="role" placeholder="角色名称" class="layui-input" disabled/>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">角色代码:</label>
            <div class="layui-input-block">
                <input name="name" placeholder="角色代码" class="layui-input" disabled/>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">备注:</label>
            <div class="layui-input-block">
                <textarea name="remark" placeholder="备注" class="layui-textarea" disabled></textarea>
            </div>
        </div>
        <div class="layui-form-item text-right">
            <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">关闭</button>
        </div>
    </form>
</script>
<script type="text/html" id="operationToolbar">
    <p>
        {if ican('edit:system/account/role')}
            <button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>
        {/if}
        {if ican('del:system/account/role')}
            <button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>
        {/if}
    </p>
</script>
<script>
    layui.use(['jquery', '@backend.role'], function ($, role) {
        role.init();
    });
</script>
