layui.define(['jquery', 'form', 'table', 'admin', 'laydate'], (cb) => {
    let $ = layui.$, form = layui.form, table = layui.table, admin = layui.admin, laydate = layui.laydate;

    class Commonlog {
        where = {
            'sort[name]': 'id',
            'sort[dir]' : 'd'
        }

        init(id, cols, data) {
            // 绘制表格
            let topH = $('#searchForm').outerHeight() + 35, logTable = table.render({
                elem    : '#loggers',
                cols    : cols,
                autoSort: false,
                data    : data,
                lazy    : true,
                limit   : 30,
                height  : 'full-' + topH,
                where   : this.where,
                url     : admin.url('backend/logger/data/' + id),
                page    : true
            })
            //排序
            table.on('sort(loggerTable)', (obj) => {
                this.where['sort[name]'] = obj.field
                this.where['sort[dir]']  = obj.type === 'asc' ? 'a' : 'd'
                logTable.reloadData()
            });
            //绘制日期控件
            laydate.render({
                elem   : 'input[name="date"]',
                type   : 'date',
                range  : true,
                trigger: 'click'
            });
            //搜索表单提交
            form.on('submit(searchBtn)', (obj) => {
                this.where = $.extend(this.where, obj.field)
                logTable.reloadData()
                return false;
            });
            //重置表单
            form.on('reset(searchForm)', (obj) => {
                this.where = $.extend(this.where, obj.field)
                logTable.reloadData()
            });
        }
    }

    cb('@backend.logger', new Commonlog())
});