/********************************************
 *
 * @file advList.js
 * @author shangwenhe, picheng
 * global tmpl
 *
 *********************************************/
/* global tmpl */
/* global __inline */
/* eslint-disable fecs-camelcase */
require('common:static/ui/tmpl/tmpl.js');
var $ = require('common:static/vendor/jquery/jquery.js');
var _ = require('common:static/vendor/underscore/underscore.js');
var admis = require('common:static/ui/admis/admis.js');

// 页面上的广告位
var advPositions = {};

/*
 * @attention:悬浮广告位置目前使用cookie判断是否展现，与顶部的banner逻辑不一致，顶部通过cookie
 *	直接不render,但是悬浮广告位有开关按钮，所以默认悬浮广告位部分是隐藏的，通过cookie判断是否展现。
 */

function MisOutputAd() {}
    // 初始化方法
MisOutputAd.prototype.init = function () {
    // 渲染模板
    this.getData(this.render);
};
MisOutputAd.prototype.collection = {
    indexRightTop: {
        id: 'index_right_top',
        // 右侧肩膀图
        html: __inline('./tmpl/indexRightTop.tmpl'),
        filter: function () {
            // 大的过滤条件 refer,domain
            // 大搜及品专不需要展示广告
            if ((document.referrer && /www\.baidu\.com/.test(document.referrer)) || /frp=bdbrand/.test(location.href)) {
                return false;
            }
            return true;
        },
        action: function (fid) {}
    },
    indexRightFloat: {
        id: 'index_right_float',
        // 右侧浮动广告
        html: __inline('./tmpl/indexRightFloat.tmpl'),
        filter: function () {
            // 大的过滤条件 refer,domain
            // 大搜及品专不需要展示广告
            if ((document.referrer && /www\.baidu\.com/.test(document.referrer)) || /frp=bdbrand/.test(location.href)) {
                return false;
            }
            return true;
        },
        action: function () {
            // 悬浮广告位展现逻辑
            var $adList = $('.index_AD_right_fixed');

            var rightCookie = {
                bdv_adRightFloat0: '#adRightFloat0',
                bdv_adRightFloat1: '#adRightFloat1',
                bdv_adRightFloat2: '#adRightFloat2',
                bdv_adRightFloat3: '#adRightFloat3',
                bdv_right_ad_poster: '#adRightFloatBig'
            };
            _.each(rightCookie, function (value, key) {
                if (!$.cookie.get(key)) {
                    $(value).removeClass('AD-close-status');
                }
            });

            // 是否需要展现广告开关，有广告并且是因为cookie隐藏
            if ($adList && $adList.length && $('.index_AD_right_fixed.AD-close-status').length) {
                $('.index_AD_right_close').show();
            }
            // 悬浮位大广告展现逻辑,5秒倒计时自动关闭
            if (!$('#adRightFloatBig').hasClass('AD-close-status')) {
                var number = 5;
                $('#adRightFloatBig').append($('<span class=\'time-num\'><b>5</b>秒后自动关闭</span>'));
                var $timer = $('.time-num b');
                var pid = setInterval(function () {
                    if (number <= 0) {
                        $('#adRightFloatBig').addClass('AD-close-status');
                        $timer.parent().remove();
                        $.cookie.set('bdv_right_ad_poster', '1', {
                            expires: 864e4,
                            path: '/'
                        });
                        clearInterval(pid);
                    }
                    else {
                        $timer.html(number--);
                    }
                }, 1000);
            }
            // 右侧悬浮关闭监听
            $('.index_AD_right_fixed .close').on('click', function () {
                var parentEle = $(this).parent();
                var adID = parentEle.attr('id');
                $('.index_AD_right_close').show();
                if (parentEle.hasClass('AD-close-status')) {
                    parentEle.removeClass('AD-close-status');
                    $('.index-right-float-big').removeClass('AD-close-status');
                }
                else {
                    parentEle.addClass('AD-close-status');
                    $('.index-right-float-big').addClass('AD-close-status');
                }
                $.cookie.set('bdv_' + adID, '1', {
                    expires: 864e4,
                    path: '/'
                });
            });
            // 打开广告
            $('.index_AD_right_close').on('click', function () {
                _.each(rightCookie, function (value, key) {
                    $.cookie.remove(key);
                });
                $(this).hide().parent().find('.index_AD_right_fixed').removeClass('AD-close-status');
                // $('.adContainer').removeClass('AD-hide-status');
            });
            // hover到浮层展现大广告
            $('.adContainer').on('mouseover', function () {
                // $(this).removeClass('AD-hide-status');
                $('#adRightFloatBig').removeClass('AD-close-status');
            });
            $('.adContainer').on('mouseleave', function () {
                // $(this).addClass('AD-hide-status');
                $('#adRightFloatBig').addClass('AD-close-status');
            });

        }
    },
    indexBannerTop: {
        id: 'index_banner_top',
        // 顶部通栏
        html: __inline('./tmpl/indexBannerTop.tmpl'),
        filter: function () {
            // 大的过滤条件 refer,domain
            // 大搜及品专不需要展示广告
            if ((document.referrer && /www\.baidu\.com/.test(document.referrer)) || /frp=bdbrand/.test(location.href)) {
                return false;
            }
            // banner广告先取cookie
            if ($.cookie.get('bdv_top_ad_banner')) {
                return false;
            }
            return true;
        },
        action: function (fid) {
            // 顶部通栏广告关闭监听函数
            $('#' + fid).on('click', '.btnTopBannerClose', function () {
                var date = new Date();
                var hours = (23 - date.getHours()) * 3600;
                var minute = (59 - date.getMinutes()) * 60;
                $(this).parent('.ad-top-banner').hide();
                // 当天不再显示
                $.cookie.set('bdv_top_ad_banner', '1', {
                    expires: (hours + minute) * 1000,
                    path: '/'
                });
            });

        }
    },
    // 检索结果页顶部通栏广告
    event2014Warmup: {
        id: 'event_2014_warmup',
        html: __inline('./tmpl/searchBannerTop.tmpl'),
        filter: function () {
            // 大的过滤条件 refer,domain
            // 大搜及品专不需要展示广告
            if ((document.referrer && /www\.baidu\.com/.test(document.referrer)) || /frp=bdbrand/.test(location.href)) {
                return false;
            }
            // banner广告先取cookie
            if ($.cookie.get('bdv_search_top_banner')) {
                return false;
            }
            return true;
        },
        action: function (fid) {
            // 顶部通栏广告关闭监听函数
            $('#' + fid).on('click', '.btnTopBannerClose', function () {
                var date = new Date();
                var hours = (23 - date.getHours()) * 3600;
                var minute = (59 - date.getMinutes()) * 60;
                $(this).parent('.ad-top-banner').hide();
                // 当天不再显示
                $.cookie.set('bdv_search_top_banner', '1', {
                    expires: (hours + minute) * 1000,
                    path: '/'
                });
            });
        }
    },
    indexBannerBottom: {
        id: 'index_banner_bottom',
        // 底部通栏
        html: __inline('./tmpl/indexBannerBottom.tmpl'),
        filter: function () {
            // 大的过滤条件 refer,domain
            // 大搜及品专不需要展示广告
            if ((document.referrer && /www\.baidu\.com/.test(document.referrer)) || /frp=bdbrand/.test(location.href)) {
                return false;
            }
            return true;
        },
        action: function () {}
    }
};
// 取得广告位的数据
MisOutputAd.prototype.getData = function (fn) {
    var map = this.bdvAdCache = {};
    var that = this;
    admis.get(['右侧悬浮', '右侧肩膀图', '顶部通栏', '检索端顶部通栏', '底部通栏'], function (ads) {
        map.indexRightTop = ads['右侧肩膀图'];
        map.indexRightFloat = ads['右侧悬浮'];
        map.indexBannerTop = ads['顶部通栏'];
        map.event2014Warmup = ads['检索端顶部通栏'];
        map.indexBannerBottom = ads['底部通栏'];
        typeof fn === 'function' && fn(that, map);
    });
};

// 渲染模板
MisOutputAd.prototype.render = function (that, data) {
    _.each(data, function (item, key, list) {
        // 过滤已经关闭的内容
        var filter = that.collection[key].filter && that.collection[key].filter();
        if (filter
            // 匹配在页面中的KEY并进行展示
            && (that.collection[key].id in advPositions)) {
            var html = that.collection[key].html({
                data: item
            });
            $('#' + that.collection[key].id).html(html);
            that.collection[key].action(that.collection[key].id);
        }
    });
};

var misAD = new MisOutputAd();

exports.init = function () {
    $(document).ready(function () {
        misAD.init();
    });
};
// 添加广告位置
exports.push = function (fn) {
    var adKey = fn();
    advPositions[adKey.id] = adKey;
};
/* eslint-enable fecs-camelcase */
