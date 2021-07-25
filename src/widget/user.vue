<script>
layui.define(['layer', 'form', 'table', 'util', 'admin', 'xmSelect', 'notice'], function (exports) {
  let $        = layui.jquery;
  let layer    = layui.layer;
  let form     = layui.form;
  let table    = layui.table;
  let util     = layui.util;
  let admin    = layui.admin;
  let xmSelect = layui.xmSelect;
  let notice   = layui.notice;

  class User {
    insTb
    where = {}

    init(data) {
      let _this = this, topH = $('#searchForm').outerHeight() + 40;
      /* 渲染表格 */
      _this.insTb = table.render({
        elem          : '#userTable',
        url           : admin.url('backend/user/list'),
        page          : true,
        toolbar       : $('#operationToolbar').html(),
        cellMinWidth  : 100,
        height        : 'full-' + topH,
        defaultToolbar: ['filter'],
        autoRow       : true,
        cols          : [[
          {type: 'checkbox', fixed: 'left'},
          {field: 'id', title: 'ID', width: 80, fixed: 'left'},
          {field: 'name', title: '账户', sort: false},
          {field: 'nickname', title: '姓名', minWidth: 200, sort: false},
          {field: 'phone', title: '手机', sort: false, minWidth: 120},
          {
            field: 'status', title: '状态', sort: false, width: 80, templet: (d) => {
              let color = '#5FB878';
              if (d.status === 0 || d.status === 3) {
                color = '#FF5722';
              }
              return "<p style='color:" + color + "'>" + d.format_status + "</p>";
            }
          },
          {
            field: 'roles', title: '角色', minWidth: 160, sort: false, templet: (d) => {
              return d.roles.map(function (item) {
                return '<span class="layui-badge layui-badge-gray">' + item + '</span>';
              }).join('&nbsp;&nbsp;');
            }
          },
          {
            field: 'is_super_user', title: '超级管理员', width: 100, sort: false, templet: (d) => {
              return d.is_super_user === 1 ? '是' : '否'
            }
          },
          {
            field  : 'create_time', title: '创建时间', templet: function (d) {
              return util.toDateString(d.create_time);
            }
            , width: 170,
          },
          {field: '_ops', title: '操作','fixed':'right', toolbar: '#userTbBar', align: 'center', width: 110, minWidth: 110}
        ]],
        lazy          : true,
        data          : data,
        where         : this.where
      });

      let userRoleList = xmSelect.render({
        el        : '#userRoleList',
        height    : '250px',
        radio     : true,
        data      : [],
        initValue : [],
        tips      : '请选择用户角色',
        name      : 'roleId',
        prop      : {
          name : 'role',
          value: 'id'
        },
        clickClose: true,
        layVerType: 'tips',
        model     : {
          icon : 'hidden',
          label: {
            type: 'text',
          }
        },
      });
      admin.get('backend/role/list?id=0').then(function (data) {
        userRoleList.update({
          data   : data.tree,
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

      /* 表格搜索 */
      form.on('submit(userTbSearch)', function (data) {
        _this.where = $.extend(_this.where, data.field)
        _this.insTb.reloadData()
        return false;
      });

      /* 表格工具条点击事件 */
      table.on('tool(userTable)', function (obj) {
        let event = obj.event
        let user  = obj.data
        if (event === 'edit') {
          _this.showEditModel(user);
        } else if (obj.event === 'del') {
          user.is_super_user === 1 ? notice.error('超级管理员不能被删除!') : _this.doDel({uids: [user.id]})
        }
      });

      /* 表格头工具栏点击事件 */
      table.on('toolbar(userTable)', function (obj) {
        let event     = obj.event
        let checkRows = table.checkStatus('userTable').data
        if (event === 'add') {
          _this.showEditModel();
        } else if (event === 'del') {
          if (checkRows.length === 0) {
            notice.error('请选择要删除的用户');
            return;
          }
          let ids = checkRows.map(function (d) {
            return d.id;
          });
          _this.doDel({uids: ids});
        }
      });
      //密码框switch监听
      form.on('switch(status)', function (data) {
        let status      = data.elem.checked ? 2 : 1
        data.elem.value = status
      });
    }

    /* 显示表单弹窗 */
    showEditModel(mData) {
      let insTb = this.insTb
      let title = (mData ? '修改' : '添加') + '用户'
      let url   = mData ? 'backend/user/save' : 'backend/user/add'
      admin.open({
        type   : 1,
        area   : '680px',
        title  : title,
        content: $('#userEditDialog').html(),
        success: function (layero, dIndex) {
          let dom = $('#passwd')
          if (!mData) {
            dom.children('label.layui-form-label').addClass('layui-form-required')
            $('#passwdInput')[0].setAttribute('lay-verify', 'required')
            $(layero).find('#setUserStatus').remove()
          } else {
            $(layero).find('#resetOnFirstLogin').remove()
          }
          // 回显表单数据
          form.val('userEditForm', mData);
          // 表单提交事件
          form.on('submit(userEditSubmit)', function (data) {
            data.field.uid = mData ? mData.id : '';
            var loadIndex  = layer.load(2);
            admin.post(url, data.field).then((data) => {
              if (data.code === 200) {
                layer.close(dIndex);
                notice.success(title + '成功')
                insTb.reload()
              } else {
                notice.error(data.message);
              }
            }).fail((data) => {
              notice.error(data.message);
            })
            layer.close(loadIndex);
            return false;
          });
          // 渲染多选下拉框
          let insRoleSel = xmSelect.render({
            el        : '#userEditRoleSel',
            height    : '250px',
            data      : [],
            initValue : mData ? mData.roleIds : [],
            tips      : '请选择用户角色',
            name      : 'roleIds',
            prop      : {
              name : 'role',
              value: 'id'
            },
            clickClose: true,
            layVerify : 'required',
            layVerType: 'tips',
          });
          admin.get('backend/role/list?id=0').then(function (data) {
            insRoleSel.update({
              data   : data.tree,
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
          // 禁止弹窗出现滚动条
          $(layero).children('.layui-layer-content').css('overflow', 'visible');
        }
      });
    }

    doDel(obj) {
      let insTb = this.insTb
      layer.confirm('确定要删除选中的用户吗？', {
        skin : 'layui-layer-admin',
        shade: .1
      }, function (i) {
        layer.close(i);
        let loadIndex = layer.load(2);
        admin.post('backend/user/del', obj).then((data) => {
          layer.close(loadIndex);
          if (data.code === 200) {
            notice.success('删除用户成功');
            insTb.reload();
          } else {
            notice.error(data.message);
          }
        }).fail((data) => {
          notice.error(data.message);
        })
      });
    }
  }

  exports('@backend.user', new User);
});
</script>