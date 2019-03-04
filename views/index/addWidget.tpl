<div class="well-sm wulaui">
    <form id="WidgetForm" action="{'backend/save-widget'|app}" data-ajax class="layui-form" role="form" lay-filter="form"
          data-ajax-done="close:me">
        <div class="layui-form-item">
            <label class="layui-form-label">选择框</label>
            <div class="layui-input-block">
                <select name="widget">
                    <option value="">请选择一个小部件</option>
                    {foreach $widgets as $wid=>$w}
                        <option value="{$wid}">{$w->name()}</option>
                    {/foreach}
                </select>
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label">位置</label>
            <div class="layui-input-block">
                <input type="radio" name="width" value="1" title="左" checked/>
                <input type="radio" name="width" value="2" title="右"/>
            </div>
        </div>
    </form>
</div>
<script>
	layui.use(['form'], function () {
		layui.form.render(null, 'form')
	})
</script>