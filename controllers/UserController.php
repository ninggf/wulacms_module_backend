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

use backend\classes\layui\TableData;
use backend\classes\PageController;
use system\classes\model\UserMetaTable;
use system\classes\model\UserRoleModel;
use system\classes\model\UserTable;
use system\classes\Syslog;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\mvc\view\JsonView;
use wulaphp\mvc\view\View;
use wulaphp\validator\ValidateException;

/**
 * Class UserController
 * @acl     r:system/account/user
 * @package backend\controllers
 */
class UserController extends PageController {

    public function index():View {
        return $this->render(['tableData' => $this->list()->render()]);
    }

    /**
     * 用户列表
     * @acl    r:system/account/user
     * @get
     * @return \backend\classes\layui\TableData
     * @Author LW 2021/3/18 15:28
     */
    public function list(): TableData {
        $page                  = irqst('page', 1);
        $limit                 = irqst('limit', 20);
        $nickname              = rqst('nickname');
        $phone                 = rqst('phone');
        $param                 = rqsts(['name', 'status']);
        $roleId                = irqst('roleId');
        $where['User.deleted'] = 0;
        foreach ($param as $key => $value) {
            if (!is_numeric($value) && empty($value)) {
                unset($param[ $key ]);
                continue;
            }
            $where[ 'User.' . $key . ' LIKE' ] = '%' . $value . '%';
        }
        $where['User.tenant_id'] = $this->passport->data['tenant_id'];

        $userTable = new UserTable();
        //账号状态
        $userStatus = $userTable::USER_STATUS;
        $count      = $userTable->count($where);

        if (!empty($nickname)) {
            $where[] = ['um.name' => 'nickname', 'um.value LIKE' => '%' . $nickname . '%'];
        }
        if (!empty($phone)) {
            $where[] = ['um2.name' => 'phone', 'um2.value LIKE' => '%' . $phone . '%'];
        }
        if (!empty($roleId)) {
            $where[] = ['ur.role_id ' => $roleId];
        }

        $fields = 'User.id,User.name,User.is_super_user,User.create_time,User.status';
        $query  = $userTable->find($where, $fields, $limit, (($page - 1) * $limit));
        if (!empty($nickname)) {
            $query->join('{user_meta} AS um', 'User.id = um.user_id', 'inner');
        }
        if (!empty($phone)) {
            $query->join('{user_meta} AS um2', 'User.id = um2.user_id', 'inner');
        }
        if (!empty($roleId)) {
            $query->join('{user_role} AS ur', 'User.id = ur.user_id', 'inner');
        }
        $list = $query->groupBy('User.id')->with('roles');

        $users = array_column($list->toArray(), null, 'id');
        $data  = [];
        foreach ($list as $user) {
            $info                                = [];
            $users[ $user['id'] ]['create_time'] = date('Y-m-d H:i:s', $users[ $user['id'] ]['create_time']);
            $info['format_status']               = $userStatus[ $user['status'] ];
            $info['roles']                       = array_column($user['roles'], 'role');
            $info['roleIds']                     = array_column($user['roles'], 'id');
            foreach ($user->meta() as $meta) {
                if (in_array($meta['name'], ['email', 'nickname', 'phone', 'desc'])) {
                    $info[ $meta['name'] ] = $meta['value'];
                }
            }
            $data[] = array_merge($users[ $user['id'] ], $info);
        }

        return new TableData($data, $count);
    }

    /**
     * 添加用户
     * @acl     add:system/account/user
     * @return \wulaphp\mvc\view\JsonView
     * @Author  LW 2021/3/24 12:05
     */
    public function add(): JsonView {
        $user     = rqsts(['name', 'passwd']);
        $userMeta = rqsts(['desc', 'phone', 'email', 'nickname']);
        $roleIds  = rqst('roleIds');

        if (empty($user['name'])) {
            return Ajax::error('用户名不合法/用户名不能为空');
        }
        if ('on' == rqst('resetOnLogin')) {
            $user['passwd_expire_at'] = time() - 1;
        }
        $user['status'] = 1;
        if (empty($user['passwd'])) {
            return Ajax::error('密码不能为空');
        } else if ($user['passwd'] != rqst('rePasswd')) {
            return Ajax::error('两次输入的密码不相同！');
        }
        if (empty($roleIds)) {
            return Ajax::error('角色必选,不能为空!');
        }
        //处理租户用户名
        $tenant = $this->passport->data['tenant'];
        $domain = $tenant['domain'] ?? '';
        if ($domain) {
            $user['name'] = $user['name'] . '@' . $domain;
        }

        $userTable         = new UserTable();
        $user['tenant_id'] = APP_TENANT_ID;
        $db                = $userTable->db();
        $db->start();//启动事务
        try {
            if ($uid = $userTable->newAccount($user)) {
                $metaTable = new UserMetaTable($db);
                $metaRes   = $metaTable->setMetas($uid, $userMeta);
                $roleRes   = $userTable->setRoles($uid, explode(',', $roleIds));
                if ($metaRes && $roleRes) {
                    $db->commit();
                    $requests = Request::getInstance()->requests();
                    unset($requests['passwd']);
                    Syslog::info('common', 'Add User successfully', 'Add User', $this->passport->uid, '', json_encode($requests));                    Syslog::info('common', 'Add User successfully', 'Add User', $this->passport->uid, '', json_encode(Request::getInstance()->requests()));

                    return Ajax::success();
                }
            }
        } catch (ValidateException  $exception) {
            $db->rollback();

            return Ajax::error($exception->getMessage());
        }
        $db->rollback();

        return Ajax::error('添加用户失败,请联系管理员');
    }

