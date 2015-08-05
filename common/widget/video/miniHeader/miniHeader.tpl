{%function name="header" openQuickSearch=false type="browse"%}
<div id="header" monkey="header" alog-alias="header" class="hdmini nav-type-mini nav-style-{%$type%}">
    {%widget name="common:widget/video/nav/nav.tpl" call="nav"%}
    <div class="hd-inner container">
        {%widget name="common:widget/video/userbar/userbar.tpl"%}
        <div class="hd-logo">
            <a href="http://v.baidu.com/" class="link-home"></a>
        </div>
        <div class="hd-nav">
            {%widget name="common:widget/video/navmini/navmini.tpl"%}
        </div>
        {%widget name="common:widget/video/tabsearch/tabsearch.tpl" call="tabsearch" openQuickSearch=$openQuickSearch%}
        <div class="hd-trace">
            {%widget name="common:widget/video/bdv_trace/bdv_trace.tpl" call="bdv_trace"%}
        </div>
        <div class="hd-record">
            {%widget name="common:widget/global/bdv_record/bdv_record.tpl" call="bdv_record" isWithBdvTrace=true%}
        </div>
        <div class="hd-goback">
            <a href="/?is_old=true ">返回旧版</a>
        </div>
    </div>
</div>
{%/function%}
