<?php
/**
 *
 * User: Leo Ning.
 * Date: 2017/7/12 0012 下午 3:57
 */

namespace backend\form;

use wulaphp\form\FormField;
use wulaphp\form\FormTable;

class MultipleCheckboxFiled extends FormField {
	public function getName() {
		return _tr('Multiple Checkbox@form');
	}

	protected function renderWidget($opts) {
		$definition = $this->options;
		$data       = $this->getDataProvidor()->getData();
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$html       = [];
		$inline     = isset($definition['inline']);
		$lableCls   = $inline ? 'checkbox-inline' : 'checkbox';
		if ($data) {
			$values = $this->value;
			if (!$values) {
				$values = [];
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
						$html [] = '<label class="' . $lableCls . '"><input id="' . $id . '_' . $key . '" type="checkbox"' . $class . $readonly . $disabled . $checked . ' name="' . $this->name . '[]"' . $val . '/>' . $d . '</label>';
					} else {
						$html [] = '<div class="checkbox">';
						$html [] = '<label><input id="' . $id . '_' . $key . '" type="checkbox"' . $class . $readonly . $disabled . $checked . ' name="' . $this->name . '[]"' . $val . '/>' . $d . '</label>';
						$html [] = '</div>';
					}
				}
			}
		}

		return implode('', $html);
	}

	public function getOptionForm() {
		return new MultipleCheckboxForm(true);
	}
}

class MultipleCheckboxForm extends FormTable {
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