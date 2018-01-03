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

use wulaphp\util\ArrayCompare;

/**
 * 控制台界面类，用于管理导航菜单.
 */
class DashboardUI {
	private $cpos  = 500;
	private $menus = [];

	/**
	 * 获取导航菜单.
	 *
	 * @param string   $id   菜单ID
	 * @param string   $name 菜单名称
	 * @param int|null $pos  位置
	 *
	 * @return Menu Menu实例的引用
	 */
	public function &getMenu($id, $name = '', $pos = null) {
		$ids = explode('/', trim($id, '/'));
		$id  = array_shift($ids);
		if (isset ($this->menus [ $id ])) {
			$menu = $this->menus [ $id ];
		} else {
			$menu                = new Menu($id);
			$this->menus [ $id ] = &$menu;
		}
		if ($ids) {
			foreach ($ids as $id) {
				$menu = $menu->getMenu($id);
			}
		}
		if ($name) {
			$menu->name = $name;
		}
		if ($pos != null) {
			$menu->pos = $pos;
		} else if (!$menu->pos) {
			$menu->pos = $this->cpos++;
		}

		return $menu;
	}

	/**
	 * 获取菜单数据.
	 *
	 * @param bool $group 是否启用分组(在下拉菜单时有用)
	 *
	 * @return array 菜单数据
	 */
	public function menuData($group = false) {
		$menus = ['menus' => []];
		/** @var \backend\classes\Menu $menu */
		foreach ($this->menus as $menu) {
			$menus['menus'][] = $menu->data($group);
		}
		usort($menus['menus'], ArrayCompare::compare('pos'));
		//处理分组
		if ($group) {
			$gdata = [];
			foreach ($menus['menus'] as $cd) {
				$gp = $cd['group'];
				unset($cd['group']);
				$gdata[ $gp ][] = $cd;
			}
			$_tpmenus = [];
			foreach ($gdata as $gds) {
				$_tpmenus   = array_merge($_tpmenus, $gds);
				$_tpmenus[] = ['name' => 'divider'];
			}
			array_pop($_tpmenus);
			$menus['menus'] = $_tpmenus;
		}

		return $menus;
	}
}