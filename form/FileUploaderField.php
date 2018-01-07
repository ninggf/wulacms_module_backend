<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\form;

use wulaphp\app\App;
use wulaphp\form\FormField;

class FileUploaderField extends FormField {
	public function getName() {
		return _tr('File Uploader@form');
	}

	protected function renderWidget($opts) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$readonly   = isset ($definition ['readonly']) ? ' data-readonly ' : '';
		$disabled   = isset ($definition ['disabled']) ? ' data-disabled ' : '';

		$auto    = isset ($definition ['auto']) ? ' data-auto ' : '';
		$url     = isset ($definition['url']) ? $definition['url'] : App::url('~media/upload');
		$width   = isset ($definition ['width']) ? ' data-width="' . $definition['width'] . '"' : '';
		$height  = isset ($definition ['height']) ? ' data-height="' . $definition['height'] . '"' : '';
		$resize  = isset ($definition ['resize']) ? ' data-resize="' . $definition['resize'] . '"' : '';
		$maxfs   = isset ($definition ['maxFileSize']) ? ' data-max-file-size="' . $definition['maxFileSize'] . '"' : '';
		$exts    = isset ($definition ['exts']) ? ' data-exts="' . $definition['exts'] . '"' : '';
		$multi   = isset ($definition ['multi']) ? ' data-multi="' . $definition['multi'] . '"' : '';
		$noWater = isset ($definition ['noWater']) ? ' data-no-water' : '';

		return '<div id="' . $id . '" data-name="' . $this->name . '" data-uploader="' . $url . '"' . $width . $height . $resize . $maxfs . $exts . $multi . $noWater . $readonly . $disabled . $auto . '></div>';
	}
}