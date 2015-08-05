{%*
  * 站点统一导航
  *
  * 约定
  *   1. 组件在body元素下直接引用
  *   2. 依赖class值html.w1024实现响应式
  *   3. 如需实现特定页面差异化，通过widget参数进行适配
  *
  * @param {string} page 页面名，用于标识当前菜单
  *%}

{%function name="nav" page=""%}

{%* 菜单数据 *%}
{%$menumain = [
	"home"    => ["title"=>"首页", "url"=>"http://v.hao123.com/"],
	"tvplay"  => ["title"=>"电视剧", "url"=>"http://v.hao123.com/dianshi/"],
	"movie"   => ["title"=>"电影", "url"=>"http://v.hao123.com/dianying/"],
	"tamasha" => ["title"=>"综艺", "url"=>"http://v.hao123.com/zongyi/"],
	"cartoon" => ["title"=>"动漫", "url"=>"http://v.hao123.com/dongman/"],
	"duandu"  => ["title"=>"网剧", "url"=>"http://www.hao123.com/video/wangju"],
	"amuse"   => ["title"=>"八卦", "url"=>"http://www.hao123.com/video/bagua"],
	"edu"     => ["title"=>"教育", "url"=>"http://v.hao123.com/jiaoyu/"],
	"live"    => ["title"=>"直播", "url"=>"http://live.hao123.com"]
]%}
{%$menusub = [
	"herounion"   => ["title"=>"英雄联盟", "hasIcon"=>1, "url"=>"http://www.hao123.com/video/lol"],
	"topic"       => ["title"=>"专题", "url"=>"http://topic.hao123.com"],
	"top"         => ["title"=>"排行榜", "url"=>"http://v.hao123.com/top/"],
	"square"      => ["title"=>"短视频", "url"=>"http://v.hao123.com/guangchang/"],	
	"info"        => ["title"=>"新闻", "url"=>"http://v.hao123.com/xinwen/"],	
	"woman"       => ["title"=>"美女", "isopen"=>1, "url"=>"http://www.69xiu.com/extension/speadRoom?jxiusr=baidu_web_m6"],	
	"sports"      => ["title"=>"体育赛事", "url"=>"http://www.hao123.com/live/sports.htm"],
	"sites"       => ["title"=>"视频名站", "url"=>"http://erji.hao123.com/video"]
]%}

<div id="nav" monkey="nav" alog-alias="nav" static="bl=nav" class='{%if $navCurrent!='home'%} hdmini {%/if%}'>
	<div class="nav-inner">
		<ul class="main">
			{%foreach $menumain as $key => $item%}
			<li{%if $key == $page%} class="current"{%/if%}>
				<a href="{%$item.url%}">
					{%$item.title%}
				</a>
			</li>
			{%/foreach%}
		</ul>
		<ul class="sub">
			{%foreach $menusub as $key => $item%}
			<li{%if isset($item.isnew) && $item.isnew%} class="new"{%/if%}{%if isset($item.hasIcon) && $item.hasIcon%} class="herounion"{%/if%}>			
				{%if isset($item.hasIcon) && $item.hasIcon%}
				<img src="http://vs3.bdstatic.com/pc_static/icons/herounion.png" />
				{%/if%}
				<a href="{%$item.url%}"{%if $item.isopen == 1%} target="_blank"{%/if%}>{%$item.title%}</a>
				{%if isset($item.isnew) && $item.isnew%}
				<img src="http://vs3.bdstatic.com/pc_static/icons/new3.png" />
				{%/if%}
			</li>
			{%/foreach%}
		</ul>
	</div>
</div>
{%/function%}