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
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\controller\AdminController;
use wulaphp\router\Router;

class AuthedController extends AdminController {

    public function beforeRun($action, $refMethod) {
        $domain = App::cfg('domain');
        if ($domain && VISITING_DOMAIN != $domain) {
            Response::respond();
        }

        $view = parent::beforeRun($action, $refMethod);

        if ($this->passport->uid && !$this->methodAnn->has('resetpasswd')) {
            $resetPasswd = $_SESSION['resetPasswd'] ?? 0;
            if ($resetPasswd) {
                Response::redirect(App::url('backend/reset'));
            }
        }

        return $view;
    }

    protected function needLogin($view) {
        if ($this->loginBack) {
            if (Request::isAjaxRequest()) {
                $_SESSION['loginBack'] = $_SERVER['HTTP_REFERER'];
            } else {
                $_SESSION['loginBack'] = Router::getFullURI();
            }
        }

        return apply_filter('mvc\admin\needLogin', $view);
    }

    protected function onScreenLocked($view) {
        return view('~backend/views/lock');
    }

    protected function onDenied($message, $view) {
        return $view;
    }

    protected function onLocked($view) {
        return $view;
    }
}