<?php

namespace backend;

use wula\cms\CmfModule;
use wulaphp\app\App;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;

/**
 * 管理后台模块
 * @group kernel
 */
class BackendModule extends CmfModule {
    public function getName() {
        return '管理后台';
    }

    public function getDescription() {
        return '基于layui与vuejs的易扩展管理后台界面';
    }

    public function getHomePageURL() {
        return 'https://www.wulacms.com/modules/backend';
    }

    public function getAuthor() {
        return 'Leo Ning';
    }

    public function getVersionList() {
        $v['1.0.0'] = '管理后台的第一个版本';

        return $v;
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
            App::redirect('backend/login');
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
        if (Request::isAjaxRequest()) {
            $view = Ajax::fatal($message ? $message : __('permission denied'), 403);
        } else {
            Response::respond(403, $message ? $message : __('permission denied'));
        }

        return $view;
    }

    /**
     * 用户被禁用了。
     *
     * @param \wulaphp\mvc\view\View $view
     *
     * @filter mvc\admin\onLocked
     * @return \wulaphp\mvc\view\View
     */
    public static function onLocked($view) {
        if (Request::isAjaxRequest()) {
            $view = Ajax::fatal('You are blocked', 403);
        }

        return $view;
    }
}

App::register(new BackendModule());