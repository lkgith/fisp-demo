/**
 * @file 屏幕宽窄版自适应脚本 。和另一个ui/responsive/responsive.js统一class
 *       tip: 新版播放页使用另一个自适应脚本在ie下有性能问题会导致宽窄切换时候页面错乱
 * @author hejie
 */
require('common:static/ui/core/core.js');
require('common:static/vendor/bootstrap/js/transition.js');
var dimension = require('common:static/ui/client/dimension.js');
var ec = require('common:static/ui/eventcenter/eventcenter.js');
function init() {
    var classname = '';
    var type;
    dimension.detect(function (obj) {
        var w = obj.width;
        var h = obj.height;
        // 窄屏临界值
        var small = 1245;
        // 窄屏临界值
        var middle = 1345;
        // console.log([w,h]);
        if (w < small) {
            type = 'w1024';
        }
        else if (w < middle) {
            type = 'w1280';
        }
        else {
            type = 'w1235';
        }
        classname = type;
        var csstxt = document.body.className;
        if (csstxt.indexOf(classname) === -1) {
            if (type === 'w1024') {
                document.documentElement.style.overflowX = 'auto';
            }
            else {
                document.documentElement.style.overflowX = '';
            }
            if (!csstxt) {
                document.body.className = classname;
            }
            else {
				if (/(w\d+)/g.test(csstxt)) {
					document.body.className = csstxt.replace(/(w\d+)/g, classname);
				}
				else {
					document.body.className = csstxt + ' ' + classname;
				}
            }
            ec.trigger('dimension.change', {size: type});
        }
    });
    $(window).trigger('resize');
}
exports.start = init;
