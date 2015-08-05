var _ = require('common:static/vendor/underscore/underscore.js')._;

window.console = window.console || {log: function () {}};
/*
* 页面相关配置项
* */
var videoConfig= {
    //       baseUrl: '/',
    baseUrl: 'http://v.baidu.com/',
//        baseUrl: 'http://tc-apptest-video01.tc.baidu.com/',

        // verify captcha url
//        captchaPrefix: 'http://10.46.135.27:8086/captcha/genimage?codestr=',
        captchaPrefix: 'http://captcha.baidu.com/captcha/genimage?codestr=',

    getRemoteUrl: function(type) {
    return this.baseUrl + type + '_intro/';
},
    getJumpUrl: function(type) {
        return this.baseUrl + type + '/';
    },
    PrefixMap: {
        movie: 'kan/movie/?',
            tv: 'kan/tvplay/?',
            show: 'kan/tvshow/?',
            comic: 'kan/comic/?'
    },
    getPlayUrlPrefix: function(type) {
        return this.baseUrl + (this.PrefixMap[type] || '');
    },
    isPreview: function() {
        return location.href.match(/test=test/);
    },
    dataType: {
        periphery: {
            movie: 'periphery',
                tv: 'tvPeriphery',
                comic: 'comicPeriphery',
                show: 'showPeriphery'
        }
    },
    siteVipProxies:['wasu.cn','letv.com','m1905.com','baofeng.com','funshion.com','pptv.com']
}



/**
 * 继承
 */
var ctor = function () {};
var inherits = function (parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            parent.apply(this, arguments);
        };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

var BView = function (options) {
    this.initialize
    && this.initialize.call(this, options);
};
BView.extend = function (protoProps, staticProps) {
    var child = inherits(this, protoProps, staticProps);
    child.extend = this.extend;
    return child;
};


/**
 * 基础视图类
 * @constructor
 * @param {options.data}
 * @param {options.el}
 */
var BaseView = BView.extend({
    initialize: function(options) {
        this.data = options.data;
        this.el = options.el;
        this.parent = options.parent;
    },
    /**
     * 绑定dom元素
     */
    bindEl: function() {},
    /**
     * 绑定事件接口
     */
    bindEvents: function() {},
    /**
     * 视图模版
     */
    template: _.template("<div><%=data.title%></div>"),
    insertHTML: function() {
        this.el.innerHTML = vApp.stripHTML(this.template({data: this.data}));
    },
    /**
     * 渲染
     */
    render: function() {
        this.insertHTML();
        this.bindEl();
        this.bindEvents();
    }
});

/** Start vApp ----------------------------------------------------------------------------------------------------- */
var vApp = window.vApp = {};

/**
 * 评分
 */
vApp.renderRating = function (rating) {
    rating = rating + "";
    return rating ? rating.replace(/(\d+)(\.\d+)/, "$1<span>$2</span>") : "";
};

/**
 * 伸缩简介详情
 * @param {string} id
 */
vApp.toggleIntro = function (id) {
    var introWrapper = T(id)[0],
        parent = introWrapper.parentNode,
        txt = '',
        toggleIcon = T(parent).find('span.toggle')[0],
        toggleHolder = T(parent).find('a.js-toggle-holder')[0];
    introWrapper.innerHTML = '';
    if (T(toggleIcon).hasClass('toggle-open')) {
        toggleHolder.innerHTML = '收起';
        toggleIcon.className = 'toggle toggle-close';
        txt = T(parent).find('input[name=longIntro]')[0].value;
    } else {
        toggleHolder.innerHTML = '详情';
        toggleIcon.className = 'toggle toggle-open';
        txt = T(parent).find('input[name=shortIntro]')[0].value;
    }
    introWrapper.appendChild(document.createTextNode(txt));
};

/**
 * html编码
 */
vApp.encodeHTML = function (str) {
    var str = String(str)
        .replace(/&quot;/g,'"')
        .replace(/&lt;/g,'<')
        .replace(/&gt;/g,'>')
        .replace(/&amp;/g, "&");
    //处理转义的中文和实体字符
    return str.replace(/&#([\d]+);/g, function(_0, _1){
        return String.fromCharCode(parseInt(_1, 10));
    });
};

/**
 * 特殊字符解码
 */
vApp.hEncode = function (str) {
    return str.replace(/&#x26/g, '&').replace(/&#x22/g, '&#x22;').replace(/&#x27/g, '&#x27;');
};

/**
 * 获取字符串长度，中文2，英文1
 */
vApp.getStringLen = function (str) {
    var strLen = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 128) {
            strLen += 2;
        } else {
            strLen++;
        }
    }
    return strLen;
};

/**
 * 截取中英文字符串
 */
vApp.setString = function (str, len) {
    var strLen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 128) {
            strLen += 2;
        } else {
            strLen++;
        }
        s += str.charAt(i);
        if (strLen >= len) {
            return s + (i == str.length - 1 ? "" : "...");
        }
    }
    return s;
};

/**
 * 跳转至播放页
 * @param {number} isPlay 是否可播放
 * @param {string} urlPrefix 可播放前缀
 * @param {string} url 第三方地址
 * @param {string} canPull 能否拉起
 * @param {string} id 拼接拉起url参数
 * @param {string} type 拼接拉起url参数,如:movie
 * @param {string} title 拼接拉起url参数,如:敢死队
 */
