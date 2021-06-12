function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

layui.define(['jquery', 'form', 'table', 'admin', 'laydate'], function (cb) {
  var $ = layui.$,
      form = layui.form,
      table = layui.table,
      admin = layui.admin,
      laydate = layui.laydate;

  var Commonlog = /*#__PURE__*/function () {
    function Commonlog() {
      _defineProperty(this, "where", {
        'sort[name]': 'id',
        'sort[dir]': 'd'
      });
    }

    var _proto = Commonlog.prototype;

    _proto.init = function init(id, cols, data) {
      var _this = this;

      // 绘制表格
      var topH = $('#searchForm').outerHeight() + 36,
          logTable = table.render({
        elem: '#loggers',
        cols: cols,
        autoSort: false,
        data: data,
        lazy: true,
        limit: 30,
        height: 'full-' + topH,
        where: this.where,
        url: admin.url('backend/logger/data/' + id),
        page: true
      }); //排序

      table.on('sort(loggerTable)', function (obj) {
        _this.where['sort[name]'] = obj.field;
        _this.where['sort[dir]'] = obj.type === 'asc' ? 'a' : 'd';
        logTable.reloadData();
      }); //绘制日期控件

      laydate.render({
        elem: 'input[name="date"]',
        type: 'date',
        range: true,
        trigger: 'click'
      }); //搜索表单提交

      form.on('submit(searchBtn)', function (obj) {
        _this.where = $.extend(_this.where, obj.field);
        logTable.reloadData();
        return false;
      }); //重置表单

      form.on('reset(searchForm)', function (obj) {
        _this.where = $.extend(_this.where, obj.field);
        logTable.reloadData();
      });
    };

    return Commonlog;
  }();

  cb('@backend.logger', new Commonlog());
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ2dlci5qcyJdLCJuYW1lcyI6WyJsYXl1aSIsImRlZmluZSIsImNiIiwibGV0IiwiJCIsImZvcm0iLCJ0YWJsZSIsImFkbWluIiwibGF5ZGF0ZSIsIkNvbW1vbmxvZyIsImluaXQiLCJpZCIsImNvbHMiLCJkYXRhIiwidG9wSCIsIm91dGVySGVpZ2h0IiwibG9nVGFibGUiLCJyZW5kZXIiLCJlbGVtIiwiYXV0b1NvcnQiLCJsYXp5IiwibGltaXQiLCJoZWlnaHQiLCJ3aGVyZSIsInVybCIsInBhZ2UiLCJvbiIsIm9iaiIsImZpZWxkIiwidHlwZSIsInJlbG9hZERhdGEiLCJyYW5nZSIsInRyaWdnZXIiLCJleHRlbmQiXSwibWFwcGluZ3MiOiI7O0FBQUFBLEtBQUssQ0FBQ0MsTUFBTkQsQ0FBYSxDQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE9BQTVCLEVBQXFDLFNBQXJDLENBQWJBLEVBQThELFVBQUNFLEVBQUQsRUFBUTtBQUNsRUMsTUFBSUMsQ0FBQUEsR0FBSUosS0FBSyxDQUFDSSxDQUFkRDtBQUFBQSxNQUFpQkUsSUFBQUEsR0FBT0wsS0FBSyxDQUFDSyxJQUE5QkY7QUFBQUEsTUFBb0NHLEtBQUFBLEdBQVFOLEtBQUssQ0FBQ00sS0FBbERIO0FBQUFBLE1BQXlESSxLQUFBQSxHQUFRUCxLQUFLLENBQUNPLEtBQXZFSjtBQUFBQSxNQUE4RUssT0FBQUEsR0FBVVIsS0FBSyxDQUFDUSxPQUE5Rkw7O0FBRGtFLE1BRzVETSxTQUg0RDtBQUFBO0FBQUEscUNBSXREO0FBQ0osc0JBQWMsSUFEVjtBQUVKLHFCQUFjO0FBRlYsT0FKc0Q7QUFBQTs7QUFBQTs7QUFBQSxXQVM5REMsSUFUOEQsR0FTOURBLGNBQUtDLEVBQUxELEVBQVNFLElBQVRGLEVBQWVHLElBQWZILEVBQXFCO0FBQUE7O0FBQ2pCO0FBQ0FQLFVBQUlXLElBQUFBLEdBQU9WLENBQUMsQ0FBQyxhQUFELENBQURBLENBQWlCVyxXQUFqQlgsS0FBaUMsRUFBNUNEO0FBQUFBLFVBQWdEYSxRQUFBQSxHQUFXVixLQUFLLENBQUNXLE1BQU5YLENBQWE7QUFDcEVZLFFBQUFBLElBQUFBLEVBQVUsVUFEMEQ7QUFFcEVOLFFBQUFBLElBQUFBLEVBQVVBLElBRjBEO0FBR3BFTyxRQUFBQSxRQUFRLEVBQUUsS0FIMEQ7QUFJcEVOLFFBQUFBLElBQUFBLEVBQVVBLElBSjBEO0FBS3BFTyxRQUFBQSxJQUFBQSxFQUFVLElBTDBEO0FBTXBFQyxRQUFBQSxLQUFBQSxFQUFVLEVBTjBEO0FBT3BFQyxRQUFBQSxNQUFBQSxFQUFVLFVBQVVSLElBUGdEO0FBUXBFUyxRQUFBQSxLQUFBQSxFQUFVLEtBQUtBLEtBUnFEO0FBU3BFQyxRQUFBQSxHQUFBQSxFQUFVakIsS0FBSyxDQUFDaUIsR0FBTmpCLENBQVUseUJBQXlCSSxFQUFuQ0osQ0FUMEQ7QUFVcEVrQixRQUFBQSxJQUFBQSxFQUFVO0FBVjBELE9BQWJuQixDQUEzREgsQ0FGaUIsQ0FjakI7O0FBQ0FHLE1BQUFBLEtBQUssQ0FBQ29CLEVBQU5wQixDQUFTLG1CQUFUQSxFQUE4QixVQUFDcUIsR0FBRCxFQUFTO0FBQ25DLFFBQUEsS0FBSSxDQUFDSixLQUFMLENBQVcsWUFBWCxJQUEyQkksR0FBRyxDQUFDQyxLQUEvQjtBQUNBLFFBQUEsS0FBSSxDQUFDTCxLQUFMLENBQVcsV0FBWCxJQUEyQkksR0FBRyxDQUFDRSxJQUFKRixLQUFhLEtBQWJBLEdBQXFCLEdBQXJCQSxHQUEyQixHQUF0RDtBQUNBWCxRQUFBQSxRQUFRLENBQUNjLFVBQVRkO0FBQ0gsT0FKRFYsRUFmaUIsQ0FvQmpCOztBQUNBRSxNQUFBQSxPQUFPLENBQUNTLE1BQVJULENBQWU7QUFDWFUsUUFBQUEsSUFBQUEsRUFBUyxvQkFERTtBQUVYVyxRQUFBQSxJQUFBQSxFQUFTLE1BRkU7QUFHWEUsUUFBQUEsS0FBQUEsRUFBUyxJQUhFO0FBSVhDLFFBQUFBLE9BQU8sRUFBRTtBQUpFLE9BQWZ4QixFQXJCaUIsQ0EyQmpCOztBQUNBSCxNQUFBQSxJQUFJLENBQUNxQixFQUFMckIsQ0FBUSxtQkFBUkEsRUFBNkIsVUFBQ3NCLEdBQUQsRUFBUztBQUNsQyxRQUFBLEtBQUksQ0FBQ0osS0FBTCxHQUFhbkIsQ0FBQyxDQUFDNkIsTUFBRjdCLENBQVMsS0FBSSxDQUFDbUIsS0FBZG5CLEVBQXFCdUIsR0FBRyxDQUFDQyxLQUF6QnhCLENBQWI7QUFDQVksUUFBQUEsUUFBUSxDQUFDYyxVQUFUZDtBQUNBLGVBQU8sS0FBUDtBQUNILE9BSkRYLEVBNUJpQixDQWlDakI7O0FBQ0FBLE1BQUFBLElBQUksQ0FBQ3FCLEVBQUxyQixDQUFRLG1CQUFSQSxFQUE2QixVQUFDc0IsR0FBRCxFQUFTO0FBQ2xDLFFBQUEsS0FBSSxDQUFDSixLQUFMLEdBQWFuQixDQUFDLENBQUM2QixNQUFGN0IsQ0FBUyxLQUFJLENBQUNtQixLQUFkbkIsRUFBcUJ1QixHQUFHLENBQUNDLEtBQXpCeEIsQ0FBYjtBQUNBWSxRQUFBQSxRQUFRLENBQUNjLFVBQVRkO0FBQ0gsT0FIRFg7QUFJSixLQS9DOEQ7O0FBQUE7QUFBQTs7QUFrRGxFSCxFQUFBQSxFQUFFLENBQUMsaUJBQUQsRUFBb0IsSUFBSU8sU0FBSixFQUFwQixDQUFGUDtBQUNILENBbkRERiIsImZpbGUiOiJsb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJsYXl1aS5kZWZpbmUoWydqcXVlcnknLCAnZm9ybScsICd0YWJsZScsICdhZG1pbicsICdsYXlkYXRlJ10sIChjYikgPT4ge1xuICAgIGxldCAkID0gbGF5dWkuJCwgZm9ybSA9IGxheXVpLmZvcm0sIHRhYmxlID0gbGF5dWkudGFibGUsIGFkbWluID0gbGF5dWkuYWRtaW4sIGxheWRhdGUgPSBsYXl1aS5sYXlkYXRlO1xuXG4gICAgY2xhc3MgQ29tbW9ubG9nIHtcbiAgICAgICAgd2hlcmUgPSB7XG4gICAgICAgICAgICAnc29ydFtuYW1lXSc6ICdpZCcsXG4gICAgICAgICAgICAnc29ydFtkaXJdJyA6ICdkJ1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdChpZCwgY29scywgZGF0YSkge1xuICAgICAgICAgICAgLy8g57uY5Yi26KGo5qC8XG4gICAgICAgICAgICBsZXQgdG9wSCA9ICQoJyNzZWFyY2hGb3JtJykub3V0ZXJIZWlnaHQoKSArIDM2LCBsb2dUYWJsZSA9IHRhYmxlLnJlbmRlcih7XG4gICAgICAgICAgICAgICAgZWxlbSAgICA6ICcjbG9nZ2VycycsXG4gICAgICAgICAgICAgICAgY29scyAgICA6IGNvbHMsXG4gICAgICAgICAgICAgICAgYXV0b1NvcnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGEgICAgOiBkYXRhLFxuICAgICAgICAgICAgICAgIGxhenkgICAgOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxpbWl0ICAgOiAzMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQgIDogJ2Z1bGwtJyArIHRvcEgsXG4gICAgICAgICAgICAgICAgd2hlcmUgICA6IHRoaXMud2hlcmUsXG4gICAgICAgICAgICAgICAgdXJsICAgICA6IGFkbWluLnVybCgnYmFja2VuZC9sb2dnZXIvZGF0YS8nICsgaWQpLFxuICAgICAgICAgICAgICAgIHBhZ2UgICAgOiB0cnVlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy/mjpLluo9cbiAgICAgICAgICAgIHRhYmxlLm9uKCdzb3J0KGxvZ2dlclRhYmxlKScsIChvYmopID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLndoZXJlWydzb3J0W25hbWVdJ10gPSBvYmouZmllbGRcbiAgICAgICAgICAgICAgICB0aGlzLndoZXJlWydzb3J0W2Rpcl0nXSAgPSBvYmoudHlwZSA9PT0gJ2FzYycgPyAnYScgOiAnZCdcbiAgICAgICAgICAgICAgICBsb2dUYWJsZS5yZWxvYWREYXRhKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy/nu5jliLbml6XmnJ/mjqfku7ZcbiAgICAgICAgICAgIGxheWRhdGUucmVuZGVyKHtcbiAgICAgICAgICAgICAgICBlbGVtICAgOiAnaW5wdXRbbmFtZT1cImRhdGVcIl0nLFxuICAgICAgICAgICAgICAgIHR5cGUgICA6ICdkYXRlJyxcbiAgICAgICAgICAgICAgICByYW5nZSAgOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyaWdnZXI6ICdjbGljaydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy/mkJzntKLooajljZXmj5DkuqRcbiAgICAgICAgICAgIGZvcm0ub24oJ3N1Ym1pdChzZWFyY2hCdG4pJywgKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMud2hlcmUgPSAkLmV4dGVuZCh0aGlzLndoZXJlLCBvYmouZmllbGQpXG4gICAgICAgICAgICAgICAgbG9nVGFibGUucmVsb2FkRGF0YSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL+mHjee9ruihqOWNlVxuICAgICAgICAgICAgZm9ybS5vbigncmVzZXQoc2VhcmNoRm9ybSknLCAob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy53aGVyZSA9ICQuZXh0ZW5kKHRoaXMud2hlcmUsIG9iai5maWVsZClcbiAgICAgICAgICAgICAgICBsb2dUYWJsZS5yZWxvYWREYXRhKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2IoJ0BiYWNrZW5kLmxvZ2dlcicsIG5ldyBDb21tb25sb2coKSlcbn0pOyJdfQ==
