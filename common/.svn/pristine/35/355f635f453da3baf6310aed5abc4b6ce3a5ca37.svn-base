/**
 * 电视剧、综艺VIP站点选择
 */

// VIP合作站点中转代理页面
exports.sites = {
	// 华数：线上
	'wasu.cn': 'http://uc.wasu.cn/member/index.php/Proxy/core?link={url}',
	// 乐视
	'letv.com': 'http://sso.letv.com/oauth/baidu?next_action={url}',
	// 暴风
	'baofeng.com': 'http://hd.baofeng.com/?c=ThirdPartner&a=vipbaidu&next_action={url}',
	// m1905 电影网
	'm1905.com': 'http://openapi.passport.m1905.com/Login/Authorize/Baidu/?ReturnUrl={url}',
	//风行新域名
	'fun.tv' : 'http://api.fun.tv/login/oauth_authorize/baidu?url={url}',
	// 风行网
	'funshion.com': 'http://api.funshion.com/login/oauth_authorize/baidu?url={url}',
	// PPTV
	'pptv.com': 'http://api.ddp.vip.pptv.com/core/proxy?link={url}'
};

exports.vipSiteLogo = "http://vs4.bdstatic.com/pc_static/common/icon/vip_super_small.png";

//按排序策略顺序
exports.sites.order = [
	'letv.com',
	'm1905.com',
	'pptv.com',
	'baofeng.com',
	'fun.tv',
	'funshion.com',
	'wasu.cn'
];

// 不参与VIP服务的作品
var filterList = {
	// 电视剧
	tv: ',16952,16953,16954,17413,19783,16967,19732,19784,20259,16957,16992,19693,18374,18375,18410,19489,19492,19493,19491,19694,',
	show:',290,'
};

// 类型别名
filterList.tvplay = filterList.tv;
// 类型别名
filterList.show = filterList.show;

// 检查作品是否参与VIP服务
// @param {string} type 作品类型
// @param {string|number} id 作品id
exports.filterWork = function(type, id) {
	if ( filterList[type] && filterList[type].indexOf(',' + id + ',') > -1 ) {
		return true;
	}
	return false;
};