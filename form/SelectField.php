<?php
/**
 *
 * User: Leo Ning.
 * Date: 2017/7/13 0013 上午 11:24
 */

namespace backend\form;

use wulaphp\form\FormField;
use wulaphp\form\FormTable;

class SelectField extends FormField {
	public function getName() {
		return _tr('Select@form');
	}

	protected function renderWidget($opts) {
		$definition  = $this->options;
		$data        = $this->getDataProvidor()->getData();
		$id          = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$readonly    = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled    = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$placeholder = isset ($definition ['placeholder']) ? ' placeholder="' . $definition ['placeholder'] . '" ' : '';
		$class       = isset ($definition ['class']) ? $definition['class'] : '';
		$multiple    = isset ($definition ['multiple']) ? ' multiple ' : '';
		$html []     = '<select id="' . $id . '" class="form-control ' . $class . '" name="' . $definition ['name'] . '"' . $multiple . $readonly . $disabled . $placeholder . '>';

		if ($data) {
			foreach ($data as $key => $d) {
				if ($key == $this->value) {
					$html [] = '<option value="' . $key . '" selected="selected">' . $d . '</option>';
				} else {
					$html [] = '<option value="' . $key . '">' . $d . '</option>';
				}
			}
		}
		$html [] = '</select>';

		return implode('', $html);
	}

	public function getOptionForm() {
		return new SelectFieldForm(true);
	}
}

class SelectFieldForm extends FormTable {
	public $table = null;
	/**
	 * 提示符
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 1,col-xs-6
	 */
	public $placeholder = '';
	/**
	 * 自定义CSS类
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 1,col-xs-3
	 */
	public $class;
	/**
	 * 多选
	 * @var \backend\form\CheckboxField
	 * @type bool
	 * @layout 1,col-xs-3
	 */
	public $multiple = 0;
}