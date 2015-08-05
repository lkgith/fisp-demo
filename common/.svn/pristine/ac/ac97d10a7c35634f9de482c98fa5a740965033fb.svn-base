/********************************************
  *
  * 文件注释，说明文件名称和文件所包含内容
  * @fileName bdPassPop.js
  * @author picheng
  * @create time 2014年08月04日 12:00
  * @version {版本信息}  v0.0.1
  *
  * ////////////////////////////////////////
  *
  * @describe  描述文件内容
  *		登录框
  *
*********************************************/




var T = $, // tangram
	ec = require('common:static/ui/eventcenter/eventcenter.js'); // 事件中心

// 登录组件命名空间
var bdPass;

// 登录成功回调函数，默认刷新页面
var loginSuccessDef = function() {
	location.reload();
};
var loginSuccess = loginSuccessDef;

// 状态码，是否已初始化
var isInit = false;

// 初始化方法
function initPass(config) {
    var defaultConf = {
        authsite:['tsina','renren','qzone'],
        apiOpt: {
            // location.host 适配video、hao123、baishi等不同域名
            staticPage: 'http://' + location.host + '/browse_static/common/html/v3Jump.html',
            product: 'vd',
            u: window.location.href,
            memberPass: true,
            safeFlag: 0,
            subpro: window.pageId || ''
        },
        cache: false,
        authsiteCfg: {
            act:'implicit'
        },
        tangram: true,
        onLoginSuccess: function(ev) {
            ev.returnValue = false;
            loginSuccess();
        }
    };
    if(config){
        for(var key in config){
            defaultConf.apiOpt[key] = config[key];
        }
    }
    T.ajax('http://passport.baidu.com/passApi/js/uni_login_wrapper.js?cdnversion=' + new Date().getTime(),{
        dataType: "script",
        success:function(){
            // 创建登录浮层实例
            bdPass = passport.pop.init(defaultConf);
            // 初始化由show方法触发，初始化成功后默认弹出浮层
            bdPass.show();
        }
    });
}

// 模块接口：弹出登录浮层
// @param {function} callback 登录成功后的回调函数
exports.show = function(callback,option) {
	loginSuccess = typeof callback === 'function' ? function () {
        exports.hide();
        ec.trigger('userinfo.refresh');
        ec.trigger('userbar.refresh');
        callback();
    } : loginSuccessDef;
	// 影音播放器调客户端登录接口
	if ( navigator.userAgent.indexOf('BIDUPlayer') > -1 ) {
		try {
			window.external.bpls_normalCall('BaiduLoginWinOpen', '', '');
		} catch(e) {
			if ( isInit ) {
				bdPass.show();
			} else {
				initPass(option);
				isInit = true;
			}
		}
	} else {
		if ( isInit ) {
			if(bdPass){
				bdPass.show();
			}
		} else {
			initPass(option);
			isInit = true;
		}
	}
};

// 模块接口：隐藏弹出浮层
exports.hide = function() {
	if ( isInit ) {
		bdPass.hide();
	}
};
