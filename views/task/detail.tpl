<div class="layui-fluid page-header">
    <h2>[{$taskName}]{$name}</h2>
  </div>

  <form class="layui-form layui-fluid layui-no-pb" id="searchForm" lay-filter="searchForm">
    <input type="hidden" id="task_id" value="{$task_id}">
    <input type="hidden" id="taskName" value="{$name}">
    <div class="layui-card">
      <div class="layui-card-body">
        <div class="layui-form-item layui-row layui-no-mb">

          <div class="layui-col-sm5 layui-col-md4">
            <label class="layui-form-label">{'Date'|t}:</label>
            <div class="layui-input-block">
              <input name="date" class="layui-input icon-date" placeholder="{'Date'|t}" autocomplete="off"/>
            </div>
          </div>

          <div class="layui-col-sm5 layui-col-md4">
            <label class="layui-form-label">{'Status'|t}:</label>
            <div class="layui-input-block">
              <select name="status">
                <option value="" selected>{'All'|t}</option>
                <option value="P">{'Pending'|t}</option>
                <option value="R">{'Running'|t}</option>
                <option value="F">{'Success'|t}</option>
                <option value="E">{'Failed'|t}</option>
              </select>
            </div>
          </div>

          <div class="layui-col-sm2 layui-col-md4">
            <label class="layui-form-label">&nbsp;</label>
            <div class="layui-btn-group">
              <button type="button" class="layui-btn" lay-filter="searchBtn" lay-submit>
                <i class="layui-icon">&#xe615;</i>
              </button>
              <button type="reset" class="layui-btn layui-btn-warm" lay-filter="resetBtn"><i class="layui-icon">&#xe669;</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>

  <div class="layui-fluid layui-radius-table layui-no-pt layui-table-cell-ah">
    <table id="pageTable" lay-filter="pageTable"></table>
  </div>
  {literal}
  <script type="text/html" id="progTpl">
    <div class="layui-progress" style="margin-top: 15px" lay-showpercent="yes" lay-filter="tpr">
      <div class="layui-progress-bar layui-bg-{{d.progCls}}" lay-percent="{{d.progress}}%"></div>
    </div>
  </script>
  <script type="text/html" id="statusTpl">
    <span class="text-{{=d.statusCls}}">{{=d.statusText}}</span>
  </script>
  <script type="text/html" id="tableToolbar">
    <a ew-href="{{d.$.detail}}{{d.id}}" ew-title="{{=d.id}}@{{=d.$.taskName}}[{{d.retried+1}}]">
      <i class="layui-icon layui-icon-log"></i>
    </a>
    <a lay-event="setup" title="{'Setup'|t}"><i class="layui-icon layui-icon-set"></i></a>
  </script>
  <!-- 任务选项界面 -->
  <script type="text/html" id="taskSetupDialog">
    <div id="jsoneditor" style="width: 100%;height: 100%"></div>
  </script>
  {/literal}
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}layui.use(['jquery','form','table','admin','laydate','element'],function($,form,table,admin,laydate){var element=layui.element,tpl=layui.laytpl,task_id=$('#task_id').val(),taskName=$('#taskName').val();tpl.config({detail:admin.url('backend/task/log/'),taskName:taskName});var TablePage=/*#__PURE__*/function(){function TablePage(){_defineProperty(this,"where",{'sort[name]':'id','sort[dir]':'d'});}var _proto=TablePage.prototype;_proto.init=function init(id,cols,data){var _this=this;// 绘制表格
var dataTable=table.render({elem:id,cols:cols,autoSort:false,data:data,lazy:true,limit:30,where:this.where,url:admin.url('backend/task/detail-data/'+task_id),page:true,done:function done(tid){admin.autoRowHeight('pageTable')(tid);element.render('progress','tpr');}});table.on('tool(pageTable)',function(obj){var event=obj.event,data=obj.data;switch(event){case'setup':break;}});//绘制日期控件
laydate.render({elem:'input[name="date"]',type:'date',range:true,trigger:'click'});//搜索表单提交
form.on('submit(searchBtn)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();return false;});//重置表单
form.on('reset(searchForm)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();});//事件处理
table.on('tool(pageTable)',function(obj){var event=obj.event,data=obj.data;switch(event){case'setup':var editor;admin.openDialog('#taskSetupDialog','Options',{area:['600px','400px'],offset:'auto',destroy:function destroy(){editor.destroy();}},function(){var container=document.getElementById("jsoneditor"),options={mode:'view'};editor=new JSONEditor(container,options);editor.set(data.options||{});});break;}});}//end init
;return TablePage;}();var taskTable=new TablePage();taskTable.init('#pageTable',pageData.table.cols,pageData.table.data);});{/literal}</script>