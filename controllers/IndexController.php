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

use backend\classes\BackendController;
use backend\classes\DashboardUI;
use backend\classes\Widget;
use backend\classes\WidgetSettingForm;
use backend\form\BootstrapFormRender;
use system\model\UserMetaModel;
use wulaphp\app\App;
use wulaphp\cache\RtCache;
use wulaphp\io\Ajax;
use wulaphp\util\ArrayCompare;
use function backend\get_system_settings;

class IndexController extends BackendController {

    public function index() {
        $ui = new DashboardUI();
        if ($this->passport->cando('m:system')) {
            $system            = $ui->getMenu('system', __('System'), 999999);
            $system->icon      = '&#xe607;';
            $system->iconCls   = 'alicon';
            $system->iconStyle = "color:orange";
            // 设置
            if ($this->passport->cando('m:system/setting')) {
                $setting            = $system->getMenu('setting', __('Settings'), 999900);
                $setting->icon      = '&#xe640;';
                $setting->iconCls   = 'alicon';
                $setting->iconStyle = 'color:orange';
                $setting->url       = App::url('backend/setting');
                //通知其它模块提供配置
                $settings = get_system_settings();
                if ($settings) {
                    /**@var \backend\classes\Setting $cfg */
                    foreach ($settings as $sid => $cfg) {
                        if ($this->passport->cando($sid . ':system/setting')) {
                            $base = $setting->getMenu($sid, $cfg->getName());
                            $url  = $cfg->getURL();
                            if ($url) {
                                $base->data['url'] = $url;
                            } else {
                                $base->data['url'] = $setting->url . '/' . $sid;
                            }
                            $base->icon      = $cfg->getIcon();
                            $base->iconCls   = $cfg->getIconCls();
                            $base->iconStyle = $cfg->getIconStyle();
                        }
                    }
                }
                $setting->url = '';
            }
            if ($this->passport->is('开发人员')) {
                $doc              = $system->getMenu('helpdoc', __('Documents'), 999999);
                $doc->data['url'] = App::url('backend/doc');
                $doc->icon        = '&#xe705;';
                $doc->iconCls     = 'layui-icon';
                $doc              = $system->getMenu('hicon', __('Icons'), 1999999);
                $doc->data['url'] = App::url('backend/doc/icon');
                $doc->iconCls     = 'layui-icon';
                $doc->iconStyle   = 'color:green';
                $doc->icon        = '&#xe62e;';
            }
        }
        fire('dashboard\initUI', $ui);
        $data = $ui->menuData();

        // 用户菜单
        $uileft = new DashboardUI();
        fire('dashboard\initUserMenu', $uileft);

        $lf           = $uileft->menuData();
        $data['user'] = $lf['menus'];

        $module = App::getModuleById('backend');

        $data = [
            'menu'    => $data,
            'ui'      => $ui,
            'appmode' => APP_MODE,
            'version' => $module->getCurrentVersion()
        ];

        $data['website']['name'] = App::cfg('name', 'Hello WulaCms');
        $data['brandName']       = App::cfg('brandName');
        $theme                   = $_COOKIE['theme'] ?? 'blue';
        if (!$theme) {
            $theme = 'blue';
        }
        $data['theme']  = $theme;
        $themes[]       = [
            'name'    => 'blue',
            'header'  => '#FFF',
            'sidebar' => '#20222A',
            'logo'    => '#1E9FFF'
        ];
        $themes[]       = [
            'name'    => 'orange',
            'header'  => '#FFF',
            'sidebar' => '#20222A',
            'logo'    => '#F78400'
        ];
        $themes[]       = [
            'name'    => 'fred',
            'header'  => '#FFF',
            'sidebar' => '#28333E',
            'logo'    => '#AA3130'
        ];
        $themes[]       = [
            'name'    => 'black',
            'header'  => '#23262E',
            'sidebar' => '#23262E',
            'logo'    => '#23262E'
        ];
        $themes[]       = [
            'name'    => 'cblk',
            'header'  => '#393D49',
            'sidebar' => '#20222A',
            'logo'    => '#20222A'
        ];
        $themes[]       = [
            'name'    => 'bbw',
            'header'  => '#20222A',
            'sidebar' => '#FFF',
            'logo'    => '#20222A'
        ];
        $themes[]       = [
            'name'    => 'bgw',
            'header'  => '#20222A',
            'sidebar' => '#FFF',
            'logo'    => '#1E9FFF'
        ];
        $themes[]       = [
            'name'    => 'obw',
            'header'  => '#20222A',
            'sidebar' => '#FFF',
            'logo'    => '#F78400'
        ];
        $themes[]       = [
            'name'    => 'fbw',
            'header'  => '#20222A',
            'sidebar' => '#FFF',
            'logo'    => '#AA3130'
        ];
        $data['themes'] = json_encode($themes);
        $userMeta       = new UserMetaModel();
        $favorites      = $userMeta->getStrMeta($this->passport->uid, 'favorites');
        $favorites      = $favorites ? @json_decode($favorites, true) : [];
        if (!is_array($favorites)) {
            $favorites = [];
        }
        $fmenus = [];
        foreach ($favorites as $fid => $v) {
            $m = $ui->getMenu($fid);
            if ($m->name && $m->data) {
                $fm        = $m->data();
                $fm['lid'] = $fid;
                $fmenus[]  = $fm;
            }
        }
        $data['favorites'] = $fmenus;

        return view($data);
    }

