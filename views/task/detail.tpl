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
    <a ew-href="{{d.$.detail}}{{d.id}}" ew-refer="~" ew-title="{{=d.id}}@{{=d.$.taskName}}[{{d.retried+1}}]">
      <i class="layui-icon layui-icon-log"></i>
    </a>
    <a lay-event="setup" title="{'Setup'|t}"><i class="layui-icon layui-icon-set"></i></a>
  </script>
  <!-- 任务选项界面 -->
  <script type="text/html" id="taskSetupDialog">
    <div id="jsoneditor" style="width: 100%;height: 100%"></div>
  </script>
  {/literal}
<script>var pageData = {$pageData|json_encode};{literal}
function _defineProperty(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}layui.use(["jquery","form","table","admin","laydate","element"],function(e,t,a,n,r){var o=layui.element,i=layui.laytpl,l=e("#task_id").val(),d=e("#taskName").val();i.config({detail:n.url("backend/task/log/"),taskName:d}),(new(function(){function i(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d"})}return i.prototype.init=function(i,d,u){var s=this,c=a.render({elem:i,cols:d,autoSort:!1,data:u,lazy:!0,limit:30,where:this.where,url:n.url("backend/task/detail-data/"+l),page:!0,done:function(e){n.autoRowHeight("pageTable")(e),o.render("progress","tpr")}});a.on("tool(pageTable)",function(e){e.event;e.data}),r.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),t.on("submit(searchBtn)",function(t){return s.where=e.extend(s.where,t.field),c.reloadData(),!1}),t.on("reset(searchForm)",function(t){s.where=e.extend(s.where,t.field),c.reloadData()}),a.on("tool(pageTable)",function(e){var t=e.event,a=e.data;switch(t){case"setup":var r;n.openDialog("#taskSetupDialog","Options",{area:["600px","400px"],offset:"auto",destroy:function(){r.destroy()}},function(){var e=document.getElementById("jsoneditor"),t={mode:"view"};r=new JSONEditor(e,t),r.set(a.options||{})})}})},i}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>