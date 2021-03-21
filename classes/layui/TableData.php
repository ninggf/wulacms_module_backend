<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes\layui;

use wulaphp\mvc\view\JsonView;

class TableData extends JsonView {
    /**
     * 构建一个适用于Layui table的数据结构。
     *
     * @param array $data
     * @param int   $total
     */
    public function __construct(array $data = [], int $total = 0) {
        parent::__construct(['data' => $data, 'count' => $total, 'code' => 0]);
    }

    /**
     * 设置响应代码。
     *
     * @param int $code
     *
     * @return $this
     */
    public function code(int $code): TableData {
        $this->data['code'] = $code;

        return $this;
    }

    /**
     * 设置错误信息.
     *
     * @param string $msg
     *
     * @return $this
     */
    public function msg(string $msg): TableData {
        $this->data['msg'] = $msg;

        return $this;
    }

    /**
     * 设置聚合行.
     *
     * @param array $row
     *
     * @return $this
     */
    public function totalRow(array $row): TableData {
        $this->data['totalRow'] = $row;

        return $this;
    }

    public function toString(): string {
        return $this->render();
    }
}