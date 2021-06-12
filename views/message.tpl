<div class="layui-fluid page-header">
    <h2>{'Message Center'|t}</h2>
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
  <script type="text/html" id="createTpl">
    <p>{{d.cu_nick}}({{d.cu_name}})</p>
    <p><small>{{d.create_time}}</small></p>
  </script>
  <script type="text/html" id="publishTpl">
    {{# if(d.publish_time){ }}
    <p>{{d.pu_nick}}({{d.pu_name}})</p>
    <p><small>{{d.publish_time}}</small></p>
    {{# } }}
  </script>
  <script type="text/html" id="statusTpl"><span class="text-{{=d.cls}}">{{ d.status }}</span></script>
  <script type="text/html" id="title_desc">
    <p class="layui-text">
      <a ew-href="{{d.$.viewURL}}/{{d.id}}" ew-title="{{=d.title}}">{{=d.title }}</a>
    </p>
    {{# if (d.desc) { }}<p><small>{{= d.desc }}</small></p>{{# } }}
  </script>
  <script type="text/html" id="toolbar">
    {{# if(d.ce && d.status == 'Draft'){ }}<a lay-event="edit" title="{{= _t('Edit') }}"><i class="layui-icon layui-icon-edit layui-fg-blue"></i></a>{{# } }}{{# if(d.cp && d.status == 'Draft'){ }}
    <a lay-event="pub" title="{{= _t('Publish') }}"><i class="layui-icon layui-icon-release layui-fg-orange"></i></a>{{# } }}{{# if(d.cd && d.status == 'Draft'){ }}
    <a lay-event="delete" title="{{= _t('Delete') }}"><i class="layui-icon layui-icon-close layui-fg-red"></i></a>{{# } }}
  </script>
  {/literal}
  {foreach $editors as $etype => $editor}
  <script type="text/html" id="{$etype}_editor">
    {$editor}
  </script>
  {/foreach}
<script>var pageData = {$pageData|json_encode};{literal}
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

layui.use(['jquery', 'form', 'table', 'admin', 'laydate', 'dropdown', 'xmSelect'], function ($, form, table, admin, laydate) {
  var element = layui.element,
      dropdown = layui.dropdown,
      xmSelect = layui.xmSelect;
  layui.laytpl.config({
    viewURL: admin.url('backend/message/view')
  });

  var TablePage = /*#__PURE__*/function () {
    function TablePage() {
      _defineProperty(this, "where", {
        'sort[name]': 'id',
        'sort[dir]': 'd',
        'msgType': $('#messageType').find('li.layui-this').data('type')
      });

      _defineProperty(this, "savedData", {});

      _defineProperty(this, "dataTable", null);
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
        url: admin.url('backend/message/data'),
        page: true,
        done: admin.autoRowHeight('pageTable')
      }),
          that = this;
      that.dataTable = dataTable; //排序

      table.on('tool(pageTable)', function (obj) {
        var event = obj.event,
            data = obj.data;

        switch (event) {
          case 'edit':
            that.openEditor(data.type, pageData.permitTypes[obj.type], data);
            break;

          case 'delete':
            admin.confirm('你真的要删除该消息吗?', function (idx) {
              layer.close(idx);
              admin.showLoading('body', 4, .65);
              admin.post('backend/message/delete/' + data.type + '/' + data.id).then(function (resp) {
                dataTable.reloadData();
                admin.removeLoading();
              }).fail(function (resp) {
                admin.removeLoading();
              });
            });
            break;

          case 'pub':
            admin.confirm('你真的要发布该消息吗?', function (idx) {
              layer.close(idx);
              admin.showLoading('body', 4, .65);
              admin.post('backend/message/publish/' + data.type + '/' + data.id).then(function (resp) {
                dataTable.reloadData();
                admin.removeLoading();
              }).fail(function (resp) {
                admin.removeLoading();
              });
            });
            break;

          default:
        }
      }); //绘制日期控件

      laydate.render({
        elem: 'input[name="date"]',
        type: 'date',
        calendar: true,
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

      element.on('tab(messageType)', function () {
        var typ = $(this).data('type');

        if (typ !== that.where.msgType) {
          that.where.msgType = typ;
          dataTable.reloadData();
        }
      }); //下拉菜单

      dropdown.render({
        elem: '#newMsgButton',
        data: pageData.newMsgItems,
        click: function click(obj) {
          that.openEditor(obj.id, obj.title);
        }
      }); //用户选择

      var userXmlSelect = xmSelect.render({
        name: 'uid',
        el: '#userXmlSelect',
        height: '240px',
        radio: true,
        empty: '无用户',
        paging: true,
        // 开启分页
        pageSize: 10,
        // 每页条数
        data: [],
        initValue: [],
        tips: '请选择用户',
        prop: {
          name: 'name',
          value: 'id'
        },
        model: {
          icon: 'hidden',
          label: {
            type: 'text'
          }
        },
        clickClose: true
      });
      admin.get('backend/user/xm-select-data?id=0').then(function (data) {
        userXmlSelect.update({
          data: data.tree,
          tree: {
            show: true,
            showFolderIcon: true,
            indent: 15,
            strict: false,
            expandedKeys: [1],
            simple: true
          },
          autoRow: true
        });
      });
    };

    _proto.openEditor = function openEditor(id, title, data) {
      var that = this;
      admin.openDialog('#' + id + '_editor', title, {
        area: ['900px', '600px'],
        btn: [_t('Save'), _t('Cancel')],
        yes: function yes(idx) {
          that.saveMsg(id, idx);
        },
        btn2: function btn2(idx) {
          this.cancel(idx);
        },
        cancel: function cancel(idx) {
          layer.close(idx);
          that.savedData = form.val(id + 'EditForm');
        }
      }, function () {
        form.render(null, id + 'EditForm');
        form.val(id + 'EditForm', data || that.savedData);
      });
    };

    _proto.saveMsg = function saveMsg(id, idx) {
      var that = this;

      if (!form.validate(id + 'EditForm')) {
        return;
      }

      admin.showLoading('#layui-layer' + idx, 4, '0.65');
      var data = form.val(id + 'EditForm');
      admin.post('backend/message/save/' + id, data).then(function (resp) {
        admin.removeLoading('#layui-layer' + idx);

        if (resp && resp.code === 200) {
          that.savedData = {};
          that.dataTable.reloadData();
          layer.close(idx);
        }
      }).fail(function (resp) {
        admin.removeLoading('#layui-layer' + idx);
      });
    };

    return TablePage;
  }();

  var page = new TablePage();
  page.init('#pageTable', pageData.table.cols, pageData.table.data);
});{/literal}</script>