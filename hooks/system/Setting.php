<?php

namespace backend\hooks\system;

use wulaphp\hook\Alter;

class Setting extends Alter {
    public function alter($value, ...$args) {
        $value['common'] = new class extends \system\classes\Setting {
            public function getId(): string {
                return 'common';
            }

            public function getName(): string {
                return __('Common Setting');
            }

            public function getView(): string {
                return '~backend/views/settings/common';
            }
        };

        return $value;
    }
}