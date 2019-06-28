<div class="well-sm wulaui">
    <form id="WidgetForm" action="{'backend/save-widget'|app}" data-ajax class="layui-form" role="form" lay-filter="form"
          data-ajax-done="close:me">
        <div class="layui-form-item">
            <label class="layui-form-label text-left">部件</label>
            <div class="layui-input-block">
                {foreach $widgets as $wid=>$w}
                    <input type="radio" name="widget" value="{$wid}" title="{$w->name()|escape}">
                {/foreach}
            </div>
        </div>
        <div class="layui-form-item">
            <label class="layui-form-label text-left">位置</label>
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