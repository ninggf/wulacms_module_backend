<script>
layui.define(['layer', 'form', 'table', 'util', 'admin', 'zTree', 'xmSelect', 'treeTable'], function (exports) {
  let $        = layui.jquery;
  let layer    = layui.layer;
  let form     = layui.form;
  let table    = layui.treeTable;
  let admin    = layui.admin;
  let toast    = admin.toast;
  let xmSelect = layui.xmSelect;

  class Role {
    insTb

    init() {
      /* 渲染表格 */
      this.insTb = table.render({
        elem          : '#roleTable',
        url           : '/backend/role/list',
        id            : 'roleList',
        page          : true,
        toolbar       : ['<p>',
          '<button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>&nbsp;',
          '<button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>',
          '</p>'].join(''),
        defaultToolbar: ["filter"],
        tree          : {
          iconIndex: 2,
          idName   : 'id',
          pidName  : 'pid',
          isPidData: true
        },
        cellMinWidth  : 100,
        cols          : [[
          {type: 'checkbox'},
          {type: 'numbers', title: '序号', width: 80,},
          {field: 'role', title: '角色名称', sort: false},
          {field: 'name', title: '角色代码', sort: false},
          {field: 'remark', title: '备注', sort: false},
          {title: '操作', toolbar: '#roleTbBar', align: 'center', width: 210, minWidth: 200}
        ]]
      });
      let _this  = this;
      /* 表格搜索 */
      form.on('submit(roleTbSearch)', function (data) {
        _this.insTb.reload({where: data.field, page: {curr: 1}});
        return false;
      });

      /* 表格工具条点击事件 */
      table.on('tool(roleTable)', function (obj) {
        if (obj.event === 'edit') { // 修改
          _this.showEditModel(obj.data);
        } else if (obj.event === 'del') { // 删除
          let id = obj.data.id
          _this.doDel({'ids': [id]});
        } else if (obj.event === 'auth') {  // 权限管理
          _this.showPermModel(obj.data.roleId);
        }
      });

      /* 表格头工具栏点击事件 */
      table.on('toolbar(roleTable)', function (obj) {
        if (obj.event === 'add') { // 添加
          _this.showEditModel();
        } else if (obj.event === 'del') { // 删除
          let checkRows = _this.insTb.checkStatus('roleList');
          if (checkRows.length === 0) {
            layer.msg('请选择要删除的角色', {icon: 2});
            return;
          }
          let ids = checkRows.map(function (d) {
            return d.id;
          });
          _this.doDel({ids: ids});
        }
      });
    }

    showEditModel(mData) {
      let insTb = this.insTb
      admin.open({
        type   : 1,
        title  : (mData ? '修改' : '添加') + '角色',
        content: $('#roleEditDialog').html(),
        success: function (layero, dIndex) {
          // 回显表单数据
          form.val('roleEditForm', mData);
          // 表单提交事件
          form.on('submit(roleEditSubmit)', function (data) {
            let loadIndex = layer.load(2);
            admin.post('/backend/role/save', data.field).then(function (data) {
              layer.close(loadIndex);
              if (data.code === 200) {
                layer.close(dIndex);
                let notice = mData ? '修改' : '添加'
                toast.tc().success('角色' + notice + '成功', '', {preventDuplicates: !1})
                insTb.refresh()
              } else {
                toast.tc().error(data.message);
              }
            }).fail(function (data) {
              toast.tc().error(data.message);
            })
            return false;

          });
          //显示角色上级
          let insXmSel = xmSelect.render({
            el        : '#rolesEditParentSel',
            height    : '250px',
            data      : [],
            tips      : '请选择上级角色',
            name      : 'pid',
            initValue : mData ? [mData.pid] : [0],
            model     : {label: {type: 'text'}},
            prop      : {
              name : 'role',
              value: 'id'
            },
            radio     : true,
            clickClose: true
          });
          let id       = mData ? mData.id : 0
          admin.get('/backend/role/list?id=' + id).then(function (data) {
            let topRoleList = [];
            topRoleList.push({'role': '无', 'id': 0})
            topRoleList = topRoleList.concat(data.tree)
            insXmSel.update({
              data   : topRoleList,
              tree   : {
                show        : true,
                showFolderIcon: true,
                indent      : 15,
                strict      : false,
                expandedKeys: [1],
                simple:true,
              },
              autoRow: true,
            })
          });
          $(layero).children('.layui-layer-content').css('overflow', 'visible');
        }
      });
    };

    doDel(obj) {
      let insTb = this.insTb
      layer.confirm('确定要删除选中的角色吗？', {
        skin : 'layui-layer-admin',
        shade: .1
      }, function (i) {
        layer.close(i);
        let loadIndex = layer.load(2);
        admin.post('/backend/role/del', obj).then(function (data) {
          if (data.code === 200) {
            toast.tc().success('角色删除成功', '', {preventDuplicates: !1});
            insTb.refresh();
          } else {
            toast.tc().error(data.message);
          }
          layer.close(loadIndex);
        }).fail(function (data) {
          toast.tc().error(data.message);
        })
      });
    };

    showPermModel(roleId) {
      admin.open({
        title  : '角色权限分配',
        btn    : ['保存', '取消'],
        content: '<ul id="roleAuthTree" class="ztree"></ul>',
        success: function (layero, dIndex) {
          let loadIndex = layer.load(2);
          $.get('../../json/role-auth-tree.json', {roleId: roleId}, function (res) {
            layer.close(loadIndex);
            if (200 === res.code) {
              $.fn.zTree.init($('#roleAuthTree'), {
                check: {enable: true},
                data : {simpleData: {enable: true}}
              }, res.data);
            } else {
              layer.msg(res.msg, {icon: 2});
            }
          }, 'json');
          // 超出一定高度滚动
          $(layero).children('.layui-layer-content').css({'max-height': '300px', 'overflow': 'auto'});
        },
        yes    : function (dIndex) {
          let insTree     = $.fn.zTree.getZTreeObj('roleAuthTree');
          let checkedRows = insTree.getCheckedNodes(true);
          let ids         = [];
          for (let i = 0; i < checkedRows.length; i++) {
            ids.push(checkedRows[i].id);
          }
          let loadIndex = layer.load(2);
          $.get('../../json/ok.json', {roleId: roleId, authIds: ids.join(',')}, function (res) {
            layer.close(loadIndex);
            if (200 === res.code) {
              layer.msg(res.msg, {icon: 1});
              layer.close(dIndex);
            } else {
              layer.msg(res.msg, {icon: 2});
            }
          }, 'json');
        }
      });
    }
  }

  exports('@backend.role', new Role());
});
</script>

<style scoped>

</style>