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
 * DEC : 菜单显示
 * User: David Wang
 * Time: 2020/5/26 9:26 上午
 */

namespace backend\classes;

use system\model\UserMetaModel;
use wulaphp\app\App;
use wulaphp\auth\Passport;

class Menu {
    public $error;

    /**
     * 菜单显示
     *
     * @param \wulaphp\auth\Passport $passport
     *
     * @return array
     */
    public function getMenu(Passport $passport): array {
        $menus     = [];
        $modules   = App::modules();
        $myMenusId = $this->getMyLikes($passport->uid);
        $myMenus   = [];
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
                    $child['like'] = 0;
                    $child['id']   = $k . '/' . $ck;
                    $child['url']  = App::url($child['url']);
                    if (in_array($child['id'], $myMenusId)) {
                        $child['like'] = 1;
                        $myMenus[]     = $child;
                    }
                    $ms['lists'][] = $child;
                }
            }
            $menus[] = $ms;
        }

        return ['naviMenus' => $menus, 'myMenus' => $myMenus];
    }

    /**
     * 用户喜欢的菜单
     *
     * @param int $uid
     *
     * @return array
     */
    public function getMyLikes(int $uid): array {
        $metaTable = new UserMetaModel();
        $myMenus   = $metaTable->getStrMeta($uid, 'myMenus');

        return (array)json_decode($myMenus, true);
    }

    /**
     * 设置用户喜欢的菜单
     *
     * @param int    $uid    用户id
     * @param string $menuId 菜单id
     * @param int    $opt    0添加 1删除
     *
     * @return bool|int|\wulaphp\db\sql\UpdateSQL
     */
    public function setMyMenus(int $uid, string $menuId, int $opt = 0) {
        $myMenus = $this->getMyLikes($uid);
        if (!$opt) {
            $myMenus = array_unique(array_merge($myMenus, [$menuId]));
        } else {
            $key = array_search($menuId, $myMenus);
            if ($key === false) {
                $this->error = '菜单ID不存在,无法删除';

                return false;
            }
            array_splice($myMenus, $key, 1);
        }
        $metaTable = new UserMetaModel();

        return $metaTable->setStrMeta($uid, 'myMenus', json_encode($myMenus));
    }
}