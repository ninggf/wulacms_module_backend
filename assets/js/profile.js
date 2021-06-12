layui.injectCss('cmp-user-profile', ".user-info-head{width:110px;height:110px;line-height:110px;position:relative;display:inline-block;border:2px solid #eee;border-radius:50%;overflow:hidden;cursor:pointer;margin:0 auto}.user-info-head:hover:after{content:'\\e681';position:absolute;top:0;left:0;right:0;bottom:0;color:#fff;background-color:rgba(0,0,0,.3);font-size:28px;padding-top:2px;font-style:normal;font-family:layui-icon;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.user-info-head img{width:110px;height:110px}.user-info-list-item{position:relative;padding-bottom:8px}.user-info-list-item>.layui-icon{position:absolute}.user-info-list-item>p{padding-left:30px}.layui-line-dash{border-bottom:1px dashed #ccc;margin:15px 0}#userInfoForm .layui-form-item{margin-bottom:25px}.user-bd-list-item{padding:14px 60px 14px 10px;border-bottom:1px solid #e8e8e8;position:relative}.user-bd-list-item .user-bd-list-lable{color:#333;margin-bottom:4px}.user-bd-list-item .user-bd-list-oper{position:absolute;top:50%;right:10px;margin-top:-8px;cursor:pointer}.user-bd-list-item .user-bd-list-img{width:48px;height:48px;line-height:48px;position:absolute;top:50%;left:10px;margin-top:-24px}.user-bd-list-item .user-bd-list-img+.user-bd-list-content{margin-left:68px}");
layui.define(['layer', 'form', 'formX', 'element', 'admin', 'notice'], function (exports) {
  var $ = layui.jquery;
  var form = layui.form;
  var admin = layui.admin;
  var notice = layui.notice;

  var Profile = /*#__PURE__*/function () {
    function Profile() {}

    var _proto = Profile.prototype;

    _proto.init = function init() {
      /* 选择头像 */
      $('#userInfoHead').click(function () {
        admin.cropImg({
          imgSrc: $('#userInfoHead>img').attr('src'),
          onCrop: function onCrop(res) {
            admin.post(admin.url('backend/upload/raw/avatar'), res, {
              contentType: 'text/plain'
            }).then(function (data) {
              if (data && data.code === 200) {
                admin.post('backend/profile/avatar', {
                  avatar: data.result.url
                }).then(function (d) {
                  if (d && d.code === 200) {
                    $('#userInfoHead > img').attr('src', data.result.url);
                    parent.layui.jquery('.layui-layout-admin>.layui-header .layui-nav img.layui-nav-img').attr('src', data.result.url);
                  }
                });
              }
            });
          }
        });
      }); // 修改用户信息

      form.on('submit(userInfoSubmit)', function (data) {
        admin.post(admin.url('backend/profile/save'), data.field).then(function (data) {
          if (data.code === 200) {
            notice.success({
              'message': '用户信息更新成功',
              'title': 'SUCCESS',
              'timeout': 2000
            });
            setTimeout(function () {
              admin.refresh();
            }, 2000);
          } else {
            notice.error(data.message);
          }
        }).fail(function (data) {
          notice.error(data.message);
        });
        return false;
      }); // 修改密码

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
    };

    return Profile;
  }();

  exports('@backend.profile', new Profile());
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2ZpbGUudnVlIl0sIm5hbWVzIjpbImxheXVpIiwiaW5qZWN0Q3NzIiwiZGVmaW5lIiwiZXhwb3J0cyIsIiQiLCJqcXVlcnkiLCJmb3JtIiwiYWRtaW4iLCJub3RpY2UiLCJQcm9maWxlIiwiaW5pdCIsImNsaWNrIiwiY3JvcEltZyIsImltZ1NyYyIsImF0dHIiLCJvbkNyb3AiLCJyZXMiLCJwb3N0IiwidXJsIiwiY29udGVudFR5cGUiLCJ0aGVuIiwiZGF0YSIsImNvZGUiLCJhdmF0YXIiLCJyZXN1bHQiLCJkIiwicGFyZW50Iiwib24iLCJmaWVsZCIsInN1Y2Nlc3MiLCJzZXRUaW1lb3V0IiwicmVmcmVzaCIsImVycm9yIiwibWVzc2FnZSIsImZhaWwiXSwibWFwcGluZ3MiOiJBQUFBQSxLQUFLLENBQUNDLFNBQU4sQ0FBZ0Isa0JBQWhCO0FBQWt3Q0QsS0FBSyxDQUFDRSxNQUFOLENBQWEsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixPQUFsQixFQUEyQixTQUEzQixFQUFzQyxPQUF0QyxFQUErQyxRQUEvQyxDQUFiLEVBQXVFLFVBQVVDLE9BQVYsRUFBbUI7QUFDMTFDLE1BQUlDLENBQUMsR0FBUUosS0FBSyxDQUFDSyxNQUFuQjtBQUNBLE1BQUlDLElBQUksR0FBS04sS0FBSyxDQUFDTSxJQUFuQjtBQUNBLE1BQUlDLEtBQUssR0FBSVAsS0FBSyxDQUFDTyxLQUFuQjtBQUNBLE1BQUlDLE1BQU0sR0FBR1IsS0FBSyxDQUFDUSxNQUFuQjs7QUFKMDFDLE1BTXAxQ0MsT0FObzFDO0FBQUE7O0FBQUE7O0FBQUEsV0FPeDFDQyxJQVB3MUMsR0FPeDFDLGdCQUFPO0FBQ0w7QUFDQU4sTUFBQUEsQ0FBQyxDQUFDLGVBQUQsQ0FBRCxDQUFtQk8sS0FBbkIsQ0FBeUIsWUFBWTtBQUNuQ0osUUFBQUEsS0FBSyxDQUFDSyxPQUFOLENBQWM7QUFDWkMsVUFBQUEsTUFBTSxFQUFFVCxDQUFDLENBQUMsbUJBQUQsQ0FBRCxDQUF1QlUsSUFBdkIsQ0FBNEIsS0FB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bEI7QUFDRCxTQVJEO0FBU0EsZUFBTyxLQUFQO0FBQ0QsT0FYRDtBQVlELEtBN0R1MUM7O0FBQUE7QUFBQTs7QUFnRTExQzlCLEVBQUFBLE9BQU8sQ0FBQyxrQkFBRCxFQUFxQixJQUFJTSxPQUFKLEVBQXJCLENBQVA7QUFDRCxDQWpFaXdDIiwic291cmNlc0NvbnRlbnQiOlsibGF5dWkuaW5qZWN0Q3NzKCdjbXAtdXNlci1wcm9maWxlJyxgLnVzZXItaW5mby1oZWFke3dpZHRoOjExMHB4O2hlaWdodDoxMTBweDtsaW5lLWhlaWdodDoxMTBweDtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1ibG9jaztib3JkZXI6MnB4IHNvbGlkICNlZWU7Ym9yZGVyLXJhZGl1czo1MCU7b3ZlcmZsb3c6aGlkZGVuO2N1cnNvcjpwb2ludGVyO21hcmdpbjowIGF1dG99LnVzZXItaW5mby1oZWFkOmhvdmVyOmFmdGVye2NvbnRlbnQ6J1xcXFxlNjgxJztwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MDtjb2xvcjojZmZmO2JhY2tncm91bmQtY29sb3I6cmdiYSgwLDAsMCwuMyk7Zm9udC1zaXplOjI4cHg7cGFkZGluZy10b3A6MnB4O2ZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtZmFtaWx5OmxheXVpLWljb247LXdlYmtpdC1mb250LXNtb290aGluZzphbnRpYWxpYXNlZDstbW96LW9zeC1mb250LXNtb290aGluZzpncmF5c2NhbGV9LnVzZXItaW5mby1oZWFkIGltZ3t3aWR0aDoxMTBweDtoZWlnaHQ6MTEwcHh9LnVzZXItaW5mby1saXN0LWl0ZW17cG9zaXRpb246cmVsYXRpdmU7cGFkZGluZy1ib3R0b206OHB4fS51c2VyLWluZm8tbGlzdC1pdGVtPi5sYXl1aS1pY29ue3Bvc2l0aW9uOmFic29sdXRlfS51c2VyLWluZm8tbGlzdC1pdGVtPnB7cGFkZGluZy1sZWZ0OjMwcHh9LmxheXVpLWxpbmUtZGFzaHtib3JkZXItYm90dG9tOjFweCBkYXNoZWQgI2NjYzttYXJnaW46MTVweCAwfSN1c2VySW5mb0Zvcm0gLmxheXVpLWZvcm0taXRlbXttYXJnaW4tYm90dG9tOjI1cHh9LnVzZXItYmQtbGlzdC1pdGVte3BhZGRpbmc6MTRweCA2MHB4IDE0cHggMTBweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZThlOGU4O3Bvc2l0aW9uOnJlbGF0aXZlfS51c2VyLWJkLWxpc3QtaXRlbSAudXNlci1iZC1saXN0LWxhYmxle2NvbG9yOiMzMzM7bWFyZ2luLWJvdHRvbTo0cHh9LnVzZXItYmQtbGlzdC1pdGVtIC51c2VyLWJkLWxpc3Qtb3Blcntwb3NpdGlvbjphYnNvbHV0ZTt0b3A6NTAlO3JpZ2h0OjEwcHg7bWFyZ2luLXRvcDotOHB4O2N1cnNvcjpwb2ludGVyfS51c2VyLWJkLWxpc3QtaXRlbSAudXNlci1iZC1saXN0LWltZ3t3aWR0aDo0OHB4O2hlaWdodDo0OHB4O2xpbmUtaGVpZ2h0OjQ4cHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOjUwJTtsZWZ0OjEwcHg7bWFyZ2luLXRvcDotMjRweH0udXNlci1iZC1saXN0LWl0ZW0gLnVzZXItYmQtbGlzdC1pbWcrLnVzZXItYmQtbGlzdC1jb250ZW50e21hcmdpbi1sZWZ0OjY4cHh9YCk7bGF5dWkuZGVmaW5lKFsnbGF5ZXInLCAnZm9ybScsICdmb3JtWCcsICdlbGVtZW50JywgJ2FkbWluJywgJ25vdGljZSddLCBmdW5jdGlvbiAoZXhwb3J0cykge1xuICBsZXQgJCAgICAgID0gbGF5dWkuanF1ZXJ5O1xuICBsZXQgZm9ybSAgID0gbGF5dWkuZm9ybTtcbiAgbGV0IGFkbWluICA9IGxheXVpLmFkbWluO1xuICBsZXQgbm90aWNlID0gbGF5dWkubm90aWNlO1xuXG4gIGNsYXNzIFByb2ZpbGUge1xuICAgIGluaXQoKSB7XG4gICAgICAvKiDpgInmi6nlpLTlg48gKi9cbiAgICAgICQoJyN1c2VySW5mb0hlYWQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFkbWluLmNyb3BJbWcoe1xuICAgICAgICAgIGltZ1NyYzogJCgnI3VzZXJJbmZvSGVhZD5pbWcnKS5hdHRyKCdzcmMnKSxcbiAgICAgICAgICBvbkNyb3A6IGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGFkbWluLnBvc3QoYWRtaW4udXJsKCdiYWNrZW5kL3VwbG9hZC9yYXcvYXZhdGFyJyksIHJlcywge1xuICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICB9KS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmNvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIGFkbWluLnBvc3QoJ2JhY2tlbmQvcHJvZmlsZS9hdmF0YXInLCB7XG4gICAgICAgICAgICAgICAgICBhdmF0YXI6IGRhdGEucmVzdWx0LnVybFxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZCA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZCAmJiBkLmNvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAkKCcjdXNlckluZm9IZWFkID4gaW1nJykuYXR0cignc3JjJywgZGF0YS5yZXN1bHQudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmxheXVpLmpxdWVyeSgnLmxheXVpLWxheW91dC1hZG1pbj4ubGF5dWktaGVhZGVyIC5sYXl1aS1uYXYgaW1nLmxheXVpLW5hdi1pbWcnKS5hdHRyKCdzcmMnLCBkYXRhLnJlc3VsdC51cmwpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyDkv67mlLnnlKjmiLfkv6Hmga9cbiAgICAgIGZvcm0ub24oJ3N1Ym1pdCh1c2VySW5mb1N1Ym1pdCknLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBhZG1pbi5wb3N0KGFkbWluLnVybCgnYmFja2VuZC9wcm9maWxlL3NhdmUnKSwgZGF0YS5maWVsZCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT09IDIwMCkge1xuICAgICAgICAgICAgbm90aWNlLnN1Y2Nlc3MoeydtZXNzYWdlJzogJ+eUqOaIt+S/oeaBr+abtOaWsOaIkOWKnycsICd0aXRsZSc6ICdTVUNDRVNTJywgJ3RpbWVvdXQnOiAyMDAwfSlcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBhZG1pbi5yZWZyZXNoKClcbiAgICAgICAgICAgIH0sIDIwMDApXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGljZS5lcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIG5vdGljZS5lcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgLy8g5L+u5pS55a+G56CBXG4gICAgICBmb3JtLm9uKCdzdWJtaXQoc3VibWl0LXBzdyknLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBhZG1pbi5wb3N0KGFkbWluLnVybCgnYmFja2VuZC9wcm9maWxlL3Bhc3N3ZCcpLCBkYXRhLmZpZWxkKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgaWYgKGRhdGEuY29kZSA9PT0gMjAwKSB7XG4gICAgICAgICAgICBub3RpY2Uuc3VjY2Vzcygn5a+G56CB5L+u5pS55oiQ5YqfJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vdGljZS5lcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIG5vdGljZS5lcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0cygnQGJhY2tlbmQucHJvZmlsZScsIG5ldyBQcm9maWxlKCkpO1xufSk7Il0sImZpbGUiOiJwcm9maWxlLmpzIn0=
