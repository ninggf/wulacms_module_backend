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

use wulaphp\mvc\view\View;

trait TablePage {
    /**
     * @param null|array|string $tpl  模板或数据
     * @param array|null        $data 数据
     *
     * @return \wulaphp\mvc\view\View
     */
    protected function renderTable($tpl = null, ?array $data = null): View {
        if (is_array($tpl)) {
            $data      = $tpl;
            $tpl       = null;
            $cols      = $this->cols();
            $tableData = $this->data()->getData();
        } else if ($tpl instanceof TableDef) {
            $tableData = $tpl->data();
            $cols      = $tpl->cols();
            $tpl       = null;
        } else {
            $tableData = $this->data()->getData();
            $cols      = $this->cols();
        }
        $data['pageData']['table']['data'] = $tableData;
        $data['pageData']['table']['cols'] = $cols;

        return $this->render($tpl, $data);
    }

    protected function cols(): array {
        $cols[][] = ['field' => 'id', 'title' => '#'];

        return $cols;
    }

    public function data(): TableData {
        return new TableData();
    }
}