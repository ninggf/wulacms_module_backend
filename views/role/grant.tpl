<div class="layui-fluid layui-radius-table layui-no-pt">
    <table id="grantTable" lay-filter="grantTable"></table>
</div>
<div class="form-group-bottom text-right">
    <button data-rid="{$rid}" id="saveBtn" class="layui-btn">{'Save'|t}</button>
</div>
<script>
    layui.use(['jquery', '@backend.grant'], function ($, grant) {
        grant.init();
        $('#saveBtn').click(() => {
            grant.save()
        })
    });
</script>
