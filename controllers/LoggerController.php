<?php

namespace backend\controllers;

use backend\classes\PageController;
use system\classes\ILogger;
use system\classes\Syslog;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\View;

/**
 * 日志控制器
 * @acl     r:system/logger
 * @package backend\controllers
 */
class LoggerController extends PageController {
    /**
     * 日志列表页
     *
     * @param string $loggerId
     *
     * @return \wulaphp\mvc\view\View
     */
    public function index(string $loggerId): ?View {
        if (!$this->passport->cando('r:system/logger/' . $loggerId)) {
            return $this->onDenied(__('you are denied'), null);
        }
        $logger = $this->getLogger($loggerId);
        $view   = $logger->getView();
        $data   = json_encode($logger->getData($loggerId, Request::getInstance()->requests()), JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
        $cols   = json_encode($logger->getCols(), JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);

        return $this->render($view, ['loggerId' => $loggerId, 'tableCols' => $cols, 'tableData' => $data]);
    }

    /**
     * 日志数据.
     *
     * @param string $loggerId
     *
     * @return array|mixed|\wulaphp\mvc\view\SimpleView
     */
    public function data(string $loggerId) {
        if (!$this->passport->cando('r:system/logger/' . $loggerId)) {
            return $this->onDenied(__('you are denied'), null);
        }
        $logger = $this->getLogger($loggerId);

        return $logger->getData($loggerId, Request::getInstance()->requests());
    }

    private function getLogger($loggerId): ILogger {
        $logger = Syslog::logger($loggerId);
        if (!$logger) {
            Response::respond(404);
        }

        return $logger;
    }
}