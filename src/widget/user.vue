<script>
layui.define(['layer', 'form', 'table', 'util', 'admin', 'xmSelect'], function (exports) {
  let $        = layui.jquery;
  let layer    = layui.layer;
  let form     = layui.form;
  let table    = layui.table;
  let util     = layui.util;
  let admin    = layui.admin;
  let xmSelect = layui.xmSelect;
  let toast    = admin.toast;

  class User {
    insTb

    init() {
      let _this = this
      /* 渲染表格 */
      _this.insTb = table.render({
        elem        : '#userTable',
        url         : '/backend/user/list',
        page        : true,
        toolbar     : ['<p>',
          '<button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>&nbsp;',
          '<button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>',
          '</p>'].join(''),
        cellMinWidth: 100,
        defaultToolbar: ['filter'],
        cols        : [[
          {type: 'checkbox'},
          {type: 'numbers'},
          {field: 'name', title: '账户', sort: false},
          {field: 'nickname', title: '姓名', sort: false},
          {field: 'phone', title: '手机', sort: false},
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
            field: 'is_super_user', title: '超级管理员', sort: false, templet: (d) => {
              return d.is_super_user === 1 ? '是' : '否'
            }
          },
          {
            field: 'create_time', title: '创建时间', templet: function (d) {
              return util.toDateString(d.create_time);
            }
            ,width: 160,
          },
          {title: '操作', toolbar: '#userTbBar', align: 'center', minWidth: 200}
        ]]
      });

      /* 表格搜索 */
      form.on('submit(userTbSearch)', function (data) {
        _this.insTb.reload({where: data.field, page: {curr: 1}});
        return false;
      });

      /* 表格工具条点击事件 */
      table.on('tool(userTable)', function (obj) {
        if (obj.event === 'edit') { // 修改
          _this.showEditModel(obj.data);
        } else if (obj.event === 'del') { // 删除
          _this.doDel({uids: [obj.data.id]});
        } else if (obj.event === 'reset') { // 重置密码
          _this.resetPsw(obj);
        }
      });

      /* 表格头工具栏点击事件 */
      table.on('toolbar(userTable)', function (obj) {
        if (obj.event === 'add') { // 添加
          _this.showEditModel();
        } else if (obj.event === 'del') { // 删除
          let checkRows = table.checkStatus('userTable');
          if (checkRows.data.length === 0) {
            toast.tc().error('请选择要删除的用户');
            return;
          }
          let ids = checkRows.data.map(function (d) {
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
      admin.open({
        type   : 1,
        area   : '680px',
        title  : title,
        content: $('#userEditDialog').html(),
        success: function (layero, dIndex) {
          let dom = $('#passwd')
          if(!mData){
            dom.children('label.layui-form-label').addClass('layui-form-required')
            $('#passwdInput')[0].setAttribute('lay-verify','required')
          }
          // 回显表单数据
          form.val('userEditForm', mData);
          // 表单提交事件
          form.on('submit(userEditSubmit)', function (data) {
            data.field.uid = mData ? mData.id : '';
            var loadIndex  = layer.load(2);
            admin.post('backend/user/save', data.field).then((data) => {
              if (data.code === 200) {
                layer.close(dIndex);
                toast.tc().success(title + '成功',{preventDuplicates: !1})

                insTb.reload()
              } else {
                toast.tc().error(data.message);
              }
            }).fail((data) => {
              toast.tc().error(data.message);
            })
            layer.close(loadIndex);
            return false;
          });
          // 渲染多选下拉框
          var insRoleSel = xmSelect.render({
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
            toast.tc().success('删除用户成功',{preventDuplicates: !1});
            insTb.reload();
          } else {
            toast.tc().error(data.message);
          }
        }).fail((data) => {
          toast.tc().error(data.message);
        })
      });
    }

    /* 重置密码 */
    resetPsw(obj) {
      layer.confirm('确定要重置“' + obj.data.nickName + '”的登录密码吗？', {
        skin : 'layui-layer-admin',
        shade: .1
      }, function (i) {
        layer.close(i);
        var loadIndex = layer.load(2);
        admin.get('../../json/ok.json', {
          userId: obj.data.userId
        }).then(() => {
          layer.close(loadIndex);
          layer.close(loadIndex);
          if (res.code === 200) {
            toast.tc().success('success',{preventDuplicates: !1});
          } else {
            toast.tc().error(data.message);
          }
        }).fail((data) => {
          toast.tc().error(data.message);
        })
      });
    }
  }

  exports('@backend.user', new User);
});
</script>