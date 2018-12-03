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

class TextField extends FormField {
    public function getName() {
        return _tr('Text@form');
    }

    public function renderWidget($opts = []) {
        $definition = $this->options;
        $id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
        $pl         = isset ($definition ['placeholder']) ? 'placeholder="' . $definition ['placeholder'] . '" ' : '';
        $readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
        $disabled   = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
        $class      = isset ($definition ['class']) ? $definition['class'] : '';
        $prepends   = isset ($definition ['prepend']) ? $definition['prepend'] : false;
        $appends    = isset ($definition ['append']) ? $definition['append'] : false;
        if ($prepends && method_exists($this->form, $prepends)) {
            $appends = $this->form->{$prepends}();
        } else {
            $prepends = false;
        }
        if ($appends && method_exists($this->form, $appends)) {
            $appends = $this->form->{$appends}();
        } else {
            $appends = false;
        }
        $pends = $prepends || $appends;
        $m     = false;
        if ($definition['type'] == '[]' || $definition['type'] == 'array') {
            $name  = $this->name . '[]';
            $m     = true;
            $class .= ' multi';
            if (!$pends) {
                $class .= ' m-b';
            }
        } else {
            $name = $this->name;
        }
        if ($m) {
            $html   = [];
            $values = [''];
            if ($this->value) {
                if (!is_array($this->value)) {
                    $values = [$this->value];
                } else {
                    $values = $this->value;
                }
            }
            foreach ($values as $ik => $v) {
                if ($pends) {
                    $html[] = '<div class="input-group m-b">';
                }
                if ($prepends) {
                    $html[] = $prepends;
                }
                $html[] = '<input id="' . $id . $ik . '" autocomplete="off" type="text" ' . $pl . $readonly . $disabled . ' name="' . $name . '" value="' . html_escape($v) . '" class="form-control ' . $class . '"/>';
                if ($appends) {
                    $html[] = $appends;
                }
                if ($pends) {
                    $html[] = '</div>';
                }
            }
            $html = implode('', $html);
        } else {
            $html = [];
            if ($pends) {
                $html[] = '<div class="input-group">';
            }
            if ($prepends) {
                $html[] = $prepends;
            }
            $html[] = '<input id="' . $id . '" autocomplete="off" type="text" ' . $pl . $readonly . $disabled . ' name="' . $name . '" value="' . html_escape($this->value) . '" class="form-control ' . $class . '"/>';
            if ($appends) {
                $html[] = $appends;
            }
            if ($pends) {
                $html[] = '</div>';
            }
            $html = implode('', $html);
        }

        return $html;
    }

    public function getOptionForm() {
        return new TextFieldForm(true);
    }
}

/**
 * Class TextFieldForm
 * @package backend\form
 * @internal
 */
class TextFieldForm extends FormTable {
    public $table = null;
    /**
     * 提示符
     * @var \backend\form\TextField
     * @type string
     * @layout 1,col-xs-9
     */
    public $placeholder = '';
    /**
     * 自定义CSS类
     * @var \backend\form\TextField
     * @type string
     * @layout 1,col-xs-3
     */
    public $class;
}