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

use wulaphp\form\FormTable;
use wulaphp\validator\JQueryValidator;

class WidgetSettingForm extends FormTable {
    use JQueryValidator;
    public $table = null;
    /**
     * 小部件标题
     * @var \backend\form\TextField
     * @type string
     * @required
     */
    public $name;

    /**
     * @param array $data
     */
    public function saveCfg($data) {

    }

    public function loadCfg($data) {
        return $data;
    }
}