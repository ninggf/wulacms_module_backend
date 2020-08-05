<div class="workspace-comp">
    <component is="{$comp}"></component>
</div>
<script type="text/javascript">
    layui.use(['{$compCls}'], function (item) {
            item.setData && item.setData({$compData|json_encode:64});
            if (window.vueVm) {

            }
            window.vueVm = new Vue({
                el: '.workspace-comp'
            });
        }
    )
</script>