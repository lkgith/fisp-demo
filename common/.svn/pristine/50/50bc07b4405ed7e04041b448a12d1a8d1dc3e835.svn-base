var T = $,                                                                      // Tangram
	loginCheck = require('common:static/ui/loginCheck/loginCheck.js'),          // 登录信息组件
	bdPassPop = require('common:static/ui/bdPassPop/bdPassPop.js');             // 登录浮层组件
var ec = require('common:static/ui/eventcenter/eventcenter.js');

// 是否登录用户
var isLogin = false;

// 用户类型
var utype = 'normal';

// 页面tn值
var pageTn = '';

// 页面来源
var urlfr = T.url.getQueryValue(location.href, 'fr');

// 设置refere信息
function setRefere() {
	// 需要进行来源统计的入口页面
	var pages = {
		tvplay: true,
		movie: true,
		tamasha: true,
		cartoon: true,
		indsa: true,
		cooperate: true
	};
	var page = pageTn && pages[pageTn] && pageTn;

	// url中存在fr参数就写入cookie
	if ( urlfr ) {
		if ( page ) {
			$.cookie.set('bdvref', urlfr + '_' + page, {
				domain: location.hostname,
				path: '/'
			});
		}
	} else {
		if ( !$.cookie.get('bdvref') ) {
			var ref = document.referrer;
			if ( ref ) {
				var a = document.createElement('a');
				a.href = ref;
				ref = a.hostname.match(/^(v|www)\.(baidu|hao123)\.com$/) ? a.hostname : '';
			}
			// 来源是video、www、hao123，就写cookie
			if ( ref && page && page !== 'indsa' ) {
				$.cookie.set('bdvref', ref + '_' + page, {
					domain: location.hostname,
					path: '/'
				});
			}
		}
	}
}

// 用户信息区块相关逻辑
function initUserBar(userinfo) {
	// 影音播放器适配，检查网页端和影音端的登录状态是否同步，不同步则退出网页端
	var isBDPlayer = navigator.userAgent.indexOf('BIDUPlayer') > -1;
	if ( isBDPlayer && window.external && window.external.bpls_get_login_info ) {
		try {
			var yyUserInfo = eval('(' + window.external.bpls_get_login_info() + ')');
			if ( !yyUserInfo.LoginState && userinfo && userinfo.value ) {
				location.href = 'http://passport.baidu.com/?logout&tpl=vd&u=' + encodeURIComponent(location.href);
			}
		} catch(ex) {}
	}

	// 监测是否个性化首页小流量，并且页面位于首页
    var isNewIndex = ($.cookie.getRaw('__bdvnindex') !== null);

	$(function() {
		// 用户信息栏交互逻辑
		function userInfoInit() {
			var $logged = $('#userbar .uname'),
				$linkLogout = $('#userbar .logout');

			if ( !$logged.length ) {
				return;
			}

            $logged.off('mouseenter.userbar').on('mouseenter.userbar', function () {
                $(this).addClass('uname-hover');
            }).off('mouseleave.userbar').on('mouseleave.userbar', function () {
                $(this).removeClass('uname-hover');
            });

			// 非百度域通过代理页面退出登录
			if (!location.hostname.match(/\.baidu\.com$/) && $linkLogout) {
				$linkLogout.click(function(e) {
					e.preventDefault();
					var iframe = document.createElement('iframe');
					iframe.src = 'http://v.baidu.com/dev_proxy_logout.html?frp=' + location.hostname;
					iframe.style.display = 'none';
					document.body.appendChild(iframe);
					$tip.style.display = 'none';
				});
				window.video_logout_callback = function() {
					location.reload();
				};
			}
		}

		// 未登录用户栏渲染逻辑
		function renderLogin() {
			var url = encodeURIComponent(document.location.href),
				tpl = [
				'<ul class="no-login">',
				'<li class="link"><a href="http://list.video.baidu.com/iph_promote.html" target="_blank">百度视频无线版</a></li>',
				'<li class="line">|</li>',
				'<li class="login"><a href="http://passport.baidu.com/v2/?login&tpl=vd&u=' + url + '" target="_blank" id="loginbtn" class="link-login">登录</a><a href="https://passport.baidu.com/v2/?reg&tpl=vd&regType=1&u=' + url + '" target="_blank" class="link-reg">注册</a></li>',
                isNewIndex ? '<li class="line">|</li>' : '',
                isNewIndex ? '<li class="nindex"><a href="/i/?is_old=false" class="link-nindex">定制首页</a></li>' : '',
				'</ul>'
			];
			$('#userbar').append(tpl.join(''));

            if (location.hostname.match(/baidu\.com$/)) {
                $('#loginbtn').off('click.userbar').on('click.userbar', function (e) {
                    e.preventDefault();
                    bdPassPop.show();
                });
            }
		}

		// 已登录用户栏渲染逻辑
		function renderLogged(userinfo) {
			var tpl = [
				'<ul class="logged">',
				'<li class="uname"><a class="link-name" href="#{mysite}" target="_blank" id="username"><span id="user_name">#{value}' + ( userinfo.user_source && userinfo.user_source != 0 && userinfo.incomplete_user == 1 && userinfo.has_uname == 0 ? '<img src="http://passport.bdimg.com/passApi/img/icon_#{user_source}_16.png" class="show_icons" id="show_icons" />' : '' ) + '</span></a>',
				'<div class="tip">',
					'<ul>',
						'<li class="first"><a href="#{mysite}" target="_blank" class="my-info">个人中心</a></li>',
						'<li><a href="https://#{host}/" target="_blank" class="my-info">帐号设置</a></li>',
						(isBDPlayer ? '' : '<li><a href="#{logoutUrl}" class="logout">退出</a></li>'),
					"</ul>",
				"</div>",
				"</li>",
				'<li class="line">|</li>',
				'<li class="link"><a href="http://list.video.baidu.com/iph_promote.html" target="_blank">百度视频无线版</a></li>',
				isNewIndex ? '<li class="line">|</li>' : '',
				isNewIndex ? '<li class="nindex"><a href="/i/?is_old=false" class="link-nindex">定制首页</a></li>' : '',
				'</ul>'
			];

			// 半账号登录适配
			if (userinfo.incomplete_user == 0 && userinfo.has_uname == 0) {
				userinfo.value = userinfo.emailphone;
				userinfo.mysite = 'https://passport.baidu.com/v2/?ucenteradduname&to=princess';
			} else if(userinfo.incomplete_user == 1 && userinfo.has_uname == 0) {
				userinfo.mysite = 'https://passport.baidu.com/v2/?ucenteradduname&to=princess';
			} else {
				userinfo.mysite = 'http://i.baidu.com/?from=video';
			}

			// 退出登录
			userinfo.logoutUrl = "http://" + userinfo.host + "/?logout&tpl=vd&u=" + encodeURIComponent(document.location.href);

            $('#userbar').html($.stringFormat(tpl.join(''), userinfo)).addClass(
				userinfo && userinfo.vipinfo && userinfo.vipinfo.isvalid ? 'vip-super' : 'vip'
			);

			// 交互逻辑初始化
			userInfoInit();
		}

		if (userinfo && userinfo.value) {
			renderLogged(userinfo);
		} else {
			renderLogin();
		}
	});
};

