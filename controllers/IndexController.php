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

use backend\classes\DashboardUI;
use wulaphp\app\App;
use wulaphp\mvc\controller\AdminController;
use function backend\get_system_settings;

class IndexController extends AdminController {

	public function index() {
		$ui = new DashboardUI();
		if ($this->passport->cando('m:system')) {
			$system            = $ui->getMenu('system', '系统', 999999);
			$system->icon      = '&#xe628;';
			$system->iconCls   = 'layui-icon';
			$system->iconStyle = "color:orange";
			// 设置
			if ($this->passport->cando('m:system/setting')) {
				$setting       = $system->getMenu('setting', '设置', 999995);
				$setting->icon = '&#xe689;';
				$setting->url  = App::url('backend/setting');
				//通知其它模块提供配置
				$settings = get_system_settings();
				if ($settings) {
					/**@var \backend\classes\Setting $cfg */
					foreach ($settings as $sid => $cfg) {
						if ($this->passport->cando($sid . ':system/setting')) {
							$base = $setting->getMenu($sid, $cfg->getName());
							$url  = $cfg->getURL();
							if ($url) {
								$base->data['url'] = $url;
							} else {
								$base->data['url'] = $setting->url . '/' . $sid;
							}
							$base->icon      = $cfg->getIcon();
							$base->iconCls   = $cfg->getIconCls();
							$base->iconStyle = $cfg->getIconStyle();
						}
					}
				}
				$setting->url = '';
			}
			if ($this->passport->is('开发人员')) {
				$doc              = $system->getMenu('helpdoc', '文档', 999998);
				$doc->data['url'] = App::url('backend/doc');
				$doc->icon        = '&#xe6bc;';
			}
		}
		fire('dashboard\initUI', $ui);
		$data = $ui->menuData();

		// 用户菜单
		$uileft = new DashboardUI();
		fire('dashboard\initUserMenu', $uileft);

		$lf           = $uileft->menuData();
		$data['user'] = $lf['menus'];

		$module = App::getModuleById('backend');

		$data = [
			'menu'    => $data,
			'ui'      => $ui,
			'appmode' => APP_MODE,
			'version' => $module->getCurrentVersion()
		];

		$data['website']['name'] = App::cfg('name', 'Hello WulaCms');

		return view($data);
	}

	public function home() {
		$data['title']         = '后台主页';
		$data['workspaceView'] = './index/home.tpl';

		return view('layout', $data);
	}
}