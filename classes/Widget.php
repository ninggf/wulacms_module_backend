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

use backend\classes\widget\CacheWidget;
use backend\classes\widget\SystemStatusWidget;
use backend\classes\widget\WelcomeWidget;
use wulaphp\app\App;
use wulaphp\mvc\view\Renderable;
use wulaphp\mvc\view\SmartyView;

/**
 * 小部件基类.
 *
 * @package backend\classes
 */
abstract class Widget implements Renderable {
	//已经注册的小部件
	private static $WIDGETS = [];
	private        $cfg     = [];

	/**
	 * 注册一个小部件.
	 *
	 * @param string                  $id
	 * @param \backend\classes\Widget $widget
	 */
	public static function register($id, Widget $widget) {
		self::$WIDGETS[ $id ] = $widget;
	}

	/**
	 * 小部件集合.
	 * @return array id/widget
	 */
	public static function widgets() {
		if (empty(self::$WIDGETS)) {
			Widget::register('welcome', new WelcomeWidget());
			Widget::register('system', new SystemStatusWidget());
			Widget::register('cache', new CacheWidget());
			fire('on_register_widget');
		}

		return self::$WIDGETS;
	}

	/**
	 * 设置配置.
	 *
	 * @param array $cfg
	 */
	public function setCfg($cfg) {
		$this->cfg = $cfg;
	}

	/**
	 * 加载小部件视图.
	 *
	 * @param string $tpl
	 * @param array  $data
	 *
	 * @return string
	 * @throws
	 */
	public function load($tpl, $data = []) {
		$tpl    = explode('/', $tpl);
		$tpl[0] = App::id2dir($tpl[0]);
		$tpl    = implode('/', $tpl);
		$view   = new SmartyView($data, $tpl);
		try {
			return $view->render();
		} catch (\Exception $e) {
			return $e->getMessage();
		}
	}

	/**
	 * 最小宽度.
	 * @return int
	 */
	public function minWidth() {
		return 1;
	}

	/**
	 * 默认宽度.
	 *
	 * @return int
	 */
	public function defaultWidth() {
		return 6;
	}

	/**
	 * 自定义配置表单.
	 *
	 * @return \wulaphp\form\FormTable
	 */
	public function settingForm() {
		return null;
	}

	/**
	 * js脚本.
	 *
	 * @return string
	 */
	public function script() {
		return null;
	}

	/**
	 * 提示badge.
	 *
	 * @return int
	 */
	public function badge() {
		return 0;
	}

	/**
	 * 小部件名称.
	 * @return string
	 */
	public abstract function name();
}