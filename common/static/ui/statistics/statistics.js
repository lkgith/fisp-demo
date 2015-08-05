/**
 * @file 统计
 * @author fe
 */

/* global PAGE_DOM_READY_TIME */

var T = $;
var win = window;
var V = win.V = (function () {
    var cache = {};

    return {
        cache: {
            set: function (key, value) {
                return cache[key] = value;
            },

            remove: function (key) {
                delete cache[key];
            },

            get: function (key) {
                return cache[key];
            }
        }
    };
})();

var vConf = {
    logImgSrc: 'http://nsclick.baidu.com/v.gif',
    logParams: {
        pid: 104
    }
};

var paramToString = function (params) {
    var ret = '';
    for (var key in params) { // pid放在第一位
        if (params.hasOwnProperty(key) && typeof params[key] !== 'function' && key !== 'pid') {
            ret += '&' + key + '='
                + encodeURIComponent(decodeURIComponent(params[key]));
        }
    }

    return (params.pid ? 'pid=' + params.pid : '') + ret;
};

vConf.logParams.toString = function () {
    if (typeof this === 'string') {
        return this;
    }

    var params = this;

    return paramToString(params);
};

// private vars
var dataCache = {};
var pending = {};

// 统计相关配置
var config = {
    // 去重方式，0: 不去重 1: 局部 > 全局 2: 全局 > 局部
    // 为兼容已有逻辑，默认值设为0
    dedup: 0
};

// private function
function getModule(name) {
    var nameArr = name.split('.');
    var mod = nameArr[0];

    name = name.replace(mod, '').replace(/^\.*/, '');

    return {
        name: name,
        mod: mod
    };
}

// extend vui
V.addEventListener = function (name, func) {
    var moduld = getModule(name);
    var name = moduld.name;
    var mod = moduld.mod;
    var arg = [].slice.call(arguments, 1);

    dataCache[mod] = dataCache[mod] ? dataCache[mod] : {};
    dataCache[mod][name] = dataCache[mod][name] ? dataCache[mod][name] : [];

    dataCache[mod][name].push(func);

    if (pending[mod] && pending[mod][name]) {
        func.apply(this, pending[mod][name]);
        // free pending event
        delete pending[mod][name];
    }
};

V.dispatch = function (name) {
    var module = getModule(name);
    var name = module.name;
    var mod = module.mod;
    var arg = [].slice.call(arguments, 1);

    // excute event handle
    if (dataCache[mod] && dataCache[mod][name] && dataCache[mod][name].length > 0) {
        // forEach excute event's factory
        T.each(dataCache[mod][name], function (idx, item) {
            item.apply(this, arg);
        });
        return;
    }

    // pending event agvs
    pending[mod] = pending[mod] ? pending[mod] : {};
    pending[mod][name] = arg;
};

V.removeEventListener = function (name, func) {
    var module = getModule(name);
    var name = module.name;
    var mod = module.mod;
    var ret = [];

    if (dataCache[mod] && dataCache[mod][name]) {
        T.each(dataCache[mod][name], function (idx, item) {
            if (item.toString() !== func.toString()) {
                ret.push(item);
            }
        });
        dataCache[mod][name] = ret;
    }
};

// 统计
V.loadImg = function (src, callback) {
    if (!src) {
        return;
    }

    var t = new Date().getTime();
    // 生成一个图片对象
    var img = window['V_fix_img' + t] = new Image();
    var i = 0;

    img.onload = img.onerror = img.onabort = function () {
        callback && callback(img);
        img.onload = img.onerror = img.onabort = null;
        try {
            delete window['V_fix_img' + t];
            img = null;
        }
        catch (e) {
            // 完成后销毁生成的图片对象
            img = null;
        }

    };
    img.src = src + '&r=' + t;
};

