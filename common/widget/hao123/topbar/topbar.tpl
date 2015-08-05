{%*
  * 顶部菜单栏
  *
  * 约定
  *   1. 组件在body元素下直接引用
  *   2. 依赖class值html.w1024实现响应式
  *   3. 如需实现特定页面差异化，通过widget参数进行适配
  *%}

{%function name="topbar"%}

{%* 导航菜单数据 *%}
{%$menumain = [
	["url" => "http://www.hao123.com/", "title" => "hao123首页"]
]%}
{%$menusub = [
	[
		"title" => "娱乐休闲",
		"links" => [
			["url" => "http://video.hao123.com/dianying/", "title" => "电影"],
			["url" => "http://v.hao123.com/tv/", "title" => "电视剧", "ishigh" => 1],
			["url" => "http://dongman.hao123.com/", "title" => "动漫"],
			["url" => "http://video.hao123.com/zongyi/", "title" => "综艺"],
			["url" => "http://live.hao123.com", "title" => "直播", "ishigh" => 1],
			["url" => "http://www.hao123.com/video", "title" => "视频"],
			["url" => "http://xyx.hao123.com/", "title" => "小游戏", "ishigh" => 1],
			["url" => "http://wyyx.hao123.com/", "title" => "页游"],
			["url" => "http://game.hao123.com/wangyou/", "title" => "网游"],
			["url" => "http://www.hao123.com/sport", "title" => "体育"],
			["url" => "http://www.hao123.com/nba", "title" => "NBA"],
			["url" => "http://news.hao123.com/soccer", "title" => "足球"],
			["url" => "http://www.hao123.com/xingzuonew.html", "title" => "星座"],
			["url" => "http://www.hao123.com/love", "title" => "交友"],
			["url" => "http://www.hao123.com/star", "title" => "明星"],
			["url" => "http://pic.hao123.com/", "title" => "图片"],
			["url" => "http://music.hao123.com/", "title" => "音乐"]
		]
	],
	[
		"title" => "生活服务",
		"links" => [
			["url" => "http://tuan.baidu.com/", "title" => "团购", "ishigh" => 1],
			["url" => "http://www.hao123.com/bank", "title" => "银行 "],
			["url" => "http://www.hao123.com/junshi", "title" => "军事", "ishigh" => 1],
			["url" => "http://www.hao123.com/fangchan", "title" => "房产 "],
			["url" => "http://www.hao123.com/stocknew.htm", "title" => "股票 "],
			["url" => "http://www.hao123.com/stock", "title" => "基金 "],
			["url" => "http://www.hao123.com/tianqi", "title" => "天气 ", "ishigh" => 1],
			["url" => "http://www.hao123.com/menu", "title" => "菜谱 ", "ishigh" => 1],
			["url" => "http://www.hao123.com/auto", "title" => "汽车"],
			["url" => "http://www.hao123.com/map", "title" => "地图"],
			["url" => "http://www.hao123.com/zhaopin", "title" => "招聘 "],
			["url" => "http://www.hao123.com/child", "title" => "儿童", "ishigh" => 1],
			["url" => "http://www.hao123.com/muying", "title" => "母婴 "],
			["url" => "http://www.hao123.com/health", "title" => "健康 "],
			["url" => "http://www.hao123.com/edu", "title" => "大学 "],
			["url" => "http://www.hao123.com/mobile", "title" => "手机"],
			["url" => "http://lady.hao123.com/", "title" => "女性"],
			["url" => "http://lvyou.hao123.com/", "title" => "旅游"],
			["url" => "http://gouwu.hao123.com/", "title" => "购物"]
		]
	],
	[
		"title" => "其他网站",
		"links" => [
			["url" => "http://life.hao123.com/soft.html", "title" => "软件", "ishigh" => 1],
			["url" => "http://www.hao123.com/mail", "title" => "邮箱 "],
			["url" => "http://www.hao123.com/weibo", "title" => "微博 "],
			["url" => "http://www.hao123.com/xiaoqingxin", "title" => "小清新 ", "ishigh" => 1],
			["url" => "http://www.hao123.com/chongwu", "title" => "宠物"],
			["url" => "http://www.hao123.com/harcksafe", "title" => "杀毒 "],
			["url" => "http://www.hao123.com/sheji", "title" => "设计 "],
			["url" => "http://www.hao123.com/hardware", "title" => "电脑"],
			["url" => "http://www.hao123.com/desktop", "title" => "桌面 "],
			["url" => "http://www.hao123.com/zhiye", "title" => "行业 "],
			["url" => "http://www.hao123.com/sheying", "title" => "摄影"],
			["url" => "http://www.hao123.com/campuseng", "title" => "英语"],
			["url" => "http://www.hao123.com/exam", "title" => "考试"],
			["url" => "http://www.hao123.com/liuxue", "title" => "留学"],
			["url" => "http://www.hao123.com/eduhtm_qyqx", "title" => "学习"],
			["url" => "http://www.hao123.com/gongyi", "title" => "公益"]
		]
	]
]%}

<div id="topbar" alog-alias="topbar" static="bl=topbar" monkey="topbar" class='{%if $navCurrent!='home'%} hdmini {%/if%}'>
	<div class="inner">
		<div class="menumain">
			{%foreach $menumain as $item%}
			<a href="{%$item.url%}" target="_blank"{%if $item@first%} class="first"{%/if%}>{%$item.title%}</a>
			{%/foreach%}
		</div>
		<div class="menusub">
			<span class="label">网站地图<i></i></span>
			<div class="bd">
				{%foreach $menusub as $menu%}
				<div class="area {%if $menu@iteration % 2 == 1%}area-odd{%else%}area-even{%/if%}">
					<h3>{%$menu.title%}</h3>
					{%foreach $menu.links as $item%}
					<a href="{%$item.url%}" target="_blank"{%if isset($item.ishigh)%} class="high"{%/if%}>{%$item.title%}</a>
					{%/foreach%}
				</div>
				{%/foreach%}
			</div>
		</div>
		<div class="quicklinks">
			<a href="http://www.hao123.com/redian/sheshouyef.htm" target="_blank" id="sethome" title="把hao123设为主页"></a><a href="http://feedback.hao123.com/?catalog_id=8" class="feedback" target="_blank" title="反馈"></a><a href="http://www.hao123.com/shouji" class="mobile" target="_blank" title="手机版"></a><a href="http://update.123juzi.net/dl.php?edition=hao123_juzi_canal&amp;cid=h8" target="_blank" class="high browse">浏览器</a>
		</div>
	</div>
</div>
{%script%}
	require('./topbar.js')();
{%/script%}
{%/function%}