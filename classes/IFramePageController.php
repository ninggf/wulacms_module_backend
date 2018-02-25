<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes;

use wulaphp\mvc\controller\LayoutSupport;

class IFramePageController extends BackendController {
	use LayoutSupport;
	protected $layout = 'backend/views/layout';

	protected function onInitLayoutData($data) {
		return $data;
	}
}