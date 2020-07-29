{literal}
<div id="module" v-cloak v-show="mod_show">
    <span class="module-show" @click="sid_show=!sid_show;hide_sid=0 ">自定义</span>
    <transition name="fade">
        <ul :class="{'hide':hide_sid}" v-show="sid_show">
            <i :class="[hide_sid?'layui-icon-right':'layui-icon-left','layui-icon']" @click="hide_sid=!hide_sid"></i>
            <li v-for="(item,index) in list">
                <!--{{item.name}}-->
                {{item.name}}
                <i @click="addModule(item,index)" :class="[item.isadd?'layui-icon-ok':'layui-icon-addition','layui-icon']"></i>
            </li>
            <li><span @click="hide_sid=1">取消</span><span @click="saveModule">保存</span></li>
        </ul>
    </transition>
    <transition name="fade">
        <div class="module-list" v-show="sid_show">
            <div v-for="(item,index) in module_list" :style="{'flex-basis':item.width+'%'}">{{item.name}}</div>
        </div>
    </transition>
    <transition name="fade">
        <div class="module-list mian-module-list" v-show="!sid_show">
            <div v-for="(item,index) in module_list" :style="{'flex-basis':item.width+'%'}">{{item.name}}</div>
        </div>
    </transition>
</div>
<script>
    layui.use(['@backend.module'], function(mod) {
               mod.init([
                   {id:1,name:'demo.widget',isadd:0,width:100},
                   {id:2,name:'demo.widget2',isadd:0,width:50},
               ])
        
    }) 
</script>
{/literal}