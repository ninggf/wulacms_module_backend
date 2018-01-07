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

class ComboxField extends FormField {
	public function getName() {
		return _tr('Combox@form');
	}

	protected function renderWidget($opts) {
		$definition  = $this->options;
		$id          = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$readonly    = isset ($definition ['readonly']) ? ' data-readonly ' : '';
		$disabled    = isset ($definition ['disabled']) ? ' data-disabled ' : '';
		$placeholder = isset($definition['placeholder']) ? ' placeholder="' . $definition['placeholder'] . '"' : '';
		$url         = isset ($definition['url']) ? $definition['url'] : '';
		$parent      = isset ($definition ['parent']) ? ' data-parent="' . $definition['parent'] . '"' : '';
		$mnl         = isset ($definition ['mnl']) ? ' data-mnl="' . $definition['mnl'] . '"' : '';
		$allowClear  = isset ($definition ['allowClear']) ? ' data-allow-clear="' . ($definition['multi'] ? 'true' : 'false') . '"' : '';
		$tagMode     = isset ($definition ['tagMode']) ? ' data-tag-mode' : '';
		$multi       = isset ($definition ['multi']) ? ' data-multi="' . ($definition['multi'] ? $definition['multi'] : '') . '"' : '';
		if ($url) {
			$url = App::url($url);

			return '<input type="hidden" style="width:100%" id="' . $id . '" name="' . $this->name . '" value="' . html_escape($this->value) . '"  data-combox="' . $url . '"' . $readonly . $disabled . $placeholder . $tagMode . $allowClear . $multi . $parent . $mnl . '/>';

		} else {
			$values = (array)$this->value;
			$datas  = $this->getDataProvidor()->getData();
			$html   = [];
			$html[] = '<select style="width:100%" id="' . $id . '" name="' . $this->name . '" data-combox' . $readonly . $disabled . $placeholder . $tagMode . $allowClear . $multi . $parent . $mnl . '>';
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
}