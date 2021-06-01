<?php

namespace backend\classes\layui;

class TableDef {
    private $cols;
    private $data;

    public function __construct(array $cols, ?TableData $data = null) {
        $this->data = $data ? $data->getData() : [];
        $this->cols = $cols;
    }

    /**
     * 获取数据.
     * @return array
     */
    public function data(): array {
        return $this->data;
    }

    /**
     * 表头
     * @return array
     */
    public function cols(): array {
        return $this->cols;
    }
}