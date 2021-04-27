<div class="layui-fluid page-header">
    <h2>{$role.role} {'Permissions'|t}</h2>
    <div class="page-toolbar">
        <button type="button" class="layui-btn layui-btn-sm grantBtn">
            <i class="layui-icon">&#xe672;</i> {'Grant'|t}
        </button>
    </div>
</div>

<div class="layui-fluid layui-radius-table">
    <table id="grantTable" lay-filter="grantTable"></table>
</div>

<div class="layui-fluid text-right">
    <button data-rid="{$rid}" id="saveBtn" class="layui-btn grantBtn">
        <i class="layui-icon">&#xe672;</i> {'Grant'|t}
    </button>
</div>

<script>
    layui.use(['jquery', '@backend.grant'], function ($, grant) {
        grant.init();
    });
</script>
