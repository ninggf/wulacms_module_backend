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

        if ($this->passport->uid && !$this->methodAnn->has('ResetPasswd')) {
            $resetPasswd = $this->passport->data['passwd_expired'];
            if ($resetPasswd) {
                Response::redirect(App::url('backend/profile/reset'));
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

        return parent::needLogin($view);
    }
}