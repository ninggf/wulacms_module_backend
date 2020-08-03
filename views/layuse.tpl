<div class="workspace">
    <component is="demo-index"></component>
</div>
<script type="text/javascript">
    layui.use(['@demo.index'],(item)=>{
        new Vue({
            el     : '.workspace',
            data   : {
            },
            methods: {
            },
            mounted() {
                console.log('module')
            },
        }); 
    })
   
</script>