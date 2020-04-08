<template>
    <form class="cooly-form" action="">
        <fieldset>
            <legend>选项一</legend>
            <div>
                <label>输入框</label><input type="text" placeholder="请输入安全码">
                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>
            </div>
            <div>
                <label>select</label>
                <select>
                    <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="opel">Opel</option>
                    <option value="audi">Audi</option>
                </select>
                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>
            </div>
            
            <div>
                <label>textarea</label>
                <textarea name="" id="" cols="30" rows="10"></textarea>
                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>
            </div>
            
            <div class="radio">
                <label>radio</label>
                <div >
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                    <span><input type="radio" name="sex" value="male" />Male</span>
                </div>
                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>
            </div>

            <div class="check-box">
                <label>check-box</label>
                <div>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                    <span><input type="checkbox"  value="male" />Male</span>
                </div>
                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>
            </div>
        </fieldset>
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
                console.log('coolay-form');
            },
        })
        exports('&coolay-form');
    })
</script>
<style id="coolay-form" lang="less">
    .cooly-form {
        font-size: 12px;
        width: 100%;
        min-height: 200px;
        background: #fff;
        padding: 20px;

        fieldset {
            padding: 10px;

            legend {
                font-size: 16px;
                margin-left: 20px;
                padding: 0 8px;
            }

            &>div {
                position: relative;
                display: flex;
                flex-flow: row wrap;
                font-size: 12px;

                * {
                    box-sizing: border-box;

                }

                label {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    border: 1px solid #e6e6e6;
                    border-right:none;
                    height: 30px;
                    line-height: 28px;
                    display: inline-block;
                    vertical-align: top;
                    text-align: right;
                    padding-right: 20px;
                    background-color: #FBFBFB;
                    flex-basis: 15%;
                    min-width: 160px;
                    font-size: 12px;
                }
                input[type="text"],
                select,
                textarea {
                    height: 30px;
                    line-height: 28px;
                    border: 1px solid #e6e6e6;
                    vertical-align: top;
                    padding-left: 20px;
                    flex-basis: 50%;
                    font-size: 12px;
                    transition: all 360ms ease 0s;
                    flex-grow: 1;
                    margin-bottom:10px;
                    &:hover,
                    &:focus {
                        border-color: skyblue;
                    }
                }
                
                

                textarea {
                    min-height: 100px;
                    line-height: 1.4;
                    padding: 10px;
                    transition: none;
                }
                p {
                    flex: 1;
                    line-height: 28px;
                    padding-left: 10px;
                    color: gray;
                    flex-basis: 30%;
                    font-size: 12px;
                }

                i {
                    font-size: 14px;
                    vertical-align: middle;
                    margin-right: 4px;
                }

                &.radio,&.check-box{
                    &>div{
                        flex-basis: 50%;
                        flex-grow: 1;
                        flex-flow: row wrap;
                        display: flex;
                        overflow: auto;
                        width:600px;
                            border: 1px solid #e6e6e6;
                            margin-bottom:10px;
                    }
                    span{
                        margin: 10px;
                        position:relative;
                        input{
                            width: 15px;
                            height: 15px;
                            vertical-align: bottom;
                            margin-right:2px;
                        }
                    }
                }
            }
        }
    }
</style>