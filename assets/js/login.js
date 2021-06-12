layui.define(['layer', 'form', 'admin'], function (cb) {
  var $ = layui.$,
      form = layui.form,
      layer = layui.layer,
      admin = layui.admin;

  var Login = /*#__PURE__*/function () {
    function Login() {}

    var _proto = Login.prototype;

    _proto.init = function init() {
      $('.login-captcha').on('click', function () {
        $(this).attr('src', $(this).data('src') + '?_=' + new Date().getTime());
      });
      form.on('submit(loginSubmit)', function (obj) {
        var loadIndex = layer.load(2);
        admin.ajax({
          url: admin.url('backend/login'),
          method: 'POST',
          data: obj.field,
          success: function success(data) {
            layer.close(loadIndex);

            if (data.code && data.code === 200) {
              if (data.target) {
                window.location = data.target;
              } else {
                window.location = admin.url('backend');
              }

              return;
            }

            if (data.args && data.args.ent >= 3) {
              $('.login-captcha').click();
              $('.login-captcha-group').show();
              $('input[name=captcha]').attr('lay-verify', 'required').attr('lay-reqText', '请填写验证码');
            }

            if (data.message) {
              if (data.args && data.args.elem) {
                layer.tips(data.message, data.args.elem);
              } else {
                layer.msg(data.message, {
                  icon: 2,
                  time: 2000
                });
              }
            }
          }
        });
        return false;
      });
    };

    return Login;
  }();

  cb('@backend.login', new Login());
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2luLmpzIl0sIm5hbWVzIjpbImxheXVpIiwiZGVmaW5lIiwiY2IiLCJsZXQiLCIkIiwiZm9ybSIsImxheWVyIiwiYWRtaW4iLCJMb2dpbiIsImluaXQiLCJvbiIsImF0dHIiLCJkYXRhIiwiRGF0ZSIsImdldFRpbWUiLCJvYmoiLCJsb2FkSW5kZXgiLCJsb2FkIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImZpZWxkIiwic3VjY2VzcyIsImNsb3NlIiwiY29kZSIsInRhcmdldCIsIndpbmRvdyIsImxvY2F0aW9uIiwiYXJncyIsImVudCIsImNsaWNrIiwic2hvdyIsIm1lc3NhZ2UiLCJlbGVtIiwidGlwcyIsIm1zZyIsImljb24iLCJ0aW1lIl0sIm1hcHBpbmdzIjoiQUFBQUEsS0FBSyxDQUFDQyxNQUFORCxDQUFhLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsT0FBbEIsQ0FBYkEsRUFBeUNFLFVBQUFBLEVBQUFBLEVBQU07QUFDM0NDLE1BQUlDLENBQUFBLEdBQUlKLEtBQUssQ0FBQ0ksQ0FBZEQ7QUFBQUEsTUFBaUJFLElBQUFBLEdBQU9MLEtBQUssQ0FBQ0ssSUFBOUJGO0FBQUFBLE1BQW9DRyxLQUFBQSxHQUFRTixLQUFLLENBQUNNLEtBQWxESDtBQUFBQSxNQUF5REksS0FBQUEsR0FBUVAsS0FBSyxDQUFDTyxLQUF2RUo7O0FBRDJDLE1BR3JDSyxLQUhxQztBQUFBOztBQUFBOztBQUFBLFdBSXZDQyxJQUp1QyxHQUl2Q0EsZ0JBQU87QUFDSEwsTUFBQUEsQ0FBQyxDQUFDLGdCQUFELENBQURBLENBQW9CTSxFQUFwQk4sQ0FBdUIsT0FBdkJBLEVBQWdDLFlBQVk7QUFDeENBLFFBQUFBLENBQUMsQ0FBQyxJQUFELENBQURBLENBQVFPLElBQVJQLENBQWEsS0FBYkEsRUFBb0JBLENBQUMsQ0FBQyxJQUFELENBQURBLENBQVFRLElBQVJSLENBQWEsS0FBYkEsSUFBc0IsS0FBdEJBLEdBQStCLElBQUlTLElBQUosRUFBRCxDQUFhQyxPQUFiLEVBQWxEVjtBQUNILE9BRkRBO0FBR0FDLE1BQUFBLElBQUksQ0FBQ0ssRUFBTEwsQ0FBUSxxQkFBUkEsRUFBK0JVLFVBQUFBLEdBQUFBLEVBQU87QUFDbENaLFlBQUlhLFNBQUFBLEdBQVlWLEtBQUssQ0FBQ1csSUFBTlgsQ0FBVyxDQUFYQSxDQUFoQkg7QUFDQUksUUFBQUEsS0FBSyxDQUFDVyxJQUFOWCxDQUFXO0FBQ1BZLFVBQUFBLEdBQUFBLEVBQVFaLEtBQUssQ0FBQ1ksR0FBTlosQ0FBVSxlQUFWQSxDQUREO0FBRVBhLFVBQUFBLE1BQU0sRUFBRSxNQUZEO0FBR1BSLFVBQUFBLElBQUFBLEVBQVFHLEdBQUcsQ0FBQ00sS0FITDtBQUlQQyxVQUFBQSxPQUpPLG1CQUlDVixJQUpELEVBSU87QUFDVk4sWUFBQUEsS0FBSyxDQUFDaUIsS0FBTmpCLENBQVlVLFNBQVpWOztBQUNBLGdCQUFJTSxJQUFJLENBQUNZLElBQUxaLElBQWFBLElBQUksQ0FBQ1ksSUFBTFosS0FBYyxHQUEvQixFQUFvQztBQUNoQyxrQkFBSUEsSUFBSSxDQUFDYSxNQUFULEVBQWlCO0FBQ2JDLGdCQUFBQSxNQUFNLENBQUNDLFFBQVBELEdBQWtCZCxJQUFJLENBQUNhLE1BQXZCQztBQUNKLGVBRkEsTUFFTztBQUNIQSxnQkFBQUEsTUFBTSxDQUFDQyxRQUFQRCxHQUFrQm5CLEtBQUssQ0FBQ1ksR0FBTlosQ0FBVSxTQUFWQSxDQUFsQm1CO0FBQ0o7O0FBQ0E7QUFDSjs7QUFDQSxnQkFBSWQsSUFBSSxDQUFDZ0IsSUFBTGhCLElBQWFBLElBQUksQ0FBQ2dCLElBQUxoQixDQUFVaUIsR0FBVmpCLElBQWlCLENBQWxDLEVBQXFDO0FBQ2pDUixjQUFBQSxDQUFDLENBQUMsZ0JBQUQsQ0FBREEsQ0FBb0IwQixLQUFwQjFCO0FBQ0FBLGNBQUFBLENBQUMsQ0FBQyxzQkFBRCxDQUFEQSxDQUEwQjJCLElBQTFCM0I7QUFDQUEsY0FBQUEsQ0FBQyxDQUFDLHFCQUFELENBQURBLENBQXlCTyxJQUF6QlAsQ0FBOEIsWUFBOUJBLEVBQTRDLFVBQTVDQSxFQUF3RE8sSUFBeERQLENBQTZELGFBQTdEQSxFQUE0RSxRQUE1RUE7QUFDSjs7QUFDQSxnQkFBSVEsSUFBSSxDQUFDb0IsT0FBVCxFQUFrQjtBQUNkLGtCQUFJcEIsSUFBSSxDQUFDZ0IsSUFBTGhCLElBQWFBLElBQUksQ0FBQ2dCLElBQUxoQixDQUFVcUIsSUFBM0IsRUFBaUM7QUFDN0IzQixnQkFBQUEsS0FBSyxDQUFDNEIsSUFBTjVCLENBQVdNLElBQUksQ0FBQ29CLE9BQWhCMUIsRUFBeUJNLElBQUksQ0FBQ2dCLElBQUxoQixDQUFVcUIsSUFBbkMzQjtBQUNKLGVBRkEsTUFFTztBQUNIQSxnQkFBQUEsS0FBSyxDQUFDNkIsR0FBTjdCLENBQVVNLElBQUksQ0FBQ29CLE9BQWYxQixFQUF3QjtBQUNwQjhCLGtCQUFBQSxJQUFJLEVBQUUsQ0FEYztBQUVwQkMsa0JBQUFBLElBQUksRUFBRTtBQUZjLGlCQUF4Qi9CO0FBSUo7QUFDSjtBQUNKO0FBN0JPLFNBQVhDO0FBK0JBLGVBQU8sS0FBUDtBQUNILE9BbENERjtBQW1DSixLQTNDdUM7O0FBQUE7QUFBQTs7QUE4QzNDSCxFQUFBQSxFQUFFLENBQUMsZ0JBQUQsRUFBbUIsSUFBSU0sS0FBSixFQUFuQixDQUFGTjtBQUNILENBL0NERiIsImZpbGUiOiJsb2dpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImxheXVpLmRlZmluZShbJ2xheWVyJywgJ2Zvcm0nLCAnYWRtaW4nXSwgY2IgPT4ge1xuICAgIGxldCAkID0gbGF5dWkuJCwgZm9ybSA9IGxheXVpLmZvcm0sIGxheWVyID0gbGF5dWkubGF5ZXIsIGFkbWluID0gbGF5dWkuYWRtaW47XG5cbiAgICBjbGFzcyBMb2dpbiB7XG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAkKCcubG9naW4tY2FwdGNoYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsICQodGhpcykuZGF0YSgnc3JjJykgKyAnP189JyArIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvcm0ub24oJ3N1Ym1pdChsb2dpblN1Ym1pdCknLCBvYmogPT4ge1xuICAgICAgICAgICAgICAgIGxldCBsb2FkSW5kZXggPSBsYXllci5sb2FkKDIpO1xuICAgICAgICAgICAgICAgIGFkbWluLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmwgICA6IGFkbWluLnVybCgnYmFja2VuZC9sb2dpbicpLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YSAgOiBvYmouZmllbGQsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIuY2xvc2UobG9hZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgJiYgZGF0YS5jb2RlID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZGF0YS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gYWRtaW4udXJsKCdiYWNrZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmFyZ3MgJiYgZGF0YS5hcmdzLmVudCA+PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvZ2luLWNhcHRjaGEnKS5jbGljaygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvZ2luLWNhcHRjaGEtZ3JvdXAnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCdpbnB1dFtuYW1lPWNhcHRjaGFdJykuYXR0cignbGF5LXZlcmlmeScsICdyZXF1aXJlZCcpLmF0dHIoJ2xheS1yZXFUZXh0JywgJ+ivt+Whq+WGmemqjOivgeeggScpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEuYXJncyAmJiBkYXRhLmFyZ3MuZWxlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXllci50aXBzKGRhdGEubWVzc2FnZSwgZGF0YS5hcmdzLmVsZW0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIubXNnKGRhdGEubWVzc2FnZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IDIwMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2IoJ0BiYWNrZW5kLmxvZ2luJywgbmV3IExvZ2luKCkpO1xufSk7Il19
