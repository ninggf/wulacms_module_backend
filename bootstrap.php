<?php

namespace backend;

use wula\cms\CmfModule;
use wulaphp\app\App;

class BackendModule extends CmfModule {
	public function getName() {
		return '管理后台';
	}

	public function getDescription() {
		return '基于jqadmin&layui的管理后台';
	}

	public function getHomePageURL() {
		return 'https://www.wulacms.com/modules/backend';
	}

	public function getAuthor() {
		return 'Leo Ning';
	}

	public function getVersionList() {
		$v['1.0.0'] = '管理后台的第一个版本';

		return $v;
	}
}

App::register(new BackendModule());