<div class="layui-fluid page-header">
    <h2>{'Tasks'|t}</h2>
  </div>

  <form class="layui-form layui-fluid layui-no-pb" id="searchForm" lay-filter="searchForm">
    <div class="layui-card">
      <div class="layui-card-body">
        <div class="layui-form-item layui-row layui-no-mb">

          <div class="layui-col-sm6 layui-col-md3">
            <label class="layui-form-label">{'Date'|t}:</label>
            <div class="layui-input-block">
              <input name="date" class="layui-input icon-date" placeholder="{'Date'|t}" autocomplete="off"/>
            </div>
          </div>

          <div class="layui-col-sm6 layui-col-md3">
            <label class="layui-form-label">{'Name'|t}:</label>
            <div class="layui-input-block">
              <input name="name" class="layui-input" placeholder="{'Name'|t}" autocomplete="off"/>
            </div>
          </div>

          <div class="layui-col-sm6 layui-col-md3">
            <label class="layui-form-label">{'Task'|t}:</label>
            <div class="layui-input-block">
              <select name="clz">
                <option value="" selected>{'All'|t}</option>
                {foreach $tasks as $clz => $name}
                <option value="{$clz|escape}">{$name}</option>
                {/foreach}
              </select>
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

  <div class="layui-fluid layui-radius-table layui-no-pt layui-table-cell-ah">
    <div class="layui-tab layui-tab-brief" lay-filter="runStatus">
      <ul class="layui-tab-title" id="messageType">
        <li class="layui-this text-info" data-type="R">{'Scheduled'|t}</li>
        <li data-type="S" class="text-success">{'Finished'|t}</li>
      </ul>
    </div>
    <table id="pageTable" lay-filter="pageTable"></table>
  </div>
  <script type="text/html" id="nameTpl">
    {literal}<span class="layui-text">
      <a ew-href="{{d.$.detail}}{{d.id}}" ew-title="[{{d.id}}]{{=d.name}}">[{{= d.type }}]{{ d.name }}</a>
    </span>{/literal}
  </script>
  <script type="text/html" id="retryCol">
    {literal}<p>Retry: {{ d.retry }}</p><p>Interval: {{ d.interval }}</p>{/literal}
  </script>
  <!-- 表格工具栏 -->
  <script type="text/html" id="tableToolbar">
    <a lay-event="setup" title="{'Setup'|t}"><i class="layui-icon layui-icon-set"></i></a>
  </script>
  <!-- 任务选项界面 -->
  <script type="text/html" id="taskSetupDialog">
    <div id="jsoneditor" style="width: 100%;height: 100%"></div>
  </script>
<script>var pageData = {$pageData|json_encode};{literal}
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

layui.use(['jquery', 'form', 'table', 'admin', 'laydate'], function ($, form, table, admin, laydate) {
  var element = layui.element,
      tpl = layui.laytpl;
  tpl.config({
    detail: admin.url('backend/task/detail/')
  });

  var TablePage = /*#__PURE__*/function () {
    function TablePage() {
      _defineProperty(this, "where", {
        'sort[name]': 'id',
        'sort[dir]': 'd',
        'status': $('#runStatus').find('li.layui-this').data('type')
      });
    }

    var _proto = TablePage.prototype;

    _proto.init = function init(id, cols, data) {
      var _this = this;

      // 绘制表格
      var dataTable = table.render({
        elem: id,
        cols: cols,
        autoSort: false,
        data: data,
        lazy: true,
        limit: 30,
        where: this.where,
        url: admin.url('backend/task/data'),
        page: true,
        done: admin.autoRowHeight('pageTable')
      }),
          that = this; //排序

      table.on('sort(pageTable)', function (obj) {
        _this.where['sort[name]'] = obj.field;
        _this.where['sort[dir]'] = obj.type === 'asc' ? 'a' : 'd';
        dataTable.reloadData();
      }); //事件处理

      table.on('tool(pageTable)', function (obj) {
        var event = obj.event,
            data = obj.data;

        switch (event) {
          case 'setup':
            var editor;
            admin.openDialog('#taskSetupDialog', 'Options', {
              area: ['600px', '400px'],
              offset: 'auto',
              destroy: function destroy() {
                editor.destroy();
              }
            }, function () {
              var container = document.getElementById("jsoneditor"),
                  options = {
                mode: 'view'
              };
              editor = new JSONEditor(container, options);
              editor.set(data.options || {});
            });
            break;
        }
      }); //绘制日期控件

      laydate.render({
        elem: 'input[name="date"]',
        type: 'date',
        range: true,
        trigger: 'click'
      }); //搜索表单提交

      form.on('submit(searchBtn)', function (obj) {
        _this.where = $.extend(_this.where, obj.field);
        dataTable.reloadData();
        return false;
      }); //重置表单

      form.on('reset(searchForm)', function (obj) {
        _this.where = $.extend(_this.where, obj.field);
        dataTable.reloadData();
      }); //标签切换

      element.on('tab(runStatus)', function () {
        var typ = $(this).data('type');

        if (typ !== that.where.status) {
          that.where.status = typ;
          dataTable.reloadData();
        }
      });
    };

    return TablePage;
  }();

  var taskTable = new TablePage();
  taskTable.init('#pageTable', pageData.table.cols, pageData.table.data);
});{/literal}</script>