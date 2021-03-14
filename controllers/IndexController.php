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
use backend\classes\Dashboard;
use backend\classes\PageMetaData;
use Exception;
use system\classes\model\UserMetaTable;
use system\classes\model\UserTable;
use system\classes\Syslog;
use wulaphp\app\App;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\JsonView;
use wulaphp\mvc\view\View;
use wulaphp\util\Captcha;

/**
 * 管理后台控制器.
 *
 * @package backend\controllers
 */
class IndexController extends AuthedController {

    /**
     * 后台框架首页
     * @get
     * @unlock
     *
     * @return \wulaphp\mvc\view\View
     * @throws
     */
    public function indexGet(): View {
        $data = PageMetaData::meta($this->passport);

        $dashboard = new Dashboard();

        if ($this->passport->cando('v:system')) {
            $naviMenu        = $dashboard->naviMenu();
            $system          = $naviMenu->get('system', __('System'), 999999);
            $system->iconCls = 'layui-icon-set';
            if ($this->passport->cando('v:system/account')) {
                $account          = $system->get('account', __('Account'), 1);
                $account->iconCls = 'layui-icon-user';
                if ($this->passport->cando('v:system/account/user')) {
                    $user          = $account->get('user', __('User'), 1);
                    $user->iconCls = 'layui-icon-user';
                    $user->url     = App::url('backend/user');
                }
                if ($this->passport->cando('v:system/account/role')) {
                    $role          = $account->get('role', __('Role'), 2);
                    $role->iconCls = 'layui-icon-group';
                    $role->url     = App::url('backend/role');
                }
            }

            if ($this->passport->cando('v:system/setting')) {
                $log          = $system->get('setting', __('Setting'), 999998);
                $log->iconCls = 'layui-icon-util';
                $log->url     = App::url('backend/setting');
            }

            if ($this->passport->cando('v:system/logs')) {
                $log          = $system->get('log', __('Logs'), 999999);
                $log->iconCls = 'layui-icon-log';
                $log->url     = App::url('backend/logs');
            }
        }

        //顶部菜单
        //        $topMenu                = $dashboard->topMenu();
        //        $msg                    = $topMenu->get('msg', __('Message'), 1);
        //        $msg->iconCls           = 'layui-icon-notice';
        //        $msg->badge             = 10;
        //        $msg->attrs['ew-event'] = 'message';
        //        $msg->data['url']       = App::url('backend/notice');

        //通知模型初始化后台界面
        fire('backend\initDashboard', $dashboard);

        $data['dashboard'] = $dashboard;

        return view($data, 'index');
    }

    /**
     * @get
     * @return \wulaphp\mvc\view\View
     */
    public function theme(): View {
        $data['showFooter'] = App::bcfg('showFooter');

        return view('theme', $data);
    }

    public function notice(): View {
        $data = apply_filter('backend\initNoticeWidget', []);
        $tpl  = $data['tpl'] ?? 'notice';

        return view($tpl, $data);
    }

    /**
     * 登录页
     *
     * @get
     * @nologin
     *
     * @return \wulaphp\mvc\view\View
     */
    public function login(): View {
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
                            Syslog::info('authlog', 'auto sign in', 'sign in', $this->passport->uid);
                            sess_del('loginBack');
                            Response::redirect($landingPage);
                        }
                    }
                } catch (Exception $e) {

                }
            }
            Response::cookie('astoken');//清空自动登录cookie
        }

        $tpl             = apply_filter('backend\loginTpl', 'login');
        $eCnt            = sess_get('errCnt', 0);
        $data            = PageMetaData::meta();
        $data['ent']     = $eCnt;
        $data['captcha'] = App::url('backend/captcha');

        return view($data, $tpl);
    }

    /**
     * 登录验证.
     *
     * @post
     * @nologin
     *
     * @param string $username
     * @param string $password
     * @param string $captcha 验证码
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function loginPost(string $username, string $password, string $captcha = ''): View {
        $eCnt = sess_get('errCnt', 0);
        if ($eCnt < 3) {
            $table = new UserTable();
            $user  = $table->findOne(['name' => $username], 'id');
            if (!$user['id']) {
                $eCnt               += 1;
                $_SESSION['errCnt'] = $eCnt;

                return Ajax::error(['ent' => $eCnt], 'alert');
            }
            $eCnt               = intval($user->meta()->where(['name' => 'errCnt'], true)->get('value'));
            $_SESSION['errCnt'] = $eCnt;
            if ($eCnt >= 3) {
                return Ajax::error(['ent' => $eCnt], 'alert');
            }
        }

        if ($eCnt >= 3) {
            $auth_code_obj = new Captcha();
            if (!$auth_code_obj->validate($captcha, false, false)) {
                return Ajax::error(['message' => '验证码不正确', 'ent' => $eCnt, 'elem' => 'input[name=captcha]'], 'alert');
            }
        }

        try {
            $userMeta = new UserMetaTable();
            if ($this->passport->login([$username, $password, $captcha])) {
                sess_del('errCnt');
                Syslog::info('authlog', 'successfully', 'sign in', $this->passport->uid);
                $userMeta->setMeta($this->passport->uid, 'errCnt', 0);
                $path      = WWWROOT_DIR . App::id2dir('backend') . '/login';
                $autologin = rqst('remember');
                if ($autologin == 'on') {
                    $cookie = Response::cookie('astoken', $this->passport['astoken'], 315360000, $path);
                    $cookie->httponly(true);
                } else {
                    Response::cookie('astoken', null, - 1, $path);
                }

                $landingPage = sess_del('loginBack', App::url('backend'));

                return Ajax::redirect($landingPage);
            } else {
                if ($eCnt < 3) {
                    $eCnt               += 1;
                    $_SESSION['errCnt'] = $eCnt;
                    $table              = new UserTable();
                    $user               = $table->findOne(['name' => $username], 'id');
                    if ($user['id']) {
                        $userMeta->setMeta($user['id'], 'errCnt', $eCnt);
                    }
                }

                Syslog::warn('authlog', 'login Fail: ' . $username, 'sign in');

                return Ajax::error([
                    'message' => $this->passport->error,
                    'ent'     => $eCnt,
                    'elem'    => 'input[name=username]'
                ], 'alert');
            }
        } catch (Exception $e) {
            return Ajax::error(['message' => '出错啦，请联系管理员', 'ent' => $eCnt, 'elem' => '#signinbtn'], 'alert');
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
        $auth_code_obj = new Captcha(rqst('name', 'auth_code'));
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
     */
    public function signout(): ?View {
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

    /**
     * 锁屏
     */
    public function lock(): View {
        $this->passport->lockScreen();

        return view('lock');
    }

    /**
     * 解锁屏幕
     *
     * @post
     * @unlock
     */
    public function unlock(): JsonView {
        $passwd = rqst('passwd');
        if ($this->passport->unlockScreen($passwd)) {
            return Ajax::success();
        }

        return Ajax::error('');
    }
}