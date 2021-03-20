<div class="layui-fluid">
    <div class="layui-card">
        <div class="layui-card-body">
            <!-- 表格工具栏 -->
            <form class="layui-form toolbar">
                <div class="layui-form-item">
                    <div class="layui-inline">
                        <label class="layui-form-label">账&emsp;号:</label>
                        <div class="layui-input-inline">
                            <input name="name" class="layui-input" placeholder="输入账号"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">姓&emsp;名:</label>
                        <div class="layui-input-inline">
                            <input name="nickname" class="layui-input" placeholder="输入姓名"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label">手&emsp;机:</label>
                        <div class="layui-input-inline">
                            <input name="phone" class="layui-input" placeholder="输入手机号"/>
                        </div>
                    </div>
                    <div class="layui-inline">&emsp;
                        <button class="layui-btn icon-btn" lay-filter="userTbSearch" lay-submit>
                            <i class="layui-icon">&#xe615;</i>搜索
                        </button>
                    </div>
                </div>
            </form>
            <!-- 数据表格 -->
            <table id="userTable" lay-filter="userTable"></table>
        </div>
    </div>
</div>

<!-- 表格操作列 -->
<script type="text/html" id="userTbBar">
    <a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit">修改</a>
    <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a>
</script>

<!-- 表单弹窗 -->
<script type="text/html" id="userEditDialog">
    <form id="userEditForm" lay-filter="userEditForm" class="layui-form model-form">
        <input name="uid" type="hidden"/>
        <div class="layui-form-item">
            <div class="layui-inline">
                <label class="layui-form-label layui-form-required">账号:</label>
                <div class="layui-input-inline">
                    <input name="name" placeholder="请输入账号" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                </div>
            </div>
            <div class="layui-inline">
                <label class="layui-form-label layui-form-required">姓名:</label>
                <div class="layui-input-inline">
                    <input name="nickname" placeholder="请输入姓名" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                </div>
            </div>
        </div>
        <div class="layui-form-item">
            <div class="layui-inline">
                <label class="layui-form-label layui-form-required">手机:</label>
                <div class="layui-input-inline">
                    <input name="phone" placeholder="请输入手机号" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                </div>
            </div>
            <div class="layui-inline">
                <label class="layui-form-label">邮箱:</label>
                <div class="layui-input-inline">
                    <input name="email" placeholder="请输入邮箱" class="layui-input" lay-verType="tips"/>
                </div>
            </div>
        </div>
        <div class="layui-form-item">
            <div class="layui-inline" id="passwd">
                <label class="layui-form-label">密码:</label>
                <div class="layui-input-inline">
                    <input id='passwdInput' name="passwd" placeholder="请输入密码" class="layui-input" lay-verType="tips"/>
                </div>
            </div>
            <div class="layui-inline">
                <label class="layui-form-label">账号状态:</label>
                <div class="layui-input-inline">
                    <select name="status" lay-verify="required">
                        <option value=""></option>
                        <option value="1" selected>正常</option>
                        <option value="0">锁定</option>
                        <option value="2">登录后须重设密码</option>
                        <option value="3">密码过期</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="layui-form-item">
            <div class="layui-block">
                <label class="layui-form-label layui-form-required">角色:</label>
                <div class="layui-input-block">
                    <div id="userEditRoleSel" ></div>
                </div>
            </div>
        </div>
        <div class="layui-form-item text-right">
            <button class="layui-btn" lay-filter="userEditSubmit" lay-submit>保存</button>
            <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">取消</button>
        </div>
    </form>
</script>
<script>
    layui.use(['jquery', '@backend.user'], function ($, user) {
        $("#user-profile").removeClass('layui-hide');
        user.init();
    });
</script>