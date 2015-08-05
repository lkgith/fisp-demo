{%*
	* @des 广告代码维护
	************************************
	* 当前页面有三种广告类型type
	* 1.mis后台配置,数据在misAdvData中配置
	* 2.网盟代码生成，此处用isUnion参数区分
	* 3.游戏广告，此处用isGame区分
	*************************************
	* 提供类名形式以控制网盟及游戏端广告输出位置及样式
	* 1.ad-full-banner    通栏广告
	* 2.ad-main-banner    页面主体部分广告
	* 3.ad-aside-banner	  页面右侧排行榜广告   
*%}

{%$misAdvData=[
	"index_banner_top"	 =>	[
		"id"		 =>	"index_banner_top",
		"classname"	 => "index-banner-top",
		"bl"		 =>	"adv_full_top",
		"monkey"	 =>	"adv_full_top"
	],
	"index_banner_bottom"	 =>	[
		"id"		 =>	"index_banner_bottom",
		"classname"	 =>	"ad-full-banner",
		"bl"		 =>	"adv_full_bottom",
		"monkey"	 =>	"adv_full_bottom"
	],
	"index_right_float"	=>	[
		"id"		 =>	"index_right_float",
		"classname"	 =>	"index-right-float",
		"bl"		 =>	"adv_float_right",
		"monkey"	 =>	"adv_float_right"
	],
	"index_right_top"	=>	[
		"id"		 =>	"index_right_top",
		"classname"	 =>	"index-right-top",
		"bl"		 =>	"adv_float_top",
		"monkey"	 =>	"adv_float_top"
	]
]%}

{%if isset($adname) && isset($misAdvData[$adname])%}
	{%$data = $misAdvData[$adname]%}
{%/if%}

{%if isset($data) && $data%}
<div {%if isset($data.classname) && $data.classname%}class="{%$data.classname%}"{%/if%} id="{%$data.id%}" static="bl={%$data.bl%}" monkey="{%$data.monkey%}"{%if isset($query) && $data.id == "index_right_top"%} videoadv="el=shoulder&page=index"{%/if%}></div>
{%script%}
require.async('common:widget/video/advList/advList.js',function(adv){
    adv.push(function(){
        return {%json_encode($data)%}
    });
});
{%/script%}
{%/if%}
