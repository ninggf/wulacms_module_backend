<template>
  <div>
    {if $messages}
    <div class="message-list">
      {foreach $messages as $msg}
      <a class="message-list-item" ew-title="{$msg.title|escape}" ew-href="{'backend/message/view/'|app}/{$msg.id}">
        <i class="layui-icon layui-icon-speaker message-item-icon"></i>
        <div class="message-item-right">
          <h2 class="message-item-title">
            {$msg.title} {if !$msg.read_time}<i class="layui-icon layui-icon-email layui-fg-red"></i>{/if}
          </h2>
          <p class="message-item-text">{$msg.create_time}</p>
        </div>
      </a>
      {/foreach}
    </div>
    {else}
    <div class="message-list-empty">
      <i class="layui-icon layui-icon-notice"></i>
      <div>没有通知</div>
    </div>
    {/if}
  </div>
</template>