<?php

namespace backend\hooks\backend;

use system\classes\Setting;
use system\classes\Syslog;
use wulaphp\app\App;
use wulaphp\hook\Handler;

class InitDashboard extends Handler {
    protected $acceptArgs = 2;

    public function handle(...$args) {
        /**@var \backend\classes\Dashboard $dashboard */
        $dashboard = $args[0];
        /**@var \system\classes\AdminPassport $passport */
        $passport = $args[1];
        if ($passport->cando('r:system')) {
            $naviMenu        = $dashboard->naviMenu();
            $system          = $naviMenu->get('system', __('System'), 999999);
            $system->iconCls = 'layui-icon-set';
            # 账户
            if ($passport->cando('r:system/account')) {
                $account          = $system->get('account', __('Account'), 1);
                $account->iconCls = 'layui-icon-user';
                if ($passport->cando('r:system/account/user')) {
                    $user          = $account->get('user', __('User'), 1);
                    $user->iconCls = 'layui-icon-user';
                    $user->url     = App::url('backend/user');
                }
                if ($passport->cando('r:system/account/role')) {
                    $role          = $account->get('role', __('Role'), 2);
                    $role->iconCls = 'layui-icon-group';
                    $role->url     = App::url('backend/role');
                }
            }
            # 设置
            if ($passport->cando('r:system/settings')) {
                $settings = Setting::settings();
                if ($settings) {
                    $setting          = $system->get('setting', __('Settings'), 999998);
                    $setting->iconCls = 'layui-icon-util';
                    foreach ($settings as $s) {
                        if ($s instanceof Setting) {
                            $id   = str_replace([' ', '-'], '_', $s->getId());
                            $name = $s->getName();
                            if ($passport->cando('r:system/settings/' . $id)) {
                                $lm          = $setting->get($id, $name);
                                $lm->iconCls = $s->getIconCls() ?? 'layui-icon-util';
                                $lm->url     = App::url('backend/settings/' . $id);
                            }
                        }
                    }
                }
            }
            # 日志
            if ($passport->cando('r:system/logger')) {
                $loggers = Syslog::loggers();
                if ($loggers) {
                    $log          = $system->get('log', __('Logs'), 999999);
                    $log->iconCls = 'layui-icon-log';
                    foreach ($loggers as $logger) {
                        $id   = str_replace([' ', '-'], '_', $logger->getId());
                        $name = $logger->getName();
                        if ($passport->cando('r:system/logger/' . $id)) {
                            $lm          = $log->get($id, $name);
                            $lm->iconCls = $logger->getIconCls() ?? 'layui-icon-log';
                            $lm->url     = App::url('backend/logger/' . $id);
                        }
                    }
                }
            }
        }

        //顶部菜单
        //        $topMenu                = $dashboard->topMenu();
        //        $msg                    = $topMenu->get('msg', __('Message'), 1);
        //        $msg->iconCls           = 'layui-icon-notice';
        //        $msg->badge             = 10;
        //        $msg->attrs['ew-event'] = 'message';
        //        $msg->data['url']       = App::url('backend/notices');
    }
}