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
use wulaphp\auth\Passport;
use wulaphp\io\Ajax;
use wulaphp\mvc\view\JsonView;
use wulaphp\validator\ValidateException;

/**
 * @acl v:users
 * Class UserController
 * @package backend\controllers
 */
class UserController extends PageController {

    public function index() {
        if (!$this->passport->cando('v:users/')) {
            return $this->onDenied(__('you are denied'), null);
        }
        return $this->render();
    }

    /**
     * 用户列表
     * @get
     * @return array
     * @Author LW 2021/3/18 15:28
     */
    public function list(): array {
        $page  = irqst('page', 1);
        $limit = irqst('limit', 20);
        $nickname = rqst('nickname');
        $phone = rqst('phone');
        $param = rqsts(['name']);
        foreach ($param as $key => $value) {
            if (!is_numeric($value) && empty($value)) {
                unset($param[ $key ]);
                continue;
            }
            $where[ 'User.'.$key . ' LIKE' ] = '%' . $value . '%';
        }
        $where['User.tenant_id'] = $this->passport->data['tenant_id'];

        $userTable = new UserTable();
        //账号状态
        $userStatus = $userTable::USER_STATUS;
        $count      = $userTable->count($where);

        if(!empty($nickname)){
            $where[] = ['um.name'=>'nickname','um.value LIKE'=>'%'.$nickname.'%'];
        }
        if(!empty($phone)){
            $where[] = ['um2.name'=>'phone','um2.value LIKE'=>'%'.$phone.'%'];
        }

        $fileds     = 'User.id,User.name,User.is_super_user,User.create_time,User.status';
        $query       = $userTable->find($where, $fileds, $limit, (($page - 1) * $limit));
        if(!empty($nickname)){
            $query->join('{user_meta} AS um', 'User.id = um.user_id','inner');
        }
        if(!empty($phone)){
            $query->join('{user_meta} AS um2', 'User.id = um2.user_id','inner');
        }
        $list = $query->groupBy('User.id') ->with('roles');

        $users      = array_column($list->toArray(), null, 'id');
        foreach ($list as $user) {
            $info                                = [];
            $users[ $user['id'] ]['create_time'] = date('Y-m-d H:i:s', $users[ $user['id'] ]['create_time']);
            $info['format_status']               = $userStatus[ $user['status'] ];
            $info['roleIds']                     = array_column($user['roles'], 'id');
            foreach ($user->meta() as $meta) {
                if (in_array($meta['name'], ['email', 'nickname', 'phone', 'desc'])) {
                    $info[ $meta['name'] ] = $meta['value'];
                }
            }
            $data[] = array_merge($users[ $user['id'] ], $info);
        }

        return ['code' => 0, 'count' => $count, 'data' => $data];
    }

    /**
     * 添加/保存用户信息
     *
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/18 15:29
     */
    public function save(): JsonView {
        $uid                      = irqst('uid', 0);
        $user                     = rqsts(['name']);
        $user['status']           = irqst('status', 1);
        $user['passwd_expire_at'] = $user['status'] == 3 ? time() : 0;
        $userMeta                 = rqsts(['desc', 'phone', 'email', 'nickname']);
        $roleIds                  = rqst('roleIds');
        if (!empty(rqst('passwd'))) {
            $user['passwd'] = Passport::passwd(rqst('passwd'));
        }
        if (empty($roleIds)) {
            return Ajax::error('角色必选,不能为空!');
        }
        $userTable = new UserTable();
        $msg       = $userTable->checkUsername($user['name'], ['id' => $uid], 'account allready exists');
        if (!is_bool($msg)) {
            return Ajax::error($msg);
        }
        $db = $userTable->db();
        $db->start();//启动事务
        try {
            if ($uid > 0) {
                $res = $userTable->updateAccount($user, $uid);
            } else {
                $res = $uid = $userTable->newAccount($user);
            }
            if ($res) {
                $metaTable = new UserMetaTable($db);
                $metaRes   = $metaTable->setMetas($uid, $userMeta);
                $roleRes   = $userTable->setRoles($uid, explode(',', $roleIds));
                if ($metaRes && $roleRes) {
                    $db->commit();

                    return Ajax::success();
                }
            }
        } catch (ValidateException  $exception) {
            return Ajax::error($exception->getMessage());
        }
        $db->rollback();

        return Ajax::error($uid ? '修改失败' : '添加失败');
    }

    /**
     * 删除用户
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/18 19:42
     */
    public function del(): JsonView {
        $uids = rqst('uids');
        if (empty($uids))
            return Ajax::error('请选择要删除的数据');
        $userTable = new UserTable();
        $db        = $userTable->db();
        $db->start();//启动事务
        try {
            $res       = $userTable->delAccount($uids);
            $metaTable = new UserMetaTable($db);
            $metaRes   = $metaTable->delete(['user_id IN' => $uids]);
            $roleRes   = $db->cudx('DELETE FROM {user_role} WHERE user_id IN (%d)', implode(',', $uids));
            if ($res && $metaRes && $roleRes) {
                $db->commit();

                return Ajax::success();
            }
        } catch (\Exception $exception) {
            return Ajax::error($exception->getMessage());
        }
        $db->rollback();

        return Ajax::error('删除失败');
    }
}