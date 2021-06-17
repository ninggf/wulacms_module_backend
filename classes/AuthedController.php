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
use wulaphp\io\Response;
use wulaphp\mvc\controller\AdminController;

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
                Response::redirect(App::url('backend/reset-passwd'));
            }
        }

        return $view;
    }
}