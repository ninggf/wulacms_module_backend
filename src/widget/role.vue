<script>
layui.define(['layer', 'form', 'util', 'admin', 'zTree', 'xmSelect', 'treeTable', 'notice'], function (exports) {
  let $         = layui.jquery;
  let layer     = layui.layer;
  let form      = layui.form;
  let treeTable = layui.treeTable;
  let admin     = layui.admin;
  let notice    = layui.notice;
  let xmSelect  = layui.xmSelect, index = top.layui.index;

  class Role {
    insTb

    init() {
      this.insTb = treeTable.render({
        elem          : '#roleTable',
        url           : admin.url('backend/role/list'),
        id            : 'roleList',
        page          : true,
        toolbar       : $('#operationToolbar').html(),
        defaultToolbar: ["filter"],
        cellMinWidth  : 100,
        cols          : [[
          {type: 'checkbox'},
          {field: 'id', title: 'ID', width: 80},
          {
            field  : 'role', title: '角色', sort: false, width: 200,
            templet: (d) => {
              return d.role + (d.system ? '&nbsp;<span class="layui-badge layui-bg-green">S</span>' : '')
            }
          },
          {field: 'name', title: '标识', sort: false, width: 100},
          {field: 'remark', title: '备注', sort: false},
          {field: '_ops', title: '操作', toolbar: '#roleTbBar', align: 'center', width: 140, minWidth: 140}
        ]],
        text          : {
          none: '<div style="padding: 18px 0;">哎呀，当前无角色数据,快去添加吧~</div>'
        },
        tree          : {
          openName : 'role',
          iconIndex: 2,
          idName   : 'id',
          pidName  : 'pid',
          isPidData: true,
          arrowType: 'arrow2',
          getIcon  : (d) => {
            return '<i class="ew-tree-icon"></i>';
          }
        },
      });
      let _this  = this;
      /* 表格搜索 */
      form.on('submit(roleTbSearch)', function (data) {
        _this.insTb.reload({where: data.field, page: {curr: 1}});
        return false;
      });

      treeTable.on('tool(roleTable)', function (obj) {
        let id = obj.data.id
        switch (obj.event) {
          case 'edit'://编辑
            _this.showEditModel(obj.data);
            break;
          case 'del'://删除
            _this.doDel({'ids': [id]});
            break;
          case 'auth'://授权
            index.openTab({
              url  : admin.url('backend/role/grant?rid=' + id),
              title: obj.data.role + ' ' + _t('Permissions'),
              refer: admin.url('backend/role')
            });
            break;
          case 'view'://查看
            break;
        }
      });

      treeTable.on('toolbar(roleTable)', function (obj) {
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
      let url   = admin.url(mData ? 'backend/role/save' : 'backend/role/add');
      admin.open({
        type   : 1,
        area   : '600px',
        offset : 10,
        title  : (mData ? '修改' : '添加') + '角色',
        content: $('#roleEditDialog').html(),
        success: function (layero, dIndex) {
          // 回显表单数据
          form.val('roleEditForm', mData);
          // 表单提交事件
          form.on('submit(roleEditSubmit)', function (data) {
            let loadIndex = layer.load(2);
            admin.post(admin.url(url), data.field).then(function (data) {
              layer.close(loadIndex);
              if (data.code === 200) {
                layer.close(dIndex);
                let msg = mData ? '修改' : '添加'
                notice.success('角色' + msg + '成功')
                insTb.refresh()
              } else {
                notice.error(data.message)
              }
            }).fail(function (data) {
              layer.close(loadIndex);
              notice.error(data.message)
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
          admin.get('backend/role/list?id=' + id).then(function (data) {
            let topRoleList = [];
            topRoleList.push({'role': '无', 'id': 0})
            topRoleList = topRoleList.concat(data.tree)
            insXmSel.update({
              data   : topRoleList,
              tree   : {
                show          : true,
                showFolderIcon: true,
                indent        : 15,
                strict        : false,
                expandedKeys  : [1],
                simple        : true,
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
        admin.post('backend/role/del', obj).then(function (data) {
          layer.close(loadIndex);
          if (data.code === 200) {
            notice.success('角色删除成功');
            insTb.refresh();
          } else {
            notice.error(data.message);
          }
        }).fail(function (data) {
          layer.close(loadIndex);
          notice.error(data.message);
        })
      });
    };
  }

  exports('@backend.role', new Role);
});
</script>

<style scoped>
.layui-form-checkbox {
  font-size: 12px !important
}
</style>