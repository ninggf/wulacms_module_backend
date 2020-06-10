layui.define(['jquery'], function (exports) {
  'use strict';

  var $ = layui.$;
  var app = new Vue({
    el: '#login',
    data: {
      winData: window.winData,
      login: {
        username: '',
        passwd: '',
        captcha: '',
        autologin: 0
      },
      vcode_show: window.winData.ent >= 3,
      captcha_src: window.winData.captcha + '?size=150x60&font=28',
      captcha_src1: '',
      errormsg: ''
    },
    methods: {
      submit: function submit() {
        var $vm = this;
        this.errormsg = ''; //本地检查

        if (!this.login.username) {
          this.errormsg = "请输入用户名";
          return;
        }

        if (!this.login.passwd) {
          this.errormsg = "请输入密码";
          return;
        }

        if (!this.login.captcha && this.vcode_show) {
          this.errormsg = "请输入验证码";
          return;
        }

        $vm.login.autologin = $vm.login.autologin ? 1 : 0;
        $.post('./login', $vm.login, function (res) {
          if (res && res.code == 500) {
            $vm.errormsg = res.message;

            if (res.args.ent >= 3 && !$vm.vcode_show) {
              $vm.captcha_src1 = $vm.captcha_src + '&t=' + Math.random();
              $vm.vcode_show = 1;
            }
          } else if (res && res.code == 200) {
            location.href = res.target;
          }
        });
      }
    },
    mounted: function mounted() {
      console.log("login.js");

      if (this.vcode_show) {
        this.captcha_src1 = this.captcha_src + '&t=' + Math.random();
      }
    }
  });
  exports('@backend.login', app);
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2luLmpzIl0sIm5hbWVzIjpbImxheXVpIiwiZGVmaW5lIiwiZXhwb3J0cyIsIiQiLCJhcHAiLCJWdWUiLCJlbCIsImRhdGEiLCJ3aW5EYXRhIiwid2luZG93IiwibG9naW4iLCJ1c2VybmFtZSIsInBhc3N3ZCIsImNhcHRjaGEiLCJhdXRvbG9naW4iLCJ2Y29kZV9zaG93IiwiZW50IiwiY2FwdGNoYV9zcmMiLCJjYXB0Y2hhX3NyYzEiLCJlcnJvcm1zZyIsIm1ldGhvZHMiLCJzdWJtaXQiLCJsZXQiLCIkdm0iLCJwb3N0IiwicmVzIiwiY29kZSIsIm1lc3NhZ2UiLCJhcmdzIiwiTWF0aCIsInJhbmRvbSIsImxvY2F0aW9uIiwiaHJlZiIsInRhcmdldCIsIm1vdW50ZWQiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQUEsS0FBSyxDQUFDQyxNQUFORCxDQUFhLENBQUMsUUFBRCxDQUFiQSxFQUF5QixVQUFDRSxPQUFELEVBQWE7QUFDbEM7O0FBQ0EsTUFBTUMsQ0FBQUEsR0FBTUgsS0FBSyxDQUFDRyxDQUFsQjtBQUNBLE1BQU1DLEdBQUFBLEdBQU0sSUFBSUMsR0FBSixDQUFRO0FBQ2hCQyxJQUFBQSxFQUFBQSxFQUFTLFFBRE87QUFFaEJDLElBQUFBLElBQUFBLEVBQVM7QUFDTEMsTUFBQUEsT0FBQUEsRUFBY0MsTUFBTSxDQUFDRCxPQURoQjtBQUVMRSxNQUFBQSxLQUFBQSxFQUFjO0FBQ1ZDLFFBQUFBLFFBQUFBLEVBQVcsRUFERDtBQUVWQyxRQUFBQSxNQUFBQSxFQUFXLEVBRkQ7QUFHVkMsUUFBQUEsT0FBQUEsRUFBVyxFQUhEO0FBSVZDLFFBQUFBLFNBQVMsRUFBRTtBQUpELE9BRlQ7QUFRTEMsTUFBQUEsVUFBQUEsRUFBY04sTUFBTSxDQUFDRCxPQUFQQyxDQUFlTyxHQUFmUCxJQUFzQixDQVIvQjtBQVNMUSxNQUFBQSxXQUFBQSxFQUFjUixNQUFNLENBQUNELE9BQVBDLENBQWVJLE9BQWZKLEdBQXlCLHNCQVRsQztBQVVMUyxNQUFBQSxZQUFZLEVBQUUsRUFWVDtBQVdMQyxNQUFBQSxRQUFBQSxFQUFjO0FBWFQsS0FGTztBQWVoQkMsSUFBQUEsT0FBTyxFQUFFO0FBQ0xDLE1BQUFBLE1BREssb0JBQ0k7QUFDTEMsWUFBSUMsR0FBQUEsR0FBWSxJQUFoQkQ7QUFDQSxhQUFLSCxRQUFMLEdBQWdCLEVBQWhCLENBRkssQ0FHTDs7QUFDQSxZQUFJLENBQUMsS0FBS1QsS0FBTCxDQUFXQyxRQUFoQixFQUEwQjtBQUN0QixlQUFLUSxRQUFMLEdBQWdCLFFBQWhCO0FBQ0E7QUFDSjs7QUFDQSxZQUFJLENBQUMsS0FBS1QsS0FBTCxDQUFXRSxNQUFoQixFQUF3QjtBQUNwQixlQUFLTyxRQUFMLEdBQWdCLE9BQWhCO0FBQ0E7QUFDSjs7QUFDQSxZQUFJLENBQUMsS0FBS1QsS0FBTCxDQUFXRyxPQUFaLElBQXVCLEtBQUtFLFVBQWhDLEVBQTRDO0FBQ3hDLGVBQUtJLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQTtBQUNKOztBQUNBSSxRQUFBQSxHQUFHLENBQUNiLEtBQUphLENBQVVULFNBQVZTLEdBQW9CQSxHQUFHLENBQUNiLEtBQUphLENBQVVULFNBQVZTLEdBQW9CLENBQXBCQSxHQUFzQixDQUExQ0E7QUFDQXBCLFFBQUFBLENBQUMsQ0FBQ3FCLElBQUZyQixDQUFPLFNBQVBBLEVBQWtCb0IsR0FBRyxDQUFDYixLQUF0QlAsRUFBNkIsVUFBVXNCLEdBQVYsRUFBZTtBQUN4QyxjQUFJQSxHQUFBQSxJQUFPQSxHQUFHLENBQUNDLElBQUpELElBQVksR0FBdkIsRUFBNEI7QUFDeEJGLFlBQUFBLEdBQUcsQ0FBQ0osUUFBSkksR0FBZUUsR0FBRyxDQUFDRSxPQUFuQko7O0FBQ0EsZ0JBQUlFLEdBQUcsQ0FBQ0csSUFBSkgsQ0FBU1QsR0FBVFMsSUFBZ0IsQ0FBaEJBLElBQXFCLENBQUNGLEdBQUcsQ0FBQ1IsVUFBOUIsRUFBMEM7QUFDdENRLGNBQUFBLEdBQUcsQ0FBQ0wsWUFBSkssR0FBbUJBLEdBQUcsQ0FBQ04sV0FBSk0sR0FBa0IsS0FBbEJBLEdBQTBCTSxJQUFJLENBQUNDLE1BQUxELEVBQTdDTjtBQUNBQSxjQUFBQSxHQUFHLENBQUNSLFVBQUpRLEdBQW1CLENBQW5CQTtBQUNKO0FBQ0osV0FOQSxNQU1PLElBQUlFLEdBQUFBLElBQU9BLEdBQUcsQ0FBQ0MsSUFBSkQsSUFBWSxHQUF2QixFQUE0QjtBQUMvQk0sWUFBQUEsUUFBUSxDQUFDQyxJQUFURCxHQUFnQk4sR0FBRyxDQUFDUSxNQUFwQkY7QUFDSjtBQUNILFNBVkQ1QjtBQVdKO0FBN0JLLEtBZk87QUE4Q2hCK0IsSUFBQUEsT0E5Q2dCLHFCQThDTjtBQUNOQyxNQUFBQSxPQUFPLENBQUNDLEdBQVJELENBQVksVUFBWkE7O0FBQ0EsVUFBSSxLQUFLcEIsVUFBVCxFQUFxQjtBQUNqQixhQUFLRyxZQUFMLEdBQW9CLEtBQUtELFdBQUwsR0FBbUIsS0FBbkIsR0FBMkJZLElBQUksQ0FBQ0MsTUFBTEQsRUFBL0M7QUFDSjtBQUNKO0FBbkRnQixHQUFSLENBQVo7QUFzREEzQixFQUFBQSxPQUFPLENBQUMsZ0JBQUQsRUFBbUJFLEdBQW5CLENBQVBGO0FBQ0gsQ0ExRERGIiwiZmlsZSI6ImxvZ2luLmpzIiwic291cmNlc0NvbnRlbnQiOlsibGF5dWkuZGVmaW5lKFsnanF1ZXJ5J10sIChleHBvcnRzKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBjb25zdCAkICAgPSBsYXl1aS4kO1xyXG4gICAgY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgICAgZWwgICAgIDogJyNsb2dpbicsXHJcbiAgICAgICAgZGF0YSAgIDoge1xyXG4gICAgICAgICAgICB3aW5EYXRhICAgICA6IHdpbmRvdy53aW5EYXRhLFxyXG4gICAgICAgICAgICBsb2dpbiAgICAgICA6IHtcclxuICAgICAgICAgICAgICAgIHVzZXJuYW1lIDogJycsXHJcbiAgICAgICAgICAgICAgICBwYXNzd2QgICA6ICcnLFxyXG4gICAgICAgICAgICAgICAgY2FwdGNoYSAgOiAnJyxcclxuICAgICAgICAgICAgICAgIGF1dG9sb2dpbjogMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdmNvZGVfc2hvdyAgOiB3aW5kb3cud2luRGF0YS5lbnQgPj0gMyxcclxuICAgICAgICAgICAgY2FwdGNoYV9zcmMgOiB3aW5kb3cud2luRGF0YS5jYXB0Y2hhICsgJz9zaXplPTE1MHg2MCZmb250PTI4JyxcclxuICAgICAgICAgICAgY2FwdGNoYV9zcmMxOiAnJyxcclxuICAgICAgICAgICAgZXJyb3Jtc2cgICAgOiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgICAgICAgbGV0ICR2bSAgICAgICA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVycm9ybXNnID0gJyc7XHJcbiAgICAgICAgICAgICAgICAvL+acrOWcsOajgOafpVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxvZ2luLnVzZXJuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcm1zZyA9IFwi6K+36L6T5YWl55So5oi35ZCNXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9naW4ucGFzc3dkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcnJvcm1zZyA9IFwi6K+36L6T5YWl5a+G56CBXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubG9naW4uY2FwdGNoYSAmJiB0aGlzLnZjb2RlX3Nob3cpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVycm9ybXNnID0gXCLor7fovpPlhaXpqozor4HnoIFcIjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICR2bS5sb2dpbi5hdXRvbG9naW49JHZtLmxvZ2luLmF1dG9sb2dpbj8xOjA7XHJcbiAgICAgICAgICAgICAgICAkLnBvc3QoJy4vbG9naW4nLCAkdm0ubG9naW4sIGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzICYmIHJlcy5jb2RlID09IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdm0uZXJyb3Jtc2cgPSByZXMubWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5hcmdzLmVudCA+PSAzICYmICEkdm0udmNvZGVfc2hvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHZtLmNhcHRjaGFfc3JjMSA9ICR2bS5jYXB0Y2hhX3NyYyArICcmdD0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR2bS52Y29kZV9zaG93ICAgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXMgJiYgcmVzLmNvZGUgPT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSByZXMudGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luLmpzXCIpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZjb2RlX3Nob3cpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FwdGNoYV9zcmMxID0gdGhpcy5jYXB0Y2hhX3NyYyArICcmdD0nICsgTWF0aC5yYW5kb20oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGV4cG9ydHMoJ0BiYWNrZW5kLmxvZ2luJywgYXBwKTtcclxufSk7XHJcbiJdfQ==
