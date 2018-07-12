<div class="vbox wulaui">
    <header class="header clearfix bg-light lt b-b {if !$groups} hidden-xs{/if}">
        {if $groups}
            <ul class="nav nav-tabs">
                {foreach $groups as $gp=>$g}
                    <li class="{if $g@index == 0}m-l-lg{/if} {if $gp == $group}active{/if}">
                        <a href="{$cfgurl}/{$gp}" id="navi-system-setting">{$g}</a>
                    </li>
                {/foreach}
            </ul>
        {else}
            <p class="h4">{$settingName}</p>
        {/if}
    </header>
    <section class="w-f scrollable">
        <div class="wrapper bg-white-only">
            <div class="max1000">
                <form name="SettingForm" id="setting-form"
                      action="{'backend/setting/save'|app}/{$setting|escape}/{$group|escape|default:0}"
                      data-validate="{$rules|escape}" data-ajax method="post" role="form"
                      class="form-horizontal {if $script}hidden{/if}" data-loading>
                    {$form|render}
                </form>
            </div>
        </div>
    </section>
    <footer class="footer bg-light b-t lt">
        <div class="row m-t-xs max1000">
            <div class="col-md-offset-9 col-md-3">
                <button class="btn btn-md btn-warning opt-reset">重置</button>
                <button class="btn btn-md btn-primary opt-save">保存</button>
            </div>
        </div>
    </footer>
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

		$('body').on('click', '.opt-save', function () {
			$('#setting-form').submit();
		}).on('click', '.opt-reset', function () {
			$('#setting-form').get(0).reset();
		});
	});
    {else}
	layui.use(['jquery', 'wulaui'], function ($, w) {
		$('body').on('click', '.opt-save', function () {
			$('#setting-form').submit();
		}).on('click', '.opt-reset', function () {
			$('#setting-form').get(0).reset();
		});
	});
    {/if}
</script>