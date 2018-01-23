<?php

namespace backend;

use backend\classes\AdminPassport;
use backend\classes\CommonSetting;
use wula\cms\CmfModule;
use wulaphp\app\App;
use wulaphp\auth\Passport;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
/**
 * 管理后台模块
 * @group kernel
 */
class BackendModule extends CmfModule {
	public function getName() {
		return '管理后台';
	}

	public function getDescription() {
		return '基于bootstrap && layui的管理后台。';
	}

	public function getHomePageURL() {
		return 'https://www.wulacms.com/modules/backend';
	}

	public function getAuthor() {
		return 'Leo Ning';
	}

	/**
	 * @param Passport $passport
	 *
	 * @filter passport\newAdminPassport
	 *
	 * @return Passport
	 */
	public static function createAdminPassport($passport) {
		if ($passport instanceof Passport) {
			$passport = new AdminPassport();
		}

		return $passport;
	}

	/**
	 * 需要登录才能操作.
	 *
	 * @param $view
	 *
	 * @filter mvc\admin\needLogin
	 * @return \wulaphp\mvc\view\View
	 */
	public static function onNeedLogin($view) {
		App::redirect('backend/auth');

		return $view;
	}

	/**
	 * @param mixed  $view
	 * @param string $message
	 *
	 * @filter mvc\admin\onDenied $message
	 * @return \wulaphp\mvc\view\View
	 */
	public static function onDenied($view, $message) {
		if (!$view) {
			if (Request::isAjaxRequest()) {
				$view = Ajax::fatal($message ? $message : '权限受限，请联系管理员', 403);
			} else {
				Response::respond(403, '权限受限，请联系管理员');
			}
		}

		return $view;
	}

	public function getVersionList() {
		$v['1.0.0'] = '管理后台的第一个版本';

		return $v;
	}

}

function get_system_settings() {
	return apply_filter('backend/settings', [
		'default' => new CommonSetting(),
	]);
}

App::register(new BackendModule());