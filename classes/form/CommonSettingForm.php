<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes\form;

use wulaphp\form\FormTable;
use wulaphp\validator\JQueryValidator;

class CommonSettingForm extends FormTable {
    use JQueryValidator;

    public $table = null;
    /**
     * 网站名称
     * @var \backend\form\TextField
     * @type string
     */
    public $name;
    /**
     * 管理后台域名
     * @var \backend\form\TextField
     * @type string
     * @note 设置后只能通过此域名(如非80，443访问需带端口)访问管理后台。为了安全请尽量与前台域名不同。
     */
    public $domain;
    /**
     * 后台主页布局
     *
     * @var \backend\form\SelectField
     * @type int
     * @dataSource \wulaphp\form\providor\LineDataProvidor
     * @dsCfg {"1":"一栏","0":"两栏"}
     */
    public $onerow = 0;
    /**
     * 多久不操作自动退出
     * @var \backend\form\TextField
     * @type int
     * @digits
     * @note 0表示不自动退出(session存在第三方时请设置较大值以模拟不自动退出),单位秒。
     */
    public $expire = 0;
    /**
     * 调试级别
     * @var \backend\form\SelectField
     * @type int
     * @dataSource \wulaphp\form\providor\LineDataProvidor
     * @dsCfg {"100":"调试","200":"警告","300":"提示","400":"错误","1000":"关闭"}
     */
    public $debug = DEBUG_WARN;
    /**
     * 系统离线时允许以下IP访问
     * @var \backend\form\TextareaField
     * @type string
     * @option {"row":5}
     * @note   一行一个IP。
     */
    public $allowedIps;
    /**
     * 系统离线时提示消息
     * @var \backend\form\TextareaField
     * @type string
     */
    public $offlineMsg;
    /**
     * 系统离线（维护模式）
     * @var \backend\form\CheckboxField
     * @type bool
     */
    public $offline = 0;
}