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

/**
 * 控制台界面类，用于管理导航菜单.
 */
class Dashboard {
    /** @var NaviMenu[] */
    private $menus;//navi menus

    public function __construct() {
        $this->menus = [
            'user' => new NaviMenu(),
            'top'  => new NaviMenu(),
            'navi' => new NaviMenu()
        ];
    }

    public function userMenu(): NaviMenu {
        return $this->menus['user'];
    }

    public function topMenu(): NaviMenu {
        return $this->menus['top'];
    }

    public function naviMenu(): NaviMenu {
        return $this->menus['navi'];
    }
}