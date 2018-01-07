<!DOCTYPE html>
<html lang="en" class="app">
<head>
    <meta charset="UTF-8">
    <title>{$title}</title>
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,user-scalable=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    {loaduicss bootstrap="bootstrap.min.css" animate="animate.min.css" main="page.css" theme="$page_style"}
    {initjq}
</head>
<body class="{$bodyCls}">
{include "$workspaceView"}
</body>
</html>