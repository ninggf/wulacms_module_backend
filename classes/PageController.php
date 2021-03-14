<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes;

use wulaphp\mvc\controller\LayoutSupport;

class PageController extends AuthedController {
    use LayoutSupport;

    protected $layout    = 'backend/views/layout';
    protected $htmlCls   = 'app';
    protected $bodyCls   = '';
    protected $pageTheme = '';
    protected $pageTitle;

    /**
     * 配置布局数。
     *
     * @param string|array $cfg
     * @param string       $value
     *
     * @return $this
     */
    protected function layoutCfg($cfg, $value = ''): PageController {
        if (is_array($cfg)) {
            foreach ($cfg as $c => $v) {
                if (in_array($c, ['htmlCls', 'bodyCls', 'pageTheme', 'pageTitle'])) {
                    $this->{$c} = $value;
                }
            }
        } else {
            if (in_array($cfg, ['htmlCls', 'bodyCls', 'pageTheme', 'pageTitle'])) {
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
    protected function onInitLayoutData(array $data): array {
        $meta              = PageMetaData::meta($this->passport);
        $data['htmlCls']   = $this->htmlCls;
        $data['bodyCls']   = $this->bodyCls;
        $data['pageTheme'] = $this->pageTheme;
        $data['pageTitle'] = $this->pageTitle ?? $this->ctrName . ' - ' . $this->module->getName();

        return array_merge($data, $meta);
    }
}