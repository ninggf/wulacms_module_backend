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
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}layui.use(["jquery","form","table","admin","laydate","dropdown","xmSelect"],function(e,t,a,r,n){var i=layui.element,o=layui.dropdown,d=layui.xmSelect;(new(function(){function l(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",msgType:e("#messageType").find("li.layui-this").data("type")})}return l.prototype.init=function(l,s,u){var p=this,c=a.render({elem:l,cols:s,autoSort:!1,data:u,lazy:!0,limit:30,where:this.where,url:r.url("backend/message/data"),page:!0}),m=this;a.on("sort(pageTable)",function(e){p.where["sort[name]"]=e.field,p.where["sort[dir]"]="asc"===e.type?"a":"d",c.reloadData()}),n.render({elem:'input[name="date"]',type:"date",range:!0,trigger:"click"}),t.on("submit(searchBtn)",function(t){return p.where=e.extend(p.where,t.field),c.reloadData(),!1}),t.on("reset(searchForm)",function(t){p.where=e.extend(p.where,t.field),c.reloadData()}),i.on("tab(messageType)",function(){var t=e(this).data("type");t!=m.where.msgType&&(m.where.msgType=t,c.reloadData())}),o.render({elem:"#newMsgButton",data:pageData.newMsgItems,click:function(e){console.log(e)}});var y=d.render({name:"uid",el:"#userXmlSelect",height:"240px",radio:!0,empty:"暂无数据",paging:!0,pageSize:10,data:[],initValue:[],tips:"请选择用户",prop:{name:"name",value:"id"},model:{icon:"hidden",label:{type:"text"}},clickClose:!0,layVerify:"required",layVerType:"tips"});r.get("backend/user/xm-select-data?id=0").then(function(e){y.update({data:e.tree,tree:{show:!0,showFolderIcon:!0,indent:15,strict:!1,expandedKeys:[1],simple:!0},autoRow:!0})})},l}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>