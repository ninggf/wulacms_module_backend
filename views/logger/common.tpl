<form class="layui-form" id="searchForm" lay-filter="searchForm">
    <div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-body">
                <div class="layui-form-item layui-row layui-no-mb">
                    <div class="layui-col-sm6 layui-col-md4">
                        <label class="layui-form-label text-left">{'Date'|t}:</label>
                        <div class="layui-input-block">
                            <input name="date" class="layui-input icon-date" placeholder="{'Date'|t}" autocomplete="off"/>
                        </div>
                    </div>
                    <div class="layui-col-sm6 layui-col-md4">
                        <label class="layui-form-label text-left">{'Level'|t}:</label>
                        <div class="layui-input-block">
                            <select name="level">
                                <option value="" selected>{'All'|t}</option>
                                <option value="INFO">{'INFO'|t}</option>
                                <option value="WARN">{'WARN'|t}</option>
                                <option value="ERROR">{'ERROR'|t}</option>
                            </select>
                        </div>
                    </div>
                    <div class="layui-col-sm6 layui-col-md4">
                        <label class="layui-form-label text-left">{'Username'|t}:</label>
                        <div class="layui-input-block">
                            <input name="name" class="layui-input" placeholder="{'Username'|t}"/>
                        </div>
                    </div>
                    <div class="layui-col-sm6 layui-col-md4">
                        <label class="layui-form-label text-left">{'Action'|t}:</label>
                        <div class="layui-input-block">
                            <input name="action" class="layui-input" placeholder="{'Action'|t}"/>
                        </div>
                    </div>
                    <div class="layui-col-sm6 layui-col-md4">
                        <label class="layui-form-label text-left">IP:</label>
                        <div class="layui-input-block">
                            <input name="ip" class="layui-input" placeholder="IP"/>
                        </div>
                    </div>
                </div>
                <div class="layui-form-item layui-row layui-no-mb">
                    <div class="layui-col-xs12 text-center layui-no-mb">
                        <div class="layui-btn-group">
                            <button type="button" class="layui-btn layui-btn-sm" lay-filter="searchBtn" lay-submit>
                                <i class="layui-icon">&#xe615;</i>
                            </button>
                            <button type="reset" class="layui-btn layui-btn-sm layui-btn-warm" lay-filter="resetBtn"><i class="layui-icon">&#xe669;</i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
<div class="layui-fluid layui-radius-table layui-no-pt">
    <table id="loggers" lay-filter="loggerTable"></table>
</div>
<script>
    layui.use(['jquery', '@backend.logger'], function ($, logger) {
        logger.init('{$loggerId}', {$tableCols},{$tableData})
    })
</script>