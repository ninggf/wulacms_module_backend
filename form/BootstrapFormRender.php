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
use wulaphp\form\FormRender;
use wulaphp\form\FormTable;
use wulaphp\util\Annotation;

class BootstrapFormRender extends FormRender {
    /**
     * 绘制.
     */
    public function render() {
        $fields                      = $this->form->createWidgets();
        $ann                         = new Annotation(new \ReflectionObject($this->form));
        $this->options['new-row']    = $ann->getBool('newRow');
        $this->options['label-col']  = $ann->getString('labelCol', $this->options['label-col']);
        $this->options['field-col']  = $ann->getString('fieldCol', $this->options['field-col']);
        $this->options['ignore-col'] = $ann->getBool('ignoreCol');
        switch ($this->options['type']) {
            case 'inline':
                return $this->renderInline($fields);
            case 'horizontal':
                return $this->horizontal($fields);
            default:
                return $this->vertical($fields);
        }
    }

    protected function renderInline($fields) {
        return $this->vertical($fields);
    }

    /**
     * 垂直布局.
     *
     * @param array $fields
     *
     * @return string
     */
    protected function vertical($fields) {
        $html   = [];
        $groups = $this->prepareGroups($fields);

        if ($groups) {
            ksort($groups);
            foreach ($groups as $group) {
                ksort($group);
                foreach ($group as $fields) {
                    $num = count($fields);
                    if ($num > 1) {
                        $chunk   = [];
                        $chunk[] = '<div class="form-group pull-in clearfix">';
                        foreach ($fields as $_field) {
                            /**@var \wulaphp\form\FormField $field */
                            @list($field, $col) = $_field;
                            $chunk[]  = '<div class="' . $col . '">';
                            $checkbox = isset($field['checkbox']);

                            if ($checkbox) {
                                //$chunk[] = '<label></label>';
                                $chunk[] = '<div class="checkbox">';
                                $chunk[] = '<label>' . $field->render($this->options) . $field['label'] . '</label></div>';
                            } else {
                                if (isset($field['label']) && $field['label']) {
                                    $chunk[] = '<label>' . $field['label'] . '</label><br/>';
                                }
                                $chunk[] = $field->render($this->options);
                            }

                            if (isset($field['note']) && $field['note']) {
                                $chunk[] = "<span class=\"help-block text-muted m-b-none\">" . $field['note'] . "</span>";
                            }
                            $chunk[] = '</div>';
                        }
                        $chunk[] = '</div>';
                        $html[]  = implode("\n", $chunk);
                    } else {
                        $field    = $fields[0][0];
                        $col      = $fields[0][1];
                        $checkbox = isset($field['checkbox']);
                        $chunk    = [];
                        if ($field instanceof HiddenField) {
                            $html[] = $field->render($this->options);
                            continue;
                        }
                        // checkbox radio 比较特殊
                        if ($col) {
                            $chunk[] = '<div class="form-group pull-in clearfix">';
                            $chunk[] = '<div class="' . $col . '">';
                        } else if ($checkbox) {
                            $chunk[] = '<div class="checkbox">';
                        } else {
                            $chunk[] = '<div class="form-group">';
                        }

                        if ($checkbox) {
                            $chunk[] = '<label>' . $field->render($this->options) . $field['label'] . '</label>';
                        } else {
                            if (isset($field['label']) && $field['label']) {
                                $chunk[] = '<label>' . $field['label'] . '</label><br/>';
                            }

                            $chunk[] = $field->render($this->options);
                        }

                        if (isset($field['note']) && $field['note']) {
                            $chunk[] = "<span class=\"help-block text-muted m-b-none\">" . $field['note'] . "</span>";
                        }

                        if ($col) {
                            $chunk[] = '</div>';
                        }

                        $chunk[] = '</div>';
                        $html[]  = implode("\n", $chunk);
                    }
                }
            }
        }

        return implode("\n", $html);
    }

