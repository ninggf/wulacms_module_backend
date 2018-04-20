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

class WysiwygField extends FormField {
	public function getName() {
		return _tr('Html Editor@form');
	}

	public function renderWidget($opts = []) {
		$definition = $this->options;
		$id         = isset ($definition ['id']) ? $definition ['id'] : $definition ['name'];
		$pl         = isset ($definition ['placeholder']) ? $definition ['placeholder'] : '';
		$readonly   = isset ($definition ['readonly']) ? ' readonly="readonly" ' : '';
		$height     = isset ($definition ['height']) && $definition ['height'] ? $definition ['height'] : 100;
		$hs         = "height:{$height}px;max-height:{$height}px";
		$name       = $this->name;
		$value      = $this->value ? $this->value : '<div>请在此编辑...</div>';

		return '<div class="wysiwyg">' . $this->getToolbar('', $id) . '<div id="' . $id . '_editorxx" style="' . $hs . '" for="#' . $id . '" data-wysiwyg ' . $readonly . ' data-placeholder="' . html_escape($pl) . '">' . $value . '</div><textarea style="' . $hs . '"  class="hidden" id="' . $id . '" name="' . $name . '" ' . $readonly . '></textarea></div>';
	}

	public function getToolbar($btns, $id) {
		if (!$btns) {
			$btns = 'font,size,color,style';
		}
		$btns    = explode(',', $btns);
		$toolbar = ['<div class="btn-toolbar" id="' . $id . '-editor-toolbar" data-role="editor-toolbar" data-target="#' . $id . '_editorxx">'];

		if (in_array('font', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-original-title="Font"><i class="fa fa-font"></i><b class="caret"></b></a>
<ul class="dropdown-menu">
 <li><a data-edit="fontName 宋体, SimSun" style="font-family:宋体, SimSun">宋体</a></li>
 <li><a data-edit="fontName 微软雅黑, Microsoft YaHei" style="font-family:微软雅黑, Microsoft YaHei">雅黑</a></li>
 <li><a data-edit="fontName 楷体, 楷体_GB2312, SimKai" style="font-family:楷体, 楷体_GB2312, SimKai">楷体</a></li>
 <li><a data-edit="fontName 黑体, SimHei" style="font-family:黑体, SimHei">黑体</a></li>
 <li><a data-edit="fontName 隶书, SimLi" style="font-family:隶书, SimLi">隶书</a></li>
  <li><a data-edit="fontName Serif" style="font-family:'Serif'">Serif</a></li>
  <li><a data-edit="fontName Sans" style="font-family:'Sans'">Sans</a></li>
  <li><a data-edit="fontName Arial" style="font-family:'Arial'">Arial</a></li>
  <li><a data-edit="fontName Arial Black" style="font-family:'Arial Black'">Arial Black</a></li>
  <li><a data-edit="fontName Comic Sans MS" style="font-family:'Comic Sans MS'">Comic Sans MS</a></li>
  <li><a data-edit="fontName Courier New" style="font-family:'Courier New'">Courier New</a></li>
  <li><a data-edit="fontName Times New Roman" style="font-family:'Times New Roman'">Times New Roman</a></li> 
</ul></div>
EQL;
		}

		if (in_array('size', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-original-title="Font Size"><i class="fa fa-text-height"></i>&nbsp;<b class="caret"></b></a>
<ul class="dropdown-menu">
<li><a data-edit="fontSize 6"><font size="6">极大</font></a></li>
<li><a data-edit="fontSize 5"><font size="5">大</font></a></li>
<li><a data-edit="fontSize 3"><font size="3">中</font></a></li>
<li><a data-edit="fontSize 1"><font size="1">小</font></a></li>
</ul>
</div>
EQL;
		}
		if (in_array('color', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-original-title="Fore Color"><i class="fa fa-square" style="color:red"></i>&nbsp;<b class="caret"></b></a>
<div class="dropdown-menu p-l-xs p-r-xs">
	<div class="btn-group btn-group-sm">
		<a class="btn btn-default" data-edit="foreColor #fff"><i class="fa fa-square" style="color:#fff"></i></a>
		<a class="btn btn-default" data-edit="foreColor #000"><i class="fa fa-square" style="color:#000"></i></a>
		<a class="btn btn-default" data-edit="foreColor #f00"><i class="fa fa-square" style="color:#f00"></i></a>
		<a class="btn btn-default" data-edit="foreColor #4f81bd"><i class="fa fa-square" style="color:#4f81bd"></i></a>
	</div>
</div>
</div>
EQL;
		}
		if (in_array('style', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-edit="bold"  data-original-title="Bold (Ctrl/Cmd+B)"><i class="fa fa-bold"></i></a>
<a class="btn btn-default" data-edit="italic"  data-original-title="Italic (Ctrl/Cmd+I)"><i class="fa fa-italic"></i></a>
<a class="btn btn-default" data-edit="strikethrough"  data-original-title="Strikethrough"><i class="fa fa-strikethrough"></i></a>
<a class="btn btn-default" data-edit="underline"  data-original-title="Underline (Ctrl/Cmd+U)"><i class="fa fa-underline"></i></a>
</div>
EQL;
		}

		if (in_array('list', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-edit="insertunorderedlist"><i class="fa fa-list-ul"></i></a>
<a class="btn btn-default" data-edit="insertorderedlist"><i class="fa fa-list-ol"></i></a>
<a class="btn btn-default" data-edit="outdent"><i class="fa fa-outdent"></i></a>
<a class="btn btn-default" data-edit="indent"><i class="fa fa-indent"></i></a>
</div>
EQL;
		}
		if (in_array('align', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-edit="justifyleft"  data-original-title="Align Left (Ctrl/Cmd+L)"><i class="fa fa-align-left"></i></a>
<a class="btn btn-default" data-edit="justifycenter"  data-original-title="Center (Ctrl/Cmd+E)"><i class="fa fa-align-center"></i></a>
<a class="btn btn-default" data-edit="justifyright"  data-original-title="Align Right (Ctrl/Cmd+R)"><i class="fa fa-align-right"></i></a>
<a class="btn btn-default" data-edit="justifyfull"  data-original-title="Justify (Ctrl/Cmd+J)"><i class="fa fa-align-justify"></i></a>
</div>
EQL;
		}

		if (in_array('link', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-edit="unlink"><i class="fa fa-unlink"></i></a>
<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Hyperlink"><i class="fa fa-link"></i></a>
<div class="dropdown-menu aside-xl">
	<div class="bg-white">
		<div class="form-group wrapper m-b-none">
			<div class="input-group">
                <input class="form-control" placeholder="URL" type="text" data-edit="createLink">
                <span class="input-group-btn"><button class="btn btn-primary btn-icon" type="button"><i class="fa fa-link"></i></button></span>
            </div>
        </div>
    </div>
</div>
</div>
EQL;
		}
		if (in_array('img', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="插入图片" data-original-title="插入图片"><i class="fa fa-picture-o"></i></a>
<div class="dropdown-menu aside-xxl">
	<div class="bg-white">
		<div class="form-group wrapper">
			<div class="input-group">
                <input class="form-control" placeholder="图片地址" type="text" value=""/>
                <span class="input-group-btn"><a class="btn btn-default btn-icon ins-pic" href="javascript:"><i class="fa fa-picture-o"></i></a></span>
            </div>
        </div>
        <div class="form-group layui-upload-drag wrapper m-t-xs m-b-none" style="width:90%;margin-left:15px" id="{$id}-uploader">
            <i class="layui-icon">&#xe67c;</i>
            <p>点击上传，或将文件拖拽到此处</p>
        </div>
    </div>
</div>
</div>
EQL;
		}

		if (in_array('pager', $btns)) {
			$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-act="pager" title="插入分页符" data-original-title="插入分页符"><i class="fa fa-copy"></i></a>
</div>
EQL;
		}

		$toolbar [] = <<<EQL
<div class="btn-group btn-group-sm">
<a class="btn btn-default" data-edit="removeFormat" title="" data-original-title="Remove Format (Ctrl/Cmd+F)"><i class="fa fa-eraser"></i></a>
<a class="btn btn-default" data-edit="undo" title="" data-original-title="Undo (Ctrl/Cmd+Z)"><i class="fa fa-undo"></i></a>
<a class="btn btn-default" data-edit="redo" title="" data-original-title="Redo (Ctrl/Cmd+Y)"><i class="fa fa-repeat"></i></a>
</div><div class="btn-group btn-group-sm source">
<a class="btn btn-default" data-toggle data-act="source"><i class="fa fa-code"></i></a>
</div>
EQL;

		$toolbar[] = '</div>';

		return implode('', $toolbar);
	}

	public function getOptionForm() {
		return new WysiwygFieldForm(true);
	}
}

class WysiwygFieldForm extends FormTable {
	public $table = null;
	/**
	 * 编辑器高度
	 * @var \backend\form\TextField
	 * @digits
	 * @type int
	 * @layout 1,col-xs-4
	 */
	public $height = 200;
	/**
	 * 菜单栏功能按钮
	 * @var \backend\form\MultipleCheckboxFiled
	 * @type array
	 * @layout 2,col-xs-12
	 * @dsCfg ::btns
	 * @option {"inline":1}
	 */
	public $toolbar = 'font,color,size,style';

	public function btns() {
		return [
			'font'  => '字体',
			'color' => '字段颜色',
			'size'  => '字体大小',
			'style' => '字体样式',
			'list'  => '列表样式',
			'align' => '对齐方式',
			'link'  => '插入链接',
			'img'   => '插入图片',
			'pager' => '插入分页'
		];
	}
}