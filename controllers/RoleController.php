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
use system\classes\model\RoleModel;
use system\classes\model\RolePermission;
use system\classes\Syslog;
use wulaphp\auth\AclResource;
use wulaphp\auth\AclResourceManager;
use wulaphp\io\Ajax;
use wulaphp\io\Request;
use wulaphp\io\Response;
use wulaphp\mvc\view\JsonView;
use wulaphp\mvc\view\View;
use wulaphp\validator\ValidateException;

/**
 * Class UserController
 * @acl     r:system/account/role
 * @package backend\controllers
 */
class RoleController extends PageController {

    public function index(): View {
        $tableData = $this->list();

        return $this->render(['tableData' => json_encode($tableData)]);
    }

    /**
     * 授权页面
     * @acl    grant:system/account/role
     *
     * @param int $rid
     *
     * @get
     * @return array|\wulaphp\mvc\view\View|null
     * @Author LW 2021/3/25 11:07
     */
    public function grant(int $rid): View {
        $roleM              = new RoleModel();
        $where['id']        = $rid;
        $where['tenant_id'] = APP_TENANT_ID;
        $role               = $roleM->findOne($where);
        if ($role['id']) {
            return $this->render('role/grant', ['rid' => $rid, 'role' => $role]);
        }
        Response::respond(404);
    }

    /**
     * 权限列表
     * @acl    grant:system/account/role
     *
     * @param int $rid
     *
     * @get
     * @return \backend\classes\layui\TableData
     */
    public function grantList(int $rid) {
        $rolePer = new RolePermission();
        $hasPers = array_column($rolePer->getPermissionByRoleId($rid), 'resId');

        $aclM = AclResourceManager::getInstance('admin');
        $res  = $aclM->getResource('/');
        $tree = $this->permissionList($res, $hasPers, 0);
        $data = array_values($tree);

        return new TableData($data, count($data));
    }

