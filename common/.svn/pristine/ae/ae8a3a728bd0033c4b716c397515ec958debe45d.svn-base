{%function name="bdv_trace" id="bdvTrace" carousel=false%}
{%if !isset($pageTn) || !$pageTn%}{%$pageTn="none"%}{%/if%}
<div id="{%$id%}" class="bdv-trace" static="tn={%$pageTn%}&bl={%$id%}">
    {%*
    <div id="{%$id%}Tip" class="bdv-trace-icons bdv-trace-tip">
        <div class="bdv-trace-tip-bg"></div>
        <!--&nbsp;&nbsp;追剧新功能上线啦！-->
        <a href="javascript:;" class="bdv-trace-tip-no-more" title="不再提示" data-static>不再提示</a>
        <a href="javascript:;" class="bdv-trace-tip-close" title="关闭" data-static><!--&times;--></a>
    </div>
    *%}
    <a href="javascript:;" class="bdv-trace-toggle" title="追剧" static="stp=toggle&toggle=1">追剧<i></i></a>
    <span class="bdv-trace-icons bdv-trace-notify"></span>
    <div class="bdv-trace-main" style="display: none">
        {%*<a href="javascript:;" class="bdv-trace-close" title="关闭" static="stp=close">&times;</a>*%}
        <div class="bdv-trace-arrow"><em>◆</em><i>◆</i></div>
        <div class="bdv-trace-content bdv-trace-none">
            <p> 订阅精彩视频，请<a href="javascript:;" class="bdv-trace-login" title="登录" static="stp=login">登录</a></p>
        </div>
    </div>
</div>

<script type="text/html" id="{%$id%}NoneTpl">
<p>您最近没有任何订阅</p>
<a href="/tv" target="_blank" title="去电视剧频道随便看看" static="stp=toTv">去电视剧频道随便看看&gt;&gt;</a>
</script>

<script type="text/html" id="{%$id%}BdTpl">
<div class="bdv-trace-bd"></div>
<div class="bdv-trace-ft clearfix">
    <a href="javascript:;" class="bdv-trace-pager bdv-trace-pager-left" data-page="prev" title="上一页" static="stp=prev">&lt;上一页</a>
    <span class="bdv-trace-pager-no"></span>
    <a href="javascript:;" class="bdv-trace-pager bdv-trace-pager-right" data-page="next" title="下一页" static="stp=next">下一页&gt;</a>
</div>
</script>