    public function home() {
        $data['title']         = '后台主页';
        $data['workspaceView'] = './index/home.tpl';
        // 注册后台首页小部件
        fire('backend\widgets');
        // 系统内置系统状态小部件
        $widgets = Widget::widgets();
        //$data['widgets'] = $widgets;

        // 加载用户配置小部件
        $userMeta  = new UserMetaModel();
        $uid       = $this->passport->uid;
        $myWidgets = $userMeta->myWidgets($uid);

        usort($myWidgets, ArrayCompare::compare('pos'));

        $uses    = ['jquery', 'bootstrap', 'sortable', 'wulaui'];
        $alias   = ['$', '_$$$', '_$$', '_$'];
        $init    = [];
        $modules = [];
        foreach ($myWidgets as $w) {
            $id = $w['id'];
            if (isset($widgets[ $id ])) {
                /**@var Widget $widget */
                $widget = $widgets[ $id ];
                if (isset($w['cfg'])) {
                    $widget->setCfg($w['cfg']);
                }
                $w['widget']              = $widget;
                $w['badge']               = $widget->badge();
                $data['myWidgets'][ $id ] = $w;
                $s                        = $widget->script();
                if ($s) {
                    $modules[ $id ] = '{/}' . App::res($s);
                    $uses[]         = $id;
                    $alias[]        = '_$' . $id;
                    $init[]         = "_\${$id}.init()";
                }
            }
        }
        $data['uses']    = "'" . implode("','", $uses) . "'";
        $data['alias']   = implode(',', $alias);
        $data['init']    = implode(';', $init);
        $data['modules'] = json_encode($modules);

        return view('layout', $data);
    }

    /**
     * 添加小部件.
     *
     * @return \wulaphp\mvc\view\SmartyView
     */
    public function addWidget() {
        $userMeta   = new UserMetaModel();
        $uid        = $this->passport->uid;
        $myWidgets  = $userMeta->myWidgets($uid);
        $widgets    = Widget::widgets();
        $newWidgets = [];
        foreach ($widgets as $id => $w) {
            if (!isset($myWidgets[ $id ])) {
                $newWidgets[ $id ] = $w;
            }
        }
        $data['widgets'] = $newWidgets;

        return view($data);
    }

    /**
     * 添加小部件（保存）
     *
     * @param string $widget
     * @param string $width
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function saveWidget($widget, $width) {
        if (!$widget) {
            return Ajax::error('请选择一个小部件');
        }
        $userMeta  = new UserMetaModel();
        $uid       = $this->passport->uid;
        $myWidgets = $userMeta->myWidgets($uid);

        if (isset($myWidgets[ $widget ])) {
            return Ajax::success('小部件已添加');
        }
        $widgets = Widget::widgets();
        if (!isset($widgets[ $widget ])) {
            return Ajax::error('未知小部件');
        }
        /**@var Widget $w */
        $w                    = $widgets[ $widget ];
        $width                = max(intval($width), $w->minWidth());
        $myWidgets[ $widget ] = ['id' => $widget, 'pos' => 999999, 'width' => $width, 'name' => $w->name()];
        $userMeta->setStrMeta($uid, 'widgets', json_encode($myWidgets));

