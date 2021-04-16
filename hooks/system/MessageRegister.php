<?php

namespace backend\hooks\system;

use backend\classes\message\Notice;
use system\classes\Message;
use wulaphp\hook\Handler;

class MessageRegister extends Handler {
    public function handle(...$args) {
        Message::register(new Notice());
    }
}