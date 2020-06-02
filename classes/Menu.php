<?php
/**
 * //                            _ooOoo_
 * //                           o8888888o
 * //                           88" . "88
 * //                           (| -_- |)
 * //                            O\ = /O
 * //                        ____/`---'\____
 * //                      .   ' \\| |// `.
 * //                       / \\||| : |||// \
 * //                     / _||||| -:- |||||- \
 * //                       | | \\\ - /// | |
 * //                     | \_| ''\---/'' | |
 * //                      \ .-\__ `-` ___/-. /
 * //                   ___`. .' /--.--\ `. . __
 * //                ."" '< `.___\_<|>_/___.' >'"".
 * //               | | : `- \`.;`\ _ /`;.`/ - ` : | |
 * //                 \ \ `-. \_ __\ /__ _/ .-` / /
 * //         ======`-.____`-.___\_____/___.-`____.-'======
 * //                            `=---='
 * //
 * //         .............................................
 * //                  佛祖保佑             永无BUG
 * DEC :
 * User: David Wang
 * Time: 2020/5/26 9:26 上午
 */

namespace backend\classes;

use wulaphp\app\App;
use wulaphp\auth\Passport;

class Menu {

    public function getMenu(Passport $passport): array {
        $menus   = [];
        $modules = App::modules();
        foreach ($modules as $module) {
            $ms         = [];
            $moduleMenu = $module->menu();
            if (!$moduleMenu) {
                continue;
            }
            foreach ($moduleMenu as $k => $mu) {
                $ms['title'] = $mu['name'];
                $ms['type']  = $k;
                foreach ($mu['items'] as $ck => $child) {
                    $child['like'] = false;
                    $child['id']   = $k.'/'.$ck;
                    $ms['lists'][] = $child;
                }
            }
            $menus[] = $ms;
        }

        return $menus;
    }
}