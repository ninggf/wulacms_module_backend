<?php

namespace backend\controllers;

use backend\classes\layui\TableData;
use backend\classes\layui\TableDef;
use backend\classes\layui\TablePage;
use backend\classes\PageController;
use system\classes\BaseTask;
use system\classes\model\TaskLogModel;
use system\classes\model\TaskModel;
use system\classes\model\TaskQueueModel;
use wulaphp\app\App;
use wulaphp\io\Response;
use wulaphp\mvc\view\View;

/**
 * @acl     r:system/task
 * @package backend\controllers
 */
class TaskController extends PageController {
    use TablePage;

    /**
     * 任务列表页
     * @return \wulaphp\mvc\view\View
     */
    public function index(): View {
        $tasks     = BaseTask::getTasks();
        $taskNames = [];
        foreach ($tasks as $task) {
            $id               = $task->getId();
            $taskNames[ $id ] = $task->getName();
        }
        $this->pageTitle = _t('Tasks');

        return $this->renderTable(['tasks' => $taskNames])->addScript(App::res('backend/assets/addon/je/jsoneditor-minimalist.js'))->addStyle(App::res('backend/assets/addon/je/jsoneditor.css'));
    }

    /**
     * 任务数据
     *
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
        $tasks     = BaseTask::getTasks();
        $taskNames = [];
        foreach ($tasks as $task) {
            $id               = $task->getId();
            $taskNames[ $id ] = $task->getName();
        }
        $task = new TaskModel();

        $query = $task->select()->where($where)->page($page, $limit)->asc('status')->desc('next_runtime');

        $total = $query->total();

        $items = $query->toArray();
        array_walk($items, function (&$item) use ($taskNames) {
            $clz                  = unget($item, 'task');
            $item['type']         = $taskNames[ $clz ] ?? '-';
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
            if ($item['options']) {
                $item['options'] = @json_decode($item['options'], true) ?: [];
            } else {
                $item['options'] = [];
            }
        });

        return new TableData($items, $total);
    }

    /**
     * 执行明细页.
     *
     * @param int $id
     *
     * @return \wulaphp\mvc\view\View
     */
    public function detail(int $id): View {
        $taskM = new TaskModel();
        $task  = $taskM->findOne($id)->ary();
        if (!$task) {
            Response::respond(404, '任务不存在');
        }
        $this->pageTitle  = '[' . $id . ']' . $task['name'];
        $task['task_id']  = $id;
        $task['taskName'] = ($tCls = BaseTask::createTask($task['task'])) ? $tCls->getName() : '-';

        return $this->renderTable(new TableDef($this->detailCols(), $this->detailData($id)), $task)->addScript(App::res('backend/assets/addon/je/jsoneditor-minimalist.js'))->addStyle(App::res('backend/assets/addon/je/jsoneditor.css'));
    }

    /**
     * 运行明细数据.
     *
     * @param int    $id
     * @param int    $page
     * @param int    $limit
     * @param string $status
     * @param string $date
     *
     * @return \backend\classes\layui\TableData
     */
    public function detailData(int $id, int $page = 1, int $limit = 30, string $status = '', string $date = ''): TableData {
        $where['task_id'] = $id;
        if ($status) {
            $where['status'] = $status;
        }
        if ($date) {
            $dates = explode(' - ', $date);
            $sdate = $dates[0] ?? null;
            $edate = $dates[1] ?? date('Y-m-d 23:59:59');
            if ($sdate) {
                $where['start_time >='] = strtotime($sdate);
            }
            if ($edate) {
                $where['start_time <='] = strtotime($edate);
            }
        }
        $model = new TaskQueueModel();
        $query = $model->findAll($where)->page($page, $limit)->desc('running')->asc('status')->desc('id');
        $total = $query->total();
        $items = $query->toArray();

        $statusText = [
            'P' => [_t('Pending'), '', '', 'PENDING'],
            'R' => [_t('Running'), 'info', 'blue', 'INFO'],
            'E' => [_t('Failed'), 'danger', 'red', 'ERROR'],
            'F' => [_t('Success'), 'success', 'green', 'SUCCESS']
        ];
        $default    = ['-', '', '', ''];
        foreach ($items as &$item) {
            if ($item['end_time']) {
                $item['elapsed'] = readable_date($item['end_time'] - $item['start_time']);
            } else {
                $item['elapsed'] = $item['running'] ? readable_date(time() - $item['start_time']) : '-';
            }
            $item['start_time'] = date('Y-m-d H:i:s', $item['start_time'] ?: $item['create_time']);
            $item['end_time']   = $item['end_time'] ? date('Y-m-d H:i:s', $item['end_time']) : '';
            $st                 = $statusText[ $item['status'] ] ?? $default;
            $item['statusText'] = $st[0];
            $item['statusCls']  = $st[1];
            $item['progCls']    = $st[2];
            $item['sts']        = $st[3];
            if ($item['options']) {
                $item['options'] = @json_decode($item['options'], true) ?: [];
            } else {
                $item['options'] = [];
            }
        }

        return new TableData($items, $total);
    }

