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

class PasswordField extends FormField {
	public function getName() {
		return _tr('Password@form');
	}

	public function renderWidget($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$pl         = isset ($definition ['placeholder']) ? 'placeholder="' . $definition ['placeholder'] . '" ' : '';
		$readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled   = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$class      = isset ($definition ['class']) ? $definition['class'] : '';
		$html       = '<input id="' . $id . '" type="password" ' . $pl . $readonly . $disabled . ' name="' . $this->name . '" value="' . html_escape($this->value) . '" class="form-control ' . $class . '"/>';

		return $html;
	}

	public function getOptionForm() {
		return new PasswordFieldForm(true);
	}
}

class PasswordFieldForm extends FormTable {
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