<?php

namespace backend\controllers;

use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\controller\AdminController;
use wulaphp\mvc\controller\UploadSupport;

/**
 * 文件上传控制器.
 *
 * @package backend\controllers
 */
class UploadController extends AdminController {
    use UploadSupport;

    public function index(string $app) {
        # 权限检测
        if (!$this->passport->cando($app . ':system/file')) {
            return $this->onDenied('you are denied');
        }

        $file = $this->prepareFile($app, $url);

        # 上传
        $rst = $this->upload($file);

        if ($rst['done']) {
            $rst['code']          = 200;
            $rst['result']['url'] = trailingslashit($url) . $rst['result']['url'];
        } else {
            $rst['code']    = 500;
            $rst['message'] = $rst['error']['message'];
        }

        return $rst;
    }

    public function raw(string $app) {
        # 权限检测
        if (!$this->passport->cando($app . ':system/file')) {
            return $this->onDenied('you are denied');
        }

        $rawData = rqst('rawData');
        if (!$rawData) {
            Response::respond(411, 'now data');
        }

        if (!preg_match('#^data:image/(jpe?g|png);base64,(.+)$#', $rawData, $ms)) {
            Response::respond(415, 'only accept base64 encoded data');
        }
        $ext      = $ms[1];
        $data     = $ms[2];
        $fileName = md5($rawData . $this->sessionID);
        $imgData  = base64_decode($data, true);

        if (!$imgData) {
            Response::respond(415, 'only accept base64 encoded data');
        }

        if (!is_dir(TMP_PATH . 'plupload') && !mkdir(TMP_PATH . 'plupload', 0755)) {
            Response::respond(503, 'cannot create tmp directory');
        }

        $filePath = TMP_PATH . 'plupload' . DS . $fileName . '.' . $ext;
        if (!file_put_contents($filePath, $imgData)) {
            @unlink($filePath);
            Response::respond(503, 'cannot save tmp file');
        }

        $file = $this->prepareFile($app, $url);
        $file->setFile($filePath);

        # 上传
        Request::getInstance()->addUserData([
            'name' => $fileName . '.' . $ext
        ]);

        $rst = $this->upload($file);

        if ($rst['done']) {
            $rst['code']          = 200;
            $rst['result']['url'] = trailingslashit($url) . $rst['result']['url'];
            $rst['style']         = 2;
        } else {
            $rst['code']    = 500;
            $rst['message'] = $rst['error']['message'];
            $rst['style']   = 2;
        }

        return $rst;
    }
}