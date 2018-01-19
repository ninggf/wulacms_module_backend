<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes\widget;

use backend\classes\Widget;

class SystemStatusWidget extends Widget {
	public function name() {
		return '系统状态';
	}

	public function render() {
		return $this->load('backend/views/widget/system');
	}

	public function script() {
		return 'backend/views/widget/system';
	}
}