<script>
layui.define(['layer', 'table', 'util', 'admin', 'notice'], function (exports) {
  let $      = layui.jquery;
  let layer  = layui.layer;
  let table  = layui.table;
  let admin  = layui.admin;
  let notice = layui.notice;

  class Grant {
    grantListTable
    insXmSel
    selRid

    init() {
      this.selRid         = $('#saveBtn').data('rid')
      this.grantListTable = table.render({
        id              : 'grantList',
        url             : admin.url('backend/role/grant-list'),
        where           : {rid: this.selRid},
        treeDefaultClose: false,
        treeLinkage     : false,
        elem            : '#grantTable',
        defaultToolbar  : [],
        cellMinWidth    : 100,
        page            : false,
        cols            : [[
          {
            field: 'name', title: '名称', width: 180, sort: false, templet: (d) => {
              let space = ['', '&emsp;', '&emsp;&emsp;']
              return space[d.level] + d.name
            }
          },
          {
            field: 'op', title: '权限', sort: false, templet: (d) => {
              let html = '';
              let op;
              let topResId;
              for (op in d.ops) {
                let resId = d.ops[op]['resId']
                if (op === 'r') {
                  topResId = resId
                }
                html += '<input data-level="' + d.level + '" class="authCheckbox ' + topResId + '" ' + d.ops[op]['checkbox'] + ' type="checkbox" title=' + d.ops[op]['name'] + ' name="grant" value="' + resId + '" > &nbsp;'
              }
              return html
            }
          }
        ]],
        done            : function (e) {
          let checkbox = $('.authCheckbox').siblings('div.layui-form-checkbox')
          checkbox.css('height', '24px')
          checkbox.css('line-height', '24px')
          checkbox.children('span').css('font-size', '12px');
          checkbox.children('span').css('padding', '0 6px');
          checkbox.children('i').css('height', '24px');
        }
      });
    };

    //保存
    save() {
      let obj   = $('.authCheckbox')
      let grant = []
      obj.each(function () {
        if ($(this).next('div.layui-form-checkbox').hasClass('layui-form-checked')) {
          grant.push($(this).val())
        }
      })
      if (grant.length > 0) {
        let loadIndex = layer.load(2);
        admin.post(admin.url('backend/role/grant-save'), {'rid': this.selRid, 'grants': grant}).then(function (data) {
          layer.close(loadIndex);
          if (data.code === 200) {
            notice.success('保存成功');
            setTimeout(()=>{
              admin.closeThisTabs()
            },2200)
          } else {
            notice.error(data.message);
          }
        }).fail(function (data) {
          notice.error(data.message);
        })
      } else {
        notice.warning('请选择角色权限');
      }

    }
  }

  exports('@backend.grant', new Grant);
})
</script>