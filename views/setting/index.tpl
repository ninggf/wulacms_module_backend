<div class="layui-fluid p-md">
    <div class="layui-card wulaui">
        <div class="layui-card-header">
            <div class="layui-tab layui-tab-brief caller-tab">
                <ul class="layui-tab-title" style="border-bottom: 0">
                    {if $groups}
                        {foreach $groups as $gp=>$g}
                            <li class="{if $gp == $group}layui-this{/if}">
                                <a href="{$cfgurl}/{$gp}" id="navi-system-setting">{$g}</a></li>
                        {/foreach}
                    {else}
                        <li class="layui-this">{$settingName}</li>
                    {/if}
                </ul>
            </div>
        </div>
        <div class="layui-card-body">
            <form name="SettingForm" id="setting-form"
                  action="{'backend/setting/save'|app}/{$setting|escape}/{$group|escape|default:0}"
                  data-validate="{$rules|escape}" data-ajax method="post" role="form"
                  class="form-horizontal {if $script}hidden{/if}" data-loading>
                {$form|render}
                <div class="form-group">
                    <div class="col-md-offset-2 col-sm-offset-3 col-xs-12 col-sm-9 col-md-10">
                        <button type="submit" class="btn btn-md btn-primary">确认保存</button>
                        <button type="reset" class="btn btn-md btn-warning">重置设置</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
<script type="text/javascript">
    {if $script}
    layui.extend({
        'backend.setting': '{$script}'
    });
    layui.use(['jquery', 'wulaui', 'backend.setting'], function ($, w, setting) {
        if (setting && setting.init) {
            setting.init();
        }
        $('#setting-form').removeClass('hidden');
    });
    {/if}
</script>