{%*公共广告区配置*%}


{%*
    *  顶部大banner
    * "index_banner_top"	 

    *  底部大banner
    * "index_banner_bottom"

    *  右侧浮动广告
	* "index_right_float"  

    *  右侧肩膀图
	* "index_right_top"	 
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
{%assign var="misAdvData" value=$misAdvData scope="global"%}
