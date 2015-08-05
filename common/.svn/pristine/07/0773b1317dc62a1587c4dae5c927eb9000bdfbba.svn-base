var tpl = __inline('./searchKeyword.tmpl'),    // 热搜词模板
	dataCache,                                 // 热搜词数据
	queue = $(),                               // 等待渲染热搜词的DOM元素
	loaded = false,                            // 数据是否已加载
	loading = false;                           // 数据请求中

// 请求数据
function _request() {
	if ( loading ) {
		return;
	}
	loading = true;

	// JSONP回调，接口在CMS中作了静态化，函数名固定
	window.videoSearchKeywordMIS = function(result) {
		loaded = true;
		dataCache = result && result[0] && result[0].data && result[0].data.videos;
		if ( dataCache.length && queue.length ) {
			var html = tpl({videos:dataCache});
			queue.each(function(index, item) {
				item.innerHTML = html;
			});
		}
	};

	$.getScript('http://v.baidu.com/staticapi/api_search_keyword.json?v=' + Math.ceil(new Date() / 7200000));
}

// 渲染热搜词模块
// @param {string} id 容器id
exports = module.exports = function(id) {
	var $box = $('#' + id);
	if ( !$box ) {
		return;
	}
	if ( !loaded ) {
		queue = queue.add($box);
		_request();
	} else if ( dataCache && dataCache.length ) {
		$box.html(tpl({videos: dataCache}));
	}
};