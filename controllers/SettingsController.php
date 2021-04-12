<?php

namespace backend\controllers;

use backend\classes\PageController;
use system\classes\Setting;
use system\classes\Syslog;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\View;

/**
 * @acl r:system/settings
 * @package backend\controllers
 */
class SettingsController extends PageController {
    public function index(string $settingId): ?View {
        if (!$this->passport->cando('r:system/settings/' . $settingId)) {
            return $this->onDenied(__('Permission denied'), null);
        }
        $setting = $this->getSetting($settingId);
        $view    = $setting->getView();
        $data    = $setting->getData();
        $name    = $setting->getName();

        return $this->render($view, [
            'settingId'   => $settingId,
            'settingName' => $name,
            'sets'        => $data,
            'settingData' => json_encode($data),
            'settingObject' => $setting
        ]);
    }

    /**
     * @post
     *
     * @param string $settingId
     *
     * @return \wulaphp\mvc\view\View|null
     */
    public function save(string $settingId): ?View {
        if (!$this->passport->cando('save:system/settings/' . $settingId)) {
            return $this->onDenied(__('Permission denied'), null);
        }
        $setting = $this->getSetting($settingId);
        $rst     = $setting->save(rqst('setting'));

        if (!$rst) {
            return Ajax::error(__('Save failed!'), 'notice');
        }
        Syslog::info('common', 'Setting successfully', 'Setting', $this->passport->uid, '', json_encode(Request::getInstance()->requests()));
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