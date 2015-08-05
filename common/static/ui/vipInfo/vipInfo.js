// tangram
var T = $;
// 获取用户信息
var loginCheck = require('common:static/ui/loginCheck/loginCheck.js');

// VIP信息数据接口
var API = '/commonapi/pay/pay_result_by_uid/?service=1';

// VIP信息
var vipInfo = null;

// 回调函数列队，用于临时保存调用组件接口时传入的回调函数，从API获取数据后被逐个执行
var callbacks = [];

// 状态码，标识数据正在请求中
var isRequesting = false;

// 对外接口：获取用户VIP信息
// @param {function} callback 回调函数，接收一个参数info
// VIP信息作为参数传入回调函数，传入的数据格式如下：
// {
//     "isvip": 1, // 是否购买过黄金VIP，1：购买过，0：未购买过
//     "isvalid": 1, // 黄金VIP是否在有效期内，1：在有效期内，0：已过期
//     "expire_date": "xxxx年xx月xx日" // 过期时间
// }
exports.get = function(callback) {
	if ( typeof callback !== 'function' ) {
		return;
	}
	if ( vipInfo ) {
		callback(vipInfo);
	} else {
		loginCheck(function(userinfo) {
			if ( userinfo && userinfo.value ) {
				callbacks.push(callback);
				if ( !isRequesting ) {
					isRequesting = true;
					T.get(API + '&t=' + new Date().getTime()).done(function(data) {
						var info = data;
						vipInfo = info;
						T.each(callbacks, function(index,item) {
							item(info);
						});
						isRequesting = false;
					}).fail(function(){
						T.each(callbacks, function(index,item) {
							item({});
						});
						isRequesting = false;
					})
				}
			} else {
				callback(vipInfo);
			}
		});
	}
};