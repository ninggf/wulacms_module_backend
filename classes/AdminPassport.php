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

use system\model\AclTable;
use system\model\UserTable;
use wulaphp\app\App;
use wulaphp\auth\Passport;

/**
 * 管理员通行证.
 *
 * @package backend\classes
 */
class AdminPassport extends Passport {
    public function is($roles) {
        // 1号用户为超级管理员
        if ($this->uid == 1) {
            return true;
        }
        $myroles = $this->data['roles'];
        if (empty($myroles)) {
            return false;
        }

        return !empty(array_intersect($myroles, (array)$roles));
    }

    /**
     * 用户可以有多个角色，角色可以继承其它角色，被继承的角色权限优先级低于当前角色.
     *
     * @param string $op    操作
     * @param string $res   资源
     * @param array  $extra 额外数据
     *
     * @return bool
     * @see table `acl`
     *
     */
    protected function checkAcl($op, $res, $extra) {
        static $checked = [];
        //1号用户为超级管理员
        if ($this->uid == 1) {
            return true;
        }
        if (!isset($this->data['acls'])) {
            $this->loadAcl();
        }
        //未找到对应的ACL
        if (!$this->data['acls']) {
            return false;
        }
        $resid = $op . ':' . $res;
        if (isset($checked[ $resid ])) {
            return $checked[ $resid ];
        }
        $reses[] = $op . ':' . $res;
        // 对资源的全部操作授权
        $reses[] = '*:' . $res;
        $ress    = explode('/', $res);
        if (count($ress) > 1) {
            // 对上级资源的全部操作授权
            while ($ress) {
                array_pop($ress);
                $reses[] = '*:' . implode('/', $ress);
            }
        }
        // 对所有资源的全部操作授权，特别是网站拥有者
        $reses[] = '*:*';
        // 权限检测.
        foreach ($reses as $opres) {
            if (isset($this->data['acls'][ $opres ])) {
                $checked[ $resid ] = $this->data['acls'][ $opres ]['allowed'] ? true : false;

                return $checked[ $resid ];
            }
        }

        return false;
    }

    /**
     * 认证
     *
     * @param array|int|string $data [0=>username,1=>password] or uid
     *
     * @return bool
     */
    protected function doAuth($data = null) {
        $table = new UserTable();
        if (is_numeric($data)) {
            $user = $table->findOne(['id' => $data]);
        } else {
            list($username, $password) = $data;
            $user = $table->findOne(['username' => $username]);
            if ($user['username'] != $username) {
                $this->error = __('You entered an incorrect username or password.');

                return false;
            }
            $passwdCheck = Passport::verify($password, $user['hash']);
            if (!$passwdCheck) {
                $this->error = __('You entered an incorrect username or password.');

                return false;
            }
        }
        $status = $user['status'];
        if ($status == '0') {
            $this->error = __('Your account is locked.');

            return false;
        }
        $this->uid               = $user['id'];
        $this->username          = $user['username'];
        $this->nickname          = $user['nickname'];
        $this->phone             = $user['phone'];
        $this->email             = $user['email'];
        $this->avatar            = $user['avatar'] ? $user['avatar'] : App::assets('jqadmin/images/avatar.jpg');
        $this->data['status']    = $user['status'];
        $this->data['lastip']    = $user['lastip'];
        $this->data['lastlogin'] = $user['lastlogin'];
        if (isset($user['pid']) && $user['pid']) {
            $this->data['pid'] = $user['pid'];
        } else {
            $this->data['pid'] = $this->uid;
        }
        $this->data['logintime'] = time();
        $this->data['astoken']   = md5($user['uid'] . $user['hash'] . $user['username'] . $_SERVER['HTTP_USER_AGENT']) . '/' . $user['id'];
        $table->updateLoginInfo($this->uid, $this->data['logintime']);

        return true;
    }

    public function restore() {
        $this->data['roles'] = [];
        $this->data['acls']  = null;
        if ($this->uid) {
            $table                = new UserTable();
            $user                 = $table->findOne($this->uid);
            $this->data['status'] = $user['status'];
            if ($user['status'] == '0') {
                $this->data['acls'] = [];
                $this->error        = __('Your account is locked.');
            } else {
                if ($this->uid != 1 && $this->uid != $this->data['pid']) {//非超级管理员且不是一级用户
                    $parent = $table->findOne($this->data['pid']);
                    if ($parent['status'] == '0') {//父用户被锁
                        $this->data['status'] = 0;
                        $this->data['acls']   = [];
                        $this->error          = __('Your account is locked.');
                    }
                    $proles = [];
                    foreach ($parent['roles'] as $r) {
                        $rid            = $r['id'];
                        $proles[ $rid ] = $r['name'];
                    }
                    $this->data['parent']          = $parent->toArray();
                    $this->data['parent']['roles'] = $proles;
                }
                $levels = [];
                foreach ($user['roles'] as $r) {
                    $rid                         = $r['id'];
                    $levels[]                    = $r['level'];
                    $this->data['roles'][ $rid ] = $r['name'];
                }
                if ($this->uid != $this->data['pid']) {
                    $this->data['maxRoleLevel'] = max(0, max($levels) - 1);
                } else {
                    $this->data['maxRoleLevel'] = 999;
                }
            }
        }
    }

    /**
     * 加载ACL.
     */
    private function loadAcl() {
        $acls = [];
        if ($this->data['roles']) {
            $acl  = new AclTable();
            $rids = array_keys($this->data['roles']);
            $ac   = $acl->findAll(['role_id IN' => $rids], 'res,allowed,priority')->toArray();
            foreach ($ac as $a) {
                $res = $a['res'];
                //priority越小优先级越高.
                if (!isset($acls[ $res ]) || $acls[ $res ]['priority'] > $a['priority']) {
                    $acls[ $res ] = $a;
                }
            }

            if (isset($this->data['parent']) && $this->data['parent']['roles']) {
                $rids  = array_keys($this->data['parent']['roles']);
                $ac    = $acl->findAll(['role_id IN' => $rids], 'res,allowed,priority')->toArray();
                $pacls = [];
                foreach ($ac as $a) {
                    $res = $a['res'];
                    //priority越小优先级越高.
                    if (!isset($pacls[ $res ]) || $pacls[ $res ]['priority'] > $a['priority']) {
                        $pacls[ $res ] = $a;
                    }
                }
                foreach ($pacls as $res => $a) {//禁用
                    if (!$a['allowed']) {
                        $acls[ $res ] = $a;
                    }
                }
            }
        }
        $this->data['acls'] = $acls;
    }
}