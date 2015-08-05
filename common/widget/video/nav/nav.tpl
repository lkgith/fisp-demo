{%*
  * 站点统一导航
  *
  * 约定
  *   1. 主导航固定菜单项写在模板中，其他菜单项由编辑在MIS中维护
  *   2. 模板中取不到MIS区块的页面通过异步接口取数据
  *   3. 组件在body元素下直接引用，禁止在外部进行干预
  *   4. 如需实现特定页面差异化，通过widget参数进行适配
  *   5. 依赖class值html.w1024实现响应式
  *%}

{%function name="nav" wrapWidth=""%}
{%*
  * 菜单数据，字段名与MIS区块字段保持一致
  * title 标题，s_intro 页面id，url 链接，episode 新窗口打开，hot_day 标icon 1 new 2 hot
  *%}
{%$dataMenu = [
	"main" => [
		[ "title" => "首页", "s_intro" => "indsa", "url" => "http://v.baidu.com/"],
		[ "title" => "电视剧", "s_intro" => "tvplay", "url" => "http://v.baidu.com/tv"],
		[ "title" => "电影", "s_intro" => "movie", "url" => "http://v.baidu.com/movie"],
		[ "title" => "综艺", "s_intro" => "tamasha", "url" => "http://v.baidu.com/show"],
		[ "title" => "动漫", "s_intro" => "cartoon", "url" => "http://v.baidu.com/comic"],
		[ "title" => "娱乐", "s_intro" => "amuse", "url" => "http://v.baidu.com/entindex/"],
		[ "title" => "资讯", "s_intro" => "info", "url" => "http://v.baidu.com/infoindex/"],
		[ "title" => "体育", "s_intro" => "sport", "url" => "http://v.baidu.com/sportindex/"],
		[ "title" => "游戏", "s_intro" => "game", "url" => "http://v.baidu.com/gameindex/"],
		[ "title" => "教育", "s_intro" => "edu", "url" => "http://v.baidu.com/eduindex/"]
	],
	"sub" => []
]%}

{%* 合并MIS数据 *%}
{%if isset($navdata)%}
	{%if isset($navdata.common_nav_left.videos) && $navdata.common_nav_left.videos%}
		{%$dataMenu.main = array_merge($dataMenu.main, $navdata.common_nav_left.videos)%}
	{%/if%}
	{%if isset($navdata.common_nav_right) && $navdata.common_nav_right.videos%}
		{%$dataMenu.sub = $navdata.common_nav_right.videos%}
	{%/if%}
	{%$isMISData = true%}
{%else%}
	{%$isMISData = false%}
{%/if%}

<div id="nav" monkey="nav" alog-alias="nav" static="bl=nav_list"><div class="nav-inner {%$wrapWidth%}">
	{%foreach $dataMenu as $key => $menu%}
	<ul class="menu-{%$key%}">
		{%foreach $menu as $item%}
		<li{%if !empty($pageTn) && $item.s_intro == $pageTn%} class="current"{%/if%}>
			<a href="{%$item.url%}"{%if isset($item.update) && $item.update == 1%} target="_blank"{%/if%}>
				{%$item.title%}
				{%if $item.hot_day > 0%}
					<img src="{%$item.imgh_url%}" style="bottom:{%$item.duration|default:30%}px;left:{%$item.rating|default:3%}px" />
				{%/if%}
			</a>
		</li>
		{%/foreach%}
	</ul>
	{%/foreach%}
</div></div>
{%if !$isMISData%}
{%script%}
	require('./nav.js')('{%$pageTn%}');
{%/script%}
{%/if%}
{%/function%}
