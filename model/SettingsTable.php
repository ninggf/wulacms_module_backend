<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\model;

use wulaphp\db\Table;

class SettingsTable extends Table {
	/**
	 * 保存配置.
	 *
	 * @param string $group
	 * @param array  $cfgs
	 *
	 * @return bool|array
	 */
	public function saveSetting($group, $cfgs) {
		try {
			$datas = [];
            foreach ($cfgs as $name => $value) {
                $needLog        = false;
                $before = '';
                $data           = [];
                $data ['group'] = $group;
                $data ['name']  = $name;
                $cfg            = $this->find($data)->get();
                if ($cfg && $cfg ['value'] != $value) {
                    $needLog        = true;
                    $data ['value'] = $value;
                    $before = $cfg['value'];
                    unset ($cfg ['value']);
                    $this->update($data, $cfg);
                } else if (!$cfg) {
                    $needLog        = true;
                    $data ['value'] = $value;
                    $datas []       = $data;
                }
                if ($needLog) {
                    fire('setting/configSave', $group, $name, $before, $value);
                }
            }
			if ($datas) {
				$this->inserts($datas);
			}
		} catch (\Exception $e) {
			return false;
		}

		return count($cfgs) > 0 ? $cfgs : true;
	}
}