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
    protected function renderTable($tpl = null, array $data = []): View {
        $data['pageData']['table']['data'] = $this->data()->getData();
        $data['pageData']['table']['cols'] = $this->cols();

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