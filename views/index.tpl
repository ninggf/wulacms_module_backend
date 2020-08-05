{literal}
    <div id="module" v-cloak v-show="mod_show">
        <span class="module-show" @click="sid_show=!sid_show;hide_sid=0 ">自定义</span>

        <ul :class="{'hide':hide_sid}" v-show="sid_show">
            <i :class="[hide_sid?'layui-icon-right':'layui-icon-left','layui-icon']" @click="hide_sid=!hide_sid"></i>
            <li v-for="(item,index) in list">
                <!--{{item.name}}-->
                {{item.name}}
                <i @click="add(item,index)" :class="[item.isadd?'layui-icon-ok':'layui-icon-addition','layui-icon']"></i>
            </li>
            <li><span @click="hide_sid=1">取消</span><span @click="saveModule">保存</span></li>
        </ul>

        <transition name="fade">
            <div class="module-list" v-show="sid_show">
                <div v-for="(item,index) in module_list" :style="{'flex-basis':item.width+'%'}">
                    {{item.name}}aaa
                    <component :is="item.component"></component>
                </div>
            </div>
        </transition>
        <transition name="fade">
            <div class="module-list mian-module-list" v-show="!sid_show">
                <div v-for="(item,index) in module_list" :style="{'flex-basis':item.width+'%'}">
                    {{item.name}}bbb
                    <component :is="item.component"></component>
                </div>
            </div>
        </transition>
    </div>
    <script>
        layui.use(['@backend.module'], function (mod) {
            window.vueVm=mod.init([
                {id: 'demo.widget', name: 'demo.widget', isadd: 1},
                {id: 'demo.widget2', name: 'demo.widget2', isadd: 0},
            ])
        })
    </script>
{/literal}