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

class WelcomeWidget extends Widget {
	public function name() {
		return '欢迎';
	}

	public function render() {
		$data['my']        = whoami('admin');
		$data['accessLog'] = $data['my']->cando('m:system/logs');

		return $this->load('backend/views/widget/welcome', $data);
	}

	public function defaultWidth() {
		return 4;
	}

	public function minWidth() {
		return 4;
	}
}