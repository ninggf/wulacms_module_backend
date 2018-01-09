<div class="wrapper-lg wulaui">
    <div style="margin: 0 auto;width: 700px;">
        {if $cls}
            <div class="alert alert-danger alert-block">
                <button type="button" class="close" data-dismiss="alert">×</button>
                <h4><i class="fa fa-bell-alt"></i>Warning!</h4>
                <p>未找到你要查看文档的类！</p>
            </div>
        {/if}
        <form class="form-inline" role="form">
            <div class="input-group input-group-lg">
                <input type="text" name="q" id="qcls" class="input-lg form-control" style="width: 610px"
                       placeholder="请输入类的全名" value="{$cls}"/>
                <span class="input-group-btn">
                    <a class="btn btn-lg btn-default" id="btn-doc-search" type="submit">Search</a>
                </span>
            </div>
        </form>
    </div>
    <script type="text/javascript">
		layui.use(['jquery', 'wulaui'], function ($, wui) {
			$('#btn-doc-search').click(function () {
				var cls = $('#qcls').val().trim();
				if (cls) {
					cls           = cls.replace(/\\/g, '.');
					location.href = "{'backend/doc/'|app}" + cls;
				} else {
					wui.toast.warning('请填写类名')
				}
			});
		});
    </script>
</div>