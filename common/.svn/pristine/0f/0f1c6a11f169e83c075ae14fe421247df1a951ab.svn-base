{%function name="statistics" uid="" refer="" word="" tn="" logParams=[]%}
{%*
	@params {array} logParams 全局统计参数
	$logParams = [
		[
			"name" => "参数名",
			"value" => "参数值",
			"isencode" => 0 // 是否URL编码
		]
	]
*%}
{%script type="text/javascript"%}
	var loginCheck = require('common:static/ui/loginCheck/loginCheck.js');
	require('common:static/ui/statistics/statistics.js');
   	if ( location.hostname.match(/(?:\.baidu\.com$)|(?:\.hao123\.com$)/) ) {
		var bdvref = $.cookie.get('bdvref');
		if ( bdvref ) {
			V.nsclick.setParam('VIDEO_FR', bdvref);
		}
	} else {
		loginCheck(function(userinfo) {
			if ( userinfo && userinfo.cookie && userinfo.cookie.bdvref ) {
				V.nsclick.setParam('VIDEO_FR', userinfo.cookie.bdvref);
			}
		});
	}

	{%if $uid%}
		var uid = $.cookie.get('BAIDUID');
		uid = uid.substring(0, uid.indexOf(':')) + (new Date().getTime());
		V.nsclick.setParam('uid', uid);
	{%/if%}
	{%if $refer%}V.nsclick.setParam('refer', '{%urlencode($refer)%}');{%/if%}
	{%if $word%}V.nsclick.setParam('wd', '{%$word%}');{%/if%}
	{%if $tn%}V.nsclick.setParam('tn', '{%$tn%}');V.nsclick.setParam('tpl', '{%$tn%}');{%/if%}
	{%if isset($pn) && $pn%}V.nsclick.setParam('pn', '{%$pn%}');{%/if%}
	{%if $logParams%}
		{%foreach $logParams as $d%}
			{%if isset($d.name) && isset($d.value)%}
				V.nsclick.setParam('{%$d.name%}', '{%if isset($d.isencode) && $d.isencode%}{%urlencode($d.value)%}{%else%}{%$d.value%}{%/if%}');
			{%/if%}
		{%/foreach%}
	{%/if%}
{%/script%}
{%/function%}
