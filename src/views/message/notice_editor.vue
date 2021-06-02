<template>
  <div data-area="800px" style="overflow: auto;height: 100%;width: 100%">
    <form class="layui-form layui-fluid layui-no-mb layui-no-pb" action="" lay-filter="noticeEditForm">
      <input type="hidden" name="id" value=""/>
      <div class="layui-form-item">
        <label class="layui-form-label">通知标题</label>
        <div class="layui-input-block">
          <input type="text" name="title" required lay-verify="required" lay-reqText="请填写标题" placeholder="请输入标题" autocomplete="off" class="layui-input">
        </div>
      </div>
      <div class="layui-form-item layui-no-mb">
        <label class="layui-form-label">通知正文</label>
        <div class="layui-input-block">
          <textarea type="text" name="content" rows="10" style="resize: none;height: 300px" placeholder="请输正文" autocomplete="off" class="layui-textarea"></textarea>
        </div>
      </div>
    </form>
  </div>
</template>