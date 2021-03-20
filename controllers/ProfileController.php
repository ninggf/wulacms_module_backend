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

use backend\classes\PageController;
use system\classes\model\UserMetaTable;
use system\classes\model\UserTable;
use wulaphp\io\Ajax;
use wulaphp\mvc\view\JsonView;
use wulaphp\mvc\view\View;
use wulaphp\validator\ValidateException;

class ProfileController extends PageController {

    public function index(): View {
        return $this->render();
    }

    /**
     * @post
     */
    public function save(): JsonView {
        $meta = rqsts(['nickname', 'phone', 'email', 'desc']);
        $name = rqst('name');

        $userTable = new UserTable(true);
        $db        = $userTable->db();

        $db->start();//启动事务
        try {
            $rst = $userTable->updateAccount(['name' => $name, 'id' => $this->passport->uid], $this->passport->uid);
            if ($rst) {
                $metaTable = new UserMetaTable($db);
                $rst       = $metaTable->setMetas($this->passport->uid, $meta);
                if ($rst) {
                    $db->commit();
                    $this->passport->username     = $name;
                    $this->passport->nickname     = $meta['nickname'];
                    $this->passport->email        = $meta['email'];
                    $this->passport->phone        = $meta['phone'];
                    $this->passport->data['desc'] = $meta['desc'];
                    $this->passport->store();

                    return Ajax::success();
                }
            }
            $msg = '修改个人信息失败，请联系管理员';
        } catch (ValidateException $e) {
            $msg = '账户已经存在';
        }
        $db->rollback();

        return Ajax::error($msg);
    }

    /**
     * @get
     * @return View
     */
    public function passwd(): View {
        return view();
    }

    /**
     * 修改密码.
     *
     * @param string $oldPsw
     * @param string $newPsw
     * @param string $rePsw
     *
     * @post
     * @return JsonView
     */
    public function passwdPost(string $oldPsw, string $newPsw, string $rePsw): JsonView {
        if (!$this->passport->verifyPasswd($oldPsw)) {
            return Ajax::error('原密码不正确');
        }
        if (!$newPsw) {
            return Ajax::error('新密码不能为空');
        }
        if ($newPsw != $rePsw) {
            return Ajax::error('两次输入的密码不一致');
        }
        if ($oldPsw == $newPsw) {
            return Ajax::error('新密码不能与原密码相同');
        }
        $table = new UserTable();
        $hash  = $table->changePassword($this->passport->uid, $newPsw);
        if (!$hash) {
            return Ajax::error('修改密码失败，请联系管理员');
        }

        $this->passport->data['passwd'] = $hash;
        $this->passport->store();

        return Ajax::success();
    }

    /**
     * 重置密码页面
     * @resetpasswd
     */
    public function reset() {
        // TODO： 制作重设密码页面
        return 'reset password';
    }

    /**
     * 重置密码
     * @resetpasswd
     */
    public function resetPost() {
        // TODO: 实现重设密码功能，要求和密码不能和上次密码相同的
        return 'ok';
    }
}