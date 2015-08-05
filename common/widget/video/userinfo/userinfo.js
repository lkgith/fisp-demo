var T = $;
var bdPassPop = require('common:static/ui/bdPassPop/bdPassPop.js'); // 登录组件

var initUserBar = function(userinfo) {
    T(function() {
        function loginCallback(){
            location.reload();
        }
        (function video_login_callback(d) {

            if (d && typeof(d) === "object" && d.value && d.value != "") {
                window.userinfo = {
                    isLogin: true
                };

                var c = [
                        '<a href="http://v.baidu.com/user/" target="_blank" id="username">个人中心</a>'
                ];
                T("#userinfo p").eq(0).append(T.stringFormat(c.join(""), d));
            } else {
                var c = [
                        '<a href="http://passport.baidu.com/v2/?login&tpl=vd&u=#{Url}" target="_blank" id="loginbtn">登录</a>',
                        '<span class="line">|</span>',
                        '<a href="https://passport.baidu.com/v2/?reg&tpl=vd&regType=1&u=#{Url}">注册</a>'
                    ],
                    d = {
                        Url: encodeURIComponent(document.location.href)
                    };
                T("#userinfo p").eq(0).append(T.stringFormat(c.join(""), d));
                if (location.hostname.match(/baidu\.com$/)) {
                    T('#loginbtn').on('click', function(e){
                        e.preventDefault(e);
                        bdPassPop.show();
                    });
                }
            }
        })(userinfo);
    });
};

module.exports = initUserBar;
