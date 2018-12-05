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
    private $cpos = 500;
    /** @var \backend\classes\Menu[] */
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
        //顶部只允许三个菜单:系统，应用，报表
        if (!in_array($id, ['system', 'apps', 'reports', 'wallet', 'site'])) {
            $hid = $id;//要被隐藏掉的id
            $id  = 'apps';
        }
        if (isset ($this->menus [ $id ])) {
            $menu = $this->menus [ $id ];
        } else {
            $menu                = new Menu($id);
            $this->menus [ $id ] = $menu;
        }

        if (isset($hid)) {//隐藏的一级
            $menu = $menu->getMenu($hid);
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
     * 独立菜单.
     *
     * @param string   $id
     * @param string   $name
     * @param string   $html
     * @param int|null $pos
     *
     * @return \backend\classes\Menu
     */
    public function &getCustomMenu($id, $name, $html, $pos = null) {
        if (!$html) {
            return null;
        }
        if (isset ($this->menus [ $id ])) {
            $menu = $this->menus [ $id ];
        } else {
            $menu                = new Menu($id);
            $this->menus [ $id ] = $menu;
        }
        if ($name) {
            $menu->name = $name;
        }
        if ($pos != null) {
            $menu->pos = $pos;
        } else if (!$menu->pos) {
            $menu->pos = $this->cpos++;
        }
        $menu->data['submenus'] = $html;

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