<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\controllers;

use backend\classes\IFramePageController;
use Michelf\MarkdownExtra;
use wulaphp\app\App;
use wulaphp\util\Annotation;

/**
 * Class DocController
 * @package backend\controllers
 * @roles   开发人员
 */
class DocController extends IFramePageController {
    public function index($cls = '') {
        if (!$cls) {
            return $this->render('doc/se');
        }
        $cls = str_replace('.', '\\', $cls);
        if (!class_exists($cls)) {
            $cls = str_replace('.', '\\', $cls);

            return $this->render('doc/se', ['cls' => $cls]);
        }
        $ref     = new \ReflectionClass($cls);
        $ns      = $ref->getNamespaceName();
        $ann     = new Annotation($ref);
        $data    = [];
        $props   = [];
        $methods = [];
        $md []   = '<span class="label label-info">package</span>' . $ref->getNamespaceName();
        $md []   = '## ' . $ref->getShortName();
        $md []   = $ann->getDoc();
        // 属性
        $pps   = $ref->getProperties(\ReflectionProperty::IS_PUBLIC | \ReflectionProperty::IS_PROTECTED);
        $md [] = '### 成员变量(属性)';
        foreach ($pps as $p) {
            $name    = $p->getName();
            $props[] = $p->getName();
            $md[]    = '#### ' . ($p->isPublic() ? '<span class="label label-info">PUBLIC</span> ' : '<span class="label label-danger">PROTECTED</span> ') . ($p->isStatic() ? '<span class="label label-warning">STATIC</span>' : '') . " <a class=\"doc-item\" id=\"doc-item-p-$name\">$name</a> ";
            $md[]    = $p->getDocComment();
            $md[]    = '';
        }
        $data['props'] = $props;
        //方法
        $mms  = $ref->getMethods(\ReflectionMethod::IS_PROTECTED | \ReflectionMethod::IS_PUBLIC);
        $md[] = '### 成员方法';
        foreach ($mms as $m) {
            $name = $m->getName();
            $ma   = new Annotation($m, false);
            $ps   = $ma->getMultiValues('param');
            $pstr = [];
            $rtns = [];
            $pds  = [];
            if ($ps) {
                $pp  = $m->getParameters();
                $pps = [];
                foreach ($pp as $p) {
                    $pps[ $p->getName() ] = [
                        $p->isOptional(),
                        $p->isOptional() && $p->isDefaultValueAvailable() ? $p->getDefaultValue() : '',
                        $p->isPassedByReference()
                    ];
                }
                foreach ($ps as $p) {
                    if (preg_match('/^(?P<type>\\\\?[a-z][a-z\d_\\\\|]*\s+)?\$(?P<p>[a-z][a-z\d_]*\s*)(?P<desc>.*)/msi', $p, $ms)) {
                        $type   = $this->getType($ms['type'], $ns);
                        $pstr[] = @"* {$ms['p']} $type {$ms['desc']}";
                        $pn     = trim($ms['p']);
                        $pds[]  = @"$type " . ($pps[ $pn ][2] ? '&$' : '$') . $pn . ($pps[ $pn ][0] ? '=' . $this->getDefaultValue($pps[ $pn ][1]) : '');
                    }
                }
            } else {
                $pstr[] = '无';
            }
            $rtn = $ma->getString('return');
            if ($rtn) {
                $rtn    = explode(' ', $rtn, 2);
                $type   = $this->getType($rtn[0], $ns);
                $rtns[] = $type;
                $rtns[] = $rtn[1];
            } else {
                $rtns[] = '`void`';
                $type   = '';
            }
            $methods[] = $name;
            if ($m->isPublic()) {
                $mf = 'public ';
            } else {
                $mf = 'protected ';
            }
            if ($m->isStatic()) {
                $mf .= 'static ';
            }
            if ($m->isAbstract()) {
                $mf .= 'abstract ';
            }
            if ($m->isFinal()) {
                $mf .= 'final ';
            }
            if ($m->returnsReference()) {
                $cname = '&' . $name;
            } else {
                $cname = $name;
            }
            $md[] = "#### <a class=\"doc-item\" id=\"doc-item-$name\">`$mf` $type `$cname(" . implode(', ', $pds) . ")`</a>";
            $md[] = $ma->getDoc();
            $md[] = '';
            $md[] = '__参数__';
            $md[] = '';
            $md[] = implode("\n", $pstr);
            $md[] = '';
            if (!$m->isConstructor() && !$m->isDestructor()) {
                $md[] = '__返回__';
                $md[] = '';
                $md[] = implode("\n", $rtns);
                $md[] = '';
            }
        }
        $data['methods'] = $methods;
        $content         = implode("\n", $md);
        $url             = App::url('~');
        $content         = preg_replace_callback('/\]\(#(?P<hash>[^\)]+)\)/', function ($ms) use ($url) {
            return '](' . $url . App::hash($ms['hash']) . ')';
        }, $content);
        $data['doc']     = MarkdownExtra::defaultTransform($content);

        return $this->render($data);
    }

    public function icon() {
        return $this->layoutCfg('htmlCls')->render();
    }

    private function getDefaultValue($value) {
        if ($value === null) {
            return 'null';
        } else if (is_numeric($value)) {
            return $value;
        } else if (is_array($value)) {
            return str_replace("\n", '', var_export($value, true));
        } else if (is_bool($value)) {
            return $value ? 'true' : 'false';
        } else {
            return "'{$value}'";
        }
    }

    private function getType($type, $ns) {
        static $url = false;
        if (!$url) {
            $url = App::url('backend/doc');
        }
        if ($type) {
            if (strpos($type, '\\') === false) {
                $typeCls = $ns . '\\' . rtrim($type, '[]');
            } else {
                $typeCls = rtrim($type, '[]');
            }
            if (class_exists($typeCls)) {
                $type = "[$type]($url/" . str_replace('\\', '.', $typeCls) . ')';
            } else {
                $type = "`{$type}`";
            }
        }

        return $type;
    }
}