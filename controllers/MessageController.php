<?php

namespace backend\controllers;

use backend\classes\layui\TableData;
use backend\classes\layui\TableDef;
use backend\classes\layui\TablePage;
use backend\classes\PageController;
use system\classes\Message;
use system\classes\MessageDto;
use system\classes\model\MessageReadLog;
use wulaphp\app\App;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
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

    public function center(): View {
        $this->pageTitle = _t('User Message Center');
        $messages        = Message::messages();
        $defaultType     = array_keys($messages)[0];
        Request::getInstance()->addUserData(['msgType' => $defaultType]);

        return $this->renderTable(new TableDef($this->centerCols(), $this->centerData()), [
            'messages' => $messages
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
        # 没有审订权限时只能查看自己发的通知.
        if (!$this->passport->cando('apr:system/message/' . $msgType)) {
            $where['M.create_uid'] = $this->passport->uid;
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
        $fields       = <<<'FIELDS'
M.*,U.name,UM.value as nickname,
CU.name AS cu_name, CUM.value AS cu_nick,
PU.name AS pu_name, PUM.value AS pu_nick
FIELDS;

        $msgs = $messageModel->alias('M')->find($where, $fields);
        $msgs->page($page, $limit);
        $msgs->asc('M.status')->sort($sortf, $sortd);
        $msgs->left('{user} AS U', 'M.uid', 'U.id');
        $msgs->join('{user_meta} AS UM', 'U.id = UM.user_id AND UM.name =\'nickname\'');
        $msgs->left('{user} AS CU', 'M.create_uid', 'CU.id');
        $msgs->join('{user_meta} AS CUM', 'CU.id = CUM.user_id AND CUM.name =\'nickname\'');
        $msgs->left('{user} AS PU', 'M.publish_uid', 'PU.id');
        $msgs->join('{user_meta} AS PUM', 'PU.id = PUM.user_id AND PUM.name =\'nickname\'');
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
     * 消息中心数据
     */
    public function centerData(): TableData {
        $msgType = rqst('msgType');

        $msg = Message::createMessage($msgType);
        if (!$msg) {
            return new TableData();
        }

        $page  = irqst('page', 1);
        $limit = irqst('limit', 30);
        $start = $page - 1;
        $start = $start < 0 ? 0 : $start;
        $total = 0;
        $msgs  = $msg->getMessages($this->passport->uid, $start, $limit, $total, ['M.type=%s', $msgType]);
        foreach ($msgs as &$msg) {
            $msg['publish_time'] = date('Y-m-d H:i:s');
            $msg['read_time']    = $msg['read_time'] ? date('Y-m-d H:i:s') : 0;
        }

        return new TableData($msgs, $total);
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

    public function view(int $id): View {
        $msgM = new \system\classes\model\Message();
        $msg  = $msgM->alias('M')->select('M.*,U.name as user_name,UM.value as nickname')->where(['M.id'=>$id])
            ->join('{user} AS U','M.publish_uid = U.id')
            ->join('{user_meta} AS UM','UM.user_id = M.publish_uid and UM.name = \'nickname\'')->get();

        if (!$msg) {
            Response::respond(404);
        }
        $uid = $this->passport->uid;
        # 消息还没有发布且无审核权限时
        if (!$msg['status'] && $this->passport->cando('apr:system/message/' . $msg['type']) && $uid != $msg['create_uid']) {
            Response::respond(403, '你无权查看此通知');
        }
        # 指定查看用户的消息
        if ($msg['status'] == 1 && $msg['uid'] && $uid = $msg['uid'] && $this->passport->cando('r:system/message/' . $msg['type'])) {
            Response::respond(403, '你无权查看此通知');
        }

        $message = Message::createMessage($msg['type']);
        if (!$message) {
            Response::respond(500, '无法处理此消息');
        }

        if ($msg['status'] == 1) {
            # 标记为以读
            $read['user_id']    = $uid;
            $read['message_id'] = $id;
            $read['read_time']  = $read['last_read_time'] = time();
            $read['read_ip']    = $read['last_read_ip'] = Request::getIp();
            $read['read_count'] = 1;
            $readLog            = new MessageReadLog();
            $readLog->upsert($read, [
                'read_count'     => imv('read_count+1'),
                'last_read_time' => $read['last_read_time'],
                'last_read_ip'   => $read['last_read_ip']
            ], 'u_m_id');
        }
        $messageContent = $message->getView($msg)->render();

        return $this->render(['message_content' => $messageContent, 'message' => $msg])->addStyle(App::res('backend/assets/css/md.css'));
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
            'title'   => __('Create'),
            'width'   => 165,
            'templet' => '#createTpl'
        ];
        $cols[] = [
            'field'   => 'publish_time',
            'title'   => __('Publish'),
            'width'   => 165,
            'templet' => '#publishTpl'
        ];
        $cols[] = ['field' => 'name', 'title' => __('User'), 'width' => 150];
        $cols[] = ['field' => 'status', 'title' => __('Status'), 'width' => 100, 'templet' => '#statusTpl'];
        $cols[] = ['field' => 'title', 'title' => __('Title & Desc'), 'templet' => '#title_desc'];
        $cols[] = ['field' => '_ops', 'width' => 120, 'toolbar' => '#toolbar'];

        return [$cols];
    }

    protected function centerCols(): array {
        $cols   = [];
        $cols[] = ['field' => 'id', 'title' => 'ID', 'with' => 'sts', 'width' => 80];
        $cols[] = ['field' => 'title', 'title' => __('Title & Desc'), 'minWidth' => 300, 'templet' => '#title_desc'];
        $cols[] = [
            'field' => 'publish_time',
            'title' => __('Publish Time'),
            'width' => 165
        ];
        $cols[] = ['field' => 'status', 'title' => __('Read Time'), 'width' => 165, 'templet' => '#statusTpl'];

        return [$cols];
    }
}