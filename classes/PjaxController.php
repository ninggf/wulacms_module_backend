<?php

namespace backend\classes;

use wulaphp\mvc\controller\LayoutSupport;
use wulaphp\mvc\view\View;

class PjaxController extends BackendController {
    use LayoutSupport;

    protected $layout    = 'backend/views/layout';
    protected $htmlCls   = 'app';
    protected $bodyCls   = '';
    protected $pageTheme = '';

    /**
     * 使用组件.
     *
     * @param string $comp 组件名（必须符合wulacms的组件规范)
     * @param array  $data 数据
     *
     * @return \wulaphp\mvc\view\View
     */
    protected final function layuiUse(string $comp, array $data = []): View {
        $fullComp                = '@' . $this->module->getNamespace() . '.' . $comp;
        $uses                    = "['" . $fullComp . "']";
        $code                    = 'layui.use(' . $uses . ', function(' . $comp . ') {' . $comp . '.init()})';
        $data['use_script_code'] = $code;

        return $this->render('~backend/views/layuse', $data);
    }

    /**
     * 配置布局数。
     *
     * @param string|array $cfg
     * @param string       $value
     *
     * @return LayoutSupport
     */
    protected function layoutCfg($cfg, $value = '') {
        if (is_array($cfg)) {
            foreach ($cfg as $c => $v) {
                if (in_array($c, ['htmlCls', 'bodyCls', 'pageTheme'])) {
                    $this->{$c} = $value;
                }
            }
        } else {
            if (in_array($cfg, ['htmlCls', 'bodyCls', 'pageTheme'])) {
                $this->{$cfg} = $value;
            }
        }

        return $this;
    }

    /**
     * 初始化布局数据.
     *
     * @param array $data
     *
     * @return mixed
     */
    protected function onInitLayoutData($data) {
        $data['htmlCls']   = $this->htmlCls;
        $data['bodyCls']   = $this->bodyCls;
        $data['pageStyle'] = $this->pageTheme;
        $menu              = new Menu();
        $data['naviMenus'] = json_encode($menu->getMenu($this->passport), JSON_UNESCAPED_UNICODE);

        return $data;
    }
}