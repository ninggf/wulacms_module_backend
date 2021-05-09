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
        <li class="layui-this text-info" data-type="R">{'Running'|t}</li>
        <li data-type="S" class="text-success">{'Finished'|t}</li>
      </ul>
    </div>
    <table id="pageTable" lay-filter="pageTable"></table>
  </div>
  <script type="text/html" id="retryCol">
    {literal}<p>Retry: {{ d.retry }}</p><p>Interval: {{ d.interval }}</p>{/literal}
  </script>
  <!-- 表格工具栏 -->
  <script type="text/html" id="tableToolbar">
    <a class="" lay-event="setup" title="{'Setup'|t}"><i class="layui-icon layui-icon-set"></i></a><a class="layui-fg-blue" lay-event="queue" title="{'Queue'|t}"><i class="layui-icon layui-icon-template-1"></i></a>
  </script>
  <!-- 任务队列界面 -->
  <script type="text/html" id="taskQueueDialog">
    <table lay-filter="queueTable"></table>
  </script>
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}layui.use(["jquery","form","table","admin","laydate"],function(e,t,a,r,n){var i=layui.element;(new(function(){function o(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",status:e("#runStatus").find("li.layui-this").data("type")})}var u=o.prototype;return u.init=function(o,u,l){var s=this,d=a.render({elem:o,cols:u,autoSort:!1,data:l,lazy:!0,limit:30,where:this.where,url:r.url("backend/task/data"),page:!0,done:r.autoRowHeight("pageTable")}),c=this;a.on("sort(pageTable)",function(e){s.where["sort[name]"]=e.field,s.where["sort[dir]"]="asc"===e.type?"a":"d",d.reloadData()}),a.on("tool(pageTable)",function(e){var t=e.event,a=e.data;switch(t){case"setup":break;case"queue":s.showQueue(a)}}),n.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),t.on("submit(searchBtn)",function(t){return s.where=e.extend(s.where,t.field),d.reloadData(),!1}),t.on("reset(searchForm)",function(t){s.where=e.extend(s.where,t.field),d.reloadData()}),i.on("tab(runStatus)",function(){var t=e(this).data("type");t!==c.where.status&&(c.where.status=t,d.reloadData())})},u.showQueue=function(e){console.log(e)},o}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>