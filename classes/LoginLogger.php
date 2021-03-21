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

class LoginLogger extends SimpleLogger {
    function getId(): string {
        return 'authlog';
    }

    function getName(): string {
        return __('Login Log');
    }

    function getIconCls(): ?string {
        return 'layui-icon-key';
    }

    public function getCols(): array {
        $cols[] = ['field' => 'date', 'title' => __('Datetime'), 'width' => 180, 'fixed' => true];
        $cols[] = ['field' => 'username', 'title' => __('Username'), 'width' => 150, 'sort' => true, 'fixed' => true];
        $cols[] = ['field' => 'action', 'title' => __('Action'), 'width' => 90, 'fixed' => true];
        $cols[] = ['field' => 'device', 'title' => __('Device'), 'width' => 70];
        $cols[] = ['field' => 'agent', 'title' => __('Agent'), 'width' => 150];
        $cols[] = ['field' => 'ip', 'title' => 'IP', 'width' => 150];
        $cols[] = ['field' => 'message', 'title' => __('Log'), 'minWidth' => 300];

        return [$cols];
    }

    /**
     * 在保存日志到数据库前对value1和value2进行处理.
     *
     * @param string|null $value1
     * @param string|null $value2
     */
    public function filter(?string &$value1 = null, ?string &$value2 = null) {
        $value2 = json_encode(['agent' => $_SERVER['HTTP_USER_AGENT'], 'device' => 'PC']);
    }

    /**
     * 对每条日志进行处理.
     *
     * @param array $item
     */
    protected function walk(array &$item) {
        $item['message'] = __($item['message'], $item['value1']);
        $detail          = @json_decode($item['value2'], true);
        if ($detail) {
            $item['device'] = $detail['device'];
            $item['agent']  = $detail['agent'];
        }
    }
}