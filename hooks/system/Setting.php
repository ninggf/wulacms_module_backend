<?php

namespace backend\hooks\system;

use wulaphp\hook\Alter;

class Setting extends Alter {
    public function alter($value, ...$args) {
        //通用配置
        $value['common'] = $this->allocation('common', __('Common Setting'), '~backend/views/settings/common');
        return $value;
    }

    /**
     * 配置属性
     *
     * @param string $id
     * @param string $name
     * @param string $view
     * @param string $prefix
     * @param string $icon
     *
     * @return \system\classes\Setting
     * @Author LW 2021/4/9 10:19
     */
    private function allocation(string $id, string $name, string $view = '', string $prefix = '', string $icon = 'layui-icon-util'): \system\classes\Setting {
        $param   = ['id' => $id, 'name' => $name, 'view' => $view, 'prefix' => $prefix, 'icon' => $icon];
        return new class($param) extends \system\classes\Setting {
            public $id, $name, $prefix, $view, $group, $icon;

            public function __construct($param) {
                $this->id     = $param['id'] ?? '';
                $this->name   = $param['name'] ?? '';
                $this->prefix = $param['prefix'] ?? '';
                $this->view   = $param['view'] ?? '';
                $this->icon   = $param['icon'] ?? '';
            }

            public function getIconCls(): ?string {
                return $this->icon;
            }

            public function getPrefix(): string {
                return $this->prefix;
            }

            public function getId(): string {
                return $this->id;
            }

            public function getName(): string {
                return $this->name;
            }

            public function getView(): string {
                return $this->view;
            }

            public function getGroup(): string {
                return trim($this->prefix . $this->id);
            }

        };
    }
}