<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\form;

use wulaphp\app\App;
use wulaphp\form\FormField;
use wulaphp\form\FormTable;

class ComboxField extends FormField {
    public function getName() {
        return _tr('Combox@form');
    }

    protected function renderWidget($opts) {
        $definition  = $this->options;
        $id          = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
        $readonly    = isset ($definition ['readonly']) ? ' data-readonly ' : '';
        $disabled    = isset ($definition ['disabled']) ? ' data-disabled ' : '';
        $placeholder = isset ($definition ['placeholder']) ? ' placeholder="' . $definition['placeholder'] . '"' : '';
        $url         = isset ($definition ['url']) ? $definition['url'] : '';
        $parent      = isset ($definition ['parent']) ? ' data-parent="' . $definition['parent'] . '"' : '';
        $mnl         = isset ($definition ['mnl']) ? ' data-mnl="' . $definition['mnl'] . '"' : '';
        $mxl         = isset ($definition ['mxl']) ? ' data-mxl="' . $definition['mxl'] . '"' : '';
        $allowClear  = isset ($definition ['allowClear']) ? ' data-allow-clear="' . ($definition['multi'] ? 'true' : 'false') . '"' : '';
        $tagMode     = isset ($definition ['tagMode']) ? ' data-tag-mode' : '';
        $multi       = isset ($definition ['multi']) ? ' data-multi="' . ($definition['multi'] ? $definition['multi'] : '') . '"' : '';
        if ($tagMode && isset($definition ['tags']) && $definition['tags']) {
            $tagMode .= '="' . html_escape($definition ['tags']) . '"';
        }
        if ($url) {
            $url = App::url($url);

            return '<input type="hidden" style="width:100%" id="' . $id . '" name="' . $this->name . '" value="' . html_escape($this->value) . '"  data-combox="' . $url . '"' . $readonly . $disabled . $placeholder . $tagMode . $allowClear . $multi . $parent . $mnl . $mxl . '/>';

        } else if ($tagMode) {
            if ($url) {
                $url = App::url($url);
            }

            return '<input type="hidden" style="width:100%" id="' . $id . '" name="' . $this->name . '" value="' . html_escape($this->value) . '"  data-combox="' . $url . '"' . $readonly . $disabled . $placeholder . $tagMode . $multi . $mxl . '/>';
        } else {
            $values = (array)$this->value;
            $datas  = $this->getDataProvidor()->getData();
            $html   = [];
            $html[] = '<select style="width:100%" id="' . $id . '" name="' . $this->name . '" data-combox' . $readonly . $disabled . $placeholder . $tagMode . $allowClear . $multi . $parent . $mnl . $mxl . '>';
            foreach ((array)$datas as $dds) {
                if (isset($dds['children'])) {
                    $html[] = '<optgroup>';
                    foreach ($dds['children'] as $dd) {
                        $selected = in_array($dds['id'], $values) ? ' selected="selected" ' : '';
                        $html[]   = '<option ' . $selected . ' value="' . html_escape($dd['id']) . '">' . html_escape($dd['text']) . '</option>';
                    }
                    $html[] = '</optgroup>';
                } else {
                    $selected = in_array($dds['id'], $values) ? ' selected="selected" ' : '';
                    $html[]   = '<option ' . $selected . ' value="' . html_escape($dds['id']) . '">' . html_escape($dds['text']) . '</option>';
                }
            }
            $html[] = '</select>';

            return implode("\n", $html);
        }
    }

    public function getOptionForm() {
        return new ComboxFieldForm(true);
    }
}

/**
 * Class ComboxFieldForm
 * @package backend\form
 * @internal
 */
class ComboxFieldForm extends FormTable {
    public $table = null;
    /**
     * 提示符
     * @var \backend\form\TextField
     * @type string
     * @layout 1,col-xs-6
     */
    public $placeholder = '';
    /**
     * 上级ID(级联选框)
     * @var \backend\form\TextField
     * @type string
     * @layout 1,col-xs-6
     */
    public $parent;
    /**
     * 获取数据URL
     * @var \backend\form\TextField
     * @type string
     * @layout 2,col-xs-12
     */
    public $url;
    /**
     * 启动查询字符数量
     * @var \backend\form\TextField
     * @type int
     * @digits
     * @layout 4,col-xs-6
     */
    public $mnl = 1;
    /**
     * 最多选择多少个(0为单选)
     * @var \backend\form\TextField
     * @type int
     * @digits
     * @layout 4,col-xs-6
     */
    public $multi = 0;
    /**
     * 允许清空
     * @var \backend\form\CheckboxField
     * @type bool
     * @layout 6,col-xs-6
     */
    public $allowClear = 1;
    /**
     * 标签模式
     * @var \backend\form\CheckboxField
     * @type bool
     * @layout 6,col-xs-6
     */
    public $tagMode = 0;
}