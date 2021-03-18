<script> window.wulacfg = {uicfg isTop=$isTop}</script>
<script type="text/javascript" src="{'backend/assets/js/layui.js'|res}"></script>
<script type="text/javascript" src="{'backend/assets/js/common.js'|res}"></script>
{foreach $_js_files.head as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<script>
    layui.use(['jquery'], function ($) {
        $(document).on('auth.need.login', function () {
            window !== top ? top.location = wulacfg.login : window.location = wulacfg.login;
        }).on('auth.perm.denied', function () {
            alert('权限受限，请联系管理员')
        });
    })
</script>