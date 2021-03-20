<?php

namespace backend\controllers;

use backend\classes\PageController;
use system\classes\Setting;
use wulaphp\io\Ajax;
use wulaphp\io\Response;
use wulaphp\mvc\view\View;

/**
 * @acl     v:settings
 * @package backend\controllers
 */
class SettingsController extends PageController {
    public function index(string $settingId): ?View {
        if (!$this->passport->cando('v:settings/' . $settingId)) {
            return $this->onDenied(__('you are denied'), null);
        }
        $setting = $this->getSetting($settingId);
        $view    = $setting->getView();

        return $this->render($view);
    }

    public function save(string $settingId): ?View {
        if (!$this->passport->cando('v:settings/' . $settingId)) {
            return $this->onDenied(__('you are denied'), null);
        }

        $setting = $this->getSetting($settingId);
        //$setting->save();
        //TODO: 保存配置.

        return Ajax::success();
    }

    private function getSetting(string $sid): Setting {
        $setting = Setting::getSetting($sid);
        if (!$setting instanceof Setting) {
            Response::respond(404);
        }

        return $setting;

    }
}