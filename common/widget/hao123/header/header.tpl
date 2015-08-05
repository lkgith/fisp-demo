{%*
  * 站点统一头部
  *
  * 约定
  *   1. 组件在body元素下直接引用
  *   2. 依赖class值html.w1024实现响应式
  *   3. 如需实现特定页面差异化，通过widget参数进行适配
  *   4. 包含普通头部和吸顶头部两种UI，吸顶头部通过#header.hdmini进行适配
  *
  *   @param {boolean} openMini|default:false 开启吸顶头部支持
  *%}

{%function name="header" openMini=true%}
{%*
  *   吸顶导航需求：
  *   频道页及详情页	在logo后显示“点+频道页名”
  *   首页				普通导航+吸顶
  *   实现方案：通过$navCurrent判断当前频道
  *%}
{%* 菜单位置数据预处理 *%}
{%$menulocation = [
	"toplist"   => ["title"=>"排行榜", "className"=>"phb"],
	"movie"   => ["title"=>"电影", "className"=>"dy"],
	"tvplay"  => ["title"=>"电视剧", "className"=>"ds"],
	"tamasha" => ["title"=>"综艺", "className"=>"zy"],
	"cartoon" => ["title"=>"动漫", "className"=>"dm"],
	"edu"     => ["title"=>"教育", "className"=>"jy"],
	"info"    => ["title"=>"新闻", "className"=>"xw"]
]%}
{%foreach $menulocation as $key => $item%}
{%if $key == $navCurrent%}{%$hasSublogo = "hd-sub-logo-`$item.className`"%}{%break%}{%/if%}{%$hasSublogo = 'hd-sub-logo-no'%}
{%/foreach%}

<div id="header" class='{%if $navCurrent!='home'%} hdmini {%/if%}' monkey="header" alog-alias="header"><div class="hd-wrapper"><div class="hd-inner">
	{%widget name="common:widget/hao123/logo/logo.tpl"%}
	<a href="http://v.baidu.com" target="_blank" class="link-support">百度视频</a>
	{%if $openMini%}
	<div class="hd-nav {%$hasSublogo%}">
		{%widget name="common:widget/hao123/navmini/navmini.tpl" page=$navCurrent%}
	</div>
	{%/if%}
	<div class="hd-search">
		{%widget name="common:widget/hao123/searchbox/searchbox.tpl" call="searchbox" isSug=1 openQuickSearch=$openQuickSearch%}
	</div>
	<div class="hd-record">
		{%widget name="common:widget/global/bdv_record/bdv_record.tpl" call="bdv_record" event="mouseover" hao123=true%}
	</div>
</div></div></div>
{%script%}

	require.async('./header.js',function(header){
		header({mark:"{%$navCurrent%}"})
	});

    require('common:widget/global/userbar/userbar.js')('{%$pageTn%}', true);
{%/script%}
{%/function%}
