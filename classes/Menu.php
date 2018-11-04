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
 * 菜单类.
 *
 * @package dashboard\classes
 */
class Menu {
    public $id;
    public $name;
    public $title     = '';
    public $url       = '';
    public $target    = '';
    public $textCls   = '';
    public $textStyle = '';
    public $icon      = '';
    public $iconStyle = '';
    public $iconCls   = '';
    public $level     = 1;
    public $pos       = 0;
    public $badge     = '';
    public $data      = [];
    /**@var \backend\classes\Menu[] */
    public  $child = [];
    public  $group = 'ug';
    private $cpos  = 500;

    public function __construct($id, $name = '', $icon = '') {
        $this->id      = $id;
        $this->name    = $name;
        $this->iconCls = $icon;
    }

    /**
     * 是否有子菜单.
     *
     * @return bool 有返回true，反之返回false.
     */
    public function hasSubMenu() {
        return count($this->child) > 0;
    }

    /**
     * 获取子菜单。
     *
     * @param string   $id   菜单ID
     * @param string   $name 菜单名称
     * @param int|null $pos  菜单位置
     *
     * @return Menu 菜单实例的引用
     */
    public function &getMenu($id, $name = '', $pos = null) {
        if (!isset ($this->child [ $id ])) {
            $this->child[ $id ]        = new Menu($id);
            $this->child[ $id ]->level = $this->level + 1;
            if ($name) {
                $this->child[ $id ]->name = $name;
            }
            $this->child[ $id ]->pos = $pos == null ? $this->cpos++ : $pos;
        }

        return $this->child[ $id ];
    }

    /**
     * 生成菜单数据.
     *
     * @param bool $group 是否启用分组(在下拉菜单时有用)
     *
     * @return array 菜单数据
     *
     * ```{.json}
     * {
     *     "id":"menu id",
     *     "name":"系统",
     *     "h5datas":"data-name=\"abc\" data-id=...",
     *     "child":[{
     *          "id":"menu id"
     *          ...
     *     },...]
     * }
     * ```
     */
    public function data($group = false) {
        $data  = get_object_vars($this);
        $datas = $data['data'];
        unset($data['data'], $data['cpos']);
        foreach (array_keys($data) as $key) {
            if (empty($data[ $key ])) {
                unset($data[ $key ]);
            } else if (is_string($data[ $key ])) {
                $data[ $key ] = trim($data[ $key ]);
            }
        }
        if ($datas) {
            $h5data = [];
            foreach ($datas as $key => $v) {
                $tkey = trim($key);
                if (is_array($v)) {
                    $data['data'][ $tkey ] = $v;
                } else {
                    $data['data'][ $tkey ] = $h5data[ 'data-' . $tkey ] = trim($v);
                }
            }
            if ($h5data) {
                $data['h5datas'] = ary_kv_concat($h5data);
            }
        }
        $data['child'] = [];
        if ($this->child) {
            if ($this->level == 1) {//一级菜单
                foreach ($this->child as $item) {
                    if ($item->child || $item->data) {
                        $data['child'][] = $item->data($group);
                    }
                }
            } else if ($this->level == 2) {//二级菜单
                foreach ($this->child as $item) {
                    unset($data['data']['url']);
                    if ($item->child) {
                        foreach ($item->child as $item1) {
                            $data1           = $item1->data($group);
                            $data1['id']     = $item->id . '/' . $data1['id'];
                            $data['child'][] = $data1;
                        }
                    } else {
                        $data['child'][] = $item->data($group);
                    }
                }
            } else {//3级菜单
                foreach ($this->child as $item) {
                    $data['child'][] = $item->data($group);
                }
            }
            //菜单排序
            usort($data['child'], function ($a, $b) {
                $apos = $a['pos'];
                $bpos = $b['pos'];
                if (!$a['child']) {
                    $apos += 1000000000;
                }
                if (!$b['child']) {
                    $bpos += 1000000000;
                }
                if ($apos > $bpos) {
                    return 1;
                } else if ($apos < $bpos) {
                    return -1;
                } else {
                    return strcmp($a['id'], $b['id']);
                }
            });
            if ($group) {
                $gdata = [];
                foreach ($data['child'] as $cd) {
                    $gp = $cd['group'];
                    unset($cd['group']);
                    $gdata[ $gp ][] = $cd;
                }
                $data['child'] = [];
                foreach ($gdata as $gds) {
                    $data['child']   = array_merge($data['child'], $gds);
                    $data['child'][] = ['name' => 'divider'];
                }
                array_pop($data['child']);
            }
        }
        unset($data['level']);

        return $data;
    }
}