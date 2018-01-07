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
		$m          = false;
		if ($definition['type'] == '[]' || $definition['type'] == 'array') {
			$name  = $this->name . '[]';
			$m     = true;
			$class .= ' multi';
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
				$html[] = '<input id="' . $id . $ik . '" type="text" ' . $pl . $readonly . $disabled . ' name="' . $name . '" value="' . html_escape($v) . '" class="form-control ' . $class . '"/>';
			}
			$html = implode('', $html);
		} else {
			$html = '<input id="' . $id . '" type="text" ' . $pl . $readonly . $disabled . ' name="' . $name . '" value="' . html_escape($this->value) . '" class="form-control ' . $class . '"/>';
		}

		return $html;
	}
}