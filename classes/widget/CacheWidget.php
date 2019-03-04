<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes\widget;

use backend\classes\Widget;

class CacheWidget extends Widget {
    public function render() {
        return $this->load('backend/views/widget/cache');
    }

    public function name() {
        return __('Cache');
    }

    public function defaultWidth() {
        return 12;
    }

    public function minWidth() {
        return 4;
    }
}