    /**
     * 日志.
     *
     * @param int $id
     *
     * @return \wulaphp\mvc\view\View
     */
    public function log(int $id): View {
        $where['TQ.id'] = $id;
        $model          = new TaskQueueModel();
        $query          = $model->alias('TQ')->select('TQ.*,T.name as task_name')->inner('{task} AS T', 'TQ.task_id', 'T.id');
        $query->where($where);
        $tq = $query->get();

        if (!$tq) {
            Response::respond(404, '任务不存在:' . $id);
        }

        $this->pageTitle = '[' . $id . '] ' . $tq['task_name'] . '(' . $tq['retried'] . ')';
        if ($tq['options']) {
            $tq['pageData']['options'] = @json_decode($tq['options']) ?: [];
        } else {
            $tq['pageData']['options'] = [];
        }

        $view = $this->render($tq);
        $view->addScript(App::res('backend/assets/addon/je/jsoneditor-minimalist.js'));
        $view->addStyle(App::res('backend/assets/addon/je/jsoneditor.css'));

        return $view;
    }

    /**
     * 日志明细
     *
     * @param int $tid
     * @param int $id
     *
     * @return array
     */
    public function logs(int $tid, int $id = 0): array {
        $taskLogM               = new TaskLogModel();
        $where['task_queue_id'] = $tid;
        if ($id) {
            $where['id >'] = $id;
        }
        $query = $taskLogM->findAll($where, 'id,content,create_time')->asc('id');

        $logs = ['id' => 0, 'contents' => []];

        foreach ($query as $_log) {
            $log = $_log->ary();

            $log['content'] = date('[Y-m-d H:i:s] ', $log['create_time']) . $log['content'];
            unset($log['create_time']);
            $logs['contents'][] = $log['content'];
            $logs['id']         = $log['id'];
        }
        $logs['contents'] = implode("\n", $logs['contents']);

        return $logs;
    }

    /**
     * 任务列表的表头.
     *
     * @return array
     */
    protected function cols(): array {
        $headCols = [];//表头

        $cols[]     = ['field' => 'id', 'title' => '#', 'width' => 70, 'with' => 'level', 'fixed' => 'left'];
        $cols[]     = [
            'field'    => 'name',
            'title'    => __('Name'),
            'minWidth' => 300,
            'templet'  => '#nameTpl',
            'fixed'    => 'left'
        ];
        $cols[]     = ['field' => 'retry', 'title' => __('Retry'), 'width' => 100, 'templet' => '#retryCol'];
        $cols[]     = ['field' => 'create_time', 'title' => __('Create Time'), 'width' => 165];
        $cols[]     = ['field' => 'first_runtime', 'title' => __('First Run Time'), 'width' => 165];
        $cols[]     = ['field' => 'next_runtime', 'title' => __('Next Run Time'), 'width' => 165];
        $cols[]     = ['field' => 'last_runtime', 'title' => __('Last Run Time'), 'width' => 165];
        $cols[]     = ['field' => 'crontab', 'title' => __('Cron Express'), 'minWidth' => 140];
        $cols[]     = [
            'field'   => '_ops',
            'title'   => '&nbsp;',
            'width'   => 60,
            'toolbar' => '#tableToolbar',
            'fixed'   => 'right',
            'align'   => 'center'
        ];
        $headCols[] = $cols;

        return $headCols;
    }

    /**
     * 运行明细表格的表头
     *
     * @return array
     */
    protected function detailCols(): array {
        $headCols = [];//表头

        $cols[]     = ['field' => 'id', 'title' => '#', 'width' => 70, 'with' => 'sts', 'fixed' => 'left'];
        $cols[]     = ['field' => 'start_time', 'title' => __('Start Time'), 'width' => 170];
        $cols[]     = ['field' => 'end_time', 'title' => __('End Time'), 'width' => 170];
        $cols[]     = ['field' => 'elapsed', 'title' => __('Elapsed'), 'align' => 'center', 'width' => 90];
        $cols[]     = ['field' => 'retried', 'title' => __('Retried'), 'align' => 'center', 'width' => 100];
        $cols[]     = [
            'field'   => 'progress',
            'title'   => __('Progress'),
            'width'   => 120,
            'templet' => '#progTpl'
        ];
        $cols[]     = [
            'field'   => 'status',
            'title'   => __('Status'),
            'align'   => 'center',
            'templet' => '#statusTpl',
            'width'   => 120
        ];
        $cols[]     = ['field' => 'msg', 'title' => __('Message'), 'minWidth' => 200];
        $cols[]     = [
            'field'   => '_ops',
            'title'   => '&nbsp;',
            'width'   => 80,
            'templet' => '#tableToolbar',
            'fixed'   => 'right',
            'align'   => 'center'
        ];
        $headCols[] = $cols;

        return $headCols;
    }
}