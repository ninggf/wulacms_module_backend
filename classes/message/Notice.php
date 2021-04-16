<?php

namespace backend\classes\message;

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
     * @param array $data
     *
     * @return \wulaphp\mvc\view\View
     */
    public function getNotifyView(array $data): View {
        return view('backend/views/message/notice_notify', $data);
    }
}