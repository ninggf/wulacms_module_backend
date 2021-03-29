<?php

namespace backend {

    use wulaphp\app\App;
    use wulaphp\app\Module;
    use wulaphp\io\Request;
    use wulaphp\io\Response;
    use wulaphp\mvc\view\View;

    /**
     * 管理后台模块
     * @group kernel
     */
    class BackendModule extends Module {
        public function getName(): string {
            return '管理后台';
        }

        public function getDescription(): string {
            return '基于layui的易扩展管理后台界面';
        }

        public function getHomePageURL(): string {
            return 'https://www.wulacms.com/modules/backend';
        }

        public function getAuthor(): string {
            return 'Leo Ning';
        }

        public function getVersionList(): array {
            $v['1.0.0'] = '管理后台的第一个版本';

            return $v;
        }

        /**
         * 需要登录才能操作.
         *
         * @param $view
         *
         * @filter mvc\admin\needLogin
         * @return mixed
         */
        public static function onNeedLogin($view) {
            if (Request::isAjax()) {
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
         * @filter mvc\admin\onDenied
         * @return \wulaphp\mvc\view\View
         */
        public static function onDenied($view, string $message): ?View {
            if ($view) {
                return $view;
            }
            if (Request::isAjax()) {
                Response::respond(403, $message ? $message : __('Permission denied'));
            } else {
                $view = view('~backend/views/denied', ['message' => $message ? $message : __('Permission denied')]);
            }

            return $view;
        }

        /**
         * 用户被禁用了。
         *
         * @param $view
         *
         * @filter mvc\admin\onBlocked
         * @return mixed
         */
        public static function onBlocked($view) {
            if (!$view) {
                if (Request::isAjax()) {
                    Response::respond(390, App::url('backend/blocked'));
                } else {
                    Response::redirect(App::url('backend/blocked'));
                }
            }

            return $view;
        }

        /**
         * @filter mvc\admin\onScreenLocked
         *
         * @param $view
         *
         * @return mixed
         */
        public static function onScreenLocked($view) {
            if (!$view) {
                if (Request::isAjax()) {
                    Response::respond(391, App::url('backend/locked'));
                } else {
                    Response::redirect(App::url('backend/locked'));
                }
            }

            return $view;
        }
    }
}

namespace {

    use wulaphp\app\App;
    use wulaphp\auth\Passport;
    use wulaphp\i18n\I18n;

    function smarty_function_uicfg($params, $tpl) {
        if (isset($params['isTop']) && $params['isTop']) {
            $groups = wulaphp\app\App::$prefix;
            unset($groups['check']);
            $config['login']  = App::url('backend/login');
            $config['lurl']   = App::url('backend/locked');
            $config['blurl']  = App::url('backend/blocked');
            $config['ids']    = App::id2dir();
            $config['base']   = WWWROOT_DIR;
            $config['assets'] = WWWROOT_DIR . ASSETS_DIR . '/';
            $config['mBase'] = App::res('/');
            $config['ids']    = wulaphp\app\App::id2dir();
            $config['groups'] = $groups ? $groups : ['char' => []];
            $config['lang']   = I18n::getTranslates();

            return json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } else {
            return 'top.wulacfg';
        }
    }

    /**
     * 是否能操作
     *
     * @param string $opRes
     * @param null   $extras 额外数据
     *
     * @return bool
     */
    function ican(string $opRes, $extras = null): bool {
        static $passport = null;
        if (!$passport) {
            $passport = Passport::get(Passport::currentType('admin'));
        }
        if ($extras !== null) {
            $extras = (array)$extras;
        }

        return $passport->cando($opRes, $extras);
    }

    /**
     * 我是$role吗?
     *
     * @param string ...$role
     *
     * @return bool
     */
    function iam(string ...$role): bool {
        static $passport = null;
        if (!$passport) {
            $passport = Passport::get(Passport::currentType('admin'));
        }

        return $passport->is($role);
    }
}