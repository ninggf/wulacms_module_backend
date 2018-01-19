<div class="container-fluid wulaui m-t-sm">
    <form id="widget-cfg-form" name="WidgetCfgForm" data-validate="{$rules|escape}" action="{'backend/save-cfg'|app}"
          data-ajax method="post" data-loading>
        <input type="hidden" name="id" id="id" value="{$id}"/>
        {$form|render}
    </form>
</div>