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
use wulaphp\form\FormTable;

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
		$url     = isset ($definition['url']) ? $definition['url'] : App::url('media/upload');
		$width   = isset ($definition ['width']) ? ' data-width="' . $definition['width'] . '"' : '';
		$height  = isset ($definition ['height']) ? ' data-height="' . $definition['height'] . '"' : '';
		$resize  = isset ($definition ['resize']) ? ' data-resize="' . $definition['resize'] . '"' : '';
		$maxfs   = isset ($definition ['maxFileSize']) ? ' data-max-file-size="' . $definition['maxFileSize'] . '"' : '';
		$exts    = isset ($definition ['exts']) ? ' data-exts="' . $definition['exts'] . '"' : '';
		$multi   = isset ($definition ['multi']) ? ' data-multi="' . $definition['multi'] . '"' : '';
		$noWater = isset ($definition ['noWater']) ? ' data-no-water' : '';

		return '<div id="' . $id . '" data-name="' . $this->name . '" data-uploader="' . $url . '"' . $width . $height . $resize . $maxfs . $exts . $multi . $noWater . $readonly . $disabled . $auto . '></div>';
	}

	public function getOptionForm() {
		return new FileUploaderFieldForm(true);
	}
}

class FileUploaderFieldForm extends FormTable {
	public $table = null;
	/**
	 * 组件宽
	 * @var \backend\form\TextField
	 * @type int
	 * @digits
	 * @layout 1,col-xs-4
	 */
	public $width;
	/**
	 * 组件高
	 * @var \backend\form\TextField
	 * @type int
	 * @digits
	 * @layout 1,col-xs-4
	 */
	public $height;
	/**
	 * 调整宽高(宽x高)
	 * @var \backend\form\TextField
	 * @type string
	 * @digits
	 * @layout 1,col-xs-4
	 */
	public $resize;
	/**
	 * 允许最大尺寸
	 * @var \backend\form\TextField
	 * @type string
	 * @digits
	 * @layout 2,col-xs-4
	 */
	public $maxFileSize;
	/**
	 * 允许的扩展名
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 2,col-xs-8
	 */
	public $exts;
	/**
	 * 最多上传(0表示上传1张)
	 * @var \backend\form\TextField
	 * @type int
	 * @digits
	 * @layout 3,col-xs-4
	 */
	public $multi = 0;
	/**
	 * 不添加水印
	 * @var \backend\form\CheckboxField
	 * @type bool
	 * @layout 3,col-xs-4
	 */
	public $noWater = 1;
	/**
	 * 选择后立即上传
	 * @var \backend\form\CheckboxField
	 * @type bool
	 * @layout 3,col-xs-4
	 */
	public $auto = 1;
}