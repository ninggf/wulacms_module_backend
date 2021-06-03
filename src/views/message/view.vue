<template>
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-card-body">
        <h1 class="text-center" style="margin-bottom: 15px">
          {$message.title}
        </h1>
        {if $message.publish_uid || $message.desc}
        <div class="layui-panel" style="margin-bottom: 20px">
          {if $message.publish_uid}
          <div class="layui-text" style="padding: 5px 10px;">
            <small style="font-size: 14px">{$message.nickname}({$message.user_name})@<i>{'Y-m-d H:i:s'|date:$message.publish_time}</i></small>
          </div>
          {/if}
          <div style="padding: 10px;font-size: 16px;">{$message.desc}</div>
        </div>
        {/if}
        <div class="msg-content" style="font-size: 20px">
          {$message_content}
        </div>
        {if $message.url}
        <div class="layui-text" style="margin-top: 15px">
          <a href="{$message.url}" target="_blank">查看原文<i class="layui-icon layui-icon-release"></i></a>
        </div>
        {/if}
      </div>
    </div>
  </div>
</template>
