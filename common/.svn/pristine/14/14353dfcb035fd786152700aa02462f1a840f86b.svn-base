// 工具组件
var loginCheck = require('common:static/ui/loginCheck/loginCheck.js'),          // 登录信息组件
	bdPassPop = require('common:static/ui/bdPassPop/bdPassPop.js');             // 登录浮层组件

// 子菜单显示隐藏
function menuinit() {
	var $menusub = $('#topbar .menusub');
	$menusub.mouseenter(function() {
		$menusub.addClass('menusub-hover');
	});
	$menusub.mouseleave(function() {
		$menusub.removeClass('menusub-hover');
	});
}

// 登录框显示隐藏
function userbarinfoinit() {
	var $userbarinfo = $('#topbar');	
	$userbarinfo.on("mouseenter",".userbar",function(){
		$(this).addClass('userbar-hover');		
	});
	$userbarinfo.on("mouseleave",".userbar",function(){
		$(this).removeClass('userbar-hover');
	});
}

// 设为首页逻辑
var sethome = (function() {
	var UA = (function(WIN, UA) {
	    var key = { //关键字常量
	            ie: "msie",
	            sf: "safari",
	            tt: "tencenttraveler"
	        },

	        //正则列表
	        reg = {
	            browser: "(" + key.ie + "|" + key.sf + "|firefox|chrome|opera)",
	            shell: "(maxthon|360se|theworld|se|theworld|greenbrowser|qqbrowser|bidubrowser)",
	            tt: "(tencenttraveler)",
	            os: "(windows nt|macintosh|solaris|linux)"
	        },

	        //ua匹配方法
	        uaMatch = function(str) {
	            var reg = new RegExp(str + "\\b[ \\/]?([\\w\\.]*)", "i"),
	                result = UA.match(reg);
	            return result ? result.slice(1) : ["", ""];
	        },

	        //特殊浏览器检测
	        is360 = function() {

	            //高速模式
	            var result = UA.toLowerCase().indexOf("360chrome") > -1 ? !!1 : !1,
	                s;

	            //普通模式
	            try {
	                if (WIN.external && WIN.external.twGetRunPath) {
	                    s = WIN.external.twGetRunPath;
	                    if (s && s.toLowerCase().indexOf("360se") > -1) {
	                        result = !!1;
	                    }
	                }
	            } catch (e) {
	                result = !1
	            }
	            return result;
	        }(),

	        //特殊检测maxthon返回版本号
	        maxthonVer = function() {
	            try {
	                if (/(\d+\.\d)/.test(external.max_version)) {
	                    return parseFloat(RegExp['\x241']);
	                }
	            } catch (e) {}
	        }(),

	        browser = uaMatch(reg.browser),
	        shell = uaMatch(reg.shell),
	        os = uaMatch(reg.os);

	    //修正部分IE外壳浏览器
	    if (browser[0].toLowerCase() === key.ie) {

	        //360
	        if (is360) {
	            shell = ["360se", ""];
	        } else if (maxthonVer) {
	            shell = ["maxthon", maxthonVer];
	        } else if (shell == ",") {
	            shell = uaMatch(reg.tt);
	        }
	    } else if (browser[0].toLowerCase() === key.sf) {

	        //特殊处理sf的version
	        browser[1] = uaMatch("version") + "." + browser[1];
	    }

	    return {
	        browser: browser.join(","),
	        shell: shell.join(","),
	        os: os.join(",")
	    };
	})(window, navigator.userAgent);

	return {
	    //配置跳转锚点
	    config: {

	        //配置帮助页面地址
	        helpUrl: "http://www.hao123.com/redian/sheshouyef.htm",

	        //外壳浏览器
	        shell: {
	            //360
	            "360se": "02",
	            "maxthon": "03",
	            //搜狗
	            "se": "04",
	            "qqbrowser": "05",
	            "theworld": "10",
	            "greenbrowser": "12",
	            "bidubrowser": "17"
	        },

	        //内核浏览器
	        browser: {
	            "firefox": "ff",
	            "chrome": "08",
	            "opera": "09",
	            "safari": "11"
	        }
	    },

	    //设置主页或跳转方法
	    set: function(el, url) {
	        //浏览器
	        var browser = UA.browser.split(",")[0].toLowerCase(),

	            //外壳
	            shell = UA.shell.split(",")[0].toLowerCase(),

	            config = this.config,

	            helpUrl = config.helpUrl,

	            errorTip = " 您的浏览器不支持，请手动设置  ",

	            setForIE = function() {
	                try {
	                    el.style.behavior = 'url(#default#homepage)';
	                    el.setHomePage(url);
	                } catch (e) {
	                    alert(errorTip);
	                }
	            };

	        if (browser === "msie" && (!shell || shell === "tencenttraveler")) {
	            setForIE();
	            return false;
	        } else if (shell && config.shell[shell]) {

	            //alert(shell)
	            helpUrl += "#" + config.shell[shell];

	            //测试发现maxthon也会注入UA
	            if (shell === "maxthon") {
	                try {
	                    if (external.max_version) {
	                        window.open(helpUrl);
	                        return false;
	                    } else {
	                        setForIE();
	                        return false;
	                    }
	                } catch (e) {
	                    setForIE();
	                    return false;
	                }
	            } else {
	                window.open(helpUrl);
	                return false;
	            }
	        } else if (config.browser[browser]) {
	            //测试发现maxthon3跳至chrome
	            if (browser === "chrome") {
	                try {
	                    if (external.max_version) {
	                        helpUrl += "#" + "03";
	                        window.open(helpUrl);
	                        return false;
	                    } else {
	                        helpUrl += "#" + config.browser[browser];
	                        window.open(helpUrl);
	                        return false;
	                    }
	                } catch (e) {
	                    helpUrl += "#" + config.browser[browser];
	                    window.open(helpUrl);
	                    return false;
	                }
	            } else {
	                helpUrl += "#" + config.browser[browser];
	                window.open(helpUrl);
	                return false;
	            }
	        } else {
	            alert(errorTip);
	            return false;
	        }
	    },

	    //绑定对象接口
	    bind: function(el, url) {
	        //允许id或dom
	        el = typeof el === "string" ? document.getElementById(el) : el;

	        //增加一层元素href控制退出机制，如果手动修改了A的href为其他域名，则不具有设为主页的功能
	        if (el.href.indexOf("hao123.com") < 0) return;
	        url = url || el.href || window.location;

	        var that = this,
	            on = document.addEventListener ? function(el, type, callback) {
	                el.addEventListener(type, callback, !1);
	            } : function(el, type, callback) {
	                el.attachEvent("on" + type, callback);
	            };

	        on(el, "click", function(e) {
	            e = e || window.event;
	            that.set(el, url);
	            if (e.preventDefault) {
	                e.preventDefault();
	            } else {
	                e.returnValue = false;
	            }
	            return false;
	        });

	        //允许链式绑定多个dom对象
	        return this;
	    }
	};
}());

