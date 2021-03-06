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

use wulaphp\app\App;
use wulaphp\io\Response;
use wulaphp\mvc\controller\AdminController;

class BackendController extends AdminController {
	public function beforeRun($action, $refMethod) {
		$domain = App::cfg('domain');
		if ($domain && $_SERVER['HTTP_HOST'] != $domain) {
			Response::respond(404);
		}
		$view = parent::beforeRun($action, $refMethod);

		return $view;
	}
}