<script type="text/html" id="{%$id%}ItemTpl">
<% var suffix = frp ? '?frp=' + frp : '';
for (var i = 0, item; item = pageData[i]; i += 1) {
    item.cur_episode *= 1;
    item.max_episode *= 1;
    var introUrl = ['/', item.works_type, '/', item.works_id, '.htm', suffix].join(''),
        itemTitle = item.title + (item.season > 0 ? (' 第' + item.season + '季') : '');
%>
<dl class="bdv-trace-item">
    <% if (item.works_type !== 'show') { %>
    <dt>
        <h3><a href="<%=introUrl%>" title="<%=itemTitle%>" target="_blank" static="stp=ti&to=search"><%=itemTitle%></a></h3>
        <span class="bdv-trace-item-update">&nbsp;
        <% if (item.cur_episode > 0 && (item.max_episode == 0 || item.cur_episode < item.max_episode)) { %>
            更新至<b><%=item.cur_episode%></b>集
            <% if (item.max_episode > 0) { %>&nbsp;|&nbsp;<% } %>
        <% } %>
        <% if (item.max_episode > 0) { %>全<%=item.max_episode%>集<% } %>
        </span>
    </dt>
    <dd class="bdv-trace-item-episodes">
        <ol data-id="<%=item.works_id%>" data-type="<%=item.works_type%>">
        <% for (var epIndex = 0, len = item.episodes.length; epIndex < len && epIndex < 5; epIndex += 1) {
            var ep = item.episodes[epIndex];
        %>
            <li>
            <% if (len === 1 && item.last_view == ep.episode) { %>
                <div class="bdv-trace-item-episode-latest">已看到最新集</div>
            </li>
            <% break; %>
            <% } %>
            <% if (epIndex === 3 && (ep.episode * 1 - item.episodes[epIndex - 1].episode * 1 !== 1)) { %>
                <div class="bdv-trace-item-episode-holder">...</div>
            </li>
            <li>
            <% } %>
            <% if (item.last_view == ep.episode) { %>
                <i class="bdv-trace-icons bdv-trace-record"></i>
            <% } %>
            <% if (ep.is_new == 1 && item.last_view != ep.episode) { %>
                <i class="bdv-trace-icons bdv-trace-new"></i>
            <% } %>
            <% if (ep.is_play == 1) { %>
                <a href="<%=func.getPlayUrl(item, ep)%>" target="_blank" title="<%=ep.title%>"
                 static="stp=jp&to=play" data-ep="<%=ep.episode%>" data-new="<%=ep.is_new%>"
                ><%=ep.episode%></a>
            <% } else { %>
                <a href="javascript:;" title="暂无资源">暂无</a>
            <% } %>
            </li>
        <% } %>
        </ol>
    </dd>
    <% } else { %>
    <dt>
        <h3><a href="<%=introUrl%>" title="<%=itemTitle%>" target="_blank" static="stp=ti&to=search"><%=itemTitle%></a></h3>
        <% if (item.max_episode > 0) { %>
        <span class="bdv-trace-item-update">&nbsp;更新至<b><%=item.max_episode%></b>期</span>
        <% } %>
    </dt>
    <dd class="bdv-trace-item-episodes bdv-trace-item-episodes-show">
        <ol data-id="<%=item.works_id%>" data-type="<%=item.works_type%>">
        <% for (var epIndex = 0, len = item.episodes.length; epIndex < len && epIndex < 3; epIndex += 1) {
            var ep = item.episodes[epIndex];
        %>
            <li>
            <% if (len === 1 && item.last_view == ep.episode) { %>
                <div class="bdv-trace-item-episode-latest">已看到最新集</div>
            </li>
            <% break; %>
            <% } %>
            <% if (epIndex === 2 && (item.episodes[epIndex - 1].episode * 1 - ep.episode * 1 !== 1)) { %>
                <div class="bdv-trace-item-episode-holder">...</div>
            </li>
            <li>
            <% } %>
            <% if (item.last_view == ep.episode) { %>
                <i class="bdv-trace-icons bdv-trace-record"></i>
            <% } %>
            <% if (ep.is_new == 1 && item.last_view != ep.episode) { %>
                <i class="bdv-trace-icons bdv-trace-new"></i>
            <% } %>
            <% if (ep.is_play == 1) { %>
                <a href="<%=func.getPlayUrl(item, ep)%>" target="_blank" title="<%=ep.title%>"
                 static="stp=jp&to=play" data-ep="<%=ep.episode%>" data-new="<%=ep.is_new%>"
                ><span><%=ep.episode%>：</span><%=ep.title%></a>
            <% } else { %>
                <a href="javascript:;" title="暂无资源">暂无资源</a>
            <% } %>
            </li>
        <% } %>
        </ol>
    </dd>
    <% } %>

    <dd class="bdv-trace-item-ft">
        <a href="<%=introUrl%>" title="查看全部" target="_blank" class="bdv-trace-item-all" static="stp=all&to=search">查看全部</a>
        <a href="javascript:;" title="删除" class="bdv-trace-item-del" data-id="<%=item.works_id%>" data-type="<%=item.works_type%>" static="stp=del&id=<%=item.works_id%>&type=<%=item.works_type%>">删除</a>
    </dd>
</dl>
<% } %>
</script>

{%script%}
    var trace = require('./bdv_trace.js');
    trace('{%$pageTn%}', '{%if $carousel%}1{%else%}0{%/if%}');
{%/script%}
{%/function%}
