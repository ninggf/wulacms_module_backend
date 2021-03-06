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

use wulaphp\form\FormField;
use wulaphp\form\FormTable;

/**
 * Class DatepickerField
 * @package ui\classes
 * @since   v1.0
 */
class DatepickerField extends FormField {
	public function getName() {
		return _tr('Datepicker@form');
	}

	protected function renderWidget($opts) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$pl         = isset ($definition ['placeholder']) ? 'placeholder="' . $definition ['placeholder'] . '" ' : '';
		$readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled   = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		$class      = isset ($definition ['class']) ? $definition['class'] : '';
		$format     = isset ($definition ['format']) ? ' data-format="' . $definition['format'] . '"' : '';
		$from       = isset ($definition ['from']) ? ' data-start="#' . $definition['from'] . '"' : '';
		$to         = isset ($definition ['to']) ? ' data-end="#' . $definition['to'] . '"' : '';
		//用法类似strtotime
		$fromDay      = isset ($definition ['startDate']) ? ' data-startday="' . $definition['startDate'] . '"' : '';
		$toDay        = isset ($definition ['endDate']) ? ' data-endday="' . $definition['endDate'] . '"' : '';
		$daysDisabled = isset ($definition ['daysDisabled']) ? ' data-disabled="' . $definition['daysDisabled'] . '"' : '';
		$dwd          = isset ($definition ['dwd']) ? ' data-dwd="' . $definition['dwd'] . '"' : '';

		return '<div data-datepicker class="input-group date" ' . $from . $to . $format . $fromDay . $toDay . $daysDisabled . $dwd . '>
				  <input id="' . $id . '" type="text"  ' . $pl . $readonly . $disabled . ' name="' . $this->name . '" value="' . html_escape($this->value) . '" class="form-control ' . $class . '"><span class="input-group-addon"><i class="fa fa-calendar"></i></span>
				</div>';
	}

	public function getOptionForm() {
		return new DatepickerFieldForm(true);
	}

}

class DatepickerFieldForm extends FormTable {
	public $table = null;
	/**
	 * 提示符
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 1,col-xs-6
	 */
	public $placeholder;
	/**
	 * 日期格式
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 1,col-xs-6
	 */
	public $format;
	/**
	 * 不早于这个日期控件中的日期
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 2,col-xs-6
	 */
	public $from;
	/**
	 * 不晚于这个日期控件中的日期
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 2,col-xs-6
	 */
	public $to;
	/**
	 * 开始日期
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 3,col-xs-6
	 */
	public $startDate;
	/**
	 * 结束日期
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 3,col-xs-6
	 */
	public $endDate;
	/**
	 * 不可用的日期
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 4,col-xs-12
	 */
	public $daysDisabled;
	/**
	 * 禁用星期几(0是周日)
	 * @var \backend\form\TextField
	 * @type string
	 * @layout 5,col-xs-12
	 */
	public $dwd;
}