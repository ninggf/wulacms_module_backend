<div class="vbox wulaui">
    <header class="header clearfix bg-light b-b {if !$groups} hidden-xs{/if}">
        <ul class="nav nav-tabs">
            {if $groups}
                {foreach $groups as $gp=>$g}
                    <li class="{if $g@index == 0}m-l-lg{/if} {if $gp == $group}active{/if}">
                        <a href="{$cfgurl}/{$gp}" id="navi-system-setting">{$g}</a>
                    </li>
                {/foreach}
            {else}
                <li class="m-l-lg active">
                    <a href="javascript:;">{$settingName}</a>
                </li>
            {/if}
        </ul>
    </header>
    <section class="scrollable">
        <div class="wrapper bg-white-only">
            <div style="max-width: 700px">
                <form name="SettingForm" action="{'backend/setting/save'|app}/{$setting|escape}/{$group|escape}"
                      data-validate="{$rules|escape}" data-ajax method="post" role="form"
                      class="form-horizontal {if $script}hidden{/if}" data-loading>
                    {$form|render}
                    <div class="form-group">
                        <div class="col-md-offset-3 col-md-9 col-xs-12">
                            <button type="submit" class="btn btn-primary">保存</button>
                            <button type="reset" class="btn btn-default">重置</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>
</div>
<script type="application/javascript">
    {if $script}
	layui.extend({
		'backend.setting': '{$script}'
	});
	layui.use(['jquery', 'wulaui', 'backend.setting'], function ($, w, setting) {
		if (setting && setting.init) {
			setting.init();
		}
		$('form[name=SettingForm]').removeClass('hidden');
	});
    {else}
	layui.use(['jquery', 'wulaui']);
    {/if}
</script>