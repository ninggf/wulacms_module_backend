<form class="layui-form" id="settingForm" lay-filter="settingForm">
    <div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-header">{$settingName}</div>
            <div class="layui-card-body">
                <div class="layui-form-item layui-row layui-no-mb">
                    <div class="layui-col-sm12 layui-col-md6">
                        <label class="layui-form-label text-left">密码过期:</label>
                        <div class="layui-input-block">
                            <select name="passwordExpInt">
                                <option value="0" selected>永不过期</option>
                                <option value="+1 week">7天</option>
                                <option value="+2 weeks">15天</option>
                                <option value="+1 month">1个月</option>
                                <option value="+3 months">3个月</option>
                                <option value="+6 months">6个月</option>
                                <option value="+1 year">12个月</option>
                                <option value="+18 months">18个月</option>
                                <option value="+2 years">24个月</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="layui-form-item layui-row layui-no-mb">
                    <div class="layui-col-sm12 layui-col-md6">
                        <label class="layui-form-label text-left">同时登录:</label>
                        <div class="layui-input-block">
                            <select name="allowLoginTwice">
                                <option value="0">不允许</option>
                                <option value="1" selected>允许</option>
                            </select>
                        </div>
                    </div>
                    <div class="layui-col-sm12 layui-col-md6">
                        <label class="layui-form-label text-left">会话有效期:</label>
                        <div class="layui-input-block">
                            <select name="tokenExpInt">
                                <option value="+10 years" selected>永久有效</option>
                                <option value="+5 minutes">10分钟</option>
                                <option value="+10 minutes">10分钟</option>
                                <option value="+30 minutes">30分钟</option>
                                <option value="+1 hour">1小时</option>
                                <option value="+2 hours">2小时</option>
                                <option value="+5 hours">5小时</option>
                                <option value="+12 hours">12小时</option>
                                <option value="+24 hours">24小时</option>
                                <option value="+1 week">7天</option>
                                <option value="+2 weeks">15天</option>
                                <option value="+1 month">1个月</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="layui-form-item text-right submit-button">
                    <button type="reset" class="layui-btn layui-btn-primary">{'Reset'|t}</button>
                    <button class="layui-btn" lay-filter="saveBtn" lay-submit>{'Save'|t}</button>
                </div>
            </div>
        </div>
    </div>

</form>
<script>
    layui.use(['@backend.settings'], function (setting) {
        setting.init('{$settingId}',{$settingData});
    })
</script>