    /**
     * @post
     * @acl grant:system/account/role
     */
    public function grantSave(): JsonView {
        $rid    = irqst('rid', 1);
        $grants = rqst('grants');
        if (empty($grants))
            return Ajax::error('请选择权限');
        $permissions = [];
        foreach ($grants as $key => $value) {
            [$op, $uri] = explode(':', $value);
            $per                 = ['id' => md5($rid . $uri . $op), 'role_id' => $rid, 'uri' => $uri, 'op' => $op];
            $permissions[ $key ] = $per;
        }
        $model = new RolePermission();
        if ($model->updatePermissionByRoleId($rid, $permissions)) {
            Syslog::info('common', 'Grant For Role successfully', 'Role Grant', $this->passport->uid, '', json_encode(Request::getInstance()->requests(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS));

            return Ajax::success();
        }

        return Ajax::error('授权失败,请刷新重试!');
    }

    /**
     * @get
     * @acl    r:system/account/role
     * @return array
     * @Author LW 2021/3/16 14:20
     */
    public function list(): array {
        $page  = irqst('page', 1);
        $limit = irqst('limit', 20);
        $id    = rqst('id', null);
        $param = rqsts(['name', 'role']);
        #$where['deleted'] = 0;
        $where = [];
        foreach ($param as $key => $value) {
            if (!is_numeric($value) && empty($value)) {
                unset($param[ $key ]);
                continue;
            }
            $where[ $key . ' LIKE' ] = '%' . $value . '%';
        }
        $roleModel          = new RoleModel();
        $where['tenant_id'] = $this->passport->data['tenant_id'];
        $roleModel          = $roleModel->select()->where($where);
        $count              = $roleModel->count();
        $list               = $roleModel->page($page, $limit)->toArray();
        if (!is_null($id) && is_numeric($id)) {
            $tree = $this->tree($list, 0, $id);
        }

        return ['code' => 0, 'count' => $count, 'data' => $list, 'tree' => $tree ?? []];
    }

    /**
     * 角色添加
     * @acl    add:system/account/role
     * @post
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/25 13:54
     */
    public function add(): JsonView {
        $role              = rqsts(['name', 'role', 'remark']);
        $role['pid']       = irqst('pid', 0);
        $role['tenant_id'] = $tenant_id = $this->passport->data['tenant_id'];
        $roleModel         = new RoleModel();
        try {
            $result = $roleModel->exist(['tenant_id' => $tenant_id, 'name' => $role['name']], 'name');
            if ($result) {
                return Ajax::error('请检查角色代码,不能重复~');
            }
            $role['system'] = 0;
            if ($roleModel->addRole($role)) {
                Syslog::info('common', 'Add Role successfully', 'Add Role', $this->passport->uid, '', json_encode(Request::getInstance()->requests()));

                return Ajax::success('添加成功');
            }
        } catch (ValidateException $exception) {
            return Ajax::error($exception->getMessage());
        }

        return Ajax::error('添加失败');
    }

    /**
     * @post
     * @acl    edit:system/account/role
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/16 14:33
     */
    public function save(): JsonView {
        $role        = rqsts(['name', 'role', 'remark']);
        $id          = irqst('id', 0);
        $role['pid'] = irqst('pid', 0);
        $roleModel   = new RoleModel();
        if (empty($id))
            return Ajax::error('当前角色无效,请刷新重试');
        try {
            $crole = $roleModel->findOne($id)->ary();
            if (!$crole) {
                return Ajax::error('角色不存在~');
            }

            $tenant_id = $this->passport->data['tenant_id'];
            $result    = $roleModel->findOne(['tenant_id' => $tenant_id, 'name' => $role['name']])->ary();
            if ($result && $result['id'] != $id) {
                return Ajax::error('请检查角色代码,不能重复~');
            }

            if ($roleModel->checkRoleIsMySubRole($role['pid'], $id, $tenant_id)) {
                return Ajax::error('修改失败,不能修改上级角色为当前子类角色!');
            }

            if ($crole['system']) {
                unset($role['name']);//内置角色不能修改name
            }

            if ($roleModel->updateRole($role, $id)) {
                Syslog::info('common', 'Edit Role successfully', 'Edit Role', $this->passport->uid, '', json_encode(Request::getInstance()->requests()));

                return Ajax::success();
            }
        } catch (ValidateException $exception) {
            return Ajax::error($exception->getMessage());
        }

        return Ajax::error('修改失败');
    }

    /**
     * @post
     * @acl    del:system/account/role
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/16 16:50
     */
    public function del(): JsonView {
        $ids = rqst('ids');
        if (empty($ids))
            return Ajax::error('请选择要删除的数据');
        $roleModel = new RoleModel();
        try {
            if ($roleModel->exist(['pid IN' => $ids, 'deleted' => 0])) {
                return Ajax::error('当前角色下存在子角色无法进行删除');
            }
            $tenant_id = $this->passport->data['tenant_id'];
            $res       = $roleModel->delRole($ids, $tenant_id);
            if ($res) {
                Syslog::info('common', 'Delete Role successfully', 'Delete Role', $this->passport->uid, json_encode(Request::getInstance()->requests()));

                return Ajax::success();
            }
        } catch (\Exception $exception) {
            return Ajax::error($exception->getMessage());
        }

        return Ajax::error('删除失败');
    }

    /**
     * @param \wulaphp\auth\AclResource $resource
     * @param int                       $pid
     * @param array                     $hasPermissions
     * @param int                       $level
     *
     * @return array
     * @Author LW 2021/3/22 13:55
     */
    private function permissionList(AclResource $resource, array $hasPermissions, int $pid = 0, int $level = 0): array {
        static $tree = [];
        static $count = 1;
        foreach ($resource->getNodes() as $key => $value) {
            $id           = $count ++;
            $uri          = $value->getURI();
            $defaultOp    = ['r' => ['uri' => $uri, 'name' => '查看', 'extra' => '', 'resId' => 'r:' . $uri]];
            $res['name']  = $value->getName();
            $res['uri']   = $value->getURI();
            $res['ops']   = isset($value->getOperations()['r']) ? $value->getOperations() : array_merge($defaultOp, $value->getOperations());
            $res['id']    = $id;
            $res['pid']   = $pid;
            $res['level'] = $level;
            foreach ($res['ops'] as &$op) {
                $op['checkbox'] = in_array($op['resId'], $hasPermissions) ? 'checked' : '';
            }
            $tree[ $id ] = $res;
            if (!empty($resource->getNodes())) {
                $this->permissionList($value, $hasPermissions, $count - 1, $level + 1);
            }

        }

        return $tree;
    }

    /**
     * 树形结构
     *
     * @param array    $list 数据列表
     * @param int      $pid  上级id
     * @param int|null $stop 跳过id
     *
     * @return array
     * @Author LW 2021/3/17 18:18
     */
    private function tree(array $list, int $pid = 0, int $stop = null): array {
        $tree = [];
        foreach ($list as $key => $value) {
            if ($stop == $value['id']) {
                continue;
            }
            if ($value['pid'] == $pid) {
                if (!empty($stop) && $pid == $stop) {
                    $stop = $value['id'];
                }
                $value['children'] = $this->tree($list, $value['id'], $stop);
                $tree[]            = $value;
            }
        }

        return $tree;
    }
}