<?php
function utf8_strlen($str,$len,$etc) {
	$count = 0;
	$slen = mb_strlen($str,"UTF-8");
	for($i = 0; $i < $slen; $i++){
		$value = ord(mb_substr($str,$i,1,"UTF-8"));
		if($value > 127) {
			$count++;
		}else{
			$count+=0.5;//非汉字算半个字
		}
		if(floor($count+1)>$len){
			return mb_substr($str,0,$i,"UTF-8").$etc;
		}
	}
	return $str;
}
function smarty_modifier_mb_truncate($string, $length = 80, $etc = '..') 
{ 
    if ($length == 0) 
        return '';
    //utf-8 每个中文3个字节
    if ((strlen($string)+mb_strlen($string,"UTF-8"))/2 > $length) { 
        return utf8_strlen($string,$length,$etc);
    } else { 
        return $string; 
    } 
} 
