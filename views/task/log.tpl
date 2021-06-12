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
layui.use(['jquery', 'admin', 'element'], function ($, admin) {
  var wh = $(window).height() - 150,
      running = $('#running').val(),
      tqId = $('#task_qid').val(),
      logViewer = $('#task_logs'),
      cid = 0,
      url = 'backend/task/logs/' + tqId + '/',
      editor = null;
  logViewer.closest('.layui-card-body').height(wh).show();

  if (running === 'P' || running === 'R') {
    $('#refreshing').show();
  }

  $('#newMsgButton').on('click', function () {
    admin.openDialog('#taskSetupDialog', 'Options', {
      area: ['600px', '400px'],
      offset: 'auto',
      destroy: function destroy() {
        editor.destroy();
      }
    }, function () {
      var container = document.getElementById("jsoneditor"),
          options = {
        mode: 'view'
      };
      editor = new JSONEditor(container, options);
      editor.set(pageData.options || {});
    });
  });

  function getLog() {
    admin.get(url + cid).then(function (data) {
      if (data && data.contents) {
        var co = logViewer.text() + "\n" + data.contents;
        logViewer.text(co);
        cid = data.id;
      }

      if (running === 'P' || running === 'R') {
        setInterval(function () {
          running = 'X';
          getLog();
        }, 5000);
      }
    });
  }

  getLog(cid);
});{/literal}</script>