<?php

namespace backend\hooks\system;

use system\classes\ILogger;
use system\classes\SimpleLogger;
use wulaphp\hook\Alter;

class Logger extends Alter implements ILogger {
    use SimpleLogger;

    public function alter($value, ...$args) {
        $value['authlog'] = $this;

        return $value;
    }

    function getId(): string {
        return 'authlog';
    }

    function getName(): string {
        return __('Login log');
    }

    function getIconCls(): ?string {
        return 'layui-icon-key';
    }

    function getView(): ?string {
        return '~backend/views/logs/authlog';
    }
}