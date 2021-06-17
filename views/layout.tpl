<!DOCTYPE html>
<html lang="zh">
<head>
    <script>if(window===top) window.location = "{'backend'|app}"</script>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <link href="/favicon.ico" rel="icon"/>
    <title>{$pageTitle}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/iconfont/iconfont.css'|res}"/>
    {foreach $_css_files as $_css_file}
        <link rel="stylesheet" href="{$_css_file}"/>
    {/foreach}
</head>
<body class="{$pageMeta.bodyCls}">
<!-- js -->
{include './common.tpl'}
{if $workspaceView}
    {include "$workspaceView"}
{elseif $workspaceHtml}
    {$workspaceHtml}
{/if}
{foreach $_js_files.foot as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<!--pageEnd-->
</body>
</html>