// 发送页面全局统计
function globalStatistics(userinfo) {
	var refere = location.hostname.match(/(?:\.baidu\.com$)|(?:\.hao123\.com$)/) ? $.cookie.get('bdvref') : userinfo.cookie && userinfo.cookie.bdvref,
		frClickNum = $.cookie.get('bdvshare'),
		nsclick = 'http://nsclick.baidu.com/v.gif?pid=104&tn=' + pageTn + (refere ? '&VIDEO_FR=' + encodeURIComponent(refere) + (frClickNum ? '__' + frClickNum : '') : ''),
		match = location.href.match(/baidu\.com\/v\?.*word=([^&]*)/);
	// 检索页query
	if ( match ) {
		nsclick += '&wd=' + match[1];
	// 详情页作品类型和id
	} else if ( match = location.href.match(/baidu\.com\/(tv|comic|show)\/(\d*)\.htm/) ) {
		nsclick += '&id=' + match[2] + '&ty=' + match[1];
	}

	// 用户信息
	if ( isLogin ) {
		nsclick += '&login=true&uname=' +  encodeURIComponent(userinfo.value) + '&utype=' + utype;
	} else {
		nsclick += '&login=false';
	}
	// URL中的fr参数，用于对比cookie统计的UV是否正确
	if ( urlfr ) {
		nsclick += '&fr=' + urlfr;
	}
	// 发送统计
	$.log(nsclick);
}

// 初始化
// @param {string} tn 页面tn值
exports = module.exports = function(tn, notInitUserBar) {
	pageTn = tn;
	loginCheck(function(userinfo) {
		if ( userinfo && userinfo.value ) {
			isLogin = true;
			if (userinfo.vipinfo && userinfo.vipinfo.isvalid && userinfo.vipinfo.isvip) {
				utype = 'vip';
			}
			$(document.body).addClass('global-logged');
		}
		// 初始化信息区块
		!notInitUserBar && initUserBar(userinfo);
		// 设置refere信息
		setRefere();
		// 执行全局统计逻辑
		globalStatistics(userinfo);
	});
};

ec.attach('userbar.refresh', function () {
    exports(pageTn);
});
