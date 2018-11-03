<p class="text-muted">请选择要清空的缓存</p>
<form action="{'backend/clear'|app}" data-ajax data-confirm="真的要清空选中的缓存吗？" class="form-horizontal" method="get">
    <div class="form-group">
        <div class="col-xs-12">
            <label class="checkbox-inline">
                <input type="checkbox" name="cc[]" value="mtpl"> 模块模板
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" name="cc[]" value="ttpl"> 主题模板
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" name="cc[]" value="idxc"> 首页缓存
            </label>
            <label class="checkbox-inline">
                <input type="checkbox" name="cc[]" value="rt"> 运行缓存
            </label>
            <button class="btn btn-warning btn-xs m-l-sm m-t-sm">清空所选</button>
        </div>
    </div>
</form>