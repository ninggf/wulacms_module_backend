<?php

namespace backend\controllers;

use wulaphp\app\App;
use wulaphp\io\IUploader;
use wulaphp\io\Response;
use wulaphp\io\UploadFile;
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

        $file = $this->_prepareFile($app, $url);

        # 上传
        $rst = $this->upload($file);

        if ($rst['done']) {
            $rst['code']          = 200;
            $rst['result']['url'] = trailingslashit($url) . $rst['result']['url'];
        } else {
            Response::respond($rst['error']['code'], $rst['error']['message']);
        }

        return $rst;
    }

    public function raw(string $app) {
        # 权限检测
        if (!$this->passport->cando($app . ':system/file')) {
            return $this->onDenied('you are denied');
        }
        $rawData = rqst('rawData');
        //TODO 将rawData转换成图片然后

    }

    private function _prepareFile(string $app, ?string &$url): UploadFile {
        $uploaderDef = App::acfg('uploader');
        $apps        = array_filter($uploaderDef, function ($v) {
            return $v{0} != '#';
        }, ARRAY_FILTER_USE_KEY);

        if (!$apps) {
            Response::respond(503, 'missing uploader configuration');
        }

        if (!isset($apps[ $app ])) {
            Response::respond(404);
        }
        # 应用定义
        $appDef = $apps[ $app ];
        $ref    = $appDef['ref'] ?? null;
        if (!$ref) {
            Response::respond(503, 'missing ref of ' . $app);
        }
        if (!isset($uploaderDef[ $ref ])) {
            Response::respond(503, 'missing uploader ' . $ref);
        }

        # 上传器配置
        $uploaderCnf = array_merge($uploaderDef[ $ref ], $appDef);
        $uploaderClz = $uploaderCnf['uploader'] ?? '';
        if (!$uploaderClz || !($uploaderCls = new $uploaderClz()) instanceof IUploader) {
            Response::respond(503, $uploaderClz . ' is not an implementation of ' . IUploader::class);
        }
        /**@var \wulaphp\io\IUploader $uploaderCls */
        if (!$uploaderCls->setup($uploaderCnf['setup'] ?? [])) {
            Response::respond(500, $uploaderCls->get_last_error());
        }
        $watermark = array_pad((array)($uploaderCnf['watermark'] ?? []), 3, null);
        $url       = $uploaderCnf['url'] ?? App::base('');
        $allowed   = (array)($uploaderCnf['allowed'] ?? []);
        $maxSize   = intval($uploaderCnf['maxSize'] ?? 10000000);

        $file = new UploadFile('', $allowed, $maxSize);
        $file->setWatermark($watermark[0], $watermark[1], $watermark[2]);
        $file->setUploader($uploaderCls);
        if (isset($uploaderCnf['extractor']) && $uploaderCnf['extractor'] instanceof \Closure) {
            $file->setMetaDataExtractor($uploaderCnf['extractor']);
        }
        if (isset($appDef['-watermark'])) {
            $file->setWatermark(null);
        }

        return $file;
    }
}