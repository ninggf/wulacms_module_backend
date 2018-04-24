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

class TimepickerField extends FormField {
	public function getName() {
		return _tr('Time Picker@form');
	}

	protected function renderWidget($opts) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$disabled   = isset ($definition ['disabled']) ? ' disabled="disabled" ' : '';
		if (empty($this->value)) {
			$this->value = date('H') . ':00';
		}
		$value = html_escape($this->value);
		$html  = <<<HTML
			<span class="combodate" for="#$id" data-timepicker><select $disabled $readonly class="hour form-control" style="width: auto;">
<option value="00">00</option>
<option value="01">01</option>
<option value="02">02</option>
<option value="03">03</option>
<option value="04">04</option>
<option value="05">05</option>
<option value="06">06</option>
<option value="07">07</option>
<option value="08">08</option>
<option value="09">09</option>
<option value="10">10</option>
<option value="11">11</option>
<option value="12">12</option>
<option value="13">13</option>
<option value="14">14</option>
<option value="15">15</option>
<option value="16">16</option>
<option value="17">17</option>
<option value="18">18</option>
<option value="19">19</option>
<option value="20">20</option>
<option value="21">21</option>
<option value="22">22</option>
<option value="23">23</option></select>
&nbsp;:&nbsp;
<select $disabled $readonly class="minute form-control" style="width: auto;">
<option value="00">00</option>
<option value="05">05</option>
<option value="10">10</option>
<option value="15">15</option>
<option value="20">20</option>
<option value="25">25</option>
<option value="30">30</option>
<option value="35">35</option>
<option value="40">40</option>
<option value="45">45</option>
<option value="50">50</option>
<option value="55">55</option>
</select></span>
<input id="$id" type="hidden" name="$this->name" value="$value"/>
HTML;

		return $html;
	}
}