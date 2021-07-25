<form class="layui-form toolbar" id="searchForm">
    <div class="layui-fluid">
        <div class="layui-card">
            <div class="layui-card-body">
                <div class="layui-form-item">
                    <div class="layui-inline">
                        <label class="layui-form-label text-left">账&emsp;号:</label>
                        <div class="layui-input-inline">
                            <input name="name" class="layui-input" placeholder="输入账号"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label text-left">姓&emsp;名:</label>
                        <div class="layui-input-inline">
                            <input name="nickname" class="layui-input" placeholder="输入姓名"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label text-left">手&emsp;机:</label>
                        <div class="layui-input-inline">
                            <input name="phone" class="layui-input" placeholder="输入手机号"/>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label text-left">状&emsp;态:</label>
                        <div class="layui-input-inline">
                            <select name="status">
                                <option value=""></option>
                                <option value="1" selected>正常</option>
                                <option value="0">锁定</option>
                            </select>
                        </div>
                    </div>
                    <div class="layui-inline">
                        <label class="layui-form-label text-left">角&emsp;色:</label>
                        <div class="layui-input-inline">
                            <div id="userRoleList"></div>
                        </div>
                    </div>
                    <div class="layui-inline">&emsp;
                        <button class="layui-btn icon-btn" lay-filter="userTbSearch" lay-submit>
                            <i class="layui-icon">&#xe615;</i>搜索
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>

<div class="layui-fluid layui-radius-table layui-no-pt layui-table-cell-ah">
    <table id="userTable" lay-filter="userTable"></table>
</div>

<!-- 表格操作列 -->
<script type="text/html" id="userTbBar">
    {if ican('edit:system/account/user')}
        <a class="layui-fg-blue" lay-event="edit" title="编辑"><i class="layui-icon iconfont layui-extend-edit"></i></a>
    {/if}
    {if ican('del:system/account/user')}
        <a class="layui-fg-red" lay-event="del" title="删除"><i class="layui-icon iconfont layui-extend-delete"></i></a>
    {/if}
</script>

<!-- 表单弹窗 -->
<script type="text/html" id="userEditDialog">
    <form id="userEditForm" lay-filter="userEditForm" class="layui-form model-form">
        <input name="uid" type="hidden"/>
        <div class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm6">
                <label class="layui-form-label layui-form-required">账号:</label>
                <div class="layui-input-block">
                    <input name="name" placeholder="请输入账号" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                </div>
            </div>
            <div class="layui-col-sm6">
                <label class="layui-form-label layui-form-required">姓名:</label>
                <div class="layui-input-block">
                    <input name="nickname" placeholder="请输入姓名" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                </div>
            </div>
        </div>
        <div class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm6">
                <label class="layui-form-label">手机:</label>
                <div class="layui-input-block">
                    <input name="phone" placeholder="请输入手机号" class="layui-input" lay-verType="tips"/>
                </div>
            </div>
            <div class="layui-col-sm6">
                <label class="layui-form-label">邮箱:</label>
                <div class="layui-input-block">
                    <input name="email" placeholder="请输入邮箱" class="layui-input" lay-verType="tips"/>
                </div>
            </div>
        </div>
        <div class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm6" id="passwd">
                <label class="layui-form-label">登录密码:</label>
                <div class="layui-input-block">
                    <input id='passwdInput' type="password" name="passwd" autocomplete="new-password" placeholder="请输入密码" class="layui-input" lay-verType="tips"/>
                </div>
            </div>
            <div class="layui-col-sm6" id="rePasswd">
                <label class="layui-form-label">确认密码:</label>
                <div class="layui-input-block">
                    <input id='rePasswdInput' type="password" name="rePasswd" placeholder="请确认密码" class="layui-input" lay-verType="tips" lay-verify="equalTo" lay-equalTo="#passwdInput" lay-equalToText="两次输入的密码不相同"/>
                </div>
            </div>
        </div>
        <div class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm12">
                <label class="layui-form-label layui-form-required">角色:</label>
                <div class="layui-input-block">
                    <div id="userEditRoleSel"></div>
                </div>
            </div>
        </div>
        <div id="resetOnFirstLogin" class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm12">
                <label class="layui-form-label">&nbsp;</label>
                <div class="layui-input-block">
                    <input type="checkbox" name="resetOnLogin" title="第一次登录时重置密码" lay-skin="primary"/>
                </div>
            </div>
        </div>
        <div id="setUserStatus" class="layui-form-item layui-row layui-no-mb">
            <div class="layui-col-sm6">
                <label class="layui-form-label">状态:</label>
                <div class="layui-input-block">
                    <select name="status">
                        <option value=""></option>
                        <option value="1" selected>正常</option>
                        <option value="0">锁定</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="layui-form-item text-right">
            <button class="layui-btn" lay-filter="userEditSubmit" lay-submit>保存</button>
            <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">取消</button>
        </div>
    </form>
</script>
<script type="text/html" id="operationToolbar">
    <p>
        {if ican('add:system/account/user')}
            <button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>
        {/if}
        {if ican('del:system/account/user')}
            <button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>
        {/if}
    </p>
</script>
<script type="text/html" id="userStatus">
    <input type="checkbox" lay-filter="userStatus" value="" lay-skin="switch" lay-text="正常|锁定" style="display: none;"/>
</script>
<script>
    layui.use(['jquery', '@backend.user'], function ($, user) {
        user.init({$tableData});
    });
</script>