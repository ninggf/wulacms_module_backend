<section class="layui-fluid p-sm">
    <div class="layui-row layui-col-space10 portlet">
        {foreach $myWidgets as $wid => $w}
            <div class="layui-col-xs12 layui-col-sm{$w.width} portlet-item" data-id="{$wid}" id="widget-{$wid}">
                <div class="layui-card phandle">
                    <header class="layui-card-header">
                        {$w.name}
                        {if $w.badge}<span class="badge bg-info m-t-n-xs">{$w.badge}</span>{/if}
                        <a href="{'backend/del-widget'|app}/{$wid}" data-ajax data-confirm="你确定要删除这个小部件吗?"
                           class="p-xs text-danger pull-right hidden"> <i class="fa fa-trash-o"></i> </a>
                        <a href="{'backend/widget-cfg'|app}/{$wid}" data-ajax="dialog" data-area="600px,auto"
                           class="cfgwidget p-xs pull-right hidden" title="配置小部件"> <i class="fa fa-gear"></i> </a>
                    </header>
                    <div class="layui-card-body">
                        {$w.widget|render}
                    </div>
                </div>
            </div>
        {/foreach}
    </div>
    <div class="layui-row layui-col-space10">
        <div class="layui-col-sm12">
            <div id="manager-btn" class="btn-group dropup">
                <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    <i class="fa fa-gears"></i> 管理小部件
                </button>
                <ul class="dropdown-menu">
                    <li><a href="{'backend/add-widget'|app}" data-ajax="dialog" title="添加小部件" data-area="500px,300px"
                           id="add-widget-btn"><i class="fa fa-plus"></i> 添加小部件</a></li>
                    <li><a href="{'backend/reset'|app}" data-ajax data-confirm="你确定要设为系统默认的小部件吗?"><i
                                    class="fa fa-refresh"></i> 设为默认</a></li>
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
            placeholder         : 'sortable-box-placeholder round-all',
            forcePlaceholderSize: true,
            tolerance           : 'pointer'
        }).on('sortupdate', function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                timer   = null;
                var ids = [];
                $('.portlet-item').each(function (i, e) {
                    ids[i] = $(e).data('id');
                });
                $.ajax("{'backend/update-order'|app}?ids=" + ids.join(','));
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