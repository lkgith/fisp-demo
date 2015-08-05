var T = $;

var userinfo, isChecking, callbacks = [],
    dataReady = false;

var ec = require('common:static/ui/eventcenter/eventcenter.js');
ec.attach('userinfo.refresh', function () {
    dataReady = false;
    isChecking = false;
});

//对外提供的获取登录信息的方法
function loginCheckReady(callback) {
    if (typeof callback === 'function') {
        if (dataReady) {
            callback(userinfo);
        } else {
            callbacks.push(callback);
            loginCheck();
        }
    }
}

//接收从服务器获取的登录信息
function receive(data) {
    if (dataReady) {
        return;
    }
    dataReady = true;
    userinfo = data;
    T.each(callbacks, function (i, fn) {
        fn(data);
    });
}

//向服务器获取登录信息
function loginCheck() {
    if (!isChecking) {
        isChecking = true;
        //百度域直接通过JSONP接口获取
        if (location.hostname.match(/(?:\.baidu\.com$)|(?:\.hao123\.com$)/)) {
            window['video_login_callback'] = function (data) {
                // 如果是已登录用户，补充VIP相关信息
                if (data && data.value) {
                    T.get('/commonapi/pay/pay_result_by_uid/?service=1&t=' + new Date().getTime())
                        .done(function (result) {
                            if (typeof result === "string") {
                                try {
                                    var vipinfo = T.parseJSON(result);
                                    data.vipinfo = vipinfo;
                                } catch (e) {
                                    data.vipinfo ={
                                        expire_date: new Date(),
                                        isvalid: 0,
                                        isvip: 0
                                    }
                                }
                            } else {
                                data.vipinfo = result;
                            }
                            receive(data);
                        }).fail(function () {
                            receive(data);
                        })
                } else {
                    receive(data);
                }
                window['video_login_callback'] = null;
            };
            T.ajax('http://v.baidu.com/d?m=uss&word=' + (new Date()).getTime(), {
                dataType: 'jsonp',
                jsonpCallback: 'video_login_callback'
            });
            //非百度域通过代理页面获取
        } else {
            window['video_login_callback'] = function (data) {
                receive(T.parseJSON(data));
                window['video_login_callback'] = null;
            };
            T(function () {
                var iframe = document.createElement('iframe');
                iframe.src = 'http://v.baidu.com/dev_proxy_logininfo.html?v=' + Math.ceil(new Date() / 7200000);
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            });
        }
    }
}

module.exports = loginCheckReady;
