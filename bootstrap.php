<?php

namespace backend;

use backend\classes\AdminPassport;
use backend\classes\CommonSetting;
use wula\cms\CmfModule;
use wulaphp\app\App;
use wulaphp\auth\Passport;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;

/**
 * 管理后台模块
 * @group kernel
 */
class BackendModule extends CmfModule {
    public function getName(): string {
        return '管理后台';
    }

    public function getDescription(): string {
        return '基于bootstrap&layui的管理后台。';
    }

    public function getHomePageURL(): string {
        return 'https://www.wulacms.com/modules/backend';
    }

    public function getAuthor(): string {
        return 'Leo Ning';
    }

    /**
     * @param Passport $passport
     *
     * @filter passport\newAdminPassport
     *
     * @return Passport
     */
    public static function createAdminPassport($passport) {
        if ($passport instanceof Passport) {
            $passport = new AdminPassport();
        }

        return $passport;
    }

    /**
     * 需要登录才能操作.
     *
     * @param $view
     *
     * @filter mvc\admin\needLogin
     * @return \wulaphp\mvc\view\View
     */
    public static function onNeedLogin($view) {
        if (Request::isAjaxRequest()) {
            Response::respond(401, __('Please login'));
        } else {
            App::redirect('backend/auth');
        }

        return $view;
    }

    /**
     * @param mixed  $view
     * @param string $message
     *
     * @filter mvc\admin\onDenied $message
     * @return \wulaphp\mvc\view\View
     */
    public static function onDenied($view, $message) {
        if (!$view) {
            if (Request::isAjaxRequest()) {
                $view = Ajax::fatal($message ? $message : __('permission denied'), 403);
            } else {
                Response::respond(403, $message ? $message : __('permission denied'));
            }
        }

        return $view;
    }

    public function getVersionList(): array {
        $v['1.0.0'] = '管理后台的第一个版本';
        $v['2.0.0'] = '不再支持 php 5.6.x版本';
        $v['2.1.0'] = '优化界面';
        $v['2.4.1'] = '兼容 wulaphp 3.7';

        return $v;
    }
}

function get_system_settings() {
    return apply_filter('backend/settings', [
        'default' => new CommonSetting(),
    ]);
}

App::register(new BackendModule());