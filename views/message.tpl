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
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}layui.use(["jquery","form","table","admin","laydate","dropdown","xmSelect"],function(e,a,t,n,i){var o=layui.element,r=layui.dropdown,d=layui.xmSelect;layui.laytpl.config({viewURL:n.url("backend/message/view")}),(new(function(){function l(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",msgType:e("#messageType").find("li.layui-this").data("type")}),_defineProperty(this,"savedData",{}),_defineProperty(this,"dataTable",null)}var s=l.prototype;return s.init=function(l,s,c){var u=this,p=t.render({elem:l,cols:s,autoSort:!1,data:c,lazy:!0,limit:30,where:this.where,url:n.url("backend/message/data"),page:!0,done:n.autoRowHeight("pageTable")}),m=this;m.dataTable=p,t.on("tool(pageTable)",function(e){var a=e.event,t=e.data;switch(a){case"edit":m.openEditor(t.type,pageData.permitTypes[e.type],t);break;case"delete":n.confirm("你真的要删除该消息吗?",function(e){layer.close(e),n.showLoading("body",4,.65),n.post("backend/message/delete/"+t.type+"/"+t.id).then(function(e){p.reloadData(),n.removeLoading()}).fail(function(e){n.removeLoading()})});break;case"pub":n.confirm("你真的要发布该消息吗?",function(e){layer.close(e),n.showLoading("body",4,.65),n.post("backend/message/publish/"+t.type+"/"+t.id).then(function(e){p.reloadData(),n.removeLoading()}).fail(function(e){n.removeLoading()})})}}),i.render({elem:'input[name="date"]',type:"date",calendar:!0,range:!0,trigger:"click"}),a.on("submit(searchBtn)",function(a){return u.where=e.extend(u.where,a.field),p.reloadData(),!1}),a.on("reset(searchForm)",function(a){u.where=e.extend(u.where,a.field),p.reloadData()}),o.on("tab(messageType)",function(){var a=e(this).data("type");a!==m.where.msgType&&(m.where.msgType=a,p.reloadData())}),r.render({elem:"#newMsgButton",data:pageData.newMsgItems,click:function(e){m.openEditor(e.id,e.title)}});var y=d.render({name:"uid",el:"#userXmlSelect",height:"240px",radio:!0,empty:"无用户",paging:!0,pageSize:10,data:[],initValue:[],tips:"请选择用户",prop:{name:"name",value:"id"},model:{icon:"hidden",label:{type:"text"}},clickClose:!0});n.get("backend/user/xm-select-data?id=0").then(function(e){y.update({data:e.tree,tree:{show:!0,showFolderIcon:!0,indent:15,strict:!1,expandedKeys:[1],simple:!0},autoRow:!0})})},s.openEditor=function(e,t,i){var o=this;n.openDialog("#"+e+"_editor",t,{area:["900px","600px"],btn:[_t("Save"),_t("Cancel")],yes:function(a){o.saveMsg(e,a)},btn2:function(e){this.cancel(e)},cancel:function(t){layer.close(t),o.savedData=a.val(e+"EditForm")}},function(){a.render(null,e+"EditForm"),a.val(e+"EditForm",i||o.savedData)})},s.saveMsg=function(e,t){var i=this;if(a.validate(e+"EditForm")){n.showLoading("#layui-layer"+t,4,"0.65");var o=a.val(e+"EditForm");n.post("backend/message/save/"+e,o).then(function(e){n.removeLoading("#layui-layer"+t),e&&200===e.code&&(i.savedData={},i.dataTable.reloadData(),layer.close(t))}).fail(function(e){n.removeLoading("#layui-layer"+t)})}},l}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>