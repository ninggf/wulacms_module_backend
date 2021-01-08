<?php

namespace backend\classes;

use wulaphp\app\App;
use wulaphp\mvc\controller\LayoutSupport;
use wulaphp\mvc\view\View;

class PjaxController extends BackendController {
    use LayoutSupport;

    protected $layout    = 'backend/views/layout';
    protected $htmlCls   = 'app';
    protected $bodyCls   = '';
    protected $pageTheme = '';

    /**
     * 使用组件.
     *
     * @param string $comp 组件名（必须符合wulacms的组件规范)
     * @param array  $data 数据
     *
     * @return \wulaphp\mvc\view\View
     */
    protected final function vueComp(string $comp, array $data = []): View {
        $fullComp = '@' . $this->module->getNamespace() . '.' . $comp;

        $data['compCls'] = $fullComp;
        $data['comp']    = $this->module->getNamespace() . '-' . $comp;

        if (!isset($data['compData']) || !is_array($data['compData'])) {
            $data['compData'] = [];
        }

        return $this->render('~backend/views/layuse', $data);
    }

    /**
     * 配置布局数。
     *
     * @param string|array $cfg
     * @param string       $value
     *
     * @return \backend\classes\PjaxController
     */
    protected function layoutCfg($cfg, string $value = ''): PjaxController {
        if (is_array($cfg)) {
            foreach ($cfg as $c => $v) {
                if (in_array($c, ['htmlCls', 'bodyCls', 'pageTheme'])) {
                    $this->{$c} = $value;
                }
            }
        } else {
            if (in_array($cfg, ['htmlCls', 'bodyCls', 'pageTheme'])) {
                $this->{$cfg} = $value;
            }
        }

        return $this;
    }

    /**
     * 初始化布局数据.
     *
     * @param array $data
     *
     * @return mixed
     */
    protected function onInitLayoutData(array $data): array {
        $cmsVer = App::getModuleById('backend')->getCurrentVersion();
        // 页面样式
        $meta['htmlCls']   = $this->htmlCls;
        $meta['bodyCls']   = $this->bodyCls;
        $meta['pageStyle'] = $this->pageTheme;
        // 全局配置(可配置)
        $meta['themedir']     = App::cfg('site.theme_base', WWWROOT_DIR . THEME_DIR . '/');
        $meta['moduledir']    = App::cfg('site.module_base', WWWROOT_DIR . MODULE_DIR . '/');
        $meta['assetsdir']    = App::cfg('site.assets_base', WWWROOT_DIR . ASSETS_DIR . '/');
        $meta['siteName']     = App::cfg('site.name', 'WulaCMS');
        $meta['defaultTitle'] = App::cfg('site.defaultTitle', 'WulaCMS');
        $meta['titleSuffix']  = App::cfg('site.titleSuffix', ' - 欢迎使用WulaCMS v' . $cmsVer);
        $meta['logo']         = App::cfg('site.logo', App::res('backend/images/logo.png'));
        $meta['projectName']  = App::cfg('site.projectName', 'Cms');
        // 插件可以修改meta数据
        $meta = apply_filter('init_layout_page_meta', $meta);
        // layui config
        $data['layuiCfg']['base']   = $meta['assetsdir'] . 'layui/';
        $data['layuiCfg']['module'] = $meta['moduledir'];
        $data['layuiCfg']['theme']  = $meta['themedir'];
        // menu and route
        $meta['naviCfg'] = (new Menu())->getMenu($this->passport);
        $meta['id2dir']  = App::id2dir();
        $meta['prefix']  = App::$prefix;
        unset($meta['prefix']['check']);
        $meta['basedir']  = App::url('/');
        $meta['apiUrl']   = App::url('api');
        $meta['cmsVer']   = $cmsVer;
        $data['pageMeta'] = $meta;
        // 用户元数据
        $info              = $this->passport->info();
        $info              = apply_filter('init_layout_user_meta', $info);
        $umeta['id']       = $info['id'];
        $umeta['username'] = $info['username'];
        $umeta['nickname'] = $info['nickname'];
        $umeta['avatar']   = $info['avatar'] ? $info['avatar'] : App::res('backend/images/avatar.jpg');
        $umeta['email']    = $info['email'];
        $umeta['phone']    = $info['phone'];
        $data['userMeta']  = $umeta;

        return $data;
    }
}