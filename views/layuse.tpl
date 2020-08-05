<div class="workspace-comp">
    <component is="{$comp}"  :compdata="{$compData|json_encode:64|escape}" ></component>
</div>
<script type="text/javascript">
    layui.use(['{$compCls}'], function (item) {
            window.vueVm = new Vue({
                el: '.workspace-comp'
            });
        }
    )
</script>