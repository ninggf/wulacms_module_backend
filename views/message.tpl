<div class="layui-fluid page-header">
    <h2>{'Message'|t}</h2>
    <div class="page-toolbar">

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

  {foreach $editors as $etype => $editor}
  <script type="text/html" id="{$etype}_editor">
    {$editor}
  </script>
  {/foreach}
<script>var pageData = {$pageData|json_encode};{literal}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}layui.use(['jquery','form','table','admin','laydate'],function($,form,table,admin,laydate){var element=layui.element;var TablePage=/*#__PURE__*/function(){function TablePage(){_defineProperty(this,"where",{'sort[name]':'id','sort[dir]':'d','msgType':$('#messageType').find('li.layui-this').data('type')});}var _proto=TablePage.prototype;_proto.init=function init(id,cols,data){var _this=this;// 绘制表格
var dataTable=table.render({elem:id,cols:cols,autoSort:false,data:data,lazy:true,limit:30,where:this.where,url:admin.url('backend/message/data'),page:true}),that=this;//排序
table.on('sort(pageTable)',function(obj){_this.where['sort[name]']=obj.field;_this.where['sort[dir]']=obj.type==='asc'?'a':'d';dataTable.reloadData();});//绘制日期控件
laydate.render({elem:'input[name="date"]',type:'date',range:true,trigger:'click'});//搜索表单提交
form.on('submit(searchBtn)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();return false;});//重置表单
form.on('reset(searchForm)',function(obj){_this.where=$.extend(_this.where,obj.field);dataTable.reloadData();});//标签切换
element.on('tab(messageType)',function(){var typ=$(this).data('type');if(typ!=that.where.msgType){that.where.msgType=typ;dataTable.reloadData();}});};return TablePage;}();var page=new TablePage();page.init('#pageTable',pageData.table.cols,pageData.table.data);});{/literal}</script>