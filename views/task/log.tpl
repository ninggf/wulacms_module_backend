<div class="layui-fluid page-header">
    <h2>{$id}@{$task_name}[{$retried}]</h2>
    <div class="page-toolbar">
      <button type="button" class="layui-btn layui-btn-sm" id="newMsgButton">
        <i class="layui-icon layui-icon-set"></i>
      </button>
    </div>
  </div>
  <input type="hidden" id="task_qid" value="{$id}"/>
  <input type="hidden" id="running" value="{$status}">
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-card-header">{'Logs'|t}<span style="display: none" id="refreshing">
          <i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop" style="font-size: 20px"></i>
        </span></div>
      <div class="layui-card-body" style="overflow: auto">
        <pre id="task_logs" style="box-sizing: border-box; width: 100%;border: none;word-wrap:normal;white-space:pre"></pre>
      </div>
    </div>
  </div>
  <script type="text/html" id="taskSetupDialog">
    <div id="jsoneditor" style="width: 100%;height: 100%"></div>
  </script>
<script>var pageData = {$pageData|json_encode};{literal}
layui.use(["jquery","admin","element"],function(t,n){function e(){n.get(c+u).then(function(t){if(t&&t.contents){var n=s.text()+"\n"+t.contents;s.text(n),u=t.id}"P"!==i&&"R"!==i||setInterval(function(){i="X",e()},5e3)})}var o=t(window).height()-150,i=t("#running").val(),a=t("#task_qid").val(),s=t("#task_logs"),u=0,c="backend/task/logs/"+a+"/",l=null;s.closest(".layui-card-body").height(o).show(),"P"!==i&&"R"!==i||t("#refreshing").show(),t("#newMsgButton").on("click",function(){n.openDialog("#taskSetupDialog","Options",{area:["600px","400px"],offset:"auto",destroy:function(){l.destroy()}},function(){var t=document.getElementById("jsoneditor"),n={mode:"view"};l=new JSONEditor(t,n),l.set(pageData.options||{})})}),e(u)});{/literal}</script>