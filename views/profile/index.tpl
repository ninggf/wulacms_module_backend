<div id="user-profile" class="layui-fluid layui-hide">
    <div class="layui-row layui-col-space15">
        <!-- 左 -->
        <div class="layui-col-sm12 layui-col-md3">
            <div class="layui-card">
                <div class="layui-card-body" style="padding: 25px;">
                    <div class="text-center layui-text">
                        <div class="user-info-head" id="userInfoHead">
                            <img src="{$userMeta.avatar}" alt=""/>
                        </div>
                        <h2 style="padding-top: 20px;">{$userMeta.nickname}</h2>
                        <!--p style="padding-top: 8px;">海纳百川，有容乃大</p-->
                    </div>
                    <div class="layui-line-dash"></div>
                    <h3>角色</h3>
                    <div class="layui-badge-list" style="padding-top: 6px;">
                        {foreach $myPassport.data.rolens as $role}
                            <span class="layui-badge layui-bg-gray">{$role}</span>
                        {/foreach}
                    </div>
                </div>
            </div>
        </div>
        <!-- 右 -->
        <div class="layui-col-sm12 layui-col-md9">
            <div class="layui-card">
                <!-- 选项卡开始 -->
                <div class="layui-tab layui-tab-brief" lay-filter="userInfoTab">
                    <ul class="layui-tab-title">
                        <li class="layui-this">基本信息</li>
                        <li>修改密码</li>
                    </ul>
                    <div class="layui-tab-content">
                        <!-- tab1 -->
                        <div class="layui-tab-item layui-show">
                            <form class="layui-form" id="userInfoForm" lay-filter="userInfoForm" style="max-width: 400px;padding: 25px 10px 0 0;">
                                <div class="layui-form-item">
                                    <label class="layui-form-label layui-form-required">账户:</label>
                                    <div class="layui-input-block">
                                        <input name="name" placeholder="请输入账户"  value="{$userMeta.username}" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label layui-form-required">姓名:</label>
                                    <div class="layui-input-block">
                                        <input name="nickname" placeholder="请输入姓名" value="{$userMeta.nickname}" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">手机:</label>
                                    <div class="layui-input-block">
                                        <input name="phone" placeholder="请输入手机" value="{$userMeta.phone}" class="layui-input" lay-verType="tips" lay-verify="phoneX"/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">邮箱:</label>
                                    <div class="layui-input-block">
                                        <input name="email" placeholder="请输入邮箱" value="{$userMeta.email}" class="layui-input" lay-verify="emailX" lay-verType="tips"/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">个人简介:</label>
                                    <div class="layui-input-block">
                                        <textarea name="desc" placeholder="个人简介" class="layui-textarea" >{$userMeta.desc|escape}</textarea>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <div class="layui-input-block">
                                        <button class="layui-btn" lay-filter="userInfoSubmit" lay-submit>更新基本信息
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <!-- tab2 -->
                        <div class="layui-tab-item" style="padding-bottom: 20px;">
                            <form class="layui-form" id="resetPwdForm" lay-filter="resetPwdForm" style="max-width: 400px;padding: 25px 10px 0 0;">
                                <div class="layui-form-item">
                                    <label class="layui-form-label layui-form-required">原始密码:</label>
                                    <div class="layui-input-block">
                                        <input type="password" name="oldPsw" placeholder="请输入原始密码" class="layui-input" lay-verType="tips" lay-verify="required" required/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label layui-form-required">新的密码:</label>
                                    <div class="layui-input-block">
                                        <input type="password" name="newPsw" placeholder="请输入新密码" class="layui-input" lay-verType="tips" lay-verify="required|psw" required/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label layui-form-required">确认密码:</label>
                                    <div class="layui-input-block">
                                        <input type="password" name="rePsw" placeholder="请再次输入新密码" class="layui-input" lay-verType="tips" lay-verify="required|equalTo" lay-equalTo="input[name=newPsw]" required/>
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <div class="layui-input-block">
                                        <button class="layui-btn" lay-filter="submit-psw" lay-submit>修改密码</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <!-- //选项卡结束 -->
            </div>
        </div>
    </div>
</div>
<script>
    layui.use(['jquery', '@backend.profile'], function ($, profile) {
        $("#user-profile").removeClass('layui-hide');
        profile.init();
    });
</script>