    /**
     * 修改用户信息
     * @acl     edit:system/account/user
     * @return \wulaphp\mvc\view\JsonView
     * @Author  LW 2021/3/18 15:29
     */
    public function save(): JsonView {
        $uid      = irqst('uid', 0);
        $user     = rqsts(['name']);
        $userMeta = rqsts(['desc', 'phone', 'email', 'nickname']);
        $roleIds  = rqst('roleIds');
        $passwd   = rqst('passwd');

        $name         = explode('@', $user['name']);
        $user['name'] = $name[0];
        if (empty($user['name'])) {
            return Ajax::error('用户名不合法/用户名不能为空');
        }

        if (rqset('status')) {
            $user['status'] = in_array(rqst('status'), [1, 0]) ? rqst('status') : 0;
        }
        if (!empty($passwd) && $passwd != rqst('rePasswd')) {
            return Ajax::error('两次输入的密码不相同！');
        }
        if (empty($roleIds)) {
            return Ajax::error('角色必选,不能为空!');
        }

        //处理租户用户名
        $tenant = $this->passport->data['tenant'];
        $domain = $tenant['domain'] ?? '';
        if ($domain) {
            $user['name'] = $user['name'] . '@' . $domain;
        }

        $userTable = new UserTable();
        $user1     = $userTable->findOne($uid);
        if (!$user1['id']) {
            return Ajax::error('用户不存在');
        }
        //超级管理员不能被别人修改.
        if ($user1['is_super_user'] && $uid != $this->passport->uid) {
            return Ajax::error('你无权修改此用户');
        }
        //不能修改别人家的用户
        if ($user1['tenant_id'] != APP_TENANT_ID) {
            return Ajax::error('你无权修改此用户');
        }

        $db = $userTable->db();
        $db->start();//启动事务
        try {
            if ($res = $userTable->updateAccount($user, $uid)) {
                $metaTable = new UserMetaTable($db);
                $metaRes   = $metaTable->setMetas($uid, $userMeta);
                $roleRes   = $userTable->setRoles($uid, explode(',', $roleIds));
                if ($metaRes && $roleRes) {
                    $db->commit();
                    $requests = Request::getInstance()->requests();
                    unset($requests['passwd']);
                    Syslog::info('common', 'Edit User successfully', 'Edit User', $this->passport->uid, '', json_encode($requests));                    Syslog::info('common', 'Edit User successfully', 'Edit User', $this->passport->uid, '', json_encode(Request::getInstance()->requests()));

                    return Ajax::success();
                }
            }
        } catch (ValidateException  $exception) {
            $db->rollback();

            return Ajax::error($exception->getMessage());
        }
        $db->rollback();

        return Ajax::error('修改失败');
    }

    /**
     * 删除用户
     * @acl     del:system/account/user
     * @return \wulaphp\mvc\view\JsonView
     * @Author  LW 2021/3/18 19:42
     */
    public function del(): JsonView {
        $uids = rqst('uids');
        if (empty($uids))
            return Ajax::error('请选择要删除的用户');
        $userTable = new UserTable();
        $db        = $userTable->db();
        $db->start();//启动事务
        try {
            $res       = $userTable->delAccount($uids, $this->passport->uid);
            $metaTable = new UserMetaTable($db);
            $metaRes   = $metaTable->recycle(['user_id IN' => $uids]);
            $userRole  = new UserRoleModel();
            $roleRes   = $userRole->recycle(['user_id IN' => $uids]);
            if ($res && $metaRes && $roleRes) {
                $db->commit();
                Syslog::info('common', 'Delete User successfully', 'Delete User', $this->passport->uid, json_encode(Request::getInstance()->requests()));

                return Ajax::success();
            }
        } catch (\Exception $exception) {
            return Ajax::error($exception->getMessage());
        }
        $db->rollback();

        return Ajax::error('删除用户失败');
    }
}