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
use system\classes\model\RoleModel;
use wulaphp\auth\AclResourceManager;
use wulaphp\io\Ajax;
use wulaphp\mvc\view\JsonView;
use wulaphp\validator\ValidateException;

class RoleController extends PageController {

    public function index() {
    }

    /**
     * @acl grant:account/role
     * @param int $rid
     */
    public function grant(int $rid){
        $aclM = AclResourceManager::getInstance();

        $root = $aclM->getResource('/');
    }

    /**
     * @acl grant:account/role
     * @param int $rid
     */
    public function grantPost(int $rid){

    }
    /**
     * @get
     * @return array
     * @Author LW 2021/3/16 14:20
     */
    public function list(): array {
        $page  = irqst('page', 1);
        $limit = irqst('limit', 20);
        $id    = rqst('id', null);
        $param = rqsts(['name', 'role']);
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
        static $stopId = [];
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

    /**
     * @post
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/16 14:33
     */
    public function save(): JsonView {
        $role        = rqsts(['name', 'role','remark']);
        $id          = irqst('id', 0);
        $role['pid'] = irqst('pid', 0);
        $roleModel   = new RoleModel();
        try {
            $role['tenant_id'] = $tenant_id = $this->passport->data['tenant_id'];
            $result            = $roleModel->findOne(['tenant_id' => $tenant_id, 'name' => $role['name']], 'id');
            if ($result && $result['id'] != $id) {
                return Ajax::error('请检查角色代码,不能重复~');
            }
            if (is_numeric($id) && $id > 0) {
                if($roleModel->checkRoleIsMySubRole($role['pid'],$id,$tenant_id)){
                    return Ajax::error('修改失败,不能修改上级角色为当前子类角色!');
                }
                $res = $roleModel->updateRole($role, $id);
                $msg = "修改";
            } else {
                $res = $roleModel->addRole($role);
                $msg = "添加";
            }
            if ($res)
                return Ajax::success();
        } catch (ValidateException $exception) {
            return Ajax::error($exception->getMessage());
        }

        return Ajax::error($msg . '失败');
    }

    /**
     * @post
     * @return \wulaphp\mvc\view\JsonView
     * @Author LW 2021/3/16 16:50
     */
    public function del(): JsonView {
        $ids = rqst('ids');
        if (empty($ids))
            return Ajax::error('请选择要删除的数据');
        $roleModel = new RoleModel();
        try {
            if ($roleModel->exist(['pid IN' => $ids])) {
                return Ajax::error('当前角色下存在子角色无法进行删除');
            }
            $tenant_id = $this->passport->data['tenant_id'];
            $res = $roleModel->delRole($ids,$tenant_id);
            if ($res)
                return Ajax::success();
        } catch (\Exception $exception) {
            return Ajax::error($exception->getMessage());
        }

        return Ajax::error('删除失败');
    }
}