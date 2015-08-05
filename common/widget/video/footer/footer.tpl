{%*
  * 站点统一footer
  *
  * 约定
  *   1. footer容器宽度与外部容器一致，内容水平居中
  *   2. 内容样式固定，不可在外部干预，如需差异化，在组件内实现，通过widget参数适配
  *   3. 搜索框引用common:searchbox组件
  *
  * @param {boolean} isSearch|default:false 是否显示搜索框
  *%}

{%function name="footer" isSearch=false loadVideoAdv=false tuiSong=true%}
<div class="footer" monkey="footer" alog-alias="footer">
	{%if $isSearch%}
	<div class="search">
		{%widget name="common:widget/video/searchbox/searchbox" call="searchbox" id="footSearch"%}
	</div>
	{%/if%}
	<div class="links">
		<a href="http://service.baidu.com/question?prod_en=video" target="_blank">帮助</a>&nbsp;|&nbsp;<a href="http://v.baidu.com/videoop.html" target="_blank">互联网视频开放协议</a>&nbsp;|&nbsp;<a href="http://qingting.baidu.com/index?pid=4" target="_blank">意见反馈</a><br />
		<a href="#" onclick="h(this,'http://www.baidu.com/');" class="action-sethome">把百度设为首页</a>&nbsp;|&nbsp;<a href="http://top.baidu.com/" target="_blank">搜索风云榜</a>&nbsp;|&nbsp;<a href="http://home.baidu.com/" target="_blank">关于百度</a>
	</div>
	<p>百度视频搜索结果源于互联网视频网站，系计算机系统根据搜索热度自动排列，不代表百度赞成被搜索网站的内容或立场。</p>
	<p class="copyright">&copy;&nbsp;{%$smarty.now|date_format:"%Y"%}&nbsp;Baidu&nbsp;<a href="http://www.baidu.com/duty/" target="_blank">使用百度前必读</a>&nbsp;|&nbsp;<a href="http://v.baidu.com/license.html" target="_blank">网络视听许可证0110516号</a></p>
</div>
{%script%}
{%if $tuiSong%}
$.getScript('http://static.pay.baidu.com/resource/tuisong/v1/tuiSong.js',function(){
		var t = new TuiSong();
		});
{%/if%}
window["h"] = function(obj, url){
    if (document.all) {
        obj.style.behavior = 'url(#default#homepage)';
        obj.setHomePage(url);
    }
}
{%if $loadVideoAdv%}
$.ajax({
    url: 'http://list.video.baidu.com/videoadv.js',
    dataType: "script",
    scriptCharset: "gb2312",
    crossDomain: true
});
{%/if%}
{%/script%}
{%/function%}
