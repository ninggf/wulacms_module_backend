<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes\widget;

use backend\classes\Widget;
use wulaphp\app\App;
use wulaphp\cache\Cache;
use wulaphp\cache\RtCache;
use wulaphp\util\RedisClient;

class SystemStatusWidget extends Widget {
	public function name() {
		return '系统状态';
	}

	public function render() {

		$data = ['php_ver' => phpversion(), 'os_name' => $_SERVER['SERVER_SOFTWARE']];

		try {
			$dialect           = App::db()->getDialect();
			$info              = explode(' ', $dialect->getAttribute(\PDO::ATTR_CLIENT_VERSION));
			$data ['dbclient'] = implode(' ', array_slice($info, 0, 2));
			$data ['dbInfo']   = $dialect->getDriverName() . ' v' . $dialect->getAttribute(\PDO::ATTR_SERVER_VERSION);
		} catch (\Exception $e) {

		}

		$cache = Cache::getCache();
		$cache->add('sw_test_d', 1, 10);
		$data['cache']   = $cache->getName();
		$data['cstatus'] = $cache->get('sw_test_d') ? 'text-success' : 'text-muted';

		try {
			$redis = RedisClient::getRedis();
			if ($redis) {
				$redis->set('sw_test_d', 1);
				$data['rstatus'] = $redis->get('sw_test_d') ? 'text-success' : 'text-muted';
				$data['redis']   = '已连接';
			} else {
				$data['rstatus'] = 'text-muted';
				$data['redis']   = '未配置';
			}
		} catch (\Exception $e) {
			$data['rstatus'] = 'text-danger';
			$data['redis']   = '未连接';
		}
		RtCache::add('sw_test_d', 1);
		$data['rtcache'] = RtCache::get('sw_test_d') ? 'text-success' : 'icon-muted';

		$system         = App::getModuleById('system');
		$data['system'] = $system->getCurrentVersion();

		$backend         = App::getModuleById('backend');
		$data['backend'] = $backend->getCurrentVersion();

		return $this->load('backend/views/widget/system', $data);
	}
}