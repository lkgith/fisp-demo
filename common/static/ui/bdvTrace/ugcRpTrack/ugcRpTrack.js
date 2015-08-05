var T = $,
    cookie = T.cookie,
    stringFormat = T.stringFormat,
    // store = require('common:vs/store'),
    bdvTraceCore = require('common:static/ui/bdvTrace/core/core.js'),
    config = require('common:static/ui/bdvTrace/config/config.js');

var ABTest = require('common:static/ui/ABTest/ABTest.js'),
    test;

/* ------------------------------------------------------------------------------------------------------------------ */
/**
 * 串联 obj[before] 与 obj[after]，并在第一次执行后替换 obj[before] 为 obj[after]
 * @param {Object} obj
 * @param {String} before
 * @param {String} after
 */
/*function lazyRun(obj, before, after) {
    var b = obj[before],
        a = obj[after];

    obj[before] = function () {
        b.apply(this, arguments);
        a.apply(this, arguments);
        obj[before] = obj[after];
    };
}*/

var nativeArrayIndexOf = Array.prototype.indexOf;
/**
 * array.indexOf
 * @param  {Array} arr
 * @param  {*} value
 * @return {Number}
 */
function indexOf(arr, value) {
    function indexof(arr, value){
        for(var i=0;i<arr.length;i++){
            if(arr[i]=== value) return i;
        }
        return -1;
    }
    return nativeArrayIndexOf ? nativeArrayIndexOf.call(arr, value) : indexof(arr, value);
}

/**
 * 记录对象转成 CSV 格式
 * @param  {Object} obj
 * @return {String}
 */
function record2CSV(obj) {
    var csv = [];

    if (T.isPlainObject(obj)) {
        for (var key in { id: 1, type: 1, last_view: 1 }) {
            csv.push(obj[key]);
        }
    }

    return csv.join(',');
}

// 延时函数
var delay = bdvTraceCore.delay;

