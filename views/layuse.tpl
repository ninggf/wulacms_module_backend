<div class="workspace-comp">
    <component is="{$comp}"  :compdata="{$compData|json_encode:64|escape}"></component>
</div>

<script type="text/javascript">
    if(location.hash){
        document.getElementsByClassName('workspace-comp')[0].style.visibility="hidden"
    }
    layui.use(['{$compCls}'], function () {
            window.vueVm = new Vue({
                el: '.workspace-comp',
            });
        }
    )
</script>