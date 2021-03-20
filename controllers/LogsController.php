<?php

namespace backend\controllers;

use backend\classes\PageController;
use system\classes\Syslog;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\View;

/**
 * 日志控制器
 * @acl     v:logs
 * @package backend\controllers
 */
class LogsController extends PageController {
    /**
     * 日志列表页
     *
     * @param string $loggerId
     *
     * @return \wulaphp\mvc\view\View
     */
    public function index(string $loggerId): ?View {
        if (!$this->passport->cando('v:logs/' . $loggerId)) {
            return $this->onDenied(__('you are denied'), null);
        }
        $logger = $this->getLogger($loggerId);
        $view   = $logger->getView();
        $data   = $logger->getData($loggerId, Request::getInstance()->requests());

        return $this->render($view, $data);
    }

    /**
     * 日志数据.
     *
     * @param string $loggerId
     *
     * @return array|mixed|\wulaphp\mvc\view\SimpleView
     */
    public function data(string $loggerId) {
        if (!$this->passport->cando('v:logs/' . $loggerId)) {
            return $this->onDenied(__('you are denied'), null);
        }
        $logger = $this->getLogger($loggerId);

        return $logger->getData($loggerId, Request::getInstance()->requests());
    }

    private function getLogger($loggerId): \system\classes\ILogger {
        $logger = Syslog::logger($loggerId);
        if (!$logger) {
            Response::respond(404);
        }

        return $logger;
    }
}