<?php

// URL中传递的callback参数值
$callback = $_GET["callback"] ? $_GET["callback"] : "";

$fis_data = array(
	// 是否购买过VIP特权
	"isvip" => 0,

	// 是否在有效期内，判断VIP用户通常只需检查这个值
	"isvalid" => 0,

	// VIP过期时间
	"expire_date" => "2015\u5e7402\u670820\u65e5"
);

if ( $callback ) {
	echo $callback . "(" . json_encode($fis_data) . ")";
} else {
	echo json_encode($fis_data);
}