<?php

namespace backend\hooks\system;

use backend\classes\LoginLogger;
use backend\classes\SimpleLogger;
use wulaphp\hook\Alter;

class Logger extends Alter {

    public function alter($value, ...$args) {
        $value['common']  = new SimpleLogger();
        $value['authlog'] = new LoginLogger();

        return $value;
    }
}