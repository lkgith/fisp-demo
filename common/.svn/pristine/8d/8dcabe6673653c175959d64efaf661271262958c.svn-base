var T = $,
    cookie = T.cookie,
    EC = require('common:static/ui/eventcenter/eventcenter.js'),
    loginCheck = require('common:static/ui/loginCheck/loginCheck.js');

// 配置信息对象
var Config = {};
Config.BDUSS = 'BDUSS';
Config.ACCESS_TOKEN = 'BDV_ACC';
Config.BASE_URL = 'http://v.baidu.com/';
//Config.BASE_URL = 'http://db-apptest-news00.vm.baidu.com:8060/';

/**
 * 获取Open Api平台的access_token
 * @param {function} cb
 */
function getAccessToken(cb) {
    T.ajax(Config.BASE_URL + 'video_topic/?type=access',{
        dataType:'jsonp',
        success:function(json) {
            if (json  && json.access_token) {
                // event center通知
                EC.trigger(OpenOauth.Event.AccessToken, { once: true, at: json.access_token });

                // 直接回调
                cb && cb(json.access_token);
            }
        }
    });
}

// 外部不能直接访问
var accessToken;

// 实例对象
var OpenOauth = function() {
    if (this.instance) { // 保持单例
        return this.instance;
    }

    this.user = {};
    this.isLogin = false;
    this.initialize();
};

OpenOauth.prototype = {
    initialize: function() {
        var me = this;

        me.instance = this;

        // vs login check
        loginCheck(function(user) {

            me.isLogin = (typeof user === 'object' && user.value);

            if (me.isLogin) { // 已登录

                me.user = user;

                // event center通知
                EC.trigger(OpenOauth.Event.Login, { once: true });

                var bduss = cookie.getRaw(Config.BDUSS);
                if (bduss) { // 用户已登录
                    var at = cookie.getRaw(Config.ACCESS_TOKEN);
                    at = at ? at.split(bduss) : null;

                    if (at && at.length > 1 && at[1]) { // 取本地的access_token
                        accessToken = at[1];
                        // event center通知
                        EC.trigger(OpenOauth.Event.AccessToken, { once: true, at: accessToken });
                        return;
                    }
                }

                // 远程获取
                getAccessToken();
            }

        });
    },
    getAccessToken: function(cb) {
        var me = this;

        if (accessToken) { // 已有access_token
            // event center通知
            EC.trigger(OpenOauth.Event.AccessToken, { once: true, at: accessToken });

            // 直接回调
            cb && cb(accessToken);
        } else if (me.isLogin) { // 远程调用
            getAccessToken(cb);
        }

    }
};

// 响应事件
OpenOauth.Event = {
    Login: 'OpenOauth.login',
    AccessToken: 'OpenOauth.accessToken'
};

module.exports = OpenOauth;