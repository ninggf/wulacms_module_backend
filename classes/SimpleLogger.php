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

    public function getIconCls(): ?string {
        return 'layui-icon-log';
    }

    public function getCols(): array {
        $cols[] = [
            'field' => 'date',
            'title' => __('Datetime'),
            'width' => 165,
            'with'  => 'level',
            'fixed' => 'left'
        ];
        $cols[] = ['field' => 'username', 'title' => __('Username'), 'width' => 120, 'sort' => true, 'fixed' => 'left'];
        $cols[] = [
            'field' => 'action',
            'title' => __('Action'),
            'width' => 120,
            'fixed' => 'left',
            'align' => 'center'
        ];
        $cols[] = ['field' => 'ip', 'title' => 'IP', 'width' => 100, 'align' => 'center'];
        $cols[] = ['field' => 'message', 'title' => __('Log'), 'minWidth' => 300];
        $cols[] = ['field' => 'value1', 'title' => __('Old Value')];
        $cols[] = ['field' => 'value2', 'title' => __('New Value')];

        return [$cols];
    }

    public function getView(): ?string {
        return '~backend/views/logger/common';
    }
}