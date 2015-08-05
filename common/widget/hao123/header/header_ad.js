// jQuery插件，轮播图
require('common:static/ui/carousel/carousel.js');

// 广告位逻辑
function ad() {
	// 广告位模板
	var tplFocus = __inline('./focus.tmpl'),
		tplLinks = __inline('./news.tmpl');

	// JSONP回调，接口在CMS中作了静态化，函数名固定
	window.hao123AdvHeaderMIS = function(data) {
		if ( data ) {
			var $header = $('#header'),
				focus = data.imgs,
				news = data.links;

			if ( focus ) {
				$header.append(tplFocus({data:focus}));
				if ( focus.length > 1 ) {
					$header.find('.hd-focus').bdvCarousel({
						containerWidth: 110,
						containerHeight: 51,
						animate: 'slide2dHorizontal',
						interval: 3000,
						originalIndex: 0
					});
				}
			}
			if ( news ) {
				$header.append(tplLinks({data:news}));
				if ( news.length > 1 ) {
					$header.find('.hd-news .bd').bdvCarousel({
						containerWidth: 278,
						containerHeight: 20,
						animate: 'slide2dVertical',
						interval: 3000,
						originalIndex: 0
					});
				}
			}
		}
	};

	$.getScript('http://list.video.baidu.com/api_hao123AdvHeader.js?v=' + Math.ceil(new Date() / 7200000));
}

exports = module.exports = function() {
	$(function() {
		ad();
	});
};