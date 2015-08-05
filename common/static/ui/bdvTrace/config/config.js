var T = $;

var config = {};

// 状态码
config.status = {
    success: 200,
    /*
    errLogin: 0, // 需要登录
    errAction: -1, // 错误的请求
    */
    errParam: -2, // 错误的参数
    /*
    errAdd: -3, // 订阅失败
    errDel: -4, // 退订失败
    */
    errLimited: -5, // 订阅已达上限
    errResult: -99 // 错误数据结构
};

// uc 模块的 errno 状态码
config.ucErrno = {
    success: 0,
    errParam: 10002, // 错误的参数
    errLimited: 10022 // 订阅已达上限
};

// uc 模块的 errno 状态码对应的 status
var ucStatusMap = {};
ucStatusMap[config.ucErrno.success] = config.status.success;
ucStatusMap[config.ucErrno.errParam] = config.status.errParam;
ucStatusMap[config.ucErrno.errLimited] = config.status.errLimited;
config.ucStatusMap = ucStatusMap;

// 更新阀值
config.threshold = {
    login: 300000, // 登录用户5分钟
    cookie: 3600000 // cookie 用户1小时
};

// 一些模块的特殊规则
config.rules = [
{
    type: 'short', // 短视频内嵌播放页
    test: function () {
        return /^\/kan\/[^(movie|tvplay|tvshow|comic|ugcrp)]/.test(location.pathname);
    },
    config: {
        tip: false,
        autoCheck: false,
        crossDomain: true
    }
}
];

// 远程服务域名
config.remoteHost = 'http://v.baidu.com';

/* ------------------------------------------------------------------------------------------------------------------ */
// 播放页前缀
var PLAY_URI = {
    tv: '/kan/tvplay/?',
    tvplay: '/kan/tvplay/?',
    show: '/kan/tvshow/?',
    tvshow: '/kan/tvshow/?',
    comic: '/kan/comic/?'
};

/**
 * 获取播放链接
 * @param {Object} item
 * @param {Object} ep
 * @returns {String}
 */
config.getPlayUrl = function (item, ep) {
    var url = 'javascript:;';

    if ((item && item.works_id && item.works_type)
        && (ep && ep.site && ep.is_play == 1)) {
        url = PLAY_URI[item.works_type];
        if (url) {
            url += T.stringFormat('id=#{id}&site=#{site}&n=#{n}',
                        { id: item.works_id, site: ep.site, n: ep.episode });
        }
    }

    return url;
};

/* ------------------------------------------------------------------------------------------------------------------ */
module.exports = config;
