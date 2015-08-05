<?php
function conv(&$data,$from = 'gbk',$to = 'utf-8//IGNORE')
{
	if(is_array($data))
	{
		foreach($data as $key=>$value ){
			if(is_array($value)){
				conv($data[$key],$from,$to);
			}else{
				$data[$key] = conv($data[$key],$from,$to);
			}
		}
	}else{
		return iconv($from,$to,$data);
	}
}
function smarty_modifier_f_json_encode($data,$from = 'gbk',$to = 'utf-8//IGNORE'){
	if($from != 'utf-8'){
		conv($data,$from,$to);
	}
	return json_encode($data);
}