        return Ajax::reload('document', '小部件已添加');
    }

    /**
     * 删除小部件.
     *
     * @param string $id
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function delWidget($id) {
        if ($id) {
            $userMeta  = new UserMetaModel();
            $uid       = $this->passport->uid;
            $myWidgets = $userMeta->myWidgets($uid);
            if ($myWidgets && isset($myWidgets[ $id ])) {
                unset($myWidgets[ $id ]);
                $userMeta->setStrMeta($uid, 'widgets', json_encode($myWidgets));

                return Ajax::reload('document', '小部件已移除');
            }

        }

        return Ajax::error('不知道你要删除什么...');
    }

    /**
     * 配置小部件.
     *
     * @param string $widget
     *
     * @return \wulaphp\mvc\view\JsonView|\wulaphp\mvc\view\SmartyView
     */
    public function widgetCfg($widget) {
        if (!$widget) {
            return Ajax::error('请选择一个小部件');
        }
        $userMeta  = new UserMetaModel();
        $uid       = $this->passport->uid;
        $myWidgets = $userMeta->myWidgets($uid);
        if (!isset($myWidgets[ $widget ])) {
            return Ajax::error('小部件已经移除');
        }
        $widgets = Widget::widgets();
        if (!isset($widgets[ $widget ])) {
            return Ajax::error('小部件已经不可用');
        }
        $wdata = $myWidgets[ $widget ];
        /**@var Widget $w */
        $w    = $widgets[ $widget ];
        $form = $w->settingForm();
        if (!$form) {
            $form = new WidgetSettingForm(true);
        }
        $cfg          = isset($wdata['cfg']) ? $wdata['cfg'] : [];
        $cfg['name']  = $wdata['name'];
        $cfg['width'] = $wdata['width'];
        $form->inflateByData($cfg);

        $data['form']  = BootstrapFormRender::v($form);
        $data['rules'] = $form->encodeValidatorRule();
        $data['id']    = $widget;

        return view($data);
    }

    /**
     * 配置小部件(保存).
     *
     * @param string     $id
     * @param string     $name
     * @param string|int $width
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function saveCfg($id, $name, $width) {
        $widget = $id;
        if (!$widget) {
            return Ajax::error('请选择一个小部件');
        }
        $userMeta  = new UserMetaModel();
        $uid       = $this->passport->uid;
        $myWidgets = $userMeta->myWidgets($uid);

        if (!isset($myWidgets[ $widget ])) {
            return Ajax::success('请先添加小部件到工作台');
        }
        $widgets = Widget::widgets();
        if (!isset($widgets[ $widget ])) {
            return Ajax::error('未知的小部件');
        }
        /**@var Widget $w */
        $w                             = $widgets[ $widget ];
        $width                         = max(intval($width), $w->minWidth());
        $name                          = $name ? $name : $w->name();
        $myWidgets[ $widget ]['name']  = $name;
        $myWidgets[ $widget ]['width'] = $width;
        $form                          = $w->settingForm();
        if ($form) {
            $data = $form->inflate('name,width');
            if ($data) {
                $myWidgets[ $widget ]['cfg'] = $data;
                $form->saveCfg($data);
            }
        }
        $userMeta->setStrMeta($uid, 'widgets', json_encode($myWidgets));

        return Ajax::reload('document', '配置完成');
    }

    /**
     * 更新小部件排序.
     *
     * @param string $ids
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function updateOrder($ids) {
        $ids = explode(',', $ids);
        if ($ids) {
            $userMeta  = new UserMetaModel();
            $uid       = $this->passport->uid;
            $myWidgets = $userMeta->myWidgets($uid);
            foreach ($ids as $k => $id) {
                if (isset($myWidgets[ $id ])) {
                    $myWidgets[ $id ]['pos'] = $k;
                }
            }
            $userMeta->setStrMeta($uid, 'widgets', json_encode($myWidgets));
        }

        return Ajax::success();
    }

    /**
     * 重设小部件
     */
    public function reset() {
        $widgets  = ['welcome' => ['id' => 'welcome', 'pos' => 1, 'width' => 12, 'name' => '欢迎']];
        $userMeta = new UserMetaModel();
        $uid      = $this->passport->uid;
        $userMeta->setStrMeta($uid, 'widgets', json_encode($widgets));

        return Ajax::reload('document', '布局已重置');
    }

    public function resetLayout() {
        $userMeta  = new UserMetaModel();
        $uid       = $this->passport->uid;
        $myWidgets = $userMeta->myWidgets($uid);
        $widgets   = Widget::widgets();
        foreach ($myWidgets as $id => $w) {
            if (isset($widgets[ $id ])) {
                /**@var Widget $widget */
                $widget                    = $widgets[ $id ];
                $myWidgets[ $id ]['name']  = $widget->name();
                $myWidgets[ $id ]['width'] = $widget->defaultWidth();
                unset($myWidgets[ $id ]['cfg']);
            }
        }
        $userMeta->setStrMeta($uid, 'widgets', json_encode($myWidgets));

        return Ajax::reload('document', '布局已重置');
    }

    public function clear($cc = null) {
        if ($cc && is_array($cc)) {
            foreach ($cc as $c) {
                if ($c == 'mtpl') {
                    rmdirs(TMP_PATH . 'tpls_c');
                } else if ($c == 'ttpl') {
                    rmdirs(TMP_PATH . 'themes_c');
                } else if ($c == 'rt') {
                    RtCache::clear();
                } else {
                    try {
                        fire('clear_' . $c . '_cache');
                    } catch (\Exception $e) {

                    }
                }
            }
        }

        return Ajax::success("所选缓存已清空");
    }

    public function setFav($mid) {
        $userMeta = new UserMetaModel();
        $meta     = $userMeta->getStrMeta($this->passport->uid, 'favorites');
        $meta     = $meta ? @json_decode($meta, true) : [];
        if (!is_array($meta)) {
            $meta = [];
        }
        $mid = explode(':', $mid, 2);
        if (count($mid) == 2 && $mid[1]) {
            if ($mid[0] == 'add') {
                $meta[ $mid[1] ] = 1;
                $userMeta->setStrMeta($this->passport->uid, 'favorites', json_encode($meta));

                return Ajax::success('快捷菜单已添加，请刷新页面');
            } else {
                unset($meta[ $mid[1] ]);
                $userMeta->setStrMeta($this->passport->uid, 'favorites', json_encode($meta));

                return Ajax::success('快捷菜单已删除，请刷新页面');
            }
        } else {
            return Ajax::warn('未知操作');
        }
    }
}