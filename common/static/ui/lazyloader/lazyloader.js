// 工具组件
var ec = require('common:static/ui/eventcenter/eventcenter.js'),
	scrolling = require('common:static/ui/scrolling/scrolling.js');

$(function(){
	var imgs = $('img[data-src]'),
		isAddedEvent = true;

	// 计算需要加载图片的页面高度
	function getLoadOffset() {
		return $(window).scrollTop() + $(window).height() + 200;
	}

	// 延迟加载
	function loadNeeded() {
		var viewOffset = getLoadOffset(),
			imgSrc,
			target,
			finished = true;
		for (var i = 0, len = imgs.length; i < len; i++) {
			target = imgs[i];
			imgSrc = target.getAttribute('data-src');
			imgSrc && ( finished = false );
			if (imgSrc && $(target).offset().top < viewOffset) {
				target.src = imgSrc;
				target.removeAttribute('data-src');
			}
		}
		if (finished) {
			scrolling.remove(window, loadNeeded);
			isAddedEvent = false;
		}
	}

	scrolling(window, loadNeeded);
	loadNeeded();

    // 手动触发检查
	ec.attach('lazyLoad.check', function () {
		imgs = $('img[data-src]');
		if (!isAddedEvent) {
			isAddedEvent = true;
			scrolling(window, loadNeeded);
		}
		loadNeeded();
	})
});
