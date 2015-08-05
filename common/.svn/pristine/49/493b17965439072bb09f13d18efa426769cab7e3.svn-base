{%function name="navGuider" current="" isBaidu=1 isLocation=0 locationTitle=""%}
<div id="navBlack" alog-alias="navbarWrapper">
<div  class="navGuider" static="s={%$pageS%}&bl=nav" monkey="nav">
    <div class="nav_main">
        <ul id="navMainMenu">
            <li class="logo"><a href="http://v.baidu.com/">百度视频</a></li>
			{%if $isLocation==1%}
				<li class="city_name">{%$locationTitle%}</li>
			{%/if%}
			{%if $isLocation==0%}
            <li class="first"><a href="http://v.baidu.com/"{%if $current=='index'%} class="current"{%/if%}><span>首页</span></a></li>
            <li><a href="http://v.baidu.com/movie"{%if $current=='movie'%} class="current"{%/if%}><span>电影</span></a></li>
            <li><a href="http://v.baidu.com/tv"{%if $current=='tvplay'%} class="current"{%/if%}><span>电视剧</span></a></li>
            <li><a href="http://v.baidu.com/show"{%if $current=='tamasha'%} class="current"{%/if%}><span>综艺</span></a></li>
            <li><a href="http://v.baidu.com/comic"{%if $current=='cartoon'%} class="current"{%/if%}><span>动漫</span></a></li>          
            <li><a href="http://v.baidu.com/gameindex/"{%if $current=='game'%} class="current"{%/if%}><span>游戏</span></a></li>
			<li><a href="http://v.baidu.com/square/"{%if $current=='square'%} class="current"{%/if%}><span>随心看</span></a></li>
            <li class="btn_more">
                <a id="btn_more" href="#" onclick="return false"><span>更多<i></i></span></a>
                <ul id="box_more">
					<li><a href="http://v.baidu.com/infoindex/"><span>资讯</span></a></li>
                    <li><a href="http://v.baidu.com/entindex/"><span>娱乐</span></a></li>
					<li><a href="http://v.baidu.com/sportindex/"><span>体育</span></a></li>
					<li><a href="http://v.baidu.com/eduindex/"><span>教育</span></a></li>
					<li><a href="http://v.baidu.com/musicindex/"><span>音乐</span></a></li>
                    <li><a href="http://v.baidu.com/amuseindex/"><span>搞笑</span></a></li>
                    <li><a href="http://v.baidu.com/fashion/index"><span>时尚</span></a></li>
                    <li><a href="http://v.baidu.com/child/index"><span>亲子</span></a></li>
					<li><a href="http://v.baidu.com/digi.html"><span>科技</span></a></li>
                    <li><a href="http://v.baidu.com/top/"><span>排行榜</span></a></li>
                    <!--li><a href="http://v.baidu.com/fuli/"><span>福利</span></a></li-->
                </ul>
            </li>
			{%/if%}
        </ul>
    </div>
    <div class="r record_see">
        {%widget name="common:widget/video/bdv_trace/bdv_trace.tpl" call="bdv_trace"%}
        {%widget name="common:widget/global/bdv_record/bdv_record.tpl" call="bdv_record" isWithBdvTrace=true%}
    </div>
    <div class="r user_info">
        {%widget name="common:widget/video/userinfo/userinfo.tpl" call="userinfo"%}
    </div>
    <div class="r search_sug">
        {%widget name="common:widget/video/searchbox/searchbox.tpl" call="searchbox" isSug=1 id="bdvSearch" style="mini"%}
    </div>
</div>

</div>
{%script type="text/javascript"%}
    {%if $isLocation==0%}
	require('./navGuider.js');
    {%/if%}

    require('common:widget/video/userbar/userbar.js')('{%$pageTn%}', true);
{%/script%}
{%/function%}
