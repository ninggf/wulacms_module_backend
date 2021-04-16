<?php

namespace backend\controllers;

use backend\classes\layui\TableData;
use backend\classes\layui\TablePage;
use backend\classes\PageController;
use system\classes\Message;
use wulaphp\io\Request;
use wulaphp\mvc\view\View;

/**
 * Class MessageController
 * @package backend\controllers
 * @acl     r:system/message
 */
class MessageController extends PageController {
    use TablePage;

    public function index(): View {
        $messages    = Message::messages();
        $editViews   = [];
        $newMsgItems = [];
        foreach ($messages as $type => $msg) {
            $editViews[ $type ] = $msg->getEditView()->render();
            $newMsgItems[]      = [
                'title' => $msg->getName(),
                'id'    => $type
            ];
        }
        $defaultType = array_keys($editViews)[0];
        Request::getInstance()->addUserData(['msgType' => $defaultType]);

        return $this->renderTable('message', [
            'editors'  => $editViews,
            'messages' => $messages,
            'pageData' => ['newMsgItems' => $newMsgItems]
        ]);
    }

    /**
     */
    public function data(): TableData {
        $where   = [
            'M.tenant_id' => $this->passport->tenant_id
        ];
        $msgType = rqst('msgType');
        if ($msgType) {
            $where['M.type'] = $msgType;
        }
        $date = rqst('date');
        if ($date) {
            $date                     = explode(' - ', $date);
            $sdate                    = ($date[0] ?? date('Y-m-d', strtotime('-7 days'))) . ' 00:00:00';
            $edate                    = ($date[1] ?? date('Y-m-d')) . ' 23:59:59';
            $sdate                    = strtotime($sdate);
            $edate                    = strtotime($edate);
            $where['M.create_time #'] = [$sdate, $edate];
        }
        $status = rqst('status');
        if (is_numeric($status)) {
            $where['M.status'] = intval($status);
        }
        $page  = irqst('page', 1);
        $limit = irqst('limit', 30);
        $sort  = (array)(rqst('sort') ?: []);
        $sortf = aryget('name', $sort, 'id');
        if ($sortf == 'id') {
            $sortf = 'M.id';
        }
        $sortd        = aryget('dir', $sort, 'd');
        $messageModel = new \system\classes\model\Message();
        $msgs         = $messageModel->alias('M')->find($where, 'M.*,U.name,UM.value as nickname')->page($page, $limit)->sort($sortf, $sortd);
        $msgs->left('{user} AS U', 'M.uid', 'U.id');
        $msgs->join('{user_meta} AS UM', 'U.id = UM.user_id AND UM.name =\'nickname\'');
        $total = $msgs->total();
        $msg   = $msgs->toArray();

        array_walk($msg, function (&$item) {
            $item['create_time'] = date('Y-m-d H:i', $item['create_time']);
            switch ($item['status']) {
                case 0:
                    $item['status'] = __('Draft');
                    break;
                case 1:
                    $item['status'] = __('Published');
                    break;
                default:
                    $item['status'] = __('Deleted');
            }
            $item['name'] = ($item['name'] ?? '-') . '/' . ($item['nickname'] ?? '-');
        });

        return new TableData($msg, $total);
    }

    public function view() {

    }

    protected function cols(): array {
        $cols   = [];
        $cols[] = ['field' => 'id', 'title' => 'ID', 'width' => 80];
        $cols[] = ['field' => 'create_time', 'title' => __('Create & Publish Time'), 'width' => 180];
        $cols[] = ['field' => 'name', 'title' => __('User'), 'width' => 150];
        $cols[] = ['field' => 'status', 'title' => __('Status'), 'width' => 80];
        $cols[] = ['field' => 'title', 'title' => __('Title & Desc'), 'templet' => '#title_desc'];
        $cols[] = ['field' => '_ops', 'width' => 80, 'toolbar' => '#toolbar'];

        return [$cols];
    }
}