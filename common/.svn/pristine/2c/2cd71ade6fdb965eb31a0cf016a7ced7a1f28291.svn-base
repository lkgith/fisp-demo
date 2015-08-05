/**
 * sugUtils
 */

require("common:static/ui/localStorage/localStorage.js");
var Base = require("common:static/ui/oo/klass.js");

var SugUtils = Base.Klass.create({
    init: function(opt){
        this.key = opt.key;
    },

    isIE67: /MSIE\s[67]/i.test(window.navigator.userAgent),

    /**
     * 数据排序 
     * @param key(string)           排序的key
     * @param [flag](string)        参数默认升序(asc) desc为倒序
     */
    assort: function(arr, key, flag){
        return arr.sort(function(a, b){
            return flag === 'desc' ? b[key] - a[key] : a[key] - b[key];
        });
    },
    /**
     *  opt.name            用户检索内容
     *  opt.data            用户输入检索信息后所搜索的内容对象（包括sug提示的各项信息）         
     */
    set: function(opt){
        //获取localStorage
        var arr = JSON.parse(localStorage.getItem(this.key) || '[]'),
            arrLen = arr.length,
            hasThisParam = false;
        for(var i = 0; i < arrLen; i++){
            //命中已有val，则将该已有的val放到数组第一位
            if(opt.name === arr[i]['name']){
                arr[i]['name'] = opt.name;
                arr[i]['num'] = parseInt(arr[i]['num'])+1;
                hasThisParam = true;
                //将data信息写入
                arr[i]['data'] = opt.data || {};
                //更新时间戳
                arr[i]['timestamp'] = +new Date();
                arr.unshift(arr[i]);
                arr.splice(i+1, 1);
            }
        }
        //以前没有的val，也将它放到数组第一位，并且num置为1
        if(!hasThisParam){
            arr.unshift({
                'name': opt.name,
                'num': '1',
                'timestamp': +new Date(),
                'data': opt.data || {}
            });
        }
        arr.length = (arr.length > 100 ? 100 : arr.length);
        localStorage.setItem(this.key, JSON.stringify(arr));
    },
    remove: function(key){
        var arr = JSON.parse(localStorage.getItem(key) || '[]'),
            arrLen = arr.length;
        for(var i = 0; i < arrLen; i++){
            if(arr[i].name == key){
                arr.splice(i, 1);
                arrLen = arr.length;
            }
        }
        localStorage.setItem(this.key, JSON.stringify(arr));
    },
    //@return Array  fuzzy模糊匹配，只要开头能匹配即可
    get: function(key, fuzzy){
        var arr = JSON.parse(localStorage.getItem(this.key) || '[]'),
            arrLen = arr.length,
            temp = [];

        if(fuzzy){
            for(var i = 0; i < arrLen; i++){
                if(arr[i]['name'].indexOf(key) == 0){
                    temp.push(arr[i]);
                }
            }
        } else {
            for(var i = 0; i < arrLen; i++){
                if(arr[i]['name'] == key){
                    temp.push(arr[i]);
                }
            }
        }

        return temp;
    },

    getAll: function(){
        var arr = JSON.parse(localStorage.getItem(this.key) || '[]');

        return arr;
    },

    log: function(url){
        var img = new Image(),
            key = 'tangram_sio_log_' + Math.floor(Math.random() *
                  2147483648).toString(36);
     
        // 这里一定要挂在window下
        // 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort
        // 导致服务器收不到日志
        window[key] = img;
     
        img.onload = img.onerror = img.onabort = function() {
          // 下面这句非常重要
          // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画
          // 则在gif动画播放过程中，img会多次触发onload
          // 因此一定要清空
          img.onload = img.onerror = img.onabort = null;
     
          window[key] = null;
     
          // 下面这句非常重要
          // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露
          // 因此这里一定要置为null
          img = null;
        };
     
        // 一定要在注册了事件之后再设置src
        // 不然如果图片是读缓存的话，会错过事件处理
        // 最后，对于url最好是添加客户端时间来防止缓存
        // 同时服务器也配合一下传递Cache-Control: no-cache;
        img.src = url;
    }
});

module.exports = SugUtils;