// 用户信息栏
var userbar = {
	// 用户信息模板
	tpl: {
		login: __inline('./login.tmpl'),
		logged: __inline('./logged.tmpl')
	},
	// 初始化
	init: function() {
		var me = this;
		loginCheck(function(userinfo) {
			if ( userinfo && userinfo.value ) {
				me._logged(userinfo.value);
			} else {
				me._login();
			}
		});
	},

	// 未登录
	_login: function() {
		$(this.tpl.login({
			url: encodeURIComponent(location.href),
			pageId: window.pageId
		})).appendTo('#topbar .inner').find('.link-login').click(function(e) {
			e.preventDefault();
			bdPassPop.show();
		});
	},

	// 已登录
	_logged: function(username) {
		var tips = $.cookie.get('bdvh-toolTip'),
			uid = (function() {
				var id = $.cookie.get('FLASHID') || $.cookie.get('BAIDUID');
				if ( id ) {
					return id.substring(0, 32);
				} else {
					return '';
				}
			}());

		$(this.tpl.logged({
			url: encodeURIComponent(location.href),
			name: username,
			uid: uid,
			istips: tips ? false : true
		})).appendTo('#topbar .inner').find('.link-close').click(function(e) {
			e.preventDefault();
			$('#topbar .userbar .tips').hide();
			$.cookie.set('bdvh-toolTip', 'close', { path: "/", expires: 604800000 });
		});
	}
};

exports = module.exports = function() {
	// 子菜单显示隐藏
	menuinit();
    // 登录信息显示隐藏
	userbarinfoinit();

	// 设为首页
	sethome.bind('sethome', 'http://www.hao123.com');

	// 用户信息
	userbar.init();
};