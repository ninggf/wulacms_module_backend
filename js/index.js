layui.define(['jquery'], function (exports) {
  'use strict';

  var $ = layui.$;
  var app = new Vue({
    el: '#index',
    data: {
      menu: {
        show: 0,
        listshow: 0,
        search_focus: 0,
        module_show: 0,
        collection_list: [],
        menu_list: [{
          title: '弹性计算',
          list: [{
            name: "111"
          }, {
            name: "222"
          }, {
            name: "333"
          }, {
            name: "444"
          }, {
            name: "555"
          }, {
            name: "666"
          }, {
            name: "777"
          }, {
            name: "888"
          }, {
            name: "999"
          }]
        }, {
          title: '分析',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '监控',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '管理',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '数据',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '应用',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '服务',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }, {
          title: '安全',
          list: [{
            name: "负载均衡"
          }, {
            name: "批量计算"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }, {
            name: "资源编排"
          }]
        }],
        current_menu: -1
      },
      // 拖动
      drop: {
        start: '',
        target: '',
        current: -1
      }
    },
    methods: {
      // 标签添加到左侧sider
      collection: function collection(item) {
        var el;

        if (item.isadd) {
          // 删除
          el = this.menu.collection_list.findIndex(function (c) {
            return c.name == item.name;
          });
          this.menu.collection_list.splice(el, 1);
        } else {
          //添加
          this.menu.collection_list.push(item);
        }

        item.isadd = !item.isadd;
      },
      dragstart: function dragstart(item) {
        this.drop.start = item;
      },
      dragend: function dragend() {
        //结束拖动
        var sindex,
            tindex,
            $vm = this;

        if (this.drop.start.name != this.drop.target.name) {
          // console.log(this.drop.start.name+'准备和'+this.drop.target.name+'交换')
          sindex = this.menu.collection_list.findIndex(function (c) {
            return c.name == $vm.drop.start.name;
          });
          tindex = this.menu.collection_list.findIndex(function (c) {
            return c.name == $vm.drop.target.name;
          });
          this.menu.collection_list.splice(sindex, 1, this.drop.target);
          this.menu.collection_list.splice(tindex, 1, this.drop.start);
          this.drop.current = -1;
        }
      },
      dragenter: function dragenter(item) {
        //拖动中 展示拖动效果
        this.drop.current = this.menu.collection_list.findIndex(function (c) {
          return c.name == item.name;
        });
        this.drop.target = item; // console.log("拖动到了"+item.name+"的位置")
      }
    },
    mounted: function mounted() {
      console.log('index');
    }
  });
  exports('@backend.index', app);
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImxheXVpIiwiZGVmaW5lIiwiZXhwb3J0cyIsIiQiLCJhcHAiLCJWdWUiLCJlbCIsImRhdGEiLCJtZW51Iiwic2hvdyIsImxpc3RzaG93Iiwic2VhcmNoX2ZvY3VzIiwibW9kdWxlX3Nob3ciLCJjb2xsZWN0aW9uX2xpc3QiLCJtZW51X2xpc3QiLCJ0aXRsZSIsImxpc3QiLCJuYW1lIiwiY3VycmVudF9tZW51IiwiZHJvcCIsInN0YXJ0IiwidGFyZ2V0IiwiY3VycmVudCIsIm1ldGhvZHMiLCJjb2xsZWN0aW9uIiwiaXRlbSIsImxldCIsImlzYWRkIiwiZmluZEluZGV4IiwiYyIsInNwbGljZSIsInB1c2giLCJkcmFnc3RhcnQiLCJkcmFnZW5kIiwic2luZGV4IiwidGluZGV4IiwiJHZtIiwiZHJhZ2VudGVyIiwibW91bnRlZCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBQSxLQUFLLENBQUNDLE1BQU5ELENBQWEsQ0FBQyxRQUFELENBQWJBLEVBQXlCLFVBQUNFLE9BQUQsRUFBYTtBQUNsQzs7QUFDQSxNQUFNQyxDQUFBQSxHQUFJSCxLQUFLLENBQUNHLENBQWhCO0FBQ0EsTUFBTUMsR0FBQUEsR0FBTSxJQUFJQyxHQUFKLENBQVE7QUFDaEJDLElBQUFBLEVBQUUsRUFBRSxRQURZO0FBRWhCQyxJQUFBQSxJQUFJLEVBQUU7QUFDRkMsTUFBQUEsSUFBSSxFQUFFO0FBQ0ZDLFFBQUFBLElBQUksRUFBRSxDQURKO0FBRUZDLFFBQUFBLFFBQVEsRUFBRSxDQUZSO0FBR0ZDLFFBQUFBLFlBQVksRUFBRSxDQUhaO0FBSUZDLFFBQUFBLFdBQVcsRUFBRSxDQUpYO0FBS0ZDLFFBQUFBLGVBQWUsRUFBRSxFQUxmO0FBTUZDLFFBQUFBLFNBQVMsRUFBRSxDQUNQO0FBQ0lDLFVBQUFBLEtBQUssRUFBRSxNQURYO0FBRUlDLFVBQUFBLElBQUksRUFBRSxDQUNOO0FBQUNDLFlBQUFBLElBQUksRUFBRTtBQUFQLFdBRE0s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R0FBaUJJLElBQWpCLENBTFcsQ0FNWDtBQUVKO0FBM0NLLEtBcEpPO0FBaU1oQmEsSUFBQUEsT0FqTWdCLHFCQWlNTjtBQUNOQyxNQUFBQSxPQUFPLENBQUNDLEdBQVJELENBQVksT0FBWkE7QUFDSDtBQW5NZSxHQUFSLENBQVo7QUFzTUFyQyxFQUFBQSxPQUFPLENBQUMsZ0JBQUQsRUFBbUJFLEdBQW5CLENBQVBGO0FBQ0gsQ0ExTURGIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsibGF5dWkuZGVmaW5lKFsnanF1ZXJ5J10sIChleHBvcnRzKSA9PiB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBjb25zdCAkID0gbGF5dWkuJDtcclxuICAgIGNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICAgIGVsOiAnI2luZGV4JyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIG1lbnU6IHtcclxuICAgICAgICAgICAgICAgIHNob3c6IDAsXHJcbiAgICAgICAgICAgICAgICBsaXN0c2hvdzogMCxcclxuICAgICAgICAgICAgICAgIHNlYXJjaF9mb2N1czogMCxcclxuICAgICAgICAgICAgICAgIG1vZHVsZV9zaG93OiAwLFxyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbl9saXN0OiBbXSxcclxuICAgICAgICAgICAgICAgIG1lbnVfbGlzdDogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICflvLnmgKforqHnrpcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIjExMVwifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIjIyMlwifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIjMzM1wifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwiNDQ0XCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCI1NTVcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIjY2NlwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwiNzc3XCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCI4ODhcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIjk5OVwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5YiG5p6QJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotJ/ovb3lnYfooaFcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLmibnph4/orqHnrpdcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+ebkeaOpycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LSf6L295Z2H6KGhXCJ9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi5om56YeP6K6h566XXCJ9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfnrqHnkIYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui0n+i9veWdh+ihoVwifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIuaJuemHj+iuoeeul1wifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5pWw5o2uJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotJ/ovb3lnYfooaFcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLmibnph4/orqHnrpdcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+W6lOeUqCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LSf6L295Z2H6KGhXCJ9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi5om56YeP6K6h566XXCJ9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfmnI3liqEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui0n+i9veWdh+ihoVwifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIuaJuemHj+iuoeeul1wifSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn5a6J5YWoJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotJ/ovb3lnYfooaFcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLmibnph4/orqHnrpdcIn0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogXCLotYTmupDnvJbmjpJcIn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiBcIui1hOa6kOe8luaOklwifSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6IFwi6LWE5rqQ57yW5o6SXCJ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudF9tZW51Oi0xLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgLy8g5ouW5YqoXHJcblxyXG4gICAgICAgICAgICBkcm9wOntcclxuICAgICAgICAgICAgICAgIHN0YXJ0OicnLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OicnLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudDotMSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgLy8g5qCH562+5re75Yqg5Yiw5bem5L6nc2lkZXJcclxuICAgICAgICAgICAgY29sbGVjdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWw7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5pc2FkZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOWIoOmZpFxyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gdGhpcy5tZW51LmNvbGxlY3Rpb25fbGlzdC5maW5kSW5kZXgoZnVuY3Rpb24oYykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5uYW1lID09IGl0ZW0ubmFtZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51LmNvbGxlY3Rpb25fbGlzdC5zcGxpY2UoZWwsIDEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvL+a3u+WKoFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudS5jb2xsZWN0aW9uX2xpc3QucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGl0ZW0uaXNhZGQgPSAhaXRlbS5pc2FkZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZHJhZ3N0YXJ0KGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcm9wLnN0YXJ0PWl0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRyYWdlbmQoKXtcclxuICAgICAgICAgICAgICAgIC8v57uT5p2f5ouW5YqoXHJcbiAgICAgICAgICAgICAgICBsZXQgc2luZGV4LHRpbmRleCwkdm09dGhpcztcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmRyb3Auc3RhcnQubmFtZSAhPSB0aGlzLmRyb3AudGFyZ2V0Lm5hbWUgICl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5kcm9wLnN0YXJ0Lm5hbWUrJ+WHhuWkh+WSjCcrdGhpcy5kcm9wLnRhcmdldC5uYW1lKyfkuqTmjaInKVxyXG4gICAgICAgICAgICAgICAgICAgIHNpbmRleD10aGlzLm1lbnUuY29sbGVjdGlvbl9saXN0LmZpbmRJbmRleChmdW5jdGlvbihjKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMubmFtZSA9PSAkdm0uZHJvcC5zdGFydC5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGluZGV4PXRoaXMubWVudS5jb2xsZWN0aW9uX2xpc3QuZmluZEluZGV4KGZ1bmN0aW9uKGMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5uYW1lID09ICR2bS5kcm9wLnRhcmdldC5uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51LmNvbGxlY3Rpb25fbGlzdC5zcGxpY2Uoc2luZGV4LDEsdGhpcy5kcm9wLnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51LmNvbGxlY3Rpb25fbGlzdC5zcGxpY2UodGluZGV4LDEsdGhpcy5kcm9wLnN0YXJ0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyb3AuY3VycmVudD0tMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZHJhZ2VudGVyKGl0ZW0pe1xyXG4gICAgICAgICAgICAgICAgLy/mi5bliqjkuK0g5bGV56S65ouW5Yqo5pWI5p6cXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3AuY3VycmVudD10aGlzLm1lbnUuY29sbGVjdGlvbl9saXN0LmZpbmRJbmRleChmdW5jdGlvbihjKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5uYW1lID09IGl0ZW0ubmFtZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3AudGFyZ2V0PWl0ZW07XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIuaLluWKqOWIsOS6hlwiK2l0ZW0ubmFtZStcIueahOS9jee9rlwiKVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2luZGV4JylcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgZXhwb3J0cygnQGJhY2tlbmQuaW5kZXgnLCBhcHApO1xyXG59KTtcclxuIl19