/**
 * @file 广告位mis数据组件
 * @author picheng@baidu.com
 */

var loginCheck = require('common:static/ui/loginCheck/loginCheck.js');

// 数据接口
// mis -> PC管理 -> 公共区块配置 -> 广告列表
// wiki: http://wiki.baidu.com/pages/viewpage.action?pageId=105290550
// http://v.baidu.com/videoapi/?page_name=navcommon&block_sign=list_common_ad_list&format=json&callback=bdvMisAdBlock
var api = 'http://v.baidu.com/staticapi/misadlist.json';

// 数据缓存
var dataCache = {};

// 等待获取广告位的队列，数据ready前请求会push到队列中
var queue = [];

var ready = false;

var loading = false;

// 请求数据
function request() {
    if (ready || loading) {
        return;
    }
    loading = true;
    $.ajax({
        url: api,
        dataType: 'jsonp',
        jsonpCallback: 'bdvMisAdBlock',
        success: function (result) {
            receive(result);
            ready = true;
            loading = false;
        }
    });
}

// 接收数据
function receive(result) {
    var ads;

    // 取广告区块数据common_ad_list
    $.each(result, function (index, item) {
        if (item.name === 'common_ad_list') {
            ads = (item.data && item.data.videos) || [];
            return false;
        }
    });

    processor(ads, function (data) {
        // 广告Array转为key-value结构
        $.each(data, function (index, item) {
            if (item.sub_title) {
                var ad = dataCache[item.sub_title] || (dataCache[item.sub_title] = []);
                ad.push(item);
            }
        });

        $.each(queue, function (index, item) {
            getAd(item.name, item.callback);
        });
    });
}

// 根据登录状态处理数据
function processor(data, callback) {
    loginCheck(function (user) {
        var ads = [];
        var state = user && user.value ? 1 : 2;
        $.each(data, function (index, item) {
            // 值为1: 对登录用户不可见，2: 对未登录用户不可见
            if (Number(item.rating) !== state) {
                ads.push(item);
            }
        });
        callback(ads);
    });
}

// 获取广告位数据
// @param {string|array} name 广告位名称，对应mis数据中的副标题字段sub_title
function getAd(name, callback) {
    if (typeof name === 'object' && name.length) {
        getList(name, callback);
        return;
    }
    var ad = dataCache[name];
    if (ad) {
        // 如果有多个广告物料，随机取一个
       // ad = ad.length > 1 ? ad[Math.floor(Math.random() * ad.length)] : ad[0];
    }
    callback(ad);
}

// 获取多个广告位数据
function getList(names, callback) {
    var data = {};
    var num = names.length;
    var i = 0;
    $.each(names, function (index, name) {
        getAd(name, function (ad) {
            data[name] = ad;
            if (++i === num) {
                callback(data);
            }
        });
    });
}

exports.get = function (name, callback) {
    if (typeof name !== 'string' && !name.length || typeof callback !== 'function') {
        return;
    }
    if (ready) {
        getAd(name, callback);
    }
    else {
        queue.push({
            name: name,
            callback: callback
        });
        request();
    }
};
