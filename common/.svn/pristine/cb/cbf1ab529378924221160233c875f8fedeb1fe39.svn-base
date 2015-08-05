{%*
  * 吸顶头部导航
  *
  * 约定
  *   1. 导航内容与普通头部导航一致，内容不同于普通导航，数据单独维护
  *   2. UI风格固定，禁止在组件外部干预
  *%}

{%* 菜单数据 *%}
{%$menumain = [
	"home"    => ["title"=>"首页", "url"=>"http://v.hao123.com/"],
	"movie"   => ["title"=>"电影", "url"=>"http://v.hao123.com/dianying/"],
	"tvplay"  => ["title"=>"电视剧", "url"=>"http://v.hao123.com/dianshi/"],
	"tamasha" => ["title"=>"综艺", "url"=>"http://v.hao123.com/zongyi/"],
	"shaoer"  => ["title"=>"少儿", "url"=>"http://www.hao123.com/video/shaoer"],
	"cartoon" => ["title"=>"动漫", "url"=>"http://v.hao123.com/dongman/"],
	"edu"     => ["title"=>"教育", "url"=>"http://v.hao123.com/jiaoyu/"],
	"square"  => ["title"=>"短视频", "url"=>"http://v.hao123.com/guangchang/"],
	"info"    => ["title"=>"新闻", "url"=>"http://v.hao123.com/xinwen/"],
	"woman"   => ["title"=>"美女秀场", "isopen"=>1, "url"=>"http://pic.hao123.com/meinv?act=live"],	
	"sports"  => ["title"=>"体育", "url"=>"http://www.hao123.com/live/sports.htm"],
	"live"    => ["title"=>"直播", "url"=>"http://live.hao123.com"],
	"top"     => ["title"=>"排行榜", "url"=>"http://v.hao123.com/top/"],
	"topic"   => ["title"=>"专题", "url"=>"http://topic.hao123.com"],
	"sites"   => ["title"=>"视频名站", "url"=>"http://erji.hao123.com/video"]
]%}
{%$menusub = [
	"duandu"  => ["title"=>"网剧", "iconName"=>"wangju", "url"=>"http://www.hao123.com/video/wangju"],
	"amuse"   => ["title"=>"八卦", "iconName"=>"bagua", "url"=>"http://www.hao123.com/video/bagua"],
	"sublive" => ["title"=>"撸直播", "iconName"=>"luzhibo", "url"=>"http://www.hao123.com/video/lol"],
	"menghome" => ["title"=>"萌主页", "iconName"=>"menghome", "url"=>"http://moe.hao123.com/"]
]%}

<div id="navmini" page="">
	<a href="javascript:void(0)" class="link-toggle">导航<i></i></a>
	<div class="bd" static="bl=float_nav_list">
	    <ul class="main">
			{%foreach $menumain as $key => $item%}
			<li{%if $key == $page%} class="current"{%/if%}>
				<a href="{%$item.url%}"{%if $item.isopen == 1%} target="_blank"{%/if%}>
					{%$item.title%}
				</a>
			</li>
			{%/foreach%}
		</ul>
		<ul class="sub">
			{%foreach $menusub as $key => $item%}
			<li{%if $item@last%} class="last"{%/if%}>
				<a href="{%$item.url%}"{%if $item.isopen == 1%} target="_blank"{%/if%}{%if isset($item.iconName) && $item.iconName%} class="{%$item.iconName%}"{%/if%}>{%$item.title%}</a>
			</li>
			{%/foreach%}
		</ul>
	</div>
</div>
{%*
  *   宽版展现快速长视频作品频道链接，窄版不显示
  *   作品一级页	当前页添加被选中状态
  *%}
{%$crumbsMenu = [
	"movie"   => ["title"=>"电影", "url"=>"http://v.hao123.com/dianying/"],
	"tvplay"  => ["title"=>"电视剧", "url"=>"http://v.hao123.com/dianshi/"],
	"tamasha" => ["title"=>"综艺", "url"=>"http://v.hao123.com/zongyi/"],
	"cartoon" => ["title"=>"动漫", "url"=>"http://v.hao123.com/dongman/"]
]%}
<div id="nav-quick-links">
	<ul>	
	{%foreach $crumbsMenu as $key => $item%}
		<li{%if isset($pageTn) && ereg("(^(movie|tvplay|cartoon|tamasha)_hao123)",$pageTn) && ($key == $page)%} class="current"{%/if%}><a href="{%$item.url%}">{%$item.title%}</a></li>
	{%/foreach%}
	</ul>
</div>
{%*
  *   详情页	“点+频道页名”处频道名可点击加链接
  *%}
{%$typeMap = [
                "movie" => "dianying",
                "tvplay" => "dianshi",
                "tamasha" => "zongyi",
                "cartoon" => "dongman"
            ]%}
{%$urlMask = $typeMap[$navCurrent]%}
<div class="hd-sub-logo">
{%if isset($pageTn) && ereg("(^(movie|tvplay|cartoon|tamasha)_detail_hao123)",$pageTn)%}
	<a href="http://v.hao123.com/{%$urlMask%}/"></a>
{%/if%}
</div>
{%script%}
	require('./navmini.js')();
{%/script%}