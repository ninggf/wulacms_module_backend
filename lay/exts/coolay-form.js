/** coolay-v1.0.0 MIT License By https://github.com/ninggf/coolayui */
 ;layui.injectCss("cmp-coolay-form",".cooly-form{font-size:12px;width:100%;min-height:200px;background:#fff;padding:20px}.cooly-form fieldset{padding:10px}.cooly-form fieldset legend{font-size:16px;margin-left:20px;padding:0 8px}.cooly-form fieldset>div{position:relative;display:flex;flex-flow:row wrap;font-size:12px}.cooly-form fieldset>div *{box-sizing:border-box}.cooly-form fieldset>div label{text-overflow:ellipsis;overflow:hidden;white-space:nowrap;border:1px solid #e6e6e6;border-right:none;height:30px;line-height:28px;display:inline-block;vertical-align:top;text-align:right;padding-right:20px;background-color:#fbfbfb;flex-basis:15%;min-width:160px;font-size:12px}.cooly-form fieldset>div input[type=text],.cooly-form fieldset>div select,.cooly-form fieldset>div textarea{height:30px;line-height:28px;border:1px solid #e6e6e6;vertical-align:top;padding-left:20px;flex-basis:50%;font-size:12px;transition:all 360ms ease 0s;flex-grow:1;margin-bottom:10px}.cooly-form fieldset>div input[type=text]:focus,.cooly-form fieldset>div input[type=text]:hover,.cooly-form fieldset>div select:focus,.cooly-form fieldset>div select:hover,.cooly-form fieldset>div textarea:focus,.cooly-form fieldset>div textarea:hover{border-color:#87ceeb}.cooly-form fieldset>div textarea{min-height:100px;line-height:1.4;padding:10px;transition:none}.cooly-form fieldset>div p{flex:1;line-height:28px;padding-left:10px;color:gray;flex-basis:30%;font-size:12px}.cooly-form fieldset>div i{font-size:14px;vertical-align:middle;margin-right:4px}.cooly-form fieldset>div.check-box>div,.cooly-form fieldset>div.radio>div{flex-basis:50%;flex-grow:1;flex-flow:row wrap;display:flex;overflow:auto;width:600px;border:1px solid #e6e6e6;margin-bottom:10px}.cooly-form fieldset>div.check-box span,.cooly-form fieldset>div.radio span{margin:10px;position:relative}.cooly-form fieldset>div.check-box span input,.cooly-form fieldset>div.radio span input{width:15px;height:15px;vertical-align:bottom;margin-right:2px}"),layui.define(function(e){Vue.component("coolay-form",{template:'<form class="cooly-form" action="">\n        <fieldset>\n            <legend>选项一</legend>\n            <div>\n                <label>输入框</label><input type="text" placeholder="请输入安全码">\n                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>\n            </div>\n            <div>\n                <label>select</label>\n                <select>\n                    <option value="volvo">Volvo</option>\n                    <option value="saab">Saab</option>\n                    <option value="opel">Opel</option>\n                    <option value="audi">Audi</option>\n                </select>\n                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>\n            </div>\n            \n            <div>\n                <label>textarea</label>\n                <textarea name="" id="" cols="30" rows="10"></textarea>\n                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>\n            </div>\n            \n            <div class="radio">\n                <label>radio</label>\n                <div >\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                    <span><input type="radio" name="sex" value="male" />Male</span>\n                </div>\n                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>\n            </div>\n\n            <div class="check-box">\n                <label>check-box</label>\n                <div>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                    <span><input type="checkbox"  value="male" />Male</span>\n                </div>\n                <p><i class="layui-icon layui-icon-tips"></i>说明说明</p>\n            </div>\n        </fieldset>\n    </form>',props:{info:"",mt:{default:0}},data:function(){return{}},mounted:function(){}}),e("&coolay-form")});