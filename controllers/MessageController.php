<?php

namespace backend\controllers;

use backend\classes\layui\TableData;
use backend\classes\layui\TablePage;
use backend\classes\PageController;
use system\classes\Message;
use system\classes\MessageDto;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\mvc\view\View;

/**
 * Class MessageController
 * @package backend\controllers
 *
 */
class MessageController extends PageController {
    use TablePage;

    /**
     * @acl     r:system/message
     * @return \wulaphp\mvc\view\View
     */
    public function index(): View {
        $messages    = Message::messages();
        $editViews   = [];
        $newMsgItems = [];
        $permitTypes = [];
        $myMsgs      = [];
        foreach ($messages as $type => $msg) {
            if ($this->passport->cando('edit:system/message/' . $type)) {
                $editViews[ $type ]   = $msg->getEditView()->render();
                $newMsgItems[]        = [
                    'title' => $msg->getName(),
                    'id'    => $type
                ];
                $permitTypes[ $type ] = $msg->getName();
                $myMsgs[ $type ]      = $msg;
            }
        }
        $defaultType = array_keys($editViews)[0];
        Request::getInstance()->addUserData(['msgType' => $defaultType]);

        return $this->renderTable('message', [
            'editors'  => $editViews,
            'messages' => $myMsgs,
            'pageData' => ['newMsgItems' => $newMsgItems, 'permitTypes' => $permitTypes]
        ]);
    }

    /**
     *
     * @acl     r:system/message
     */
    public function data(): TableData {
        $msgType = rqst('msgType');
        if (!$this->passport->cando('edit:system/message/' . $msgType)) {
            return new TableData([], 0);
        }
        $where = [
            'M.tenant_id' => $this->passport['tenant_id']
        ];

        if ($msgType) {
            $where['M.type'] = $msgType;
        }
        $uid = rqst('uid');
        if ($uid) {
            $where['M.uid'] = $uid;
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
        $status             = rqst('status');
        $where['M.deleted'] = 0;
        if (is_numeric($status)) {
            $where['M.status'] = intval($status);
            if ($status == 2) {
                $where['M.deleted'] = 1;
            }
        } else {
            $where['M.status <'] = 2;
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
        $total   = $msgs->total();
        $msg     = $msgs->toArray();
        $canEdit = $this->passport->cando('edit:system/message/' . $msgType);
        $canDel  = $this->passport->cando('del:system/message/' . $msgType);
        $canPub  = $this->passport->cando('pub:system/message/' . $msgType);
        array_walk($msg, function (&$item) use ($canDel, $canEdit, $canPub) {
            $item['create_time']  = date('Y-m-d H:i', $item['create_time']);
            $item['publish_time'] = $item['publish_time'] ? date('Y-m-d H:i', $item['publish_time']) : '';
            switch ($item['status']) {
                case 0:
                    $item['status'] = __('Draft');
                    $item['sts']    = '';
                    $item['cls']    = '';
                    break;
                case 1:
                    $item['status'] = __('Published');
                    $item['sts']    = 'SUCCESS';
                    $item['cls']    = 'success';
                    break;
                default:
                    $item['status'] = __('Deleted');
                    $item['sts']    = 'ERROR';
                    $item['cls']    = 'danger';
            }
            $item['name'] = ($item['name'] ?? '-') . '/' . ($item['nickname'] ?? '-');
            $item['ce']   = $canEdit;
            $item['cd']   = $canDel;
            $item['cp']   = $canPub;
        });

        return new TableData($msg, $total);
    }

    /**
     *
     * @throws \wulaphp\validator\ValidateException
     */
    public function savePost(string $_msgType): \wulaphp\mvc\view\JsonView {
        if (!$this->passport->cando('edit:system/message/' . $_msgType)) {
            $this->onDenied('you are denied');
        }
        $message = Message::createMessage($_msgType);
        if (!$message) {
            return Ajax::error('未知的消息类型');
        }
        $rst = $message->send(new MessageDto(true), $this->passport->uid, irqst('id'));
        if ($rst) {
            return Ajax::success('保存成功');
        } else {
            return Ajax::error('保存消息失败');
        }
    }

    public function view() {

    }

    /**
     * 删除消息.
     *
     * @param string $type
     * @param int    $id
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function deletePost(string $type, int $id): \wulaphp\mvc\view\JsonView {
        if (!$this->passport->cando('edit:system/message/' . $type)) {
            $this->onDenied('you are denied');
        }
        $msg = new \system\classes\model\Message();

        $rst = $msg->deleteMsg($id, $this->passport->uid);
        if ($rst > 0) {
            return Ajax::success('消息删除成功');
        } else {
            return Ajax::error('消息删除失败');
        }
    }

    /**
     * 删除消息.
     *
     * @param string $type
     * @param int    $id
     *
     * @return \wulaphp\mvc\view\JsonView
     */
    public function publishPost(string $type, int $id): \wulaphp\mvc\view\JsonView {
        if (!$this->passport->cando('pub:system/message/' . $type)) {
            $this->onDenied('you are denied');
        }
        $msg = new \system\classes\model\Message();

        $rst = $msg->publishMsg($id, $this->passport->uid);
        if ($rst > 0) {
            return Ajax::success('消息发布成功');
        } else {
            return Ajax::error('消息发布失败');
        }
    }

    protected function cols(): array {
        $cols   = [];
        $cols[] = ['field' => 'id', 'title' => 'ID', 'with' => 'sts', 'width' => 80];
        $cols[] = [
            'field'   => 'create_time',
            'title'   => __('Create & Publish Time'),
            'width'   => 180,
            'templet' => '#cpTimeTpl'
        ];
        $cols[] = ['field' => 'name', 'title' => __('User'), 'width' => 150];
        $cols[] = ['field' => 'status', 'title' => __('Status'), 'width' => 100, 'templet' => '#statusTpl'];
        $cols[] = ['field' => 'title', 'title' => __('Title & Desc'), 'templet' => '#title_desc'];
        $cols[] = ['field' => '_ops', 'width' => 120, 'toolbar' => '#toolbar'];

        return [$cols];
    }
}