<div class="panel-body p-t-xs">
    <div class="row m-l-none m-r-none bg-light lter">
        <div class="col-sm-6 col-md-3 padder-v b-r b-light">
            <span class="fa-stack fa-2x pull-left m-r-sm">
              <i class="fa fa-circle fa-stack-2x text-success"></i>
              <i class="fa fa-linux fa-stack-1x text-white"></i>
            </span>
            <a class="clear" href="javascript:">
                <span class="h4 block m-t-xs"><strong>软件</strong></span>
                <small class="text-muted text-uc">
                    php v{$php_ver}<br/>
                    {$os_name}
                </small>
            </a>
        </div>
        <div class="col-sm-6 col-md-3 padder-v b-r b-light">
            <span class="fa-stack fa-2x pull-left m-r-sm">
              <i class="fa fa-circle fa-stack-2x text-warning"></i>
              <i class="fa fa-bitbucket fa-stack-1x text-white"></i>
            </span>
            <a class="clear" href="javascript:">
                <span class="h4 block m-t-xs"><strong>数据库</strong></span>
                <small class="text-muted text-uc">
                    {$dbclient}<br/>
                    {$dbInfo}
                </small>
            </a>
        </div>
        <div class="col-sm-6 col-md-3 padder-v b-r b-light">
            <span class="fa-stack fa-2x pull-left m-r-sm">
              <i class="fa fa-circle fa-stack-2x {$rtcache}"></i>
              <i class="fa fa-hdd-o fa-stack-1x text-white"></i>
            </span>
            <a class="clear" href="javascript:">
                <span class="h4 block m-t-xs"><strong>Cache/Redis</strong></span>
                <small class="text-uc {$cstatus}">
                    Cache: {$cache}
                </small>
                <br>
                <small class="{$rstatus} text-uc">
                    Redis: {$redis}
                </small>
            </a>
        </div>
        <div class="col-sm-6 col-md-3 padder-v b-light">
            <span class="fa-stack fa-2x pull-left m-r-sm">
              <i class="fa fa-circle fa-stack-2x text-warning"></i>
              <i class="fa fa-hdd-o fa-stack-1x text-white"></i>
            </span>
            <a class="clear" href="javascript:">
                <span class="h4 block m-t-xs"><strong>内核</strong></span>
                <small class="text-uc text-muted">
                    内核: v{$system}
                </small>
                <br>
                <small class="text-uc text-muted">
                    后台: v{$backend}
                </small>
            </a>
        </div>
    </div>
</div>