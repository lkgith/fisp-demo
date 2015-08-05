{%*
  * 热搜词组件
  *
  * 约定
  *   1. 模板中取不到MIS区块则通过异步接口取数据
  *   2. 宽高依赖外部容器，热搜词从左至右排列，组件样式禁止在外部干预
  *   3. 如需实现UI差异化，内组件内实现后通过widget参数进行适配实现
  *   4. 数量限制与老版约定一致，最多7个query
  *
  * @param {string} id 必填，组件唯一标识
  *%}

{%function name="searchKeyword" id=""%}

{%if isset($navdata.common_search_keyword.videos)%}
  {%$isMISData = true%}
  {%$keywordData = $navdata.common_search_keyword.videos%}
{%else%}
  {%$isMISData = false%}
{%/if%}

<div id="{%$id%}" class="search-keyword" static="bl=top_search_Keyword">
  {%if $isMISData && $keywordData && !(isset($BuyVolume) && $BuyVolume) %}
    <ul>
    {%foreach $keywordData as $item%}
      <li>
        <a href="{%$item.url%}" target="_blank"{%if $item.update%} class="hot"{%/if%}>{%$item.title%}</a>
        {%if $item.date%}<img src="http://vs4.bdstatic.com/short/icon_hot_tag.gif" alt="" />{%/if%}
      </li>
    {%/foreach%}
    </ul>
  {%/if%}
</div>
{%if !$isMISData%}
{%script%}
  require('./searchKeyword.js')('{%$id%}');
{%/script%}
{%/if%}
{%/function%}
