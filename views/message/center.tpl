<div class="layui-fluid page-header">
    <h2>{'Message Center'|t}</h2>
  </div>

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
  <script type="text/html" id="statusTpl">
      {{# if (d.read_time) { }}{{d.publish_time}} {{# } }}
  </script>
  <script type="text/html" id="title_desc">
    <p class="layui-text">
      <a ew-href="{{d.$.viewURL}}/{{d.id}}" ew-title="{{=d.title}}">
        {{=d.title }}
        {{# if (!d.read_time) { }}<i class="layui-icon layui-icon-email layui-fg-red"></i>{{# } }}
      </a>
    </p>
    {{# if (d.desc) { }}<p><small>{{= d.desc }}</small></p>{{# } }}
  </script>
  {/literal}
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}layui.use(["jquery","form","table","admin"],function(e,a,t,i){var r=layui.element;layui.laytpl.config({viewURL:i.url("backend/message/view")}),(new(function(){function a(){_defineProperty(this,"where",{"sort[name]":"id","sort[dir]":"d",msgType:e("#messageType").find("li.layui-this").data("type")}),_defineProperty(this,"savedData",{}),_defineProperty(this,"dataTable",null)}return a.prototype.init=function(a,n,l){var o=t.render({elem:a,cols:n,autoSort:!1,data:l,lazy:!0,limit:30,where:this.where,url:i.url("backend/message/center-data"),page:!0,done:i.autoRowHeight("pageTable")}),s=this;s.dataTable=o,r.on("tab(messageType)",function(){var a=e(this).data("type");a!==s.where.msgType&&(s.where.msgType=a,o.reloadData())})},a}())).init("#pageTable",pageData.table.cols,pageData.table.data)});{/literal}</script>