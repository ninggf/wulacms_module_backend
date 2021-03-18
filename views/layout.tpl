<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <script>if (window === top) window.location = "{'backend'|url}"</script>
    <link href="/favicon.ico" rel="icon"/>
    <title>{$pageTitle}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
    {foreach $_css_files as $_css_file}
        <link rel="stylesheet" href="{$_css_file}"/>
    {/foreach}
</head>
<body>
<!-- js -->
{include './common.tpl'}
{include "$workspaceView"}
{foreach $_js_files.foot as $_js_file}
    <script src="{$_js_file}"></script>
{/foreach}
<!--pageEnd-->
</body>
</html>