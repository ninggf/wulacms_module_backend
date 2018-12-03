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

use backend\classes\IFramePageController;
use backend\classes\Setting;
use backend\form\BootstrapFormRender;
use wulaphp\app\App;
use wulaphp\form\FormTable;
use wulaphp\io\Ajax;
use wulaphp\validator\ValidateException;
use function backend\get_system_settings;

/**
 * 通用配置控制器.
 *
 * @package dashboard\controllers
 * @roles   管理员
 * @acl     m:system/setting
 */
class SettingController extends IFramePageController {
    /**
     * 通用配置页.
     *
     * @param string $setting
     * @param string $group
     *
     * @return \wulaphp\mvc\view\View
     */
    public function index($setting = '', $group = '') {
        if (!$setting) {
            return $this->render(['error' => '不存在的配置'], 'setting/error');
        }
        $cfg = $this->getSetting($setting);
        if (!$cfg) {
            return $this->render(['error' => '不存在的配置'], 'setting/error');
        }
        if (!$cfg instanceof Setting) {
            return $this->render(['error' => '配置不合法'], 'setting/error');
        }
        if (!$this->passport->cando($setting . ':system/setting')) {
            return $this->render(['error' => '你没权限进行此项配置'], 'setting/error');
        }
        //配置组
        $groups = $cfg->getGroups();
        if (!$group && $groups) {
            $group = array_keys($groups)[0];
        }
        $data                = [
            'group'   => $group,
            'setting' => $setting,
            'cfgurl'  => App::url('backend/setting/' . $setting)
        ];
        $data['groups']      = $groups;
        $data['settingName'] = $cfg->getName();
        $set                 = [];
        $tpl                 = $cfg->customTpl($group, $set);
        if ($tpl) {//自定义模板
            $data['cfg'] = $set;

            return $this->render($tpl, $set);
        } else {
            $form = $cfg->getForm($group);
            if (!$form instanceof FormTable) {
                return $this->render(['error' => '无法识别的表单'], 'setting/error');
            }
            $data['rules'] = '';
            if (method_exists($form, 'encodeValidatorRule')) {
                $data['rules'] = $form->encodeValidatorRule($this);
            }
            $data['form'] = BootstrapFormRender::h($form, [
                'label-col' => 'col-xs-12 col-sm-3 col-md-2',
                'field-col' => 'col-xs-12 col-sm-9 col-md-10'
            ]);
            //填充表单
            $cfg->load($form, $setting, $group);
            $module = $cfg->script($group);
            if ($module) {
                if (is_array($module)) {
                    $data['javaScript'] = implode("\n", $module);
                } else {
                    $data['script'] = '{/}' . App::res($module);
                }
            }

            return $this->layoutCfg('htmlCls')->render($data);
        }
    }

    /**
     * 保存配置.
     *
     * @param string $setting
     * @param string $group
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function savePost($setting, $group = '') {
        if (!$setting) {
            return Ajax::error('不能保存哦');
        }
        $cfg = $this->getSetting($setting);
        if (!$cfg) {
            return Ajax::error('不存在的配置');
        }
        if (!$cfg instanceof Setting) {
            return Ajax::error('配置实例非法');
        }
        if (!$this->passport->cando($setting . ':system/setting')) {
            return Ajax::error('你没权限进行此项配置');
        }
        //配置组
        $groups = $cfg->getGroups();
        if (!$group && $groups) {
            $group = array_keys($groups)[0];
        }
        $form = $cfg->getForm($group);
        $data = $form->inflate();
        try {
            $form->validate($data);
            if ($cfg->save($data, $setting, $group)) {
                if ($cfg->needReload()) {
                    return Ajax::reload('top', '配置已保存');
                } else {
                    return Ajax::success('配置已保存');
                }
            } else {
                return Ajax::error('出错啦，无法应用配置');
            }
        } catch (ValidateException $ve) {
            return Ajax::validate('SettingForm', $ve->getErrors());
        }
    }

    /**
     * 取配置.
     *
     * @param string $setting
     *
     * @return  \backend\classes\Setting
     */
    private function getSetting($setting) {
        $settings = get_system_settings();
        if (isset($settings[ $setting ])) {
            return $settings[ $setting ];
        }

        return null;
    }
}