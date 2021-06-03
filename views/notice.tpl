<div class="layui-card" id="dlg-notice" style="box-shadow: none;border: none;">
    <div class="layui-tab layui-tab-brief">
        <ul class="layui-tab-title">
            {foreach $types as $msg}
            <li {if $msg@first}class="layui-this"{/if}>{$msg.name}{if $msg.newCnt}({$msg.newCnt}){/if}</li>
            {/foreach}
        </ul>
        <div class="layui-tab-content" id="message_wrapper" style="padding: 0;">
            {foreach $types as $msg}
            <div class="layui-tab-item {if $msg@first}layui-show{/if}">
                {$msg.listHtml}
            </div>
            {/foreach}
            <a id="messageClearBtn1" class="message-btn-clear" ew-href="{'backend/message/center'|app}" ew-title="{'Message Center'|t}">{'Message Center'|t}</a>
        </div>
    </div>
</div>

<script>
    layui.use(['jquery','admin','element'], function ($,admin) {
        $('#message_wrapper').on('click','a[ew-href]',function(){
            layui.layer.close($('#dlg-notice').closest('.layui-layer').attr('id').substr(11))
        }).on('click','a[ew-ajax]',function(){
            layui.layer.close($('#dlg-notice').closest('.layui-layer').attr('id').substr(11))
            admin.get($(this).attr('ew-ajax'))
        })
    });
</script>

<style>
    /** 消息列表样式 */
    .message-list {
        position: absolute;
        top: 48px;
        left: 0;
        right: 0;
        bottom: 45px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .message-list-item {
        display: block;
        padding: 10px 20px;
        line-height: 24px;
        position: relative;
        border-bottom: 1px solid #e8e8e8;
    }

    .message-list-item:hover, .message-btn-clear:hover, .message-btn-more:hover {
        background: #F2F2F2;
    }

    .message-list-item .message-item-icon {
        width: 40px;
        height: 40px;
        line-height: 40px;
        margin-top: -20px;
        border-radius: 50%;
        position: absolute;
        left: 20px;
        top: 50%;
    }

    .message-list-item .message-item-icon.layui-icon {
        color: #fff;
        font-size: 22px;
        text-align: center;
        background-color: #FE5D58;
    }

    .message-list-item .message-item-icon + .message-item-right {
        margin-left: 55px;
    }

    .message-list-item .message-item-title {
        color: #666;
        font-size: 14px;
    }

    .message-list-item .message-item-text {
        color: #999;
        font-size: 12px;
    }

    .message-list-item > .layui-badge {
        position: absolute;
        right: 20px;
        top: 12px;
    }

    .message-list-item > .layui-badge + .message-item-right {
        margin-right: 50px;
    }

    .message-btn-clear, .message-btn-more {
        color: #666;
        display: block;
        padding: 10px 5px;
        line-height: 24px;
        text-align: center;
        cursor: pointer;
    }

    .message-btn-clear {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        border-top: 1px solid #e8e8e8;
    }

    .message-btn-more {
        color: #666;
        font-size: 13px;
    }

    .message-btn-more.ew-btn-loading > .ew-btn-loading-text {
        font-size: 13px !important;
    }

    .message-list-empty {
        color: #999;
        padding: 100px 0;
        text-align: center;
        display: none;
    }

    .message-list-empty > .layui-icon {
        color: #ccc;
        display: block;
        font-size: 45px;
        margin-bottom: 15px;
    }

    .show-empty .message-list-empty {
        display: block;
    }

    .show-empty .message-btn-clear, .show-empty .message-list {
        display: none;
    }

    /** //消息列表样式结束 */
</style>