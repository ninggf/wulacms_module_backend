<?php

namespace backend\classes\message;

use Michelf\MarkdownExtra;
use system\classes\Message;
use wulaphp\mvc\view\View;

/**
 * 系统通知.
 *
 * @package backend\classes\message
 */
class Notice extends Message {
    public function getType(): string {
        return 'notice';
    }

    public function getName(): string {
        return __('Notice');
    }

    /**
     * 查看视图
     *
     * @param array $data
     *
     * @return \wulaphp\mvc\view\View
     */
    public function getView(array $data): View {
        $data['content'] = MarkdownExtra::defaultTransform($data['content']);
        return view('backend/views/message/notice_view', $data);
    }

    /**
     * 编辑视图.
     *
     * @return \wulaphp\mvc\view\View
     */
    public function getEditView(): View {
        return view('backend/views/message/notice_editor');
    }

    /**
     * 通知中心视图.
     *
     * @param int $uid
     * @param int $start
     * @param int $limit
     *
     * @return \wulaphp\mvc\view\View
     */
    public function getNotifyView(int $uid, int $start = 0, int $limit = 30): View {
        $messages = $this->getMessages($uid, $start, $limit);
        $ctime    = time();
        foreach ($messages as &$msg) {
            $msg['create_time'] = readable_date($ctime - $msg['create_time']);
        }
        $data = [
            'messages' => $messages
        ];

        return view('backend/views/message/notice_notify', $data);
    }
}