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

  <div class="layui-fluid layui-radius-table layui-no-pt">
    <div class="layui-tab layui-tab-brief" lay-filter="runStatus">
      <ul class="layui-tab-title" id="messageType">
        <li class="layui-this text-info" data-type="R">{'Running'|t}</li>
        <li data-type="S" class="text-success">{'Finished'|t}</li>
      </ul>
    </div>
    <table id="pageTable" lay-filter="pageTable"></table>
  </div>

  <!-- 表格工具栏 -->
  <script type="text/html" id="tableToolbar">
    <a class="" lay-event="setup" title="{'Setup'|t}"><i class="layui-icon layui-icon-set"></i></a>
    <a class="layui-fg-blue" lay-event="queue" title="{'Queue'|t}"><i class="layui-icon layui-icon-template-1"></i></a>
  </script>
  <!-- 任务队列界面 -->
  <script type="text/html" id="taskQueueDialog">

  </script>
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}layui.use(['jquery','form','table','admin','laydate'],function($,form,table,admin,laydate){var element=layui.element;var TablePage=/*#__PURE__*/function(){function TablePage(){_defineProperty(this,"where",{'sort[name]':'id','sort[dir]':'d','status':$('#runStatus').find('li.layui-this').data('type')});}var _proto=TablePage.prototype;_proto.init=function init(id,cols,data){var _this=this;// 绘制表格
var dataTable=table.render({elem:id,cols:cols,autoSort:false,data:data,lazy:true,limit:30,where:this.where,url:admin.url('backend/task/data'),page:true}),that=this;//排序
table.on('sort(pageTable)',function(obj){_this.where['sort[name]']=obj.field;_this.where['sort[dir]']=obj.type==='asc'?'a':'d';dataTable.reloadData();});//绘制日期控件
laydate.render({elem:'input[name="date"]',type:'date',range:true,trigger:'click'});//搜索表单提交
form.on('submit(searchBtn)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();return false;});//重置表单
form.on('reset(searchForm)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();});//标签切换
element.on('tab(runStatus)',function(){var typ=$(this).data('type');if(typ!==that.where.status){that.where.status=typ;dataTable.reloadData();}});};return TablePage;}();var page=new TablePage();page.init('#pageTable',pageData.table.cols,pageData.table.data);});{/literal}</script>