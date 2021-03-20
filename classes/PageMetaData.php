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

use wulaphp\app\App;
use wulaphp\auth\Passport;

class PageMetaData {
    /**
     * 获取页面通用数据
     *
     * @param \wulaphp\auth\Passport|null $passport
     *
     * @return array
     */
    public static function meta(?Passport $passport = null): array {
        $cmsVer = App::getModuleById('backend')->getCurrentVersion();
        // 页面样式
        $meta['htmlCls'] = '';
        $meta['bodyCls'] = App::bcfg('showFooter') ? '' : 'close-footer';
        // 全局配置(可配置)
        $meta['themedir']     = App::cfg('site.theme_base', WWWROOT_DIR . THEME_DIR . '/');
        $meta['moduledir']    = App::cfg('site.module_base', WWWROOT_DIR . MODULE_DIR . '/');
        $meta['assetsdir']    = App::cfg('site.assets_base', WWWROOT_DIR . ASSETS_DIR . '/');
        $meta['siteName']     = App::cfg('site.name', 'WulaCMS');
        $meta['defaultTitle'] = App::cfg('site.defaultTitle', 'WulaCMS');
        $meta['titleSuffix']  = App::cfg('site.titleSuffix', ' - ' . __('Powered By WulaCMS v%s', $cmsVer));
        $meta['logo']         = App::cfg('site.logo', App::res('backend/assets/img/logo.png'));
        $meta['projectName']  = App::cfg('site.projectName', 'WulaCms Pro');
        $meta['brandImg']     = App::cfg('site.brandImg', App::res('backend/assets/img/logo.png'));
        $meta['brandName']    = App::cfg('site.brandName');
        $meta['site']         = App::cfg('site');
        // 插件可以修改meta数据
        $meta           = apply_filter('init_layout_page_meta', $meta);
        $meta['id2dir'] = App::id2dir();
        $meta['prefix'] = App::$prefix;
        unset($meta['prefix']['check']);
        $meta['cmsVer']   = $cmsVer;
        $data['pageMeta'] = $meta;
        // 用户元数据
        $umeta = ['id' => 0, 'nickname' => __('Anonymous'), 'username' => 'anonymous'];
        if ($passport) {
            $info              = $passport->info();
            $info              = apply_filter('init_layout_user_meta', $info);
            $umeta['id']       = $info['id'];
            $umeta['username'] = $info['username'];
            $umeta['nickname'] = $info['nickname'];
            $umeta['avatar']   = $info['avatar'] ? $info['avatar'] : App::res('backend/assets/img/head.jpg');
            $umeta['email']    = $info['email'];
            $umeta['phone']    = $info['phone'];
        }
        $data['userMeta'] = $umeta;

        return $data;
    }
}