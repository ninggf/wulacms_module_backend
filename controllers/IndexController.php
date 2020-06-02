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
use backend\classes\LoopController;
use system\classes\CaptchaCode;
use system\classes\Syslog;
use system\model\UserMetaModel;
use system\model\UserTable;
use wulaphp\app\App;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;

class IndexController extends LoopController {

    /**
     * 后台首页
     */
    public function index() {

        return $this->render('index');
    }

    /**
     * 登录
     *
     * @nologin
     * @sessWrite
     * @return \wulaphp\mvc\view\View
     */
    public function login() {
        $from = rqst('from');
        if ($from) {
            $_SESSION['loginBack'] = $from;
        }
        $landingPage = sess_get('loginBack', App::url('backend'));
        if ($this->passport->isLogin) {
            sess_del('loginBack');
            Response::redirect($landingPage);
        } else if (isset($_COOKIE['astoken'])) {
            // 自动登录
            $astokens = explode('/', $_COOKIE['astoken']);
            if (count($astokens) == 2) {
                $uid = intval($astokens[1]);
                try {
                    if ($this->passport->login($uid)) {
                        if ($this->passport['astoken'] == $_COOKIE['astoken']) {
                            Syslog::info('Auto Login', $this->passport->uid, 'accesslog');
                            sess_del('loginBack');
                            Response::redirect($landingPage);
                        }
                    }
                } catch (\Exception $e) {

                }
            }
            Response::cookie('astoken', null);
        }

        $module = App::getModule('backend');
        $tpl    = apply_filter('backend\loginTpl', 'login');
        $eCnt   = sess_get('errCnt', 0);

        return view([
            'winData' => [
                'version' => $module->getCurrentVersion(),
                'ent'     => $eCnt,
                'website' => [
                    'name'     => App::cfg('brandName', 'WulaCms'),
                    'brandImg' => App::cfg('brandImg')
                ],
                'captcha' => App::url('backend/captcha')
            ]
        ], $tpl);
    }

    /**
     * 登录验证.
     * @nologin
     *
     * @param string $username
     * @param string $passwd
     * @param string $captcha 验证码
     *
     * @sessWrite
     * @return \wulaphp\mvc\view\JsonView
     */
    public function loginPost($username, $passwd, $captcha = '') {
        $eCnt = sess_get('errCnt', 0);
        if ($eCnt < 3) {
            $table              = new UserTable();
            $user               = $table->findOne(['username' => $username], 'id');
            $eCnt               = intval($user->meta()->where(['name' => 'errCnt'], true)->get('ivalue'));
            $_SESSION['errCnt'] = $eCnt;
            if ($eCnt >= 3) {
                return Ajax::error(['ent' => $eCnt], 'alert');
            }
        }
        if ($eCnt >= 3) {
            $auth_code_obj = new CaptchaCode();
            if (!$auth_code_obj->validate($captcha, false, false)) {
                return Ajax::error(['message' => '验证码不正确', 'ent' => $eCnt], 'alert');
            }
        }

        try {
            $userMeta = new UserMetaModel();
            if ($this->passport->login([$username, $passwd, $captcha])) {
                Syslog::info('Login', $this->passport->uid, 'accesslog');
                sess_del('errCnt');
                $userMeta->setIntMeta($this->passport->uid, 'errCnt', 0);
                if (rqst('autologin') != 'false') {
                    Response::cookie('astoken', $this->passport['astoken'], 315360000, '/');
                } else {
                    Response::cookie('astoken', null);
                }
                $resetPasswd  = $userMeta->getIntMeta($this->passport->uid, 'resetPasswd');
                $passwdExpire = $userMeta->getIntMeta($this->passport->uid, 'passwdExpire');
                if ($resetPasswd || ($passwdExpire > 0 && $passwdExpire <= time())) {
                    $_SESSION['resetPasswd'] = 1;
                    $landingPage             = App::url('backend/resetpasswd');
                } else {
                    $landingPage = sess_del('loginBack', App::url('backend'));
                }

                return Ajax::redirect($landingPage);
            } else {
                if ($eCnt < 3) {
                    $eCnt               += 1;
                    $_SESSION['errCnt'] = $eCnt;
                    $table              = new UserTable();
                    $user               = $table->findOne(['username' => $username], 'id');
                    if ($user['id']) {
                        $userMeta->setIntMeta($user['id'], 'errCnt', $eCnt);
                    }
                }

                Syslog::warn('Login Fail: ' . $username, 0, 'accesslog');

                return Ajax::error(['message' => $this->passport->error, 'ent' => $eCnt], 'alert');
            }
        } catch (\Exception $e) {
            return Ajax::error(['message' => '出错啦，请联系管理员', 'ent' => $eCnt], 'alert');
        }
    }

    /**
     * 验证码.
     *
     * @nologin
     *
     * @param string $type
     * @param string $size
     * @param int    $font
     *
     * @sessWrite
     */
    public function captcha($type = 'png', $size = '120x36', $font = 13) {
        Response::nocache();
        $size = explode('x', $size);
        if (count($size) == 1) {
            $width  = intval($size [0]);
            $height = $width * 3 / 4;
        } else if (count($size) >= 2) {
            $width  = intval($size [0]);
            $height = intval($size [1]);
        } else {
            $width  = 60;
            $height = 20;
        }
        $font          = intval($font);
        $font          = max([18, $font]);
        $type          = in_array($type, ['gif', 'png']) ? $type : 'png';
        $auth_code_obj = new CaptchaCode (rqst('name', 'auth_code'));
        // 定义验证码信息
        $arr ['code'] = [
            'characters' => 'A-H,L-K,M-N,P-T,V-Z,3-6',
            'length'     => 4,
            'deflect'    => true,
            'multicolor' => true
        ];
        $auth_code_obj->setCode($arr ['code']);
        // 定义干扰信息
        $arr ['molestation'] = ['type' => 'both', 'density' => 'normal'];
        $auth_code_obj->setMolestation($arr ['molestation']);
        // 定义图像信息. 设置图象类型请确认您的服务器是否支持您需要的类型
        $arr ['image'] = ['type' => $type, 'width' => $width, 'height' => $height];
        $auth_code_obj->setImage($arr ['image']);
        // 定义字体信息
        $arr ['font'] = ['space' => 5, 'size' => $font, 'left' => 5];
        $auth_code_obj->setFont($arr ['font']);
        // 定义背景色
        $arr ['bg'] = ['r' => 255, 'g' => 255, 'b' => 255];
        $auth_code_obj->setBgColor($arr ['bg']);
        $auth_code_obj->paint();
        Response::getInstance()->close(true);
    }

    /**
     * 退出
     * @nologin
     * @resetpasswd
     * @sessWrite
     */
    public function logout() {
        if ($this->passport->isLogin) {
            Syslog::info('Logout', $this->passport->uid, 'accesslog');
            $this->passport->logout();
        }
        $this->destorySession();
        //清空自动登录
        Response::cookie('astoken', null);
        if (Request::isAjaxRequest() || rqset('ajax')) {
            return Ajax::redirect(App::url('backend/login'));
        } else {
            App::redirect('backend/login');

            return null;
        }
    }

    /**
     * 重置密码页面
     * @resetpasswd
     */
    public function resetpasswd() {
        // TODO： 制作重设密码页面
        return 'reset password';
    }

    /**
     * 重置密码
     * @resetpasswd
     */
    public function resetpasswdPost() {
        // TODO: 实现重设密码功能，要求和密码不能和上次密码相同的
        return 'ok';
    }
}