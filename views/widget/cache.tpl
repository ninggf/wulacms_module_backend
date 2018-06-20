<div class="panel-body p-t-xs">
    <p class="text-muted">请选择要清空的缓存</p>

    <form action="{'backend/clear'|app}" data-ajax data-confirm="真的要清空选中的缓存吗？" class="form-horizontal" method="get">
        <div class="form-group">
            <div class="col-sm-12">
                <label class="checkbox-inline">
                    <input type="checkbox" name="cc[]" value="mtpl"> 模块模板
                </label>
                <label class="checkbox-inline">
                    <input type="checkbox" name="cc[]" value="ttpl"> 主题模板
                </label>
                <label class="checkbox-inline">
                    <input type="checkbox" name="cc[]" value="idxc"> 首页缓存
                </label>
            </div>
        </div>
        <p>
            <button class="btn btn-warning"><i class="fa fa-eraser"></i>立即清空</button>
            <button class="btn btn-default" type="reset"><i class="fa fa-refresh"></i> 重置所选</button>
        </p>
    </form>
</div>