vApp.toRightPage = function (isPlay, urlPrefix, url, canPull, id, type, title, site, episode, year) {
    var playUrl = isPlay == 1 ? urlPrefix + url.replace('&', '%26') : url;
    if (!this.getIsVideoBrowser() && canPull) {
        var bdvdUrlPre = 'bdvb://play/?url=', urlParam = '';
        id && (urlParam += ('&id=' + id));
        type && (urlParam += ('&type=' + type));
        title && (urlParam += ('&title=' + title));
        site && (urlParam += ('&site=' + site));
        episode && (urlParam += ('&episode=' + episode));
        year && (urlParam += ('&year=' + year));
        if (/(MSIE)/.test(navigator.userAgent)) {
            try {
                new ActiveXObject("ACTIVEXBDVB.ActiveXbdvbCtrl.1");
                playUrl = bdvdUrlPre + url + urlParam;
            } catch (e) {}
        } else {
            if (navigator.plugins["WebKit Test PlugIn"]) {
                playUrl = bdvdUrlPre + url + urlParam;
            }
        }
    }
    return playUrl;
};

vApp._stripPattern = new RegExp(">(([\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24))<", "g");
vApp.stripHTML = function (str) {
    return str.replace(/\t/g, "").replace(this._stripPattern, "><");
};

/**
 * 非a标签统计
 */
vApp.sitesClick = function (arg) {
    V.loadImg("http://nsclick.baidu.com/v.gif?" + arg);
};

/** 判断客户端是否是百度浏览器 */
vApp.getIsVideoBrowser = function () {
    return this.isVideoBrowers === undefined ? (this.isVideoBrowers = navigator.userAgent.indexOf('Chrome/23.0.1263') > -1) : this.isVideoBrowers;
};

/** 是否开启视频浏览器推广 */
vApp.browersPromotion = false;

/**
 * 检测是否支持拉起
 * @return {bool} canPull 是否能拉起
 */
vApp.canPullBdvb = function () {
    var canPull = false;
    if (/(MSIE)/.test(navigator.userAgent)) {
        try {
            var bdvd = new ActiveXObject("ACTIVEXBDVB.ActiveXbdvbCtrl.1");
            canPull = true;
        } catch (e) {}
    } else {
        if (navigator.plugins["WebKit Test PlugIn"]) {
            canPull = true;
        }
    }
    //return canPull;
    /*关闭拉起*/
    return false;
};

/**
 * url地址跳转（浏览器拉起）
 */
vApp.pullDdvb = function (url, urlhash, id, type, title) {
    var urlRtn, bdvdUrlPre = 'bdvb://play/?url=';
    if (/(MSIE)/.test(navigator.userAgent)) {
        try {
            var bdvd = new ActiveXObject("ACTIVEXBDVB.ActiveXbdvbCtrl.1");
            urlRtn = (urlhash ? (bdvdUrlPre + urlhash + '&id=' + id + '&type=' + type + '&title=' + title) : url);
        } catch (e) {
            urlRtn = url;
        }
    } else {
        if (navigator.plugins["WebKit Test PlugIn"]) {
            urlRtn = (urlhash ? (bdvdUrlPre + urlhash + '&id=' + id + '&type=' + type + '&title=' + title) : url);
        } else {
            urlRtn = url;
        }
    }
    return urlRtn;
};

vApp.isDebug = true;
//vApp.isDebug = false;
vApp.debug = function(o) {
    if (this.isDebug) {
        console && console.log(o);
    }
};

/**
 * 按秒获取“00:00”格式的播放时间
 * @param {string} str
 * @return {string}
 */
vApp.getPlayDuration = function(str) {
    str = parseInt(str);
    var s = str % 60, m = Math.floor(str / 60), h = m >= 60 ? Math.floor(m / 60) : 0, holder = '';
    if (h > 0) {
        m = m % 60;
        holder = (h > 10 ? h : ('0' + h)) + ':';
    }
    return holder + (m === 0 ? '00' : (m > 9 ? m : ('0' + m)) ) + ':' + (s > 9 ? s : ('0' + s));
};

/**
 * 浏览器信息
 * @param ua
 * @returns {{browser: (*|string), version: (*|string)}}
 */
vApp.browser = function(ua) {
    var ua = ua || navigator.userAgent;
    ua = ua.toLowerCase();
    var match = /(ipad).*os\s([\d_]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) ||
        [];
    return { browser: match[1] || "", version: match[2] || "0" };
};
//判断来源是否是影棒
vApp.isFromYB =function (){
    var url = window.location.href,isFromYb = false;
    if(url && url.indexOf('from=yb') != -1){
        isFromYb = true;
    }
    return isFromYb;
}
//播放地址重置
vApp.getPlayUrl = function(vid,type,params){
    var rawurl = params.url || params.link || '';
    var site = params.site || '';
      if(rawurl.match(/(youku\.com)|(tudou\.com)|(qq\.com)|(sohu\.com)/)){
        return rawurl;
      }else{
        return videoConfig.getPlayUrlPrefix(type)+"id="+vid+"&site="+site+"&url="+rawurl;
    }
}
/** End vApp ------------------------------------------------------------------------------------------------------- */

exports.BView =  BView;
exports.BaseView = BaseView;
exports.vApp = vApp;
exports.tmpl = _.template;
exports.config = videoConfig;
