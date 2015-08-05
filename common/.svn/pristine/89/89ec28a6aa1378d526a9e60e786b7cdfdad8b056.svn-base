// 组件工具
var scrolling = require('common:static/ui/scrolling/scrolling.js'),
	client = require('common:static/ui/client/client.js');

// 吸顶头部逻辑
exports = module.exports = function() {
	$(function() {
		if ( client.browser.ie === 'ie6' ) {
			return;
		}

		var $window = $(window),
			$header = $('#header'),
			$miniBox = $header.find('.hd-inner'),
			threshold = 180, // 出现吸顶头部的滚动阀值
			state = false;   // 显示隐藏状态

		// 显示吸顶头部
		function showMiniHd() {
			$header.addClass('hdmini');
			$miniBox.stop().hide().fadeIn();
			state = true;
		}

		// 隐藏吸顶头部
		function hideMiniHd() {
			$miniBox.stop().show();
			$header.removeClass('hdmini');
			state = false;
		}

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
	});
};
