{%*回到顶部*%}
<div id="back-to-top" class="back-to-top{%if isset($className)%} {%$className%}{%/if%}" alog-alias="backTop">
    <ul class="bt-list">
        <li class="bt-top"><a href="#" id="back-to-top-btn" class="bt-btn-top" title="回到顶部"></a></li>
        <li class="bt-bottom">
            <a target="_blank" href="{%if isset($hao123) && $hao123%}http://feedback.hao123.com/?catalog_id=8{%else%}http://qingting.baidu.com/index?pid=4{%/if%}"  class="bt-btn-feedback" id="showFeed">反馈</a>
        </li>
    </ul>
</div>
{%if isset($hao123) && $hao123%}
	{%script%}
		require("./backTop.js")({
			feedback: false
		});
	{%/script%}
{%else%}
	{%*广告配置*%}
	{%if !isset($hideXF) || !$hideXF%}
	{%widget name="common:widget/video/adv/adv.tpl" adname="index_right_float"%}
	{%/if%}
	{%script%}
		require("./backTop.js")();
	{%/script%}
{%/if%}