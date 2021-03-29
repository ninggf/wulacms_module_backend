<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <link href="/favicon.ico" rel="icon"/>
    <title>{'Your are blocked'|t} - {$pageMeta.projectName|default:'App'}{$pageMeta.titleSuffix}</title>
    <link rel="stylesheet" href="{'backend/assets/css/layui.css'|res}"/>
    <link rel="stylesheet" href="{'backend/assets/css/admin.css'|res}"/>
</head>
<body class="{$pageMeta.bodyCls}">
<div class="error-page">
    <img class="error-page-img" src="{'backend/assets/img/ic_403.png'|res}">
    <div class="error-page-info">
        <h1>403</h1>
        <p>{'Sorry, your are blocked!'|t}</p>
    </div>
</div>
<style>
    .error-page {
        position: absolute;
        top: 50%;
        width: 100%;
        text-align: center;
        -o-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        -moz-transform: translateY(-50%);
        -webkit-transform: translateY(-50%);
        transform: translateY(-50%);
    }

    .error-page .error-page-img {
        display: inline-block;
        height: 260px;
        margin: 10px 15px;
    }

    .error-page .error-page-info {
        vertical-align: middle;
        display: inline-block;
        margin: 10px 15px;
    }

    .error-page .error-page-info > h1 {
        color: #434e59;
        font-size: 72px;
        font-weight: 600;
    }

    .error-page .error-page-info > p {
        color: #777;
        font-size: 20px;
        margin-top: 5px;
    }

    .error-page .error-page-info > div {
        margin-top: 30px;
    }
</style>
{include './common.tpl' isTop=true}
<script>
    layui.use(['admin'], function () {
    });
</script>
</body>
</html>