var T = $,
    cookie = T.cookie,
    config = require('common:static/ui/bdvTrace/config/config.js');

/* ------------------------------------------------------------------------------------------------------------------ */
var ctor = function () {};
/**
 * 继承
 * @param  {Function} parent
 * @param  {Function|Object} protoProps
 * @param  {Object} staticProps
 * @return {Function}
 */
var inherits = function (parent, protoProps, staticProps) {
    var child,
        extend = T.extend;

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
    extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    protoProps && extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    staticProps && extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

/**
 * 延迟执行
 * @param {Function} callback
 * @param {Number} time
 * @returns {Number}
 */
function delay(callback, time) {
    time = parseInt(time, 10);

    if (isNaN(time)) {
        time = 0;
    }

    return setTimeout(callback, time);
}

/**
 * 首字母大写
 * @param  {String} s
 * @return {String}
 */
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/**
 * 追剧核心，主要负责逻辑控制
 * @desc:
 *  检测更新条件：1.登录用户 2.最近更新时间
 * @param {Object} options
 */
var BdvTraceCore = function (options) {
    options = options || {};

    this.crossDomain = typeof options.crossDomain !== 'undefined' ? options.crossDomain : false;
    this.isLogin = options.isLogin;

    this.cache = []; // 缓存分页数据
    this.recGroups = null; // 推荐组数据

    this.pageSize = options.pageSize || 2;
    this.pageNo = 1;
    this.pages = 0;
    this.size = 0;

    // 检查更新的赋值
    this._threshold = this.isLogin ? config.threshold.login : config.threshold.cookie;
    this._cookieKey = 'BDV_TRACE';
    this._lastTime = 0; // 最近更新时间
    this._sign = ''; // 更新签名
    this._isLoading = false; // 是否请求中
    this.callbacks = {}; // 事件中心

    this._initialize();
}
BdvTraceCore.prototype = {
    fire:function(type, opts){
        if(type in this.callbacks && this.callbacks[type].length){
            for(var i=0;i<this.callbacks[type].length;i++){
                this.callbacks[type][i](opts);
            }
        }else if(this['on'+type]){
            this['on'+type](opts);
        }
    },
    on:function(type, callback){
        if(type in this.callbacks){
            this.callbacks[type].push(callback);
        }else{
            this.callbacks[type] = [callback];
        }
    },
    // 内部初始化函数，建议不要重写
    _initialize: function () {
        var trace = cookie.getRaw(this._cookieKey);

        if (!trace || trace.indexOf(':') === -1) { // cookie 中没有记录
            this._updateTrace();
            this._lastTime -= this._threshold + 1; // 前置最近更新时间，用于激活首次调用函数 check 的逻辑
        } else {
            trace = trace.split(':');
            this._lastTime = trace[0] * 1;
            this._sign = trace[1] || '';
        }

        this.initialized();
    },
    // 初始化之后，外部重写
    initialized: function () {
    },
    /**
     * 订阅列表加载成功
     * @param {Object} evt
     */
    onListSuccess: function (evt) {
        if (!(evt && evt.query && evt.result)) {
            return;
        }

        this.pageNo = evt.query.pn;
        var pageData = this._processResult(evt.result);
        this._render(pageData);
    },
    /**
     * 处理追剧数据
     * @private
     * @param  {Object} result
     * @return {Array} pageData
     */
    _processResult: function (result) {
        this.size = parseInt(result.data_num, 10);
        this.pages = this.size > 0 ? Math.ceil(this.size / this.pageSize) : 0;

        var pageData = result.data;
        if (this._sign != result.update_sign) { // 追剧有更新
            this._sign = result.update_sign;
            this._updateTrace();
            if (pageData && pageData.length) { // 有数据
                // console.log('fire.notify');
                this.fire('notify');
            }
        }

        if (result.similar && result.similar.length) { // 推荐数据
            this.recGroups = result.similar;
        }

        return this.processPageData(pageData);
    },
    /**
     * 处理分页数据
     * @param  {Array} pageData
     * @return {Array}
     */
    processPageData: function (pageData) {
        this.cache[this.pageNo] = pageData;
        return pageData;
    },
    // 订阅成功
    onAddSuccess: function () {
        var me = this;
        delay(function () {
            me._afterCud(true);
        }, 0);
    },
    // 退订成功
    onDelSuccess: function () {
        var me = this;
        delay(function () {
            me._afterCud(true);
        }, 0);
    },
    // 更新成功
    onUpdateSuccess: function () {
        this._afterCud(false);
    },
    /**
     * 新增、更新、删除操作之后执行
     * @param {Boolean} refresh
     */
    _afterCud: function (refresh) {
        this.cache = []; // 清除缓存
        this._sign = 0; // 重置下签名
        this._updateTrace();
        refresh && this.list({ pn: 1, ps: this.pageSize }); // 刷新第一页
    },
    // 更新 trace 记录，目前存储在 cookie 中
    _updateTrace: function () {
        this._lastTime = new Date().getTime();
        cookie.setRaw(this._cookieKey, (this._lastTime + ':' + this._sign), {
            expires: 604800000, // 1 week: 1000 * 60 * 60 * 24 * 7
            path: '/'
        });
    },
    /**
     * 渲染
     * @private
     * @param {Array} pageData
     */
    _render: function (pageData) {
        var me = this;

        delay(function () {
            me.fire('render', {
                pageData: pageData,
                pageMeta: { pageNo: me.pageNo, pageSize: me.pageSize, pages: me.pages, size: me.size }
            });
        }, 0);
    },
    // 检测是否需要下载追剧数据
    check: function () {
        var now = new Date().getTime(),
            isUpdate = now - this._lastTime > this._threshold;
        // console.log('%d - %d > %d => isUpdate: %s', now, this._lastTime, this._threshold, isUpdate);
        if (isUpdate) {
            this._lastTime = new Date().getTime(); // 预先设置下最近更新时间，防止接口挂掉后产生的请求雪崩。
            this.list();
        }
    },
    /**
     * 追剧列表
     * @param {Object} params
     */
    list: function (params) {
        params = params || { pn: this.pageNo, ps: this.pageSize };

        if (!params.pn) {
            params.pn = this.pageNo;
        }
        if (!params.ps) {
            params.ps = this.pageSize;
        }

        if (this.cache[params.pn]) {
            this.pageNo = params.pn;
            this._render(this.cache[params.pn]);
        } else {
            this._request('list', params);
        }
    },
    /**
     * 订阅
     * @param {Object} params
     * @param {Function} callback
     */
    add: function (params, callback) {
        params = params || {};

        if (params.type && params.works_id) {
            params.last_view = params.last_view || 0;
            this._request('add', params, callback);
        } else {
            callback && callback(config.status.errParam);
        }
    },
    /**
     * 退订
     * @param {Object} params
     * @param {Function} callback
     */
    del: function (params, callback) {
        params = params || {};

        if (params.type && params.works_id) {
            this._request('del', params, callback);
        } else {
            callback && callback(config.status.errParam);
        }
    },
    /**
     * 注意！更新剧集的操作统一在进入播放页时处理
     * 更新追剧记录
     * @param {Object}   params
     * @param {Function} callback
     */
    update: function (params, callback) {
        /*params = params || {};

        if (params.type && params.works_id && params.last_view) {
            this._request('update', params, callback);
        } else {
            callback && callback(config.status.errParam);
        }*/
    },
    /**
     * 请求
     * @private
     * @param {String} type
     * @param {Object} params
     * @param {Function} callback
     */
    _request: function (type, params, callback) {
        if (this._isLoading || !type) {
            return;
        }

        var me = this;
        me._isLoading = true;
        params['_t'] = new Date().getTime();

        var url = me.getRequestUrl(type, params);
        var onSuccess = function (data) {
            me._isLoading = false;

            var result = { status: config.status.errResult };
            if (data) {
                if (T.isString(data)) {
                    try {
                        result = T.parseJSON(data);
                    } catch (e) {
                        // console.dir(e);
                    }
                } else if (typeof data == 'object') {
                    result = data;
                }
            }

            // 来自 uc 模块的数据结构
            if (result && typeof result.errno !== 'undefined') {
                var t = { status: config.ucStatusMap[result.errno] || result.errno };
                if (typeof result.data !== 'undefined') {
                    T.extend(t, result.data);
                }
                result = t;
            }

            callback && delay(function () { // 伪并行执行外部处理函数
                callback(result.status);
            }, 0);

            var eName = capitalizeFirstLetter(type);
            eName += result && result.status == config.status.success ? 'Success' : 'Error';
            me.fire(eName, { query: params, result: result }); // 派发事件
        };
        if (me.crossDomain) { // 跨域时向 v.baidu.com 请求 jsonp
            T.ajax(url,{
                dataType:'jsonp',
                success:function (data){
                    onSuccess(data);
                }
            });
        } else {
            T.get(url, onSuccess);
        }
    },
    /**
     * 获取请求 URL
     * @param  {String} type
     * @param  {Object} params
     * @return {String}
     */
    getRequestUrl: function (type, params) {
        var url = [ '/uc/follow/', type, '/?', T.url.jsonToQuery(params) ].join('');
        return this.crossDomain ? config.remoteHost + url : url;
    }
};

// static method: 延迟
BdvTraceCore.delay = delay;

// static method
BdvTraceCore.capitalizeFirstLetter = capitalizeFirstLetter;

// static method: 继承；也可以用 T.lang.createClass 本身的静态函数 extend，但不能扩展 staticProps
BdvTraceCore.extend = function (protoProps, staticProps) {
    var child = inherits(this, protoProps, staticProps);
    child.extend = this.extend;
    return child;
};

/* ------------------------------------------------------------------------------------------------------------------ */
module.exports = BdvTraceCore;
