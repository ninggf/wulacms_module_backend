<script>
layui.define(['layer', 'form', 'formX', 'element', 'admin', 'notice'], function (exports) {
  let $      = layui.jquery;
  let form   = layui.form;
  let admin  = layui.admin;
  let notice = layui.notice;

  class Profile {
    init() {
      /* 选择头像 */
      $('#userInfoHead').click(function () {
        admin.cropImg({
          imgSrc: $('#userInfoHead>img').attr('src'),
          onCrop: function (res) {
            $('#userInfoHead>img').attr('src', res);
            parent.layui.jquery('.layui-layout-admin>.layui-header .layui-nav img.layui-nav-img').attr('src', res);
          }
        });
      });

      // 修改用户信息
      form.on('submit(userInfoSubmit)', function (data) {
        admin.post(admin.url('backend/profile/save'), data.field).then(function (data) {
          if (data.code === 200) {
            notice.success({'message':'用户信息更新成功','title':'SUCCESS','timeout':2000})
            setTimeout(function (){
              admin.refresh()
            },2000)
          } else {
            notice.error(data.message);
          }
        }).fail(function (data) {
          notice.error(data.message);
        })
        return false;
      });

      // 修改密码
      form.on('submit(submit-psw)', function (data) {
        admin.post(admin.url('backend/profile/passwd'), data.field).then(function (data) {
          if (data.code === 200) {
            notice.success('密码修改成功');
          } else {
            notice.error(data.message);
          }
        }).fail(function (data) {
          notice.error(data.message);
        });
        return false;
      });
    }
  }

  exports('@backend.profile', new Profile());
});
</script>

<style id="user-profile">
/* 用户信息 */
.user-info-head {
  width: 110px;
  height: 110px;
  line-height: 110px;
  position: relative;
  display: inline-block;
  border: 2px solid #EEE;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin: 0 auto;
}

.user-info-head:hover:after {
  content: '\\e681';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: #FFF;
  background-color: rgba(0, 0, 0, 0.3);
  font-size: 28px;
  padding-top: 2px;
  font-style: normal;
  font-family: layui-icon;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.user-info-head img {
  width: 110px;
  height: 110px;
}

.user-info-list-item {
  position: relative;
  padding-bottom: 8px;
}

.user-info-list-item > .layui-icon {
  position: absolute;
}

.user-info-list-item > p {
  padding-left: 30px;
}

.layui-line-dash {
  border-bottom: 1px dashed #CCC;
  margin: 15px 0;
}

/* 基本信息 */
#userInfoForm .layui-form-item {
  margin-bottom: 25px;
}

/* 账号绑定 */
.user-bd-list-item {
  padding: 14px 60px 14px 10px;
  border-bottom: 1px solid #E8E8E8;
  position: relative;
}

.user-bd-list-item .user-bd-list-lable {
  color: #333;
  margin-bottom: 4px;
}

.user-bd-list-item .user-bd-list-oper {
  position: absolute;
  top: 50%;
  right: 10px;
  margin-top: -8px;
  cursor: pointer;
}

.user-bd-list-item .user-bd-list-img {
  width: 48px;
  height: 48px;
  line-height: 48px;
  position: absolute;
  top: 50%;
  left: 10px;
  margin-top: -24px;
}

.user-bd-list-item .user-bd-list-img + .user-bd-list-content {
  margin-left: 68px;
}
</style>