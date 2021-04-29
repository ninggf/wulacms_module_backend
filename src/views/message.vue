<template>
  <div class="layui-fluid page-header">
    <h2>{'Message'|t}</h2>
    <div class="page-toolbar">
      <button type="button" class="layui-btn layui-btn-sm" id="newMsgButton">
        <i class="layui-icon">&#xe654;</i> {'New'|t} <i class="layui-icon layui-icon-down layui-font-12"></i>
      </button>
    </div>
  </div>

  <form class="layui-form layui-fluid layui-no-pb" id="searchForm" lay-filter="searchForm">
    <div class="layui-card">
      <div class="layui-card-body">
        <div class="layui-form-item layui-row layui-no-mb">
          <div class="layui-col-sm6 layui-col-md4">
            <label class="layui-form-label">{'Date'|t}:</label>
            <div class="layui-input-block">
              <input name="date" class="layui-input icon-date" placeholder="{'Date'|t}" autocomplete="off"/>
            </div>
          </div>
          <div class="layui-col-sm6 layui-col-md4">
            <label class="layui-form-label">{'Status'|t}:</label>
            <div class="layui-input-block">
              <select name="status">
                <option value="" selected>{'All'|t}</option>
                <option value="0">{'Draft'|t}</option>
                <option value="1">{'Published'|t}</option>
                <option value="2">{'Deleted'|t}</option>
              </select>
            </div>
          </div>
          <div class="layui-col-sm6 layui-col-md4">
            <label class="layui-form-label">{'User'|t}:</label>
            <div class="layui-input-block">
              <div id="userXmlSelect"></div>
            </div>
          </div>
        </div>
        <div class="layui-form-item layui-row layui-no-mb">
          <div class="layui-col-xs12 text-center layui-no-mb">
            <div class="layui-btn-group">
              <button type="button" class="layui-btn layui-btn-sm" lay-filter="searchBtn" lay-submit>
                <i class="layui-icon">&#xe615;</i>
              </button>
              <button type="reset" class="layui-btn layui-btn-sm layui-btn-warm" lay-filter="resetBtn"><i class="layui-icon">&#xe669;</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>

  <div class="layui-fluid layui-radius-table layui-no-pt">
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
  <script type="text/html" id="title_desc">
    <small>{{ d.title }}</small>
    <div>{{ d.desc }}</div>
  </script>
  {/literal}
  {foreach $editors as $etype => $editor}
  <script type="text/html" id="{$etype}_editor">
    {$editor}
  </script>
  {/foreach}
</template>

<script>
layui.use(['jquery', 'form', 'table', 'admin', 'laydate', 'dropdown', 'xmSelect'], ($, form, table, admin, laydate) => {
  let element    = layui.element
      , dropdown = layui.dropdown
      , xmSelect = layui.xmSelect

  class TablePage {
    where = {
      'sort[name]': 'id',
      'sort[dir]' : 'd',
      'msgType'   : $('#messageType').find('li.layui-this').data('type')
    }

    init(id, cols, data) {
      // 绘制表格
      let dataTable = table.render({
        elem    : id,
        cols    : cols,
        autoSort: false,
        data    : data,
        lazy    : true,
        limit   : 30,
        where   : this.where,
        url     : admin.url('backend/message/data'),
        page    : true
      }), that      = this
      //排序
      table.on('sort(pageTable)', (obj) => {
        this.where['sort[name]'] = obj.field
        this.where['sort[dir]']  = obj.type === 'asc' ? 'a' : 'd'
        dataTable.reloadData()
      });
      //绘制日期控件
      laydate.render({
        elem   : 'input[name="date"]',
        type   : 'date',
        range  : true,
        trigger: 'click'
      });
      //搜索表单提交
      form.on('submit(searchBtn)', (obj) => {
        this.where = $.extend(this.where, obj.field)
        dataTable.reloadData()
        return false;
      });
      //重置表单
      form.on('reset(searchForm)', (obj) => {
        this.where = $.extend(this.where, obj.field)
        dataTable.reloadData()
      });

      //标签切换
      element.on('tab(messageType)', function () {
        let typ = $(this).data('type')
        if (typ != that.where.msgType) {
          that.where.msgType = typ
          dataTable.reloadData()
        }
      })
      //下拉菜单
      dropdown.render({
        elem: '#newMsgButton',
        data: pageData.newMsgItems,
        click(obj) {
          console.log(obj)
        }
      })
      //用户选择
      let userXmlSelect = xmSelect.render({
        name      : 'uid',
        el        : '#userXmlSelect',
        height    : '240px',
        radio     : true,
        empty     : '暂无数据',
        paging    : true, // 开启分页
        pageSize  : 10, // 每页条数
        data      : [],
        initValue : [],
        tips      : '请选择用户',
        prop      : {
          name : 'name',
          value: 'id'
        },
        model     : {
          icon : 'hidden',
          label: {
            type: 'text',
          },
        },
        clickClose: true,
        layVerify : 'required',
        layVerType: 'tips',

      })
      admin.get('backend/user/xm-select-data?id=0').then(function (data) {
        userXmlSelect.update({
          data   : data.tree,
          tree   : {
            show          : true,
            showFolderIcon: true,
            indent        : 15,
            strict        : false,
            expandedKeys  : [1],
            simple        : true,
          },
          autoRow: true,
        })

      });

    }

  }

  let page = new TablePage();
  page.init('#pageTable', pageData.table.cols, pageData.table.data)
});
</script>