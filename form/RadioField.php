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

use wulaphp\form\FormField;
use wulaphp\form\FormTable;

class RadioField extends FormField {
    public function getName() {
        return _tr('Radio@form');
    }

    public function renderWidget($opts = []) {
        $definition = $this->options;
        $data       = $this->getDataProvidor()->getData();
        $id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
        $html       = [];
        $inline     = isset($definition['inline']);
        $lableCls   = $inline ? 'radio-inline' : 'radio';
        if ($data) {
            $values = $this->value;
            if (!$values) {
                if (is_numeric($values)) {
                    $values = [0];
                } else {
                    $values = [];
                }
            }
            if ($values && !is_array($values)) {
                $values = explode(',', $values);
            }
            $readonly = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
            $disabled = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
            $class    = isset ($definition ['class']) ? ' class="' . $definition['class'] . '" ' : '';
            foreach ($data as $key => $d) {
                $checked = '';
                if ($d) {
                    $val = ' value="' . $key . '" ';
                    if (in_array($key, $values)) {
                        $checked = ' checked="checked" ';
                    }
                    if ($inline) {
                        $html [] = '<label class="' . $lableCls . '"><input id="' . $id . '_' . $key . '" type="radio"' . $class . $readonly . $disabled . $checked . ' name="' . $this->name . '"' . $val . '/>' . $d . '</label>';
                    } else {
                        $html [] = '<div class="radio">';
                        $html [] = '<label><input id="' . $id . '_' . $key . '" type="radio"' . $class . $readonly . $disabled . $checked . ' name="' . $this->name . '"' . $val . '/>' . $d . '</label>';
                        $html [] = '</div>';
                    }
                }
            }
        }

        return implode('', $html);
    }

    public function getOptionForm() {
        return new RadioFieldForm(true);
    }
}

/**
 * Class RadioFieldForm
 * @package backend\form
 * @internal
 */
class RadioFieldForm extends FormTable {
    public $table = null;
    /**
     * 一行显示
     * @var \backend\form\CheckboxField
     * @type bool
     * @layout 1,col-xs-9
     */
    public $inline = 0;
    /**
     * 自定义CSS类
     * @var \backend\form\TextField
     * @type string
     * @layout 1,col-xs-3
     */
    public $class;
}