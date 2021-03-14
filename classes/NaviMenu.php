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
class NaviMenu {
    private $cpos = 500;
    /** @var MenuItem[] */
    private $menus = [];//navi menus

    /**
     * 获取菜单数据.
     *
     * @param bool $group 是否启用分组(在下拉菜单时有用)
     *
     * @return array 菜单数据
     */
    public function menus(bool $group = false): array {
        $menus = [];
        foreach ($this->menus as $menu) {
            $menus[] = $menu->data($group);
        }
        usort($menus, ArrayCompare::compare('pos'));
        //处理分组
        if ($group) {
            $gdata = [];
            foreach ($menus as $cd) {
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
            $menus = $_tpmenus;
        }

        return $menus;
    }

    /**
     * 获取导航菜单.
     *
     * @param string   $id   菜单ID
     * @param string   $name 菜单名称
     * @param int|null $pos  位置
     *
     * @return MenuItem Menu实例的引用
     */
    public function &get(string $id, string $name = '', ?int $pos = null): MenuItem {
        $ids = explode('/', trim($id, '/'));
        $id  = array_shift($ids);

        if (isset ($this->menus [ $id ])) {
            $menu = $this->menus[ $id ];
        } else {
            $menu                = new MenuItem($id);
            $this->menus [ $id ] = $menu;
        }

        if ($ids) {
            foreach ($ids as $id) {
                $menu = $menu->get($id);
            }
        }

        if ($name) {
            $menu->name = $name;
        }
        if ($pos != null) {
            $menu->pos = $pos;
        } else if (!$menu->pos) {
            $menu->pos = $this->cpos ++;
        }

        return $menu;
    }
}