/* ------------------------------------------------------------------------------------------------------------------ */
// PC 端根据 cookie 用户观看记录推荐的追剧 *** 一般只推一屏数据 ***
var BdvTraceUgcRpTrack = bdvTraceCore.extend({
    __type: 'BdvTraceUgcRpTrack',
    initialized: function () {
        this.records = null; // 追剧记录

        /*
        this._store = null;
        this._storeKey = 'TRACK_DEL'; // 退订作品的 storeKey
        this._storeExpire = 604800000; // 1 week
        this.shieldMax = 20; // 屏蔽单类作品的最大值
        this.storeData = null;

        // 串联函数
        lazyRun(this, 'loadStoreData', '__loadStoreData');
        */
    },
    /*
    // 获取 store 中的 cache 数据
    __loadStoreData: function () {
        this.storeData = this._store.get(this._storeKey);
    },
    // 创建 store，调用一次后会被 _loadStoreData 替换！
    loadStoreData: function () {
        this._store = store.create(true);
    },
    updateStoreData: function (data) {
        data = data || this.storeData;
        if (data) {
            this._store.set(this._storeKey, data, this._storeExpire);
            this.storeData = data;
        }
    },
    */
    /**
     * 追剧记录加载成功
     * @override
     * @param {Object} evt
     */
    onListSuccess: function (evt) {
        if (!(evt && evt.query && evt.result)) {
            return;
        }

        this.pageNo = evt.query.pn;

        var result = evt.result,
            dataSize = result.data ? result.data.length : 0;
        if (dataSize) {
            this.records = result.data;

            if (dataSize > this.pageSize) { // 最多只保留一页的数据
                this.records = this.records.slice(0, this.pageSize);
            }

            this._followWorks(); // 包装记录数据
        } else { // 无记录数据时直接渲染
            var pageData = [];
            this.cache[this.pageNo] = pageData;
            this._render(pageData);
        }
    },
    /**
     * 追剧作品列表加载成功
     * @override
     * @param {Object} evt
     */
    onFollowWorksSuccess: function (evt) {
        var pageData = this._processResult(evt.result);
        this._render(pageData);
    },
    /**
     * 追剧作品数据
     * @param {Function} callback
     */
    _followWorks: function (callback) {
        this._request('followWorks', {}, callback);
    },
    /**
     * 退订
     * @override
     * @param {Object} params
     * @param {Function} callback
     */
    /*del: function (params, callback) {
        params = params || {};

        if (params.type && params.works_id) {
            this.loadStoreData();
            var shield = this.storeData || {},
                ids = shield[params.type];

            if (ids) {
                if (indexOf(ids, params.works_id) === -1) {
                    ids.push(params.works_id);
                    var more = ids.length - this.shieldMax;
                    if (more > 0) { // 超过存储的最大值
                        ids = ids.slice(more);
                    }
                }
            } else {
                shield[params.type] = [ params.works_id ];
            }

            this.updateStoreData(shield);

            var result = { status: config.status.success };
            callback && delay(function () {
                callback(result.status);
            }, 0);
            this.fire('DelSuccess', { query: params, result: result });
        } else {
            callback && callback(config.status.errParam);
        }
    },
    // 退订成功
    onDelSuccess: function () {
        var me = this;

        delay(function () {
            var pageData = me.processPageData(me.cache[me.pageNo]);
            me._render(pageData);
        }, 0);
    },*/
    /**
     * 处理分页数据
     * @override
     * @param  {Array} pageData
     * @return {Array}
     */
    /*processPageData: function (pageData) {
        this.loadStoreData();
        var shield = this.storeData,
            data = [],
            pSize = pageData.length;

        if (shield && pSize) {
            for (var i = 0, item; item = pageData[i]; i += 1) {
                var ids = shield[item.works_type]; // 需要排除的作品集合
                if (ids && indexOf(ids, item.works_id) !== -1) { // 排除
                    continue;
                } else {
                    data.push(item);
                }
            }

            var size = data.length;
            if (size != pSize) { // 因为只有一屏数据，可以重新计算
                this.size = size;
                this.pages = Math.ceil(size / this.pageSize);
            }
        } else {
            data = pageData;
        }

        this.cache[this.pageNo] = data;
        return data;
    },*/
    /**
     * 更新追剧记录
     * @override
     * @param {Object}   params
     * @param {Function} callback
     */
    update: function (params, callback) {
        params = params || {};

        if (params.type && params.works_id && params.last_view) {
            this._request('update', params, callback);
        } else {
            callback && callback(config.status.errParam);
        }
    },
    /**
     * 获取请求 URL
     * @override
     * @param  {String} type
     * @param  {Object} params
     * @return {String}
     */
    getRequestUrl: function (type, params) {
        var url = '';

        switch (type) {
            // 追剧记录
            case 'list':
                // url = '/api/handler.php?api=track-pc';
                url = '/ugc-rp/track-pc?';
                break;

            // 追剧作品
            case 'followWorks':
                var q = [];
                T.each(this.records, function (index,record) {
                    q.push('r[]=' + record2CSV(record));
                });
                url = '/follow/works?' + q.join('&');
                // url = 'http://cq01-rdqa-pool112.cq01.baidu.com:8888' + url; // for test
                break;

            // 退订作品
            case 'del':
                url = stringFormat('/ugc-rp/remove-track?wid=#{works_id}&type=#{type}', params);
                break;

            // 更新记录
            case 'update':
                url = stringFormat('/ugc-rp/add-track?wid=#{works_id}&type=#{type}&episode=#{last_view}', params);
                break;

            default:
                break;
        }

        if (url.indexOf('http') === -1) {
            url = config.remoteHost + url;
        }

        // url += '&uid=000CB904B94580D9E7FF9F956C0AB820'; // for test
        return url;
    }
});

/* ------------------------------------------------------------------------------------------------------------------ */
exports.Klass = BdvTraceUgcRpTrack;

/**
 * 小流量测试
 * @param  {Number}  scale 小流量比率
 * @return {Boolean}
 */
exports.isHit = function (scale) {
    scale = Math.min(parseInt(scale) || 10, 100);

    if (!test) {
      test = ABTest.create();
    }
    test.split(scale, function () {});

    return test.isHit;
};
