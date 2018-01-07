基于layui, Bootstrap、jQuery、H5等技术的现代化管理控制台.

## 触发器

控制台提供的触发器大部分与后台界面有关。通过提供自定义触发器处理器可以非常方便地实现导航菜单等管理.

### 1. dashboard\initUI (`DashboardUI $ui`)

初始化控制台界面时触发.

__参数:__

* $ui 控制台界面实例

__示例:__

```php
/**
 * @param \backend\classes\DashboardUI $ui
 *
 * @bind dashboard\initUI
 */
public static function initUiI(DashboardUI $ui) {
    $passport = whoami('admin');
    if ($passport->cando('m:api')) {
        $navi          = $ui->getMenu('api', '接口(API)');
        $navi->icon    = '&#xe857;'; // 参考阿里ICON
        $navi->pos     = 900;
        $navi->iconCls = 'layui-icon';

        $doc             = $navi->getMenu('doc', '接口文档');
        $doc->pos        = 1;
        $doc->icon       = 'fa fa-book';
        $doc->iconStyle  = 'color:green';
        $doc->data['url']= App::hash('~rest/doc'); 
    }
}
```

> * 示例代码用到了触发器自动绑定功能。
> * `DashboardUI`功能请参考其[文档](#backend/doc/backend.classes.DashboardUI).

### 2. dashboard\initLeftTopbar(`DashboardUI $ui`)
初始化控制台界面顶部左侧菜单时触发.

__参数:__

* $ui 控制台界面实例

### 3. dashboard\initRightTopbar(`DashboardUI $ui`)
初始化控制台界面顶部右侧菜单时触发.

__参数:__

* $ui 控制台界面实例

### 4. dashboard\initUserTopbar(`DashboardUI $ui`)
初始化控制台界面顶部右侧用户下拉菜单时触发.

__参数:__

* $ui 控制台界面实例


### 5. dashboard\headercss()
输出控制台主界面的头部HTML代码时触发。可以像下边代码来增加自定义的CSS文件:

```php
bind('dashboard\headercss',function(){
    echo '<link rel="stylesheet" href="your/css/file.css"/>';
});
```

或者:

```php
bind('dashboard\headercss',function(){
    echo '<style>body{color:red}</style>';
});
```

### 6. dashboard\footerjs()
输出控制台主界面的底部HTML代码时触发。可以像下边代码来增加自定义的JS文件:

```php
bind('dashboard\footerjs',function(){
    echo '<script type="text/javascript" src="your/js/file.js"/>';
});
```

或者:

```php
bind('dashboard\footerjs',function(){
    echo '<script>var greeting = "Hello World!";</script>';
});
```

## 过滤器/修改器

### 1. get_media_domains($domains=[])

获取多媒体域名时触发。

__参数:__

* $domains `array` 每个域名为一个值.

### 2. dashboard/settings($settings=[])

注册系统设置项时触发.只需要提供一个[Setting](#backend/doc/backend.classes.Setting)子类 的实例，即可轻松实现配置功能.

__参数:__

* $settings `array` key 为配置`setting`,value为Setting类的子类的实例.