/* eslint-disable fecs-max-statements */
function statisic(ev, options) {
    // extends options
    if (options) {
        options.logParams && (vConf.logParams = options.logParams);
        options.logImgSrc && (vConf.logImgSrc = options.logImgSrc);
    }

    var src = (options && options.logImgSrc) ? options.logImgSrc : vConf.logImgSrc;
    var enc = encodeURIComponent;
    // 事件源元素
    var el = ev.currentTarget;
    // 事件源所在的链接节点的url
    var href;
    // 事件源所在的链接节点的title
    var title;
    // 返回
    // 事件源所在的链接节点的statisic
    var statisic;
    var partStatic;
    var queryStr = '';
    var paramStr = '';
    var i = 0;
    var cmd;
    var dedup = config.dedup;

    // 不需要统计的元素，直接返回
    if (el.getAttribute('data-static')) {
        return;
    }
    // /读取元素href与title
    href = el.href || el.getAttribute('href', 2) || (el.value ? el.value : '');

    title = el.getAttribute('title', 2) || el.innerHTML;
    // 链接处理
    if (href && !(/^(javascript|#)/.test(href))) {
        href = href;
    }
    else {
        href = '';
    }
    // title处理
    if (title && !(/^\s*</i.test(title)) && !(/>\s*$/i.test(title))) {
        title = title;
    }
    else {
        title = '';
    }
    // 统计参数串
    // 公有参数

    paramStr = vConf.logParams.toString();

    // a 私有
    statisic = el.getAttribute('static', 2) || '';
    // 区域统计参数串
    partStatic = getParentAttr(el, 'static') || null;

    // 去重
    if (dedup) {
        (function () {
            var paramJson = typeof paramStr === 'string' && T.url.queryToJson(paramStr);
            var staticJson = typeof statisic === 'string' && T.url.queryToJson(statisic);
            var parJson = typeof partStatic === 'string' && T.url.queryToJson(partStatic);
            function returnValue(v) {
                return v;
            }
            // 局部 > 全局
            if (dedup === 1 && paramJson) {
                if (staticJson) {
                    for (var key in staticJson) {
                        if (paramJson[key]) {
                            delete paramJson[key];
                        }
                    }
                }
                if (parJson) {
                    for (var key in parJson) {
                        if (paramJson[key]) {
                            delete paramJson[key];
                        }
                    }
                }
                paramStr = T.url.jsonToQuery(paramJson, returnValue);

            // 全局 > 局部
            }
            else {
                if (dedup === 2 && paramJson) {
                    for (var key in paramJson) {
                        if (staticJson && staticJson[key]) {
                            delete staticJson[key];
                        }
                        if (parJson && parJson[key]) {
                            delete parJson[key];
                        }
                    }
                    if (staticJson) {
                        statisic = T.url.jsonToQuery(staticJson, returnValue);
                    }
                    if (parJson) {
                        partStatic = T.url.jsonToQuery(parJson, returnValue);
                    }
                }
            }
        }());
    }

    // extends partStatic?
    // statisic = T.object.extend(partStatic,statisic);
    statisic = (paramStr === '' ? '' : paramStr + '&') + (partStatic ? partStatic + '&' : '') + statisic;

    // 去除重复的值，保留最后面的一个
    statisic = statisic.match(/(?:[^&|^=]+=[^&]+)/g).join('&');

    var clt = T.url.getQueryValue(statisic, 'clt') || null;

    // 记录首次点击时间
    if (clt && !V.cache.get('STATISIC_' + clt) && PAGE_DOM_READY_TIME) {
        var clTime = (new Date()).getTime() - PAGE_DOM_READY_TIME;
        // param.clt = clt;
        V.cache.set('STATISIC_' + clt, clt);
    // PAGE_DOM_READY_TIME = null;
    }

    //
    queryStr = statisic;
    if (!/&?ti=([^&]+)?/.test(queryStr) && title) {
        queryStr += ('&ti=' + enc(title));
    }
    if (!/&?u=([^&]+)?/.test(queryStr) && href) {
        queryStr += ('&u=' + enc(href));
    }
    if (clTime) {
        queryStr += ('&clti=' + clTime);
    }
    // cmd
    // 可执行条件
    cmd = el.getAttribute('cmd') || null;
    // 使用cmd对统计参数进行处理时，需要返回处理好的字符串
    if (cmd) {
        try {
            var tempFun = Function('' + cmd + '')();
            if (T.isFunction(tempFun)) {
                var tempStr = tempFun(el, queryStr);
                if (T.isString(tempStr)) {
                    queryStr = tempStr;
                }
            }
        }
        catch (e) {}
    }

    var str = src + '?' + queryStr;
    // 发送统计请求
    V.loadImg(str);

    // 向上查找属性
    function getParentAttr(domEl, attr, deep) {
        deep = deep || 10;
        domEl = domEl.parentNode;

        if (!domEl || domEl === document.body || domEl === document.documentElement) {
            return;
        }

        var attribute = domEl.getAttribute(attr) || null;
        var i = 0;

        if (!attribute) {
            while (domEl && domEl !== document.body
                && domEl !== document.documentElement && domEl.getAttribute
                && !attribute && domEl.parentNode && domEl.parentNode.getAttribute && i <= deep) {

                domEl = domEl.parentNode;
                attribute = domEl.getAttribute(attr) || null;
                i += 1;
            }
        }
        return attribute;
    }
}
/* eslint-enable fecs-max-statements */

V.nsclick = statisic;
V.nsclick.setParam = function (key, value) {
    if (T.isString(vConf.logParams)) {
        var re = new RegExp('[&|\?]' + key + '=[^&]+');
        vConf.logParams = vConf.logParams.replace(re, '');
        vConf.logParams += '&' + key + '=' + value;
    }
    else {
        vConf.logParams[key] = value;
    }
};

V.nsclick.concatStr = function (str) {
    str = str.replace(/^&/, '');
    vConf.logParams += '&' + str;
};

V.nsclick.extString = function (str) {
    var params = str.split('&');
    var param;
    var i = 0;
    var l = params.length;

    for (; i < l; i += 1) {
        param = params[i].split('=');
        if (param.length === 2) {
            V.nsclick.setParam(param[0], param[1]);
        }
    }
};

/**
 * 发送统计参数
 * @param  {mixed} params     要发送的统计参数，Object 或者 Function，Function返回Object或string
 * @param  {Object} defaults  默认pid=104，并且页面会配置refer、tn等参数，此参数会替换默认配置，仅当次有效
 * @param  {string} imgSrc    统计图片地址，可根据需要发送v.gif，p.gif，u.gif
 */

/*V.nsclick.send({
    login: true,
    bl: 'top_area'
}, {
    pid: 109,
    tn: 'search'
}, 'http://nsclick.baidu.com/u.gif');
V.nsclick.send(function () {
    var para = {
        site: 'vbaidu',
        bl: 'test'
    };

    if (~location.hostname.indexOf('.hao123.com')) {
        para.site = 'hao123';
        para.pid = 120;
    }

    return para;
});
V.nsclick.send(function () {
    return '&bl=asd&pid=233&tn=asdf';
});
*/

V.nsclick.send = function (params, defaults, imgSrc) {
    var defaultParams = $.extend({}, defaults || vConf.logParams);
    delete defaultParams.toString; // 删除无用的

    var strParam = '';
    if ($.isPlainObject(params)) {
        $.extend(defaultParams, params);
    }
    else if ($.isFunction(params)) {
        var ret = params();
        if ($.isPlainObject(ret)) {
            $.extend(defaultParams, ret);
        }
        else {
            ret && (strParam += ret);
        }
    }

    var logStr = paramToString(defaultParams);
    var regPid = /pid=(\d+)/;
    if (regPid.test(strParam)) {
        var pid = RegExp.$1;
        logStr = logStr.replace(regPid, function () {
            return 'pid=' + pid;
        });
        strParam = strParam.replace(regPid, '');
    }

    strParam && (logStr += '&' + strParam.replace(/^&*/, '').replace(/&&*/g, '&'));

    V.loadImg((imgSrc || vConf.logImgSrc) + '?' + logStr);
};

/**
 * 统计相关配置
 * @param {Object} options 参数
 */
V.nsclick.setConfig = function (options) {
    T.extend(config, options);
};

$(document.body).on('mousedown', 'a', V.nsclick);
