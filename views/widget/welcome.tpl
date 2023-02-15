<article class="media">
    <span class="pull-left thumb-md"><img src="{$my.avatar|media}" class="img-circle"></span>
    <div class="media-body">
        <p class="block">欢迎亲爱的<strong>{$my.nickname}</strong>. 您最后登陆信息如下</p>
        <strong class="block">{$my.logintime|date_format:'Y年m月d日H点i分'}</strong>
        <small class="block m-t-sm">IP: {$my.lastip}</small>
    </div>
</article>
