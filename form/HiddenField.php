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

class HiddenField extends FormField {
	public function getName() {
		return _tr('Hidden@form');
	}

	public function renderWidget($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $this->name;

		return '<input type="hidden" id="' . $id . '" name="' . $this->name . '" value="' . html_escape($this->value) . '"/>';
	}
}