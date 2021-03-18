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

use backend\classes\AuthedController;
use system\classes\Syslog;
use wulaphp\app\App;
use wulaphp\app\Module;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\JsonView;

/**
 * 退出登录.
 *
 * @package backend\controllers
 */
class SignoutController extends AuthedController {
    public function __construct(Module $module) {
        define('NO_RESTORE_PASSPORT', true);
        parent::__construct($module);
    }

    /**
     * @nologin
     * @resetpasswd
     */
    public function index(): ?JsonView {
        if ($this->passport->isLogin) {
            Syslog::info('authlog', 'sign out ' . $this->passport->username, 'sign out', $this->passport->uid);
        }
        $this->destorySession();
        //清空自动登录
        Response::cookie('astoken', null, - 1, WWWROOT_DIR . App::id2dir('backend') . '/login');
        if (Request::isAjaxRequest() || rqset('ajax')) {
            return Ajax::redirect(App::url('backend/login'));
        } else {
            App::redirect('backend/login');

            return null;
        }
    }
}