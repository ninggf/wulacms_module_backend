{literal}
    <div id="module" v-cloak v-show="mod_show">
        <span class="module-show" @click="sid_show=!sid_show;hide_sid=0 ">自定义</span>
        <!--左侧-->
        <ul :class="{'hide':hide_sid}" v-show="sid_show">
            <i :class="[hide_sid?'layui-icon-right':'layui-icon-left','layui-icon']" @click="hide_sid=!hide_sid"></i>
            <li v-for="(item,index) in list">
                <!--{{item.name}}-->
                {{item.name}}
                <i @click="add(item,index)" :class="[item.isadd?'layui-icon-ok':'layui-icon-addition','layui-icon']"></i>
            </li>
            <li><span @click="hide_sid=1">取消</span><span @click="saveModule">保存</span></li>
        </ul>
        <!--主体-->
        <div style="width:100%;display:flex">
            <div class="module-list" style="flex-basis: 100%;">
                <div class='left' style="flex-basis: 66%;">
                    <component  draggable="true" :is="item.component"  
                        v-if="item.pos=='left'" 
                        v-for="(item,index) in module_list"
                        :style="{'flex-basis':item.width==2?'100%':'50%'}"
                        >
                    </component>
                </div>
                <div class='right'  style="flex-basis: 33%;">
                    <component :is="item.component"  
                        v-if="item.pos=='right'" 
                        v-for="(item,index) in module_list"
                        style="flex-basis:100%"
                        >
                    </component>
                </div>
            </div>
        </div>    

    </div>
    <script>
        layui.use(['@backend.module'], function (mod) {
            window.vueVm=mod.init(
                [
                    {id: 'demo.widget', name: 'demo.widget', isadd: 1,width:2,pos:'left'},
                    {id: 'demo.widget2', name: 'demo.widget2', isadd: 1,width:1,pos:'left'},
                    {id: 'demo.widget3', name: 'demo.widget3', isadd: 1,pos:'right'},
                ]
            )
        })
    </script>
{/literal}