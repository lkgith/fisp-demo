{%*
  * 搜索框
  *
  * 约定
  *   1. 搜索框和suggestion样式固定，不允许在外部干预
  *   2. 如需实现UI差异化，内组件内实现后通过widget参数进行适配实现
  *   3. suggestion内部实现不支持多实例，每个页面只允许开启一次isSug
  *   4. suggestion组件存放于CMS中，这里只引入组件添加相关配置
  *   5. 输入框id值为{%$id%}Input，提交按钮id值为{%id%}Btn，不可修改
  *
  * @param {string} id|default:"bdvSearch" 当前页面中不可重复，用于标识组件DOM节点，多次引用时JS逻辑依赖
  * @param {string} isSug|default:0 是否开启suggestion
  * @param {string} style UI风格，包含风格：默认、mini
  *%}

{%function name="searchbox" id="bdvSearch" isSug=0 style="" openQuickSearch=false%}
{%if isset($navdata.common_search_prekeyword.videos)%}
	{%$isMISData = true%}
	{%$prekeyData = $navdata.common_search_prekeyword.videos%}
	{%$prekey = ""%}
	{%foreach $prekeyData as $item%}
		{%if $item.s_intro == $pageTn%}
			{%if $item.title%}
				{%$prekey = $item.title%}
			{%/if%}
			{%break%}
		{%/if%}
	{%/foreach%}
{%else%}
	{%$isMISData = false%}
{%/if%}

<form action="http://v.baidu.com/v" method="get" name="f1" id="{%$id%}" class="bdv-search{%if $style%} bdv-search-{%$style%}" data-style="{%$style%}{%/if%}">
	<span class="bdv-search-inputs">
		<input type="text" maxlength="120" id="{%$id%}Input" name="word" value="{%if isset($wd) && $wd%}{%$wd%}{%elseif $isMISData && $prekey%}{%$prekey%}" data-prekey="{%$prekey%}" class="place-holder{%/if%}" autocomplete="off" />
		{%if $openQuickSearch%}
			<span class="predict-query"></span>
			<span class="predict-input"></span>
		{%/if%}
	</span>
	<span class="bdv-search-btns">
		<input type="submit" value="" title="影视搜索" id="{%$id%}Btn" />
	</span>
	<input type="hidden" name="fr" value="video" />
	<input name="ie" type="hidden" value="utf-8" />
</form>
{%if $isSug%}
{%script%}
    (function() {
    	function log(src) {
    		var t = new Date().getTime(),
    			img = window['V_fix_img'+t] = new Image();
    		img.onload = img.onerror = img.onabort = function() {
    			img.onload = img.onerror = img.onabort = null;
    			try {
    				delete window['V_fix_img'+t];
    				img = null;
    			} catch(e) {
    				img = null;
    			}
    		}
    		img.src = src+'&r='+t;
    	};
    	var types = { movie: 21, tv: 22, show: 26, comic: 43, person: 50 };
    	var bdvSugConfig = {
			domain: 'v.hao123.com',
    		form: '{%$id%}',
    		input: '{%$id%}Input',
    		num: 6,
    		delay: 200,
    		classname: 'bdv-qs-suggestion{%if $style%} bdv-{%$style%}-suggestion{%/if%}',
    		onsubmit: function(evt) {
    			log( 'http://nsclick.baidu.com/v.gif?pid=104&tn=sug&searchpage={%$pageTn%}&s=zdjs&input=' + encodeURIComponent(evt.query) + '&wd=' + encodeURIComponent(evt.title) + ( evt.index ? '&li=' + evt.index : '' ) + ( evt.eventType ? '&eventtype=' + evt.eventType : '' ) );
    		},
    		onclicklink: function(evt) {
    			log( 'http://nsclick.baidu.com/v.gif?pid=104&tn=sug&s=zdjs&bl=spa&input=' + encodeURIComponent(evt.query) + '&wd=' + encodeURIComponent(evt.title) + '&id=' + evt.id + '&ty=' + types[evt.type] + '&stp=' + evt.target + '&li=' + evt.index + '&u=' + encodeURIComponent(evt.url) );
    		}
    	};
    	var sug = require("common:static/ui/suggestion/suggestion.js");
    	sug(bdvSugConfig);
    	$('#bdvSearchInput').on('focus',function(){$('#bdvSearch').addClass('hd-bdv-ipt-focus')}).on('blur',function(){$('#bdvSearch').removeClass('hd-bdv-ipt-focus')});
    }());
{%/script%}
{%/if%}
{%script%}
	require('./searchbox.js')({
		id: '{%$id%}',
		{%if isMISData%}
		ismis: true,
		{%/if%}
		pageTn: '{%$pageTn%}'
	});
{%/script%}
{%/function%}
