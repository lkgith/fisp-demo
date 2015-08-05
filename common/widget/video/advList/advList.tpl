{%*顶部通栏广告*%}
<script type="text/html" id="index_banner_top_tpl">
<%
    var item = data[0];
    if( data && data.length >1 ){
        item = data[Math.floor(Math.random() * data.length)];
    }
%>
<% if(item && item.hot_day == 1){ %>
    <div class="ad-top-banner" > 
        <a href="<%=item.url%>" target="_blank" id="linkAdv984" static="stp=adv_top_984_90">
            <img src="<%=item.imgh_url%>" alt="<%=item.title%>"/>
        </a>
        <a href="javascript:void(0)" class="btnTopBannerClose"></a>
    </div>
<% } %>
</script>
{%*底部通栏广告*%}
<script type="text/html" id="index_banner_bottom_tpl">
<%
    var item = data[0];
    if( data && data.length >1 ){
        item = data[Math.floor(Math.random() * data.length)];
    }
%>
<% if(item && item.hot_day == 1){ %>
	<div> 
	<a href="<%=item.url%>" target="_blank" static="stp=iph_promote_984_83">
		<img src="<%=item.imgh_url%>" alt="<%=item.title%>" />
	</a>
	</div>
<% } %>
</script>
{%*顶部肩膀图*%}
<script type="text/html" id="index_right_top_tpl">
<%
    var item = data[0];
    if( data && data.length >1 ){
        item = data[Math.floor(Math.random() * data.length)];
    }
%>
<% if(item && item.hot_day == 1){ %>
<a href="<%=item.url%>" target="_blank" static="stp=toplist_140_70" style="background:url(<%=item.imgh_url%>) 100% 100% no-repeat;"></a>
<% } %>
</script>
{%*右侧悬浮广告*%}
<script type="text/html" id="index_right_float_tpl">
<div class="index_AD_right_close">
	<a title="右侧悬浮广告" class="close" href="javascript:void(0)"></a>
</div>
<div class="adContainer">

<% var data = data || []; %>
<% for(var i = 0, len = data.length; i < len; i++) { %>
<% var item = data[i]; %>
<div id="adRightFloat<%=i%>" 
    class="index_AD_right_fixed
    <% if( item.title ){ %> has-title <% } %>">
    <% if (item.intro == 1) { %> index_AD_right_fixed_big<% } %> 
	<a class="normal" target="_blank" href="" static="bl=index_AD_right_fixed&stp=adv_right_90">
		<img  src="<%=item.imgh_url || item.imgv_url%>" /><% if (item.intro != 1 ) { %><%=item.title%><% } %>
	</a>
	<a title="<%=item.title%>" class="close" href="javascript:void(0)"></a>
</div>
<% } %>
</div>
</script>
{%if !isset($hasNoUnioAd) || !hasNoUnioAd%}
{%script%}
$(function() {
	$.getScript('http://cbjs.baidu.com/js/m.js', function() {
		if ( window.BAIDU_CLB_fillSlotAsync ) {
			$('.adm-union').each(function(index, item) {
				var domid = item.getAttribute('id'),
					uniodid = item.getAttribute('data-union');
				if ( domid && uniodid ) {
					BAIDU_CLB_fillSlotAsync(uniodid, domid);
				}
			});
		}
	});
});
{%/script%}
{%/if%}
{%script%}
require.async('./advList.js',function(ADV){
	ADV.init();
});
{%/script%}
