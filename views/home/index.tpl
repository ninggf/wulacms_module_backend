<style>
    #wellcom-wrap {
        background: #fff;
        padding: 16px 24px;
    }

    #wellcom-wrap .img-wrap {
        display: block;
        width: 72px;
        height: 72px;
        box-sizing: border-box;
        float: left;
        margin-right: 20px;
    }

    #wellcom-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border: none;
        vertical-align: middle;
        border-radius: 72px;
    }

    #wellcom-wrap h2 {
        font-size: 30px;
        font-weight: 500;
        line-height: 1.2;
    }

    #wellcom-wrap p {
        margin-top: 20px;
    }

    #project-wrap {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: url("{'backend/assets/img/bg-login.svg'|res}") no-repeat center 60px;
        background-size: 100%;
    }

    #project {
        width: 500px;
        margin: 25% auto;
        text-align: center;
        font-size: 48px;
        font-weight: 600;
    }

    #project sub {
        font-weight: 300;
        font-size: 24px;
        margin-left: 10px;
    }
</style>
<div id="wellcom-wrap">
    <div class="img-wrap">
        <img src="{$myPassport.avatar}" alt="">
    </div>
    <h2>{$myPassport.nickname}，祝你开心每一天!</h2>
    <p>
        {foreach $myPassport.data.rolens as $role}
            <span class="layui-badge layui-bg-gray">{$role}</span>
        {/foreach}
    </p>
    <cite>{$myPassport.data.login}</cite>
    <br style="clear: both"/>
</div>
<div id="project-wrap">
    <div id="project">
        {$pageMeta.projectName}<sub>{$pageMeta.cmsVer}</sub>
    </div>
</div>
