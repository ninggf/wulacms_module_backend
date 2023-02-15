<style>
    .layui-card-header {
        position: relative;
    }

    .layui-card-header > a.del-wdg {
        position: absolute;
        right: 5px;
        top: 0
    }

    .layui-card-header > a.cfgwidget {
        position: absolute;
        right: 25px;
        top: 0
    }

    .layui-card-header > .layui-tab-title {
        border: none;
    }

    .portlet-item .layui-card-body {
        user-select: all;
        -moz-user-select: all;
        -ms-user-select: all;
        -webkit-user-select: all;
    }
</style>
<section class="layui-fluid p-sm">
    {'on_render_dashboard_home'|fire}
    <div class="layui-row layui-col-space10" id="portlet">
        <div class="{if !$onerow}layui-col-md8{/if} layui-col-sm12 portlet" id="portletCol1" data-maxw="12">
            {foreach $myWidgets as $wid => $w}
                <div class="portlet-item m-b-sm" data-id="{$wid}" id="widget-{$wid}" data-minw="{$w.minWidth}">
                    <div class="layui-card phandle {if $w.tabs}layui-tab{/if}" lay-filter="{$wid}Tab">
                        <header class="layui-card-header layui-tab-brief">
                            {if $w.tabs}
                                <ul class="layui-tab-title">
                                    {foreach $w.tabs as $tid=>$tab}
                                        <li {if $tab@first}class="layui-this"{/if}>{$tab}</li>
                                    {/foreach}
                                </ul>
                            {else}
                                {$w.name}
                                {if $w.badge}<span class="badge bg-info m-t-n-xs">{$w.badge}</span>{/if}
                            {/if}
                            <a href="{'backend/del-widget'|app}/{$wid}" data-ajax data-confirm="你确定要删除这个小部件吗?" class="p-xs text-danger del-wdg hidden"> <i class="fa fa-trash-o"></i> </a>
                            <a href="{'backend/widget-cfg'|app}/{$wid}" data-ajax="dialog" data-area="600px,auto" class="cfgwidget p-xs hidden" title="配置小部件"> <i class="fa fa-gear"></i> </a>
                        </header>
                        <div class="layui-card-body {$w.cls} {if $w.tabs}layui-tab-content{/if}" style="{$w.style|escape}">
                            {$w.widget|render}
                        </div>
                    </div>
                </div>
            {/foreach}
        </div>
        <div class="{if !$onerow}layui-col-md4{/if} layui-col-sm12 portlet" id="portletCol2" {if !$onerow}data-maxw="4"{/if}>
            {foreach $myWidgets2 as $wid => $w}
                <div class="portlet-item m-b-sm" data-id="{$wid}" id="widget-{$wid}" data-minw="{$w.minWidth}">
                    <div class="layui-card phandle {if $w.tabs}layui-tab{/if}" lay-filter="{$wid}Tab">
                        <header class="layui-card-header layui-tab-brief">
                            {if $w.tabs}
                                <ul class="layui-tab-title">
                                    {foreach $w.tabs as $tid=>$tab}
                                        <li {if $tab@first}class="layui-this"{/if}>{$tab}</li>
                                    {/foreach}
                                </ul>
                            {else}
                                {$w.name}
                                {if $w.badge}<span class="badge bg-info m-t-n-xs">{$w.badge}</span>{/if}
                            {/if}
                            <a href="{'backend/del-widget'|app}/{$wid}" data-ajax data-confirm="你确定要删除这个小部件吗?" class="p-xs text-danger del-wdg hidden"> <i class="fa fa-trash-o"></i> </a>
                            <a href="{'backend/widget-cfg'|app}/{$wid}" data-ajax="dialog" data-area="600px,auto" class="cfgwidget p-xs hidden" title="配置小部件"> <i class="fa fa-gear"></i> </a>
                        </header>
                        <div class="layui-card-body {if $w.tabs}layui-tab-content{/if}">
                            {$w.widget|render}
                        </div>
                    </div>
                </div>
            {/foreach}
        </div>
    </div>
    <div class="layui-row layui-col-space10">
        <div class="layui-col-xs12">
            <div id="manager-btn" class="btn-group dropup">
                <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    <i class="fa fa-gears"></i> 管理小部件
                </button>
                <ul class="dropdown-menu">
                    <li><a href="{'backend/add-widget'|app}" data-ajax="dialog" title="添加小部件" data-area="350px,auto" id="add-widget-btn"><i class="fa fa-plus"></i> 添加小部件</a></li>
                    <li><a href="{'backend/reset'|app}" data-ajax data-confirm="你确定要设为系统默认的小部件吗?"><i class="fa fa-refresh"></i> 设为默认</a></li>
                    <li class="divider"></li>
                    <li>
                        <a href="{'backend/reset-layout'|app}" data-ajax data-confirm="你确定要重置小部件布局吗?">
                            <i class="fa fa-rotate-left"></i> 重置布局</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>
<script type="text/javascript">
    {if $modules}
    layui.extend({$modules});
    {/if}
    layui.use([{$uses}], function ({$alias}) {
        var timer = null;
        $('.portlet').sortable({
            connectWith         : '.portlet',
            iframeFix           : false,
            items               : '.portlet-item',
            opacity             : 0.65,
            helper              : 'original',
            revert              : true,
            handle              : 'header',
            forceHelperSize     : true,
            placeholder         : 'sortable-placeholder m-b-sm',
            placeholderStyle    : 'border-color:#ddd',
            forcePlaceholderSize: true,
            tolerance           : 'pointer',
            beforeDrop          : function (e, target) {
                return target.data('maxw') >= e.data('minw');
            }
        }).on('sortupdate', function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                timer    = null;
                var ids1 = [], ids2 = [];
                $('#portletCol1 .portlet-item').each(function (i, e) {
                    ids1[i] = $(e).data('id');
                });
                $('#portletCol2 .portlet-item').each(function (i, e) {
                    ids2[i] = $(e).data('id');
                });
                $.ajax("{'backend/update-order'|app}?ids1=" + ids1.join(',') + '&ids2=' + ids2.join(','));
            }, 3000);
        });

        $('.portlet-item').on('mouseenter', function () {
            $(this).find('header a').removeClass('hidden');
        }).on('mouseleave', function () {
            $(this).find('header a').addClass('hidden');
        });
        var mbtn = $('#manager-btn');
        if (mbtn.offset().top < 100) {
            mbtn.removeClass('dropup');
        }
        mbtn.hover(function () {
            mbtn.find('.btn').addClass('btn-primary');
        }, function () {
            mbtn.find('.btn').removeClass('btn-primary');
        });
        $('#add-widget-btn').on('before.dialog', function (e) {
            e.options.btn = ['添加', '取消'];
            e.options.yes = function () {
                $('#WidgetForm').submit();
            }
        });
        $('.cfgwidget').on('before.dialog', function (e) {
            e.options.btn = ['保存', '取消'];
            e.options.yes = function () {
                $('#widget-cfg-form').submit();
            }
        });
        {$init}
    })
</script>