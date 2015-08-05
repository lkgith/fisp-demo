{%*flash支持情况监测统计*%}
<div style="height: 0px;overflow: hidden;"><div id="flashTestElem"></div></div>
{%script type="text/javascript"%}
	var swf = require('common:static/vendor/jquery/swfobject.js');
	if(!window['advPlayLog']){
		window['advPlayLog'] = function(logstr){
			$.log(logstr+'&refer='+encodeURIComponent(document.referrer)+'&r='+Math.random());
		}
	}
	advPlayLog('http://nsclick.baidu.com/u.gif?pid=104&tpl={%$pageTn%}&stp=probestart');
	var flashData = {
		wrap: 'flashTestElem',
		url: 'http://list.video.baidu.com/swf/probe.swf?v=20150311&r='+Math.random(),
		width: '1',
		height: '1',
		flashvars:{
			"log": "tpl={%$pageTn%}"
		},
		attributes: {
			id: 'flashTester'
		},
		params:{
			wmode: 'transparent',
			allowScriptAccess: 'always',
			allowFullScreen: 'true'
		}
	};
	swf.embedSWF(flashData.url,flashData.wrap,flashData.width,flashData.height,"6","",flashData.flashvars,flashData.params,flashData.attributes);
{%/script%}