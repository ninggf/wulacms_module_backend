<script>window.wulacfg = {uicfg isTop=$isTop}</script>
<script type="text/javascript" src="{'backend/assets/js/layui.js'|res}"></script>
{foreach $_js_files.head as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<script>
    layui.use(['jquery'], function ($) {
        $(document).on('auth.need.login', function () {
            window !== top ? top.location = wulacfg.login : window.location = wulacfg.login;
        }).on('auth.user.locked', function () {
            window !== top ? top.location = wulacfg.lurl : window.location = wulacfg.lurl;
        }).on('auth.user.blocked', function () {
            window !== top ? top.location = wulacfg.blurl : window.location = wulacfg.blurl;
        });
    })
</script>