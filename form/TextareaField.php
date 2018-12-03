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

class TextareaField extends FormField {
	public function getName() {
		return _tr('Textarea@from');
	}

	public function renderWidget($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$row        = isset ($definition ['row']) ? $definition ['row'] : '3';

		$definition ['value'] = html_escape($definition ['value']);
		$readonly             = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled             = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$placeholder          = isset ($definition ['placeholder']) ? ' placeholder="' . $definition ['placeholder'] . '" ' : '';
		$class                = isset ($definition ['class']) ? $definition['class'] : '';
		$html []              = '<textarea id="' . $id . '" rows="' . $row . '"' . $readonly . $disabled . $placeholder . ' name="' . $this->name . '" class="form-control ' . $class . '">' . html_escape($this->value) . '</textarea>';

		return implode('', $html);
	}

	public function getOptionForm() {
		return new TextareaFieldForm(true);
	}
}

/**
 * Class TextareaFieldForm
 * @package backend\form
 * @internal
 */
class TextareaFieldForm extends FormTable {
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
	 * 行数
	 * @var \backend\form\TextField
	 * @type int
	 * @digits
	 * @layout 1,col-xs-3
	 */
	public $row = 3;
}
