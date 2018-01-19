<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\controllers;

use backend\classes\CaptchaCode;
use system\classes\Syslog;
use wulaphp\app\App;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\controller\AdminController;

/**
 * 认证控制器.
 *
 * @package backend\controllers
 */
class AuthController extends AdminController {
	/**
	 * 登录后台.
	 *
	 * @nologin
	 *
	 * @return \wulaphp\mvc\view\SmartyView
	 */
	public function index() {
		if ($this->passport->isLogin) {
			Response::redirect(App::url('backend'));
		}

		$module = App::getModule('backend');

		return view([
			'version' => $module->getCurrentVersion(),
			'website' => ['name' => App::cfg('name', 'Hello WulaCms')]
		]);
	}

	/**
	 * 登录验证.
	 * @nologin
	 *
	 * @param string $username
	 * @param string $passwd
	 * @param string $captcha 验证码
	 *
	 * @return \wulaphp\mvc\view\JsonView
	 */
	public function indexPost($username, $passwd, $captcha = '') {
		if ($this->passport->login([$username, $passwd, $captcha])) {
			Syslog::info('Login', $this->passport->uid, 'accesslog');

			return Ajax::redirect(App::url('backend'));
		} else {
			return Ajax::error($this->passport->error, 'alert');
		}
	}

	/**
	 * 验证码.
	 *
	 * @nologin
	 *
	 * @param string $type
	 * @param string $size
	 * @param int    $font
	 */
	public function captcha($type = 'png', $size = '90x30', $font = 13) {
		Response::nocache();
		$size = explode('x', $size);
		if (count($size) == 1) {
			$width  = intval($size [0]);
			$height = $width * 3 / 4;
		} else if (count($size) >= 2) {
			$width  = intval($size [0]);
			$height = intval($size [1]);
		} else {
			$width  = 60;
			$height = 20;
		}
		$font          = intval($font);
		$font          = max([18, $font]);
		$type          = in_array($type, ['gif', 'png']) ? $type : 'png';
		$auth_code_obj = new CaptchaCode ();
		// 定义验证码信息
		$arr ['code'] = ['characters' => 'A-H,J-K,M-N,P-Z,3-9', 'length' => 4, 'deflect' => true, 'multicolor' => true];
		$auth_code_obj->setCode($arr ['code']);
		// 定义干扰信息
		$arr ['molestation'] = ['type' => 'both', 'density' => 'normal'];
		$auth_code_obj->setMolestation($arr ['molestation']);
		// 定义图像信息. 设置图象类型请确认您的服务器是否支持您需要的类型
		$arr ['image'] = ['type' => $type, 'width' => $width, 'height' => $height];
		$auth_code_obj->setImage($arr ['image']);
		// 定义字体信息
		$arr ['font'] = ['space' => 5, 'size' => $font, 'left' => 5];
		$auth_code_obj->setFont($arr ['font']);
		// 定义背景色
		$arr ['bg'] = ['r' => 255, 'g' => 255, 'b' => 255];
		$auth_code_obj->setBgColor($arr ['bg']);
		$auth_code_obj->paint();
		Response::getInstance()->close(true);
	}

	/**
	 * 登出.
	 *
	 * @return null|\wulaphp\mvc\view\JsonView
	 */
	public function signout() {
		Syslog::info('Logout', $this->passport->uid, 'accesslog');
		$this->passport->logout();
		if (Request::isAjaxRequest() || rqset('ajax')) {
			return Ajax::redirect(App::url('backend/auth'));
		}
		App::redirect('backend/auth');

		return null;
	}
}