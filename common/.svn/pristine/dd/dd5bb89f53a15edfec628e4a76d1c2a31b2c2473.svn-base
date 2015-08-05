/**
*
* 文件注释，说明文件名称和文件所包含内容
* @file responsive.js
* @author picheng
* @create time 2014年08月22日 15:49
* @version {版本信息}  v0.0.1
*
* ////////////////////////////////////////
*
* 响应式布局
* 根据浏览端改版需求，响应式只在宽度上作两种适配，宽屏和窄屏
*
* 约定
*   1. 页面默认UI以宽屏为准，页面结构和各组件对窄屏作适配
*   2. CSS适配关注class值：html.w1024
*   3. JS适配关注全局事件：window:resize，传入数据：{ size: 当前窗口尺寸, type: 'big' || 'small' }
*
* ////////////////////////////////////////
*
* @Modification time  2014年08月29日 15:51
*     @by shangwenhe
*     修改窄屏临界值 1024 修改为  1235
*     当屏幕小于 1235时 以1024来展示
*
*     100毫秒修改为50毫秒。用户不会感觉到停顿
*
*********************************************/





// 工具组件
var ec = require('common:static/ui/eventcenter/eventcenter.js');

exports = module.exports = function () {
    $(function () {
        var html = $('html'); // 屏幕尺寸切换时为HTML元素添加class
        var small = 1245; // 窄屏临界值
        var middle = 1345; // 窄屏临界值
        var max = 1900;
        var timer = null; // 定位器，避免窗口变化过程set太频繁
        var $window = $(window);
        var classList = ['w1024', 'w1235', 'w1280', 'w1920'].join(' ');

        function checkSet() {
            var w = document.documentElement.clientWidth;

            html.removeClass(classList);
            if (w < small) {
                html.addClass('w1024');
                ec.trigger('window:resize', {size: w, type: 'small'});
                $window.trigger('window:resize', {size: w, type: 'small'});
            }
            else if (w >= small && w < middle) {
                html.addClass('w1280 w1235');
                ec.trigger('window:resize', {size: w, type: 'w1280'});
                $window.trigger('window:resize', {size: w, type: 'w1280'});
            }
            else if (w >= max) {
                html.addClass('w1920 w1235');
                ec.trigger('window:resize', {size: w, type: 'w1920'});
                $window.trigger('window:resize', {size: w, type: 'w1920'});
            }
            else {
                html.addClass('w1235');
                ec.trigger('window:resize', {size: w, type: 'big'});
                $window.trigger('window:resize', {size: w, type: 'big'});
            }
        }

        $window.resize(function (e) {
            // 50毫秒内重复resize 则清除计时器
            // 函数节流
            clearTimeout(timer);
            timer = setTimeout(checkSet, 50);
        });

        checkSet();
    });
};
