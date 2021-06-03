<template>
  <div class="layui-fluid page-header">
    <h2>{'Message Center'|t}</h2>
  </div>

  <div class="layui-fluid layui-radius-table layui-no-pt layui-table-cell-ah">
    <div class="layui-tab layui-tab-brief" lay-filter="messageType">
      <ul class="layui-tab-title" id="messageType">
        {foreach $messages as $typ => $msg}
        <li class="{if $msg@first}layui-this{/if}" data-type="{$typ}">{$msg->getName()}</li>
        {/foreach}
      </ul>
    </div>
    <table id="pageTable" lay-filter="pageTable"></table>
  </div>
  {literal}
  <script type="text/html" id="statusTpl">
      {{# if (d.read_time) { }}{{d.publish_time}} {{# } }}
  </script>
  <script type="text/html" id="title_desc">
    <p class="layui-text">
      <a ew-href="{{d.$.viewURL}}/{{d.id}}" ew-title="{{=d.title}}">
        {{=d.title }}
        {{# if (!d.read_time) { }}<i class="layui-icon layui-icon-email layui-fg-red"></i>{{# } }}
      </a>
    </p>
    {{# if (d.desc) { }}<p><small>{{= d.desc }}</small></p>{{# } }}
  </script>
  {/literal}
</template>

<script>
layui.use(['jquery', 'form', 'table', 'admin'], ($, form, table, admin) => {
  let element    = layui.element

  layui.laytpl.config({
    viewURL: admin.url('backend/message/view')
  })

  class TablePage {
    where     = {
      'sort[name]': 'id',
      'sort[dir]' : 'd',
      'msgType'   : $('#messageType').find('li.layui-this').data('type')
    }
    savedData = {}
    dataTable = null

    init(id, cols, data) {
      // 绘制表格
      let dataTable  = table.render({
        elem    : id,
        cols    : cols,
        autoSort: false,
        data    : data,
        lazy    : true,
        limit   : 30,
        where   : this.where,
        url     : admin.url('backend/message/center-data'),
        page    : true,
        done    : admin.autoRowHeight('pageTable')
      }), that       = this
      that.dataTable = dataTable
      //标签切换
      element.on('tab(messageType)', function () {
        let typ = $(this).data('type')
        if (typ !== that.where.msgType) {
          that.where.msgType = typ
          dataTable.reloadData()
        }
      })
    }
  }

  let page = new TablePage();
  page.init('#pageTable', pageData.table.cols, pageData.table.data)
});
</script>