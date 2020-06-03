<?php

namespace backend\classes;

use wulaphp\mvc\controller\LayoutSupport;

class PjaxController extends BackendController {
    use LayoutSupport;
    protected $layout    = 'backend/views/layout';
    protected $htmlCls   = 'app';
    protected $bodyCls   = '';
    protected $pageTheme = '';

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
        $data['naviMenus'] = $menu->getMenu($this->passport);

        return $data;
    }
}