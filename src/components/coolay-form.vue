<template>
    <form class="cooly-form" action="">
            <div>
                <label>输入框</label><input type="text" placeholder="请输入安全码">
            </div>
    </form>
</template>
<script>
    layui.define((exports) => {
        Vue.component('coolay-form', {
            template: `$tpl$`,
            props: {
                info: "",
                mt: {
                    default: 0,
                },
            },
            data: function() {
                return {}
            },
            mounted() {
                console.log('coolay-form 初始化成功');
            },
        })
        exports('&coolay-form',{name:'coolay-form'});
    })
</script>
<style id="coolay-form" lang="less">
    .cooly-form {
        width: 100%;
        min-height: 200px;
        background: #fff;
        padding: 20px;
        height: 100%;
        overflow: scroll;
    }
</style>