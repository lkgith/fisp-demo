// 组件工具
var scrolling = require('common:static/ui/scrolling/scrolling.js'),
	client = require('common:static/ui/client/client.js');

// 吸顶头部逻辑
exports = module.exports = function(option) {	
	$(function() {	
		if ( client.browser.ie === 'ie6' ) {
			return;
		}

		var $window = $(window),
			$header = $('#header'),
			$userbar = $('#topbar'),
			$navNormal = $('#nav'),
			$miniBox = $header.find('.hd-inner'),
			threshold = 180, // 出现吸顶头部的滚动阀值
			state = false;   // 显示隐藏状态

		// 显示吸顶头部
		function showMiniHd() {
			$header.addClass('hdmini');
			$userbar.addClass('hdmini');
			$navNormal.addClass('hdmini');
			$miniBox.stop().hide().fadeIn();
			state = true;
		}

		// 隐藏吸顶头部
		function hideMiniHd() {
			$miniBox.stop().show();
			$header.removeClass('hdmini');
			$userbar.removeClass('hdmini');
			$navNormal.removeClass('hdmini');
			state = false;
		}
		// 改版后的hao123导航需求：只有首页有普通+吸顶两种状态的切换，其他均只有吸顶状态
		if (option.mark =="home") {
			// 处理普通和吸顶导航的切换
			$(function() {
				scrolling(window, function() {
					var top = $window.scrollTop();
					if ( top > threshold) {
						!state && showMiniHd();
					} else {
						state && hideMiniHd();
					}
				});
				if ( $window.scrollTop() > threshold ) {
					!state && showMiniHd();
				}
			});			
		}else {
			// 只有吸顶状态
			!state && showMiniHd();			
		}		
	});
};
