{%*
  * 站点统一头部
  *
  * 约定
  *   1. 组件在body元素下直接引用
  *   2. 包含普通头部和吸顶头部两种UI，吸顶头部通过#header.hdmini进行适配
  *   3. 内部组件吸顶样式在各组件内适配
  *   4. 依赖class值html.w1024实现响应式
  *   5. 如需实现特定页面差异化，通过widget参数进行适配
  *
  * @param {boolean} openMini|default:false 开启吸顶头部支持
  * @param {boolean} openQuickSearch|default:false 开启极速搜索
  *%}

{%function name="header" openMini=false wrapWidth="" openQuickSearch=false%}
<div id="header" monkey="header" alog-alias="header"><div class="hd-inner">
	<div class="hd-inner2 {%$wrapWidth%}">
	{%widget name="common:widget/video/userbar/userbar.tpl"%}
	{%widget name="common:widget/video/logo/logo.tpl"%}
	{%if $openMini%}
	<div class="hd-nav">
		{%widget name="common:widget/video/navmini/navmini.tpl"%}
	</div>
	{%/if%}
	{%widget name="common:widget/video/tabsearch/tabsearch.tpl" call="tabsearch" openQuickSearch=$openQuickSearch%}
	<div class="hd-trace">
		{%widget name="common:widget/video/bdv_trace/bdv_trace.tpl" call="bdv_trace"%}
	</div>
	<div class="hd-record">
		{%widget name="common:widget/global/bdv_record/bdv_record.tpl" call="bdv_record" isWithBdvTrace=true%}
	</div>
    <div class="hd-paopao">
        {%widget name="common:widget/video/pop/pop.tpl" call="bdv_pop"%}
    </div>
	<div class="hd-keyword">
		{%widget name="common:widget/video/searchKeyword/searchKeyword.tpl" call="searchKeyword" id="searchKeyword"%}
	</div>
	{%if !isset($hideShoulder) || !$hideShoulder%}
		{%widget name="common:widget/video/adv/adv.tpl" adname="index_right_top"%}
	{%/if%}
</div></div></div>
{%script%}
	require('./header.js')();
{%/script%}
{%/function%}
