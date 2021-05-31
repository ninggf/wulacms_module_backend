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
use backend\classes\PageMetaData;
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
     * 保存个人资料.
     *
     * @post
     */
    public function savePost(): JsonView {
        $meta = rqst('meta');
        $name = rqst('name');

        $userTable = new UserTable();
        $db        = $userTable->db();

        $db->start();//启动事务
        try {
            $rst = $userTable->updateAccount(['name' => $name, 'id' => $this->passport->uid], $this->passport->uid);
            if ($rst) {
                $metaTable = new UserMetaTable($db);
                $rst       = $metaTable->setMetas($this->passport->uid, $meta);
                if ($rst) {

                    $this->passport->username = $name;
                    $this->passport->nickname = $meta['nickname'];
                    $this->passport->email    = $meta['email'];
                    $this->passport->phone    = $meta['phone'];
                    $this->passport->data     = array_merge($this->passport->data, $meta);
                    $this->passport->store();
                    fire('backend\profileUpdated', $this->passport, $meta);
                    $db->commit();

                    return Ajax::success();
                }
            }
            $msg = '修改个人信息失败，请联系管理员';
        } catch (ValidateException $e) {
            $msg = '账户名已经存在';
        } catch (\Exception $e) {
            $msg = $e->getMessage();
        }
        $db->rollback();

        return Ajax::error($msg);
    }

    public function avatar(): JsonView {
        $meta['avatar'] = rqst('avatar');
        if (!$meta['avatar']) {
            return Ajax::error('更新头像失败');
        }
        $metaTable = new UserMetaTable();
        $metaTable->setMetas($this->passport->uid, $meta);
        $this->passport->avatar = $meta['avatar'];
        $this->passport->store();

        return Ajax::success('头像更新成功');
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
     * @ResetPasswd
     * @post
     * @return JsonView
     * @throws \wulaphp\validator\ValidateException
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

        $this->passport->data['passwd']           = $hash['passwd'];
        $this->passport->data['passwd_expire_at'] = $hash['passwd_expire_at'];

        $this->passport->store();

        return Ajax::success();
    }

    /**
     * 重置密码页面
     * @ResetPasswd
     */
    public function reset(): \wulaphp\mvc\view\SmartyView {
        $data = PageMetaData::meta();

        return view($data);
    }
}