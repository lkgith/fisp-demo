{%*
  * 登录注册栏
  * 
  * 约定
  *   1. 组件包含普通头部UI和吸顶头部两种UI，吸顶头部UI通过.hdmini适配
  *   2. 如需实现UI差异化，内组件内实现后通过widget参数进行适配实现
  *%}

<div id="userbar" static="bl=userbar" monkey="userbar" alog-alias="userbar"></div>
{%script%}
	require('./userbar.js')('{%$pageTn%}');
{%/script%}