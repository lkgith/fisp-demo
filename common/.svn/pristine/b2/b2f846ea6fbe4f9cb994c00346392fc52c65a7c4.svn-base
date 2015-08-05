<script>
(function () {

// Phone端、iPad端各页面url规则
var urlRules = {
	iphone: {
		home    : 'http://m.video.baidu.com/',
		channel : 'http://m.video.baidu.com/?src=video#{{type}}',
		detail  : 'http://m.video.baidu.com/?src=video#detail/{{type}}/{{id}}',
		search  : 'http://m.video.baidu.com/?src=video#search/{{query}}'
	},
	ipad: {
		home    : 'http://v.baidu.com/ipadwebapp/browse/browse.html',
		channel : 'http://v.baidu.com/ipadwebapp/browse/browse.html#{{type}}',
		detail  : 'http://v.baidu.com/ipadwebapp/browse/browse.html#detail/{{type}}/{{id}}',
		search  : 'http://v.baidu.com/ipadwebapp/browse/browse.html#search/{{query}}'
	}
};
urlRules.android = urlRules.iphone;

// url适配
var adapter = [
	// 首页
	{
		reg: /^\/$/i,
		get: function (o) {
			return urlRules[o.ua].home;
		}
	},

	// 频道页
	{
		reg: /^\/(tv|movie|show|comic|live)\/*$/i,
		map: {
			tv: 'tvplay',
			show: 'tvshow'
		},
		get: function (o) {
			return urlRules[o.ua].channel.replace('{{type}}', this.map[o.match[1]] || o.match[1]);
		}
	},

	// 详情页
	{
		reg: /^\/(movie|tv|show|comic)\/(\d+)\.htm$/i,
		map: {
			tv: 'tvplay',
			show: 'tvshow'
		},
		get: function (o) {
			return urlRules[o.ua].detail.replace('{{type}}', this.map[o.match[1]] || o.match[1]).replace('{{id}}', o.match[2]);
		}
	},

	// 检索页
	{
		reg: /^\/v$/i,
		get: function (o) {
			var search = o.search.split('&'),
				params = {};
			for (var i = 0, len = search.length, item; i < len; i++) {
				item = search[i].split('=');
				if (item[0] && item[1]) {
					params[item[0]] = item[1]
				}
			}
			return urlRules[o.ua].search.replace('{{query}}', params.word || '');
		}
	}
];

// 页面作无线端适配
var ua = navigator.userAgent.match(/(iphone|android|ipad)/i);

// 是否强制命中pc
var isPcview = !!~location.search.indexOf('pcview=1');

if (ua && !isPcview) {
	var path = location.pathname,
		url, match;
	for (var i = 0, len = adapter.length; i < len; i++) {
		if (match = path.match(adapter[i].reg)) {
			url = adapter[i].get({
				match: match,
				search: location.search.slice(1),
				ua: ua[1].toLowerCase()
			});
			break;
		}
	}
	url && location.replace(url);
}
}());
</script>