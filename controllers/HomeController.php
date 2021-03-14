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

use backend\classes\PageController;
use wulaphp\mvc\view\View;

class HomeController extends PageController {
    /**
     * 管理后台主页
     */
    public function index(): View {
        $data = apply_filter('backend\initHomePage', []);
        $tpl  = $data['tpl'] ?? null;

        return $this->render($tpl, $data);
    }
}