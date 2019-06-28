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

use backend\model\SettingsTable;
use wulaphp\cache\RtCache;

/**
 * 配置基类.通过继承此类，可以方便地为应用提供配置功能.
 *
 */
abstract class Setting {
    /**
     * 保存配置.默认情况下配置保存到数据库的`settings`表中。如果需要自定义配置保存位置请重写此方法。
     *
     * @param array  $data    `key/value`数据.
     * @param string $setting 配置
     * @param string $group   配置组
     *
     * @return bool 成功返回true，反之false。
     */
    public function save($data, $setting, $group = '') {
        if ($group) {
            $setting .= '/' . $group;
        }
        $table = new SettingsTable();
        try {
            $cfgs = $table->saveSetting($setting, $data);
            if (is_array($cfgs)) {
                RtCache::add('cfg.' . $setting, $cfgs);
            }

            return true;
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * 自定义配置页面模板.
     *
     * @param string $group 配置组
     * @param array  $data  数据
     *
     * @return null|string 自定义模板路径，不自定义模板时返回`null`。
     */
    public function customTpl($group = '', &$data = []) {
        return null;
    }

    /**
     * 配置组.
     * @return null|array 配置组，只有一个分组时返回`null`；如果有多个分组时请返回分组id与名称:
     *
     * ```php
     *  ['group1'=>'分组1','group2'=>'分组2']
     * ```
     */
    public function getGroups() {
        return null;
    }

    /**
     * 配置表单.
     *
     * @param string $group 配置组
     *
     * @return \wulaphp\form\FormTable 实例.
     */
    public abstract function getForm($group = '');

    /**
     * 配置名称.
     *
     * @return string
     */
    public abstract function getName();

    public function getIcon() {
        return '&#xe640;';
    }

    public function getIconCls() {
        return 'alicon';
    }

    public function getIconStyle() {
        return 'color:orange';
    }

    public function getURL() {
        return null;
    }

    /**
     * 自定义模块
     *
     * @param string $group
     *
     * @return null|string|array
     */
    public function script($group = '') {
        return null;
    }

    public function needReload() {
        return false;
    }

    /**
     * 填充配置表单，默认从数据库的`settings`表中读取配置。如果自定义了配置保存位置请重写此方法。
     *
     * @param \wulaphp\form\FormTable $form    通过<a href="javascript:;" onclick="doc_gotodoc(this,'')">getForm</a>()
     *                                         获取的配置表单实例.
     * @param string                  $setting 配置
     * @param string                  $group   配置组
     *
     * @return array
     */
    public function load(&$form, $setting, $group = '') {
        $table = new SettingsTable();
        if ($group) {
            $setting .= '/' . $group;
        }
        $cfg = $table->findAll(['group' => $setting], 'name,value')->toArray('value', 'name');

        return $form->inflateByData($cfg);
    }
}