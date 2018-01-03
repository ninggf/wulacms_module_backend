<?php
/*
 * This file is part of wulacms.
 *
 * (c) Leo Ning <windywany@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace backend\classes;

use system\model\AclTable;
use system\model\UserTable;
use wulaphp\app\App;
use wulaphp\auth\Passport;

/**
 * 管理员通行证.
 *
 * @package backend\classes
 */
class AdminPassport extends Passport {
	public function is($roles) {
		// 1号用户为超级管理员
		if ($this->uid == 1) {
			return true;
		}
		$myroles = $this->data['roles'];
		if (empty($myroles)) {
			return false;
		}

		return !empty(array_intersect($myroles, (array)$roles));
	}

	/**
	 * 用户可以有多个角色，角色可以继承其它角色，被继承的角色权限优先级低于当前角色.
	 *
	 * @see table `acl`
	 *
	 * @param string $op    操作
	 * @param string $res   资源
	 * @param array  $extra 额外数据
	 *
	 * @return bool
	 */
	protected function checkAcl($op, $res, $extra) {
		static $checked = [];
		//1号用户为超级管理员
		if ($this->uid == 1) {
			return true;
		}
		if (!isset($this->data['acls'])) {
			$this->loadAcl();
		}
		//未找到对应的ACL
		if (!$this->data['acls']) {
			return false;
		}
		$resid = $op . ':' . $res;
		if (isset($checked[ $resid ])) {
			return $checked[ $resid ];
		}
		$reses[] = $op . ':' . $res;
		// 对资源的全部操作授权
		$reses[] = '*:' . $res;
		$ress    = explode('/', $res);
		if (count($ress) > 1) {
			// 对上级资源的全部操作授权
			while ($ress) {
				array_pop($ress);
				$reses[] = '*:' . implode('/', $ress);
			}
		}
		// 对所有资源的全部操作授权，特别是网站拥有者
		$reses[] = '*:*';
		// 权限检测.
		foreach ($reses as $opres) {
			if (isset($this->data['acls'][ $opres ])) {
				$checked[ $resid ] = $this->data['acls'][ $opres ]['allowed'] ? true : false;

				return $checked[ $resid ];
			}
		}

		return false;
	}

	protected function doAuth($data = null) {
		list($username, $password) = $data;
		$table = new UserTable();
		$user  = $table->get(['username' => $username]);
		if ($user['username'] != $username) {
			$this->error = __('You entered an incorrect username or password.');

			return false;
		}
		$passwdCheck = Passport::verify($password, $user['hash']);
		if (!$passwdCheck) {
			$this->error = __('You entered an incorrect username or password.');

			return false;
		}
		$status = $user['status'];
		if ($status == '0') {
			$this->error = __('Your account is locked.');

			return false;
		}
		$this->uid               = $user['id'];
		$this->username          = $user['username'];
		$this->nickname          = $user['nickname'];
		$this->phone             = $user['phone'];
		$this->email             = $user['email'];
		$this->avatar            = $user['avatar'] ? $user['avatar'] : App::assets('avatar.jpg');
		$this->data['status']    = $user['status'];
		$this->data['lastip']    = $user['lastip'];
		$this->data['lastlogin'] = $user['lastlogin'];
		foreach ($user['roles'] as $r) {
			$rid                         = $r['id'];
			$this->data['roles'][ $rid ] = $r['name'];
		}
		$table->updateLoginInfo($this->uid);

		return true;
	}

	/**
	 * 加载ACL.
	 */
	private function loadAcl() {
		$acls = [];
		if ($this->data['roles']) {
			$acl = new AclTable();
			foreach ($this->data['roles'] as $rid => $role) {
				$ac = $acl->findAll(['role_id' => $rid], 'res,allowed,priority');
				/**@var \wulaphp\db\sql\Query $a */
				foreach ($ac as $a) {
					$res = $a['res'];
					//priority越小优先级越高.
					if (!isset($acls[ $res ]) || $acls[ $res ]['priority'] > $a['priority']) {
						$ra = $a->get();
						unset($ra['res']);
						$acls[ $res ] = $ra;
					}
				}
			}
		}
		$this->data['acls'] = $acls;
		$this->store();
	}
}