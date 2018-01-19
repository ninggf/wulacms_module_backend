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
            <label class="layui-form-label">宽度</label>
            <div class="layui-input-block">
                <input type="radio" name="width" value="1" title="1">
                <input type="radio" name="width" value="2" title="2">
                <input type="radio" name="width" value="3" title="3">
                <input type="radio" name="width" value="4" title="4">
                <input type="radio" name="width" value="5" title="5">
            </div>
            <div class="layui-input-block">
                <input type="radio" name="width" value="6" title="6">
                <input type="radio" name="width" value="7" title="7">
                <input type="radio" name="width" value="8" title="8">
                <input type="radio" name="width" value="9" title="9">
                <input type="radio" name="width" value="10" title="10">
            </div>
            <div class="layui-input-block">
                <input type="radio" name="width" value="11" title="11">
                <input type="radio" name="width" value="12" title="12 (一整行)" checked>
            </div>
        </div>
    </form>
</div>
<script>
	layui.use(['form'], function () {
		layui.form.render(null, 'form')
	})
</script>