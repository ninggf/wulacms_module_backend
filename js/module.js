layui.define(['jquery'], function (exports) {
  'use strict';

  var $ = layui.$;
  var app = new Vue({
    el: '#module',
    data: {
      list: [{
        title: "模块一",
        width: "25%",
        isadd: 0
      }, {
        title: "模块二",
        width: "50%",
        isadd: 0
      }, {
        title: "模块三",
        width: "75%",
        isadd: 0
      }],
      module_list: [],
      //控制侧边栏开启关闭
      hide_sid: 0,
      sid_show: 0
    },
    methods: {
      addModule: function addModule(m) {
        var el,
            item = {};
        item.width = m.width;
        item.title = m.title;

        if (m.isadd) {
          // 删除
          el = this.module_list.findIndex(function (c) {
            return c.title == m.title;
          });
          this.module_list.splice(el, 1);
        } else {
          //添加
          this.module_list.push(item);
        }

        m.isadd = !m.isadd;
      }
    },
    mounted: function mounted() {
      console.log('module');
    }
  });
  exports('@backend.module', app);
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyJdLCJuYW1lcyI6WyJsYXl1aSIsImRlZmluZSIsImV4cG9ydHMiLCIkIiwiYXBwIiwiVnVlIiwiZWwiLCJkYXRhIiwibGlzdCIsInRpdGxlIiwid2lkdGgiLCJpc2FkZCIsIm1vZHVsZV9saXN0IiwiaGlkZV9zaWQiLCJzaWRfc2hvdyIsIm1ldGhvZHMiLCJhZGRNb2R1bGUiLCJtIiwibGV0IiwiaXRlbSIsImZpbmRJbmRleCIsImMiLCJzcGxpY2UiLCJwdXNoIiwibW91bnRlZCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBQSxLQUFLLENBQUNDLE1BQU5ELENBQWEsQ0FBQyxRQUFELENBQWJBLEVBQXlCLFVBQUNFLE9BQUQsRUFBYTtBQUNsQzs7QUFDQSxNQUFNQyxDQUFBQSxHQUFNSCxLQUFLLENBQUNHLENBQWxCO0FBQ0EsTUFBTUMsR0FBQUEsR0FBTSxJQUFJQyxHQUFKLENBQVE7QUFDaEJDLElBQUFBLEVBQUFBLEVBQVMsU0FETztBQUVoQkMsSUFBQUEsSUFBQUEsRUFBUztBQUNMQyxNQUFBQSxJQUFJLEVBQUMsQ0FDRDtBQUNJQyxRQUFBQSxLQUFLLEVBQUMsS0FEVjtBQUVJQyxRQUFBQSxLQUFLLEVBQUMsS0FGVjtBQUdJQyxRQUFBQSxLQUFLLEVBQUM7QUFIVixPQURDLEVBTUQ7QUFDSUYsUUFBQUEsS0FBSyxFQUFDLEtBRFY7QUFFSUMsUUFBQUEsS0FBSyxFQUFDLEtBRlY7QUFHSUMsUUFBQUEsS0FBSyxFQUFDO0FBSFYsT0FOQyxFQVdEO0FBQ0lGLFFBQUFBLEtBQUssRUFBQyxLQURWO0FBRUlDLFFBQUFBLEtBQUssRUFBQyxLQUZWO0FBR0lDLFFBQUFBLEtBQUssRUFBQztBQUhWLE9BWEMsQ0FEQTtBQWtCTEMsTUFBQUEsV0FBVyxFQUFDLEVBbEJQO0FBbUJMO0FBQ0FDLE1BQUFBLFFBQVEsRUFBQyxDQXBCSjtBQXFCTEMsTUFBQUEsUUFBUSxFQUFDO0FBckJKLEtBRk87QUF5QmhCQyxJQUFBQSxPQUFPLEVBQUU7QUFDTEMsTUFBQUEsU0FESyxxQkFDS0MsQ0FETCxFQUNPO0FBQ1JDLFlBQUlaLEVBQUpZO0FBQUFBLFlBQU9DLElBQUksR0FBQyxFQUFaRDtBQUNJQyxRQUFBQSxJQUFJLENBQUNULEtBQUxTLEdBQVdGLENBQUMsQ0FBQ1AsS0FBYlM7QUFDQUEsUUFBQUEsSUFBSSxDQUFDVixLQUFMVSxHQUFXRixDQUFDLENBQUNSLEtBQWJVOztBQUNBLFlBQUdGLENBQUMsQ0FBQ04sS0FBTCxFQUFXO0FBQ1A7QUFDQUwsVUFBQUEsRUFBRSxHQUFDLEtBQUtNLFdBQUwsQ0FBaUJRLFNBQWpCLENBQTJCLFVBQVNDLENBQVQsRUFBVztBQUNyQyxtQkFBT0EsQ0FBQyxDQUFDWixLQUFGWSxJQUFTSixDQUFDLENBQUNSLEtBQWxCO0FBQ0gsV0FGRSxDQUFISDtBQUdBLGVBQUtNLFdBQUwsQ0FBaUJVLE1BQWpCLENBQXdCaEIsRUFBeEIsRUFBMkIsQ0FBM0I7QUFDSCxTQU5ELE1BTUs7QUFDRDtBQUNBLGVBQUtNLFdBQUwsQ0FBaUJXLElBQWpCLENBQXNCSixJQUF0QjtBQUNKOztBQUNBRixRQUFBQSxDQUFDLENBQUNOLEtBQUZNLEdBQVEsQ0FBQ0EsQ0FBQyxDQUFDTixLQUFYTTtBQUNSO0FBaEJLLEtBekJPO0FBMkNoQk8sSUFBQUEsT0EzQ2dCLHFCQTJDTjtBQUNOQyxNQUFBQSxPQUFPLENBQUNDLEdBQVJELENBQVksUUFBWkE7QUFDSDtBQTdDZSxHQUFSLENBQVo7QUFnREF2QixFQUFBQSxPQUFPLENBQUMsaUJBQUQsRUFBb0JFLEdBQXBCLENBQVBGO0FBQ0gsQ0FwRERGIiwiZmlsZSI6Im1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImxheXVpLmRlZmluZShbJ2pxdWVyeSddLCAoZXhwb3J0cykgPT4ge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgY29uc3QgJCAgID0gbGF5dWkuJDtcclxuICAgIGNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICAgIGVsICAgICA6ICcjbW9kdWxlJyxcclxuICAgICAgICBkYXRhICAgOiB7XHJcbiAgICAgICAgICAgIGxpc3Q6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOlwi5qih5Z2X5LiAXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6XCIyNSVcIixcclxuICAgICAgICAgICAgICAgICAgICBpc2FkZDowLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTpcIuaooeWdl+S6jFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOlwiNTAlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNhZGQ6MCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6XCLmqKHlnZfkuIlcIixcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDpcIjc1JVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzYWRkOjAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBtb2R1bGVfbGlzdDpbXSxcclxuICAgICAgICAgICAgLy/mjqfliLbkvqfovrnmoI/lvIDlkK/lhbPpl61cclxuICAgICAgICAgICAgaGlkZV9zaWQ6MCxcclxuICAgICAgICAgICAgc2lkX3Nob3c6MCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgYWRkTW9kdWxlKG0pe1xyXG4gICAgICAgICAgICAgICAgbGV0IGVsLGl0ZW09e307XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS53aWR0aD1tLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udGl0bGU9bS50aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICBpZihtLmlzYWRkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yig6ZmkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsPXRoaXMubW9kdWxlX2xpc3QuZmluZEluZGV4KGZ1bmN0aW9uKGMpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMudGl0bGU9PW0udGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVfbGlzdC5zcGxpY2UoZWwsMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5re75YqgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlX2xpc3QucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbS5pc2FkZD0hbS5pc2FkZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ21vZHVsZScpXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGV4cG9ydHMoJ0BiYWNrZW5kLm1vZHVsZScsIGFwcCk7XHJcbn0pO1xyXG4iXX0=