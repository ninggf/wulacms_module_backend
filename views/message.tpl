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
            <label class="layui-form-label text-left">{'Date'|t}:</label>
            <div class="layui-input-block">
              <input name="date" class="layui-input icon-date" placeholder="{'Date'|t}" autocomplete="off"/>
            </div>
          </div>
          <div class="layui-col-sm6 layui-col-md4">
            <label class="layui-form-label text-left">{'Status'|t}:</label>
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
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}layui.use(["jquery","form","table","admin","laydate","dropdown"],function(e,a,t,r,n){var i=layui.element,o=layui.dropdown;(new(function(){function d(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",msgType:e("#messageType").find("li.layui-this").data("type")})}return d.prototype.init=function(d,l,s){var u=this,c=t.render({elem:d,cols:l,autoSort:!1,data:s,lazy:!0,limit:30,where:this.where,url:r.url("backend/message/data"),page:!0}),p=this;t.on("sort(pageTable)",function(e){u.where["sort[name]"]=e.field,u.where["sort[dir]"]="asc"===e.type?"a":"d",c.reloadData()}),n.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),a.on("submit(searchBtn)",function(a){return u.where=e.extend(u.where,a.field),c.reloadData(),!1}),a.on("reset(searchForm)",function(a){u.where=e.extend(u.where,a.field),c.reloadData()}),i.on("tab(messageType)",function(){var a=e(this).data("type");a!=p.where.msgType&&(p.where.msgType=a,c.reloadData())}),o.render({elem:"#newMsgButton",data:pageData.newMsgItems,click:function(e){console.log(e)}})},d}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>