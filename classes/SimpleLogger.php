<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes;

use system\classes\CommonLogger;

class SimpleLogger extends CommonLogger {
    function getId(): string {
        return 'common';
    }

    function getName(): string {
        return __('Common Log');
    }

    public function getCols(): array {
        $cols[] = ['field' => 'date', 'title' => __('Datetime'), 'width' => 180, 'fixed' => true];
        $cols[] = ['field' => 'username', 'title' => __('Username'), 'width' => 150, 'sort' => true, 'fixed' => true];
        $cols[] = ['field' => 'action', 'title' => __('Action'), 'width' => 90, 'fixed' => true];
        $cols[] = ['field' => 'ip', 'title' => 'IP', 'width' => 150];
        $cols[] = ['field' => 'message', 'title' => __('Log'), 'minWidth' => 300];
        $cols[] = ['field' => 'valu1', 'title' => __('New Value')];
        $cols[] = ['field' => 'valu2', 'title' => __('Old Value')];

        return [$cols];
    }

    public function getView(): ?string {
        return '~backend/views/logger/common';
    }
}