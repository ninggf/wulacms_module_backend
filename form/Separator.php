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

class Separator extends FormField {
	public function getName() {
		return _tr('Separator@form');
	}

	protected function renderWidget($opts) {
		return '<div class="line line-dashed line-lg pull-in"></div>';
	}
}