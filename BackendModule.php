<?php

namespace backend {

    use wulaphp\app\App;
    use wulaphp\app\Module;
    use wulaphp\io\Ajax;
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
        public static function onDenied($view, string $message): ?View {
            if (Request::isAjaxRequest()) {
                $view = Ajax::fatal($message ? $message : __('Permission denied'), 403);
            } else {
                Response::respond(403, $message ? $message : __('Permission denied'));
            }

            return $view;
        }

        /**
         * 用户被禁用了。
         *
         * @param \wulaphp\mvc\view\View|null $view
         *
         * @filter mvc\admin\onLocked
         * @return \wulaphp\mvc\view\View
         */
        public static function onLocked(?View $view): ?View {
            if (Request::isAjaxRequest()) {
                $view = Ajax::fatal('You are blocked', 403);
            }

            return $view;
        }
    }
}

namespace {

    use wulaphp\app\App;
    use wulaphp\i18n\I18n;

    function smarty_function_uicfg($params, $tpl) {
        if (isset($params['isTop']) && $params['isTop']) {
            $groups = wulaphp\app\App::$prefix;
            unset($groups['check']);
            $config['login']   = App::url('backend/login');
            $config['lockurl'] = App::url('backend/lock');
            $me                = whoami('admin');
            $config['slocked'] = $me->screenLocked;
            $config['ids']     = App::id2dir();
            $config['base']    = WWWROOT_DIR;
            $config['assets']  = WWWROOT_DIR . ASSETS_DIR . '/';
            $config['ids']     = wulaphp\app\App::id2dir();
            $config['groups']  = $groups ? $groups : ['char' => []];
            $config['lang']    = I18n::getTranslates();

            return json_encode($config);
        } else {
            return 'top.wulacfg';
        }
    }
}