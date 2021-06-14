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
function _defineProperty(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}layui.use(["jquery","form","table","admin","laydate"],function(e,t,a,n,r){var i=layui.element;layui.laytpl.config({detail:n.url("backend/task/detail/")}),(new(function(){function o(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",status:e("#runStatus").find("li.layui-this").data("type")})}return o.prototype.init=function(o,l,d){var u=this,s=a.render({elem:o,cols:l,autoSort:!1,data:d,lazy:!0,limit:30,where:this.where,url:n.url("backend/task/data"),page:!0,done:n.autoRowHeight("pageTable")}),c=this;a.on("sort(pageTable)",function(e){u.where["sort[name]"]=e.field,u.where["sort[dir]"]="asc"===e.type?"a":"d",s.reloadData()}),a.on("tool(pageTable)",function(e){var t=e.event,a=e.data;switch(t){case"setup":var r;n.openDialog("#taskSetupDialog","Options",{area:["600px","400px"],offset:"auto",destroy:function(){r.destroy()}},function(){var e=document.getElementById("jsoneditor"),t={mode:"view"};r=new JSONEditor(e,t),r.set(a.options||{})})}}),r.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),t.on("submit(searchBtn)",function(t){return u.where=e.extend(u.where,t.field),s.reloadData(),!1}),t.on("reset(searchForm)",function(t){u.where=e.extend(u.where,t.field),s.reloadData()}),i.on("tab(runStatus)",function(){var t=e(this).data("type");t!==c.where.status&&(c.where.status=t,s.reloadData())})},o}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>