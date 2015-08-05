{%*
  * 带标签搜索框
  *
  * 约定
  *   1. 组件包含普通头部UI和吸顶头部两种UI，吸顶头部UI通过.hdmini适配
  *   2. 搜索框引用searchbox组件
  *   3. 标签query拖带依赖searchbox搜索框id值bdvSearchInput
  *   4. 如需实现UI差异化，内组件内实现后通过widget参数进行适配实现
  *%}

{%function name="tabsearch" openQuickSearch=false%}
<div id="tabsearch">
	<div class="tabs">
		<a href="http://news.baidu.com/" data-product="news">新闻</a><a href="http://www.baidu.com/" data-product="ps">网页</a><a href="http://tieba.baidu.com/" data-product="tieba">贴吧</a><a href="http://zhidao.baidu.com/" data-product="zhidao">知道</a><a href="http://music.baidu.com/" data-product="music">音乐</a><a href="http://image.baidu.com/" data-product="image">图片</a><strong>视频</strong><a href="http://map.baidu.com/" data-product="map">地图</a><a href="http://baike.baidu.com/" data-product="baike">百科</a><a href="http://www.hao123.com/" target="_blank">hao123</a>
	</div>
	<div class="bd">
		{%widget name="common:widget/video/searchbox/searchbox.tpl" call="searchbox" isSug=1 id="bdvSearch" openQuickSearch=$openQuickSearch%}
	</div>
</div>
{%script%}
	require('./tabsearch.js')();
{%/script%}
{%/function%}