var tpl = __inline('./nav.tmpl'),
	onlineAPI = 'http://v.baidu.com/staticapi/api_mis_nav_utf8.json',
	testAPI = '/api_mis_nav.json';

// 从videoapi接口获取数据填充导航菜单
// @param {string} pageTn 页面tn值，用于模板逻辑
exports = module.exports = function(pageTn) {
	// JSONP回调，接口在CMS中作了静态化，函数名固定
	window.cbMISNav = function(result) {
		var map = {
			common_nav_left: '#nav .menu-main',
			common_nav_right: '#nav .menu-sub'
		};

		for ( var i = 0, len = result.length, item; i < len; i++ ) {
			item = result[i];
			if ( map[item.name] && item.data && item.data.videos ) {
				$(map[item.name]).append(tpl({
					pageTn: pageTn,
					menu: item.data.videos
				}));
			}
		}
	};

	$.getScript(onlineAPI + '?v=' + Math.ceil(new Date() / 7200000));
};