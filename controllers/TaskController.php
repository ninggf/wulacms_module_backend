<?php

namespace backend\controllers;

use backend\classes\layui\TableData;
use backend\classes\layui\TablePage;
use backend\classes\PageController;
use system\classes\BaseTask;
use system\classes\model\TaskModel;
use wulaphp\mvc\view\View;

/**
 * @acl     r:system/task
 * @package backend\controllers
 */
class TaskController extends PageController {
    use TablePage;

    public function index(): View {
        $tasks     = BaseTask::getTasks();
        $taskNames = [];
        foreach ($tasks as $task) {
            $id               = $task->getId();
            $taskNames[ $id ] = $task->getName();
        }

        return $this->renderTable(['tasks' => $taskNames]);
    }

    public function queue() {

    }

    /**
     * @param int    $page
     * @param int    $limit
     * @param string $status 状态
     * @param string $clz    脚本
     * @param string $date   时间
     *
     * @return \backend\classes\layui\TableData
     */
    public function data(int $page = 1, int $limit = 30, string $status = '', string $clz = '', string $date = ''): TableData {
        $where['status'] = 'R';
        if (in_array($status, ['S', 'R'])) {
            $where['status'] = $status;
        }
        if ($clz) {
            $where['task'] = $clz;
        }

        $task = new TaskModel();

        $query = $task->select()->where($where)->page($page, $limit)->asc('status')->desc('next_runtime');

        $total = $query->total();

        $items = $query->toArray();

        array_walk($items, function (&$item) {
            $item['level']        = $item['status'] == 'R' ? 'INFO' : 'SUCCESS';
            $item['next_runtime'] = date('Y-m-d H:i:s', $item['next_runtime']);
            if ($item['first_runtime']) {
                $item['first_runtime'] = date('Y-m-d H:i:s', $item['first_runtime']);
            } else {
                $item['first_runtime'] = 'N/A';
            }
            if ($item['last_runtime']) {
                $item['last_runtime'] = date('Y-m-d H:i:s', $item['last_runtime']);
            } else {
                $item['last_runtime'] = 'N/A';
            }
            $item['create_time'] = date('Y-m-d H:i:s', $item['create_time']);
        });

        return new TableData($items, $total);
    }

    /**
     *
     * @return array
     */
    protected function cols(): array {
        $headCols = [];//表头

        $cols[]     = ['field' => 'id', 'title' => '#', 'width' => 70, 'with' => 'level', 'fixed' => 'left'];
        $cols[]     = ['field' => 'name', 'title' => __('Name'), 'minWidth' => 150];
        $cols[]     = ['field' => 'retry', 'title' => __('Retry'), 'width' => 120,'templet'=>'#retryCol'];
        $cols[]     = ['field' => 'create_time', 'title' => __('Create Time'), 'width' => 170];
        $cols[]     = ['field' => 'first_runtime', 'title' => __('First Run Time'), 'width' => 170];
        $cols[]     = ['field' => 'next_runtime', 'title' => __('Next Run Time'), 'width' => 170];
        $cols[]     = ['field' => 'last_runtime', 'title' => __('Last Run Time'), 'width' => 170];
        $cols[]     = ['field' => 'crontab', 'title' => __('Cron Express'), 'width' => 140];
        $cols[]     = [
            'field'   => '_ops',
            'title'   => '&nbsp;',
            'width'   => 80,
            'toolbar' => '#tableToolbar',
            'fixed'   => 'right',
            'align'   => 'center'
        ];
        $headCols[] = $cols;

        return $headCols;
    }
}