    /**
     * 标签水平放置.
     *
     * @param array $fields
     *
     * @return string
     */
    protected function horizontal($fields) {
        $html      = [];
        $groups    = $this->prepareGroups($fields);
        $newRow    = $this->options['new-row'];
        $ignoreCol = $this->options['ignore-col'];
        if ($groups) {
            ksort($groups);
            foreach ($groups as $group) {
                ksort($group);
                foreach ($group as $fields) {
                    $num = count($fields);
                    if ($num > 1) {
                        if ($newRow) {
                            foreach ($fields as $_field) {
                                @list($field, $col) = $_field;
                                $this->renderRow($html, $field, $col, $ignoreCol);
                            }
                        } else {
                            $chunk   = [];
                            $chunk[] = '<div class="form-group">';//1
                            $field   = $fields[0][0];
                            if (isset($field['label']) && $field['label']) {
                                $chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">' . $field['label'] . '</label>';
                            } else {
                                $chunk[] = '<label style="height:0" class="control-label ' . $this->options['label-col'] . '">&nbsp;</label>';
                            }
                            $chunk[] = '<div class="' . $this->options['field-col'] . '">';//2
                            if (!$ignoreCol) {
                                $chunk[] = '<div class="row">';//3
                            }
                            foreach ($fields as $idx => $_field) {
                                /**@var \wulaphp\form\FormField $field */
                                @list($field, $col) = $_field;
                                if (!$ignoreCol) {
                                    $chunk[] = '<div class="' . $col . '">';//4
                                }
                                $checkbox = isset($field['checkbox']);
                                if ($checkbox) {
                                    if ($idx) {
                                        $chunk[] = '<div class="checkbox"><label>' . $field->render($this->options) . $field['label'] . '</label></div>';
                                    } else {
                                        $chunk[] = '<div class="checkbox"><label>' . $field->render($this->options) . '是</label></div>';
                                    }
                                } else {
                                    $chunk[] = $field->render($this->options);
                                }
                                if (isset($field['note']) && $field['note']) {
                                    $chunk[] = "<span class=\"help-block text-muted m-b-none\">" . $field['note'] . "</span>";
                                } else if ($idx) {
                                    $chunk[] = "<span class=\"help-block text-muted m-b-none\">" . $field['label'] . "</span>";
                                }
                                if (!$ignoreCol) {
                                    $chunk[] = '</div>';//4
                                }
                            }
                            if (!$ignoreCol) {
                                $chunk[] = '</div>';//3
                            }
                            $chunk[] = '</div></div>';//2,1
                            $html[]  = implode("\n", $chunk);
                        }
                    } else {
                        list($field, $col) = $fields[0];
                        $this->renderRow($html, $field, $col, $ignoreCol);
                    }
                }
            }
        }

        return implode("\n", $html);
    }

    /**
     * 行内表单.
     *
     * @param FormTable $form
     *
     * @return \backend\form\BootstrapFormRender
     */
    public static function inline(FormTable $form) {
        return new BootstrapFormRender($form, ['type' => 'inline']);
    }

    /**
     * 标签垂直放置表单.
     *
     * @param \wulaphp\form\FormTable $form
     *
     * @return \backend\form\BootstrapFormRender
     */
    public static function v(FormTable $form) {
        return new BootstrapFormRender($form, ['type' => 'vertical']);
    }

    /**
     * 标签水平放置表单.
     *
     * @param \wulaphp\form\FormTable $form
     * @param array                   $options 选项，通过label-col要配置标签的宽度,field-col设置字段宽度
     *
     * @return \backend\form\BootstrapFormRender
     */
    public static function h(FormTable $form, $options = []) {
        $options['type'] = 'horizontal';
        if (!isset($options['label-col']) || !isset($options['field-col'])) {
            $options['label-col'] = 'col-lg-2 col-md-3 col-sm-4';
            $options['field-col'] = 'col-lg-10 col-md-9 col-sm-8';
        }

        return new BootstrapFormRender($form, $options);
    }

    private function renderRow(&$html, FormField $field, $col, $ignoreCol) {
        if ($field instanceof Separator) {
            $html[] = $field->render();

            return;
        } else if ($field instanceof HiddenField) {
            $html[] = $field->render($this->options);

            return;
        }
        $checkbox = isset($field['checkbox']);
        $chunk    = [];
        // checkbox radio 比较特殊
        $chunk[] = '<div class="form-group">';//1
        // label
        if (isset($field['label']) && !$checkbox) {
            $chunk[] = '<label class="control-label ' . $this->options['label-col'] . '">' . $field['label'] . '</label>';
        } else {
            $chunk[] = '<label style="height:0"  class="control-label ' . $this->options['label-col'] . '">&nbsp;</label>';
        }
        $chunk[] = '<div class="' . $this->options['field-col'] . '">';//2

        if ($col && !$ignoreCol) {
            $chunk[] = '<div class="row"><div class="' . $col . '">';//3
        }

        if ($checkbox) {
            $chunk[] = '<div class="checkbox"><label>' . $field->render($this->options) . $field['label'] . '</label></div>';
        } else {
            $chunk[] = $field->render($this->options);
        }
        if (isset($field['note']) && $field['note']) {
            $chunk[] = "<span class=\"help-block text-muted m-b-none\">" . $field['note'] . "</span>";
        }

        if ($col && !$ignoreCol) {
            $chunk[] = '</div></div>';//3
        }

        $chunk[] = '</div></div>';//1,2
        $html[]  = implode("\n", $chunk);
    }

    /**
     * @param $fields
     *
     * @return array
     */
    private function prepareGroups($fields) {
        $groups = [];
        $j      = 1;
        /**@var \wulaphp\form\FormField $field */
        foreach ($fields as $i => $field) {
            $layout = $field->layout();
            @list($row, $col, $o) = $layout;
            if ($row) {
                $groups[ intval($row) ]['g'][] = [$field, $col, $o];
                $j                             = $row;
            } else {
                $groups[ $j ]['n'][] = [$field, $col ? $col : false, intval($o)];
                $j++;
            }
        }

        return $groups;
    }
}