//Start
(function() {

function mySug(config){
    if(!(this instanceof mySug)){
        return new mySug(config);
    }
    this.init(config);
};
mySug.prototype = {
    constructor: mySug,
    isIE67: /MSIE\s[67]/i.test(window.navigator.userAgent),
    init: function(opt){
        if(this.isIE67){
            return false;
        }

        this.localStorage();
        this.JSON();
        //确定localStorage所存的key
        this.key = opt.key;
        //判断先前是否有该key
        var str = localStorage.getItem(this.key);
        if(!str){
            localStorage.setItem(this.key, '[]');
            return;
        }
        try{
            this.data = JSON.parse(str);
        }
        catch(e){
            window.console && console.log('localStorage中的"'+this.key+'"字段已被其他地方使用，请更换');
        }
    },
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
        var str = localStorage.getItem(this.key),
            arr = JSON.parse(str) || [],
            arrLen = arr.length,
            hasThisParam = false;
        for(var i=0;i<arrLen;i++){
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
        var str = localStorage.getItem(key),
        arr = JSON.parse(str) || [],
        arrLen = arr.length;
        for(var i=0;i<arrLen;i++){
            if(arr[i].name == key){
                arr.splice(i, 1);
                arrLen = arr.length;
            }
        }
        localStorage.setItem(this.key, JSON.stringify(arr));
    },
    //@return Array  fuzzy模糊匹配，只要开头能匹配即可
    get: function(key, fuzzy){
        var str = localStorage.getItem(this.key);
        if(!str){
            return [];
        }
        var arr = JSON.parse(str),
            arrLen = arr.length,
            temp = [];
        if(fuzzy){
            for(var i=0;i<arrLen;i++){
                if(arr[i]['name'].indexOf(key) == 0){
                    temp.push(arr[i]);
                }
            }
        }
        else{
            for(var i=0;i<arrLen;i++){
                if(arr[i]['name'] == key){
                    temp.push(arr[i]);
                }
            }
        }
        return temp;
    },
    getAll: function(){
        var str = localStorage.getItem(this.key);
        if(!str){
            return [];
        }
        return JSON.parse(str);
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
    },
    localStorage: function(){
        typeof window.localStorage == 'undefined' &&
        (function(){
            var localStorage = window.localStorage = {},
                prefix = 'data-userdata',
                doc = document,
                attrSrc = doc.body,
                html = doc.documentElement,
                mark = function(key, isRemove, temp, reg){
                    html.load(prefix);
                    temp = html.getAttribute(prefix);
                    reg = RegExp('\\b' + key + '\\b,?', 'i');
                    hasKey = reg.test(temp) ? 1 : 0;
                    temp = isRemove ? temp.replace(reg, '').replace(',', '') : 
                            hasKey ? temp : !temp ? key :
                                temp.split(',').concat(key).join(',');
                    html.setAttribute(prefix, temp);
                    html.save(prefix);
                };
                
            attrSrc.addBehavior('#default#userData');
            html.addBehavior('#default#userData');

            localStorage.getItem = function(key){
                attrSrc.load(key);
                return attrSrc.getAttribute(key);
            };
            
            localStorage.setItem = function(key, value){
                attrSrc.setAttribute(key, value);
                attrSrc.save(key);
                mark(key);
            };
            
            localStorage.removeItem = function(key){
                attrSrc.removeAttribute(key);
                attrSrc.save(key);
                mark(key, 1);
            };
            
            localStorage.clear = function(){
                html.load(prefix);
                var attrs = html.getAttribute(prefix).split(','),
                    len = attrs.length;
                for(var i=0;i<len;i++){
                    attrSrc.removeAttribute(attrs[i]);
                    attrSrc.save(attrs[i]);
                };
                html.setAttribute(prefix,'');
                html.save(prefix);
            };
        })();
    },
    JSON: function(){
        typeof JSON !== 'object' &&
        (function(){
            'use strict';
            window.JSON = {};
            function f(n) {
                return n < 10 ? '0' + n : n;
            }
            if (typeof Date.prototype.toJSON !== 'function') {
                Date.prototype.toJSON = function () {
                    return isFinite(this.valueOf())
                        ? this.getUTCFullYear()     + '-' +
                            f(this.getUTCMonth() + 1) + '-' +
                            f(this.getUTCDate())      + 'T' +
                            f(this.getUTCHours())     + ':' +
                            f(this.getUTCMinutes())   + ':' +
                            f(this.getUTCSeconds())   + 'Z'
                        : null;
                };
                String.prototype.toJSON      =
                    Number.prototype.toJSON  =
                    Boolean.prototype.toJSON = function () {
                        return this.valueOf();
                    };
            }
            var cx,
                escapable,
                gap,
                indent,
                meta,
                rep;
            function quote(string) {
                escapable.lastIndex = 0;
                return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                    var c = meta[a];
                    return typeof c === 'string'
                        ? c
                        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }) + '"' : '"' + string + '"';
            }

            function str(key, holder) {
                var i,          // The loop counter.
                    k,          // The member key.
                    v,          // The member value.
                    length,
                    mind = gap,
                    partial,
                    value = holder[key];
                if (value && typeof value === 'object' &&
                        typeof value.toJSON === 'function') {
                    value = value.toJSON(key);
                }
                if (typeof rep === 'function') {
                    value = rep.call(holder, key, value);
                }
                switch (typeof value) {
                case 'string':
                    return quote(value);
                case 'number':
                    return isFinite(value) ? String(value) : 'null';
                case 'boolean':
                case 'null':
                    return String(value);
                case 'object':
                    if (!value) {
                        return 'null';
                    }
                    gap += indent;
                    partial = [];
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }
                        v = partial.length === 0
                            ? '[]'
                            : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }
                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }
                    v = partial.length === 0
                        ? '{}'
                        : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
                }
            }

            if (typeof JSON.stringify !== 'function') {
                escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                meta = {    // table of character substitutions
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"' : '\\"',
                    '\\': '\\\\'
                };
                JSON.stringify = function (value, replacer, space) {
                    var i;
                    gap = '';
                    indent = '';
                    if (typeof space === 'number') {
                        for (i = 0; i < space; i += 1) {
                            indent += ' ';
                        }
                    } else if (typeof space === 'string') {
                        indent = space;
                    }
                    rep = replacer;
                    if (replacer && typeof replacer !== 'function' &&
                            (typeof replacer !== 'object' ||
                            typeof replacer.length !== 'number')) {
                        throw new Error('JSON.stringify');
                    }
                    return str('', {'': value});
                };
            }
            if (typeof JSON.parse !== 'function') {
                cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                JSON.parse = function (text, reviver) {
                    var j;
                    function walk(holder, key) {

                        var k, v, value = holder[key];
                        if (value && typeof value === 'object') {
                            for (k in value) {
                                if (Object.prototype.hasOwnProperty.call(value, k)) {
                                    v = walk(value, k);
                                    if (v !== undefined) {
                                        value[k] = v;
                                    } else {
                                        delete value[k];
                                    }
                                }
                            }
                        }
                        return reviver.call(holder, key, value);
                    }

                    text = String(text);
                    cx.lastIndex = 0;
                    if (cx.test(text)) {
                        text = text.replace(cx, function (a) {
                            return '\\u' +
                                ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        });
                    }
                    if (/^[\],:{}\s]*$/
                            .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                        j = eval('(' + text + ')');
                        return typeof reviver === 'function'
                            ? walk({'': j}, '')
                            : j;
                    }
                    throw new SyntaxError('JSON.parse');
                };
            }
        })();
    }
};

var myNewSug = mySug({key: 'newsug'});


/**
 * tangram ----------------------------------------------------------
 */
var T, baidu = T = function(){
    // Copyright (c) 2009-2012, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var T, baidu = T = baidu || function(q, c) { return baidu.dom ? baidu.dom(q, c) : null; };

baidu.version = '2.0.2.2';
baidu.guid = "$BAIDU$";
baidu.key = "tangram_guid";

// Tangram 可能被放在闭包中
// 一些页面级别唯一的属性，需要挂载在 window[baidu.guid]上

var _ = window[ baidu.guid ] = window[ baidu.guid ] || {};
(_.versions || (_.versions = [])).push(baidu.version);

// 20120709 mz 添加参数类型检查器，对参数做类型检测保护
baidu.check = baidu.check || function(){};

 
baidu.lang = baidu.lang || {};

baidu.forEach = function( enumerable, iterator, context ) {
    var i, n, t;

    if ( typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if ( typeof n == "number" ) {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for ( i=0; i<n; i++ ) {
                
                t = enumerable[ i ]
                t === undefined && (t = enumerable.charAt && enumerable.charAt( i ));

                // 被循环执行的函数，默认会传入三个参数(array[i], i, array)
                iterator.call( context || null, t, i, enumerable );
            }
        
        // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i=0; i<enumerable; i++) {
                iterator.call( context || null, i, i, i);
            }
        
        // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if ( enumerable.hasOwnProperty(i) ) {
                    iterator.call( context || null, enumerable[ i ], i, enumerable );
                }
            }
        }
    }

    return enumerable;
};

baidu.type = (function() {
    var objectType = {},
        nodeType = [, "HTMLElement", "Attribute", "Text", , , , , "Comment", "Document", , "DocumentFragment", ],
        str = "Array Boolean Date Error Function Number RegExp String",
        retryType = {'object': 1, 'function': '1'},//解决safari对于childNodes算为function的问题
        toString = objectType.toString;

    // 给 objectType 集合赋值，建立映射
    baidu.forEach(str.split(" "), function(name) {
        objectType[ "[object " + name + "]" ] = name.toLowerCase();

        baidu[ "is" + name ] = function ( unknow ) {
            return baidu.type(unknow) == name.toLowerCase();
        }
    });

    // 方法主体
    return function ( unknow ) {
        var s = typeof unknow;
        return !retryType[s] ? s
            : unknow == null ? "null"
            : unknow._type_
                || objectType[ toString.call( unknow ) ]
                || nodeType[ unknow.nodeType ]
                || ( unknow == unknow.window ? "Window" : "" )
                || "object";
    };
})();

// extend
baidu.isDate = function( unknow ) {
    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
};

baidu.isElement = function( unknow ) {
    return baidu.type(unknow) == "HTMLElement";
};

// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
baidu.isEnumerable = function( unknow ){
    return unknow != null
        && (typeof unknow == "object" || ~Object.prototype.toString.call( unknow ).indexOf( "NodeList" ))
    &&(typeof unknow.length == "number"
    || typeof unknow.byteLength == "number"  //ArrayBuffer
    || typeof unknow[0] != "undefined");
};
baidu.isNumber = function( unknow ) {
    return baidu.type(unknow) == "number" && isFinite( unknow );
};

// 20120903 mz 检查对象是否为一个简单对象 {}
baidu.isPlainObject = function(unknow) {
    var key,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    if ( baidu.type(unknow) != "object" ) {
        return false;
    }

    //判断new fn()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( unknow.constructor &&
        !hasOwnProperty.call(unknow, "constructor") &&
        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in unknow ) {}
    return key === undefined || hasOwnProperty.call( unknow, key );
};

baidu.isObject = function( unknow ) {
    return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null );
};

baidu.extend = function(depthClone, object) {
    var second, options, key, src, copy,
        i = 1,
        n = arguments.length,
        result = depthClone || {},
        copyIsArray, clone;
    
    baidu.isBoolean( depthClone ) && (i = 2) && (result = object || {});
    !baidu.isObject( result ) && (result = {});

    for (; i<n; i++) {
        options = arguments[i];
        if( baidu.isObject(options) ) {
            for( key in options ) {
                src = result[key];
                copy = options[key];
                // Prevent never-ending loop
                if ( src === copy ) {
                    continue;
                }
                
                if(baidu.isBoolean(depthClone) && depthClone && copy
                    && (baidu.isPlainObject(copy) || (copyIsArray = baidu.isArray(copy)))){
                        if(copyIsArray){
                            copyIsArray = false;
                            clone = src && baidu.isArray(src) ? src : [];
                        }else{
                            clone = src && baidu.isPlainObject(src) ? src : {};
                        }
                        result[key] = baidu.extend(depthClone, clone, copy);
                }else if(copy !== undefined){
                    result[key] = copy;
                }
            }
        }
    }
    return result;
};

baidu.createChain = function(chainName, fn, constructor) {
    // 创建一个内部类名
    var className = chainName=="dom"?"$DOM":"$"+chainName.charAt(0).toUpperCase()+chainName.substr(1),
        slice = Array.prototype.slice,
        chain = baidu[chainName];
    if(chain){return chain}
    // 构建链头执行方法
    chain = baidu[chainName] = fn || function(object) {
        return baidu.extend(object, baidu[chainName].fn);
    };

    // 扩展 .extend 静态方法，通过本方法给链头对象添加原型方法
    chain.extend = function(extended) {
        var method;

        // 直接构建静态接口方法，如 baidu.array.each() 指向到 baidu.array().each()
        for (method in extended) {
            (function(method){//解决通过静态方法调用的时候，调用的总是最后一个的问题。
                // 20121128 这个if判断是防止console按鸭子判断规则将本方法识别成数组
                if (method != "splice") {
                    chain[method] = function() {
                        var id = arguments[0];

                        // 在新版接口中，ID选择器必须用 # 开头
                        chainName=="dom" && baidu.type(id)=="string" && (id = "#"+ id);

                        var object = chain(id);
                        var result = object[method].apply(object, slice.call(arguments, 1));

                        // 老版接口返回实体对象 getFirst
                        return baidu.type(result) == "$DOM" ? result.get(0) : result;
                    }
                }
            })(method);
        }
        return baidu.extend(baidu[chainName].fn, extended);
    };

    // 创建 链头对象 构造器
    baidu[chainName][className] = baidu[chainName][className] || constructor || function() {};

    // 给 链头对象 原型链做一个短名映射
    chain.fn = baidu[chainName][className].prototype;

    return chain;
};

baidu.overwrite = function(Class, list, fn) {
    for (var i = list.length - 1; i > -1; i--) {
        Class.prototype[list[i]] = fn(list[i]);
    }

    return Class;
};

baidu.object = baidu.object || {};

baidu.object.isPlain  = baidu.isPlainObject;

baidu.createChain('string',
    // 执行方法
    function(string){
        var type = baidu.type(string),
            str = new String(~'string|number'.indexOf(type) ? string : type),
            pro = String.prototype;
        baidu.forEach(baidu.string.$String.prototype, function(fn, key) {
            pro[key] || (str[key] = fn);
        });
        return str;
    }
);

baidu.string.extend({
    trim: function(){
        var trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g');
        return function(){
            return this.replace(trimer, '');
        }
    }()
});

baidu.createChain("array", function(array){
    var pro = baidu.array.$Array.prototype
        ,ap = Array.prototype
        ,key;

    baidu.type( array ) != "array" && ( array = [] );

    for ( key in pro ) {
        //ap[key] || (array[key] = pro[key]);
        array[key] = pro[key];
    }

    return array;
});

// 对系统方法新产生的 array 对象注入自定义方法，支持完美的链式语法
baidu.overwrite(baidu.array.$Array, "concat slice".split(" "), function(key) {
    return function() {
        return baidu.array( Array.prototype[key].apply(this, arguments) );
    }
});

baidu.array.extend({
    indexOf : function (match, fromIndex) {
        baidu.check(".+(,number)?","baidu.array.indexOf");
        var len = this.length;

        // 小于 0
        (fromIndex = fromIndex | 0) < 0 && (fromIndex = Math.max(0, len + fromIndex));

        for ( ; fromIndex < len; fromIndex++) {
            if(fromIndex in this && this[fromIndex] === match) {
                return fromIndex;
            }
        }
        
        return -1;
    }
});

baidu.createChain('Callbacks', function(options){
    var opts = options;
    if(baidu.type(options) === 'string'){
        opts = {};
        baidu.forEach(options.split(/\s/), function(item){
            opts[item] = true;
        });
    }
    return new baidu.Callbacks.$Callbacks(opts);
}, function(options){
    var opts = baidu.extend({}, options || {}),
        fnArray = [],
        fireQueue = [],
        fireIndex = 0,
        memory, isLocked, isFired, isFiring,
        fireCore = function(data, index){
            var item, fn;
            if(!fireQueue || !fnArray){return;}
            memory = opts.memory && data;
            isFired = true;
            fireQueue.push(data);
            if(isFiring){return;}
            isFiring = true;
            while(item = fireQueue.shift()){
                for(fireIndex = index || 0; fn = fnArray[fireIndex]; fireIndex++){
                    if(fn.apply(item[0], item[1]) === false
                        && opts.stopOnFalse){
                        memory = false;
                        break;
                    }
                }
            }
            isFiring = false;
            opts.once && (fnArray = []);
        },
        callbacks = {
            add: function(){
                if(!fnArray){return this;}
                var index = fnArray && fnArray.length;
                (function add(args){
                    var len = args.length,
                        type, item;
                    for(var i = 0, item; i < len; i++){
                        if(!(item = args[i])){continue;}
                        type = baidu.type(item);
                        if(type === 'function'){
                            (!opts.unique || !callbacks.has(item)) && fnArray.push(item);
                        }else if(item && item.length && type !== 'string'){
                            add(item);
                        }
                    }
                })(arguments);
                !isFiring && memory && fireCore(memory, index);
                return this;
            },
            
            remove: function(){
                if(!fnArray){return this;}
                var index;
                baidu.forEach(arguments, function(item){
                    while((index = baidu.array(fnArray).indexOf(item)) > -1){
                        fnArray.splice(index, 1);
                        isFiring && index < fireIndex && fireIndex--;
                    }
                });
                return this;
            },
            
            has: function(fn){
                return baidu.array(fnArray).indexOf(fn) > -1;
            },
            
            empty: function(){
                return fnArray = [], this;
            },
            disable: function(){
                return fnArray = fireQueue = memory = undefined, this;
            },
            disabled: function(){
                return !fnArray;
            },
            lock: function(){
                isLocked = true;
                !memory && callbacks.disable();
                return this;
            },
            fired: function(){
                return isFired;
            },
            fireWith: function(context, args){
                if(isFired && opts.once
                    || isLocked){return this;}
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                fireCore(args);
                return this;
            },
            fire: function(){
                callbacks.fireWith(this, arguments);
                return this;
            }
        };
    return callbacks;
});

baidu.createChain('Deferred', function(fn){
    return new baidu.Deferred.$Deferred(fn);
}, function(fn){
    var me = this,
        state = 'pending',
        tuples = [
            ['resolve', 'done', baidu.Callbacks('once memory'), 'resolved'],
            ['reject', 'fail', baidu.Callbacks('once memory'), 'rejected'],
            ['notify', 'progress', baidu.Callbacks('memory')]
        ],
        promise = {
            state: function(){return state;},
            always: function(){
                me.done(arguments).fail(arguments);
                return this;
            },
            then: function(){
                
                var args = arguments;
                return baidu.Deferred(function(defer){
                    baidu.forEach(tuples, function(item, index){
                        var action = item[0],
                            fn = args[index];
                        me[item[1]](baidu.type(fn) === 'function' ? function(){
                            var ret = fn.apply(this, arguments);
                            if(ret && baidu.type(ret.promise) === 'function'){
                                ret.promise()
                                    .done(defer.resolve)
                                    .fail(defer.reject)
                                    .progress(defer.notify);
                            }else{
                                defer[action + 'With'](this === me ? defer : this, [ret]);
                            }
                        } : defer[action]);
                    });
                }).promise();
                
            },
            promise: function(instance){
                return instance != null ? baidu.extend(instance, promise) : promise;
            }
        };
    //
    promise.pipe = promise.then;
    baidu.forEach(tuples, function(item, index){
        var callbacks = item[2],
            stateName = item[3];
        // promise[ done | fail | progress ] = list.add
        promise[item[1]] = callbacks.add;
        stateName && callbacks.add(function(){
            // state = [ resolved | rejected ]
            state = stateName;
            // [ reject_list | resolve_list ].disable; progress_list.lock
        }, tuples[index ^ 1][2].disable, tuples[2][2].lock);
        // deferred[ resolve | reject | notify ] = list.fire
        me[item[0]] = callbacks.fire;
        me[item[0] + 'With'] = callbacks.fireWith;
    });
    promise.promise(me);
    fn && fn.call(me, me);
});

baidu.when = baidu.when || function(subordinate ){
    var args = arguments,
        len = arguments.length,
        remaining = len !== 1 || (subordinate && baidu.type(subordinate.promise) === 'function') ? len : 0,
        defer = remaining === 1 ? subordinate : baidu.Deferred(),
        progressVals, progressContexts, resolveContexts;
    function update(index, contexts, vals){
        return function(val){
            contexts[index] = this;
            vals[index] = arguments.length > 1 ? arguments : val;
            if(vals === progressVals){
                defer.notifyWith(contexts, vals);
            }else if(!(--remaining)){
                defer.resolveWith(contexts, vals);
            }
        };
    }
    
    if(len > 1){
        progressVals = new Array(len);
        progressContexts = new Array(len);
        resolveContexts = new Array(len);
        for(var i = 0; i < len; i++){
            if(args[i] && baidu.type(args[i].promise) === 'function'){
                args[i].promise()
                    .done(update(i, resolveContexts, args))
                    .fail(defer.reject)
                    .progress(update(i, progressContexts, progressVals));
            }else{
                --remaining;
            }
        }
        
    }
    !remaining && defer.resolveWith(resolveContexts, args);
    return defer.promise();
}

baidu.global = baidu.global || (function() {
    var me = baidu._global_ = window[ baidu.guid ],
        // 20121116 mz 在多个tangram同时加载时有互相覆写的风险
        global = me._ = me._ || {};

    return function( key, value, overwrite ) {
        if ( typeof value != "undefined" ) {
            overwrite || ( value = typeof global[ key ] == "undefined" ? value : global[ key ] );
            global[ key ] =  value;

        } else if (key && typeof global[ key ] == "undefined" ) {
            global[ key ] = {};
        }

        return global[ key ];
    }
})();

baidu.browser = baidu.browser || function(){
    var ua = navigator.userAgent;
    
    var result = {
        isStrict : document.compatMode == "CSS1Compat"
        ,isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua)
        ,isWebkit: /webkit/i.test(ua)
    };

    try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua) :
            result.ie = document.documentMode || + RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua) :
            result.chrome = + RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
            result.safari = + (RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua) : 
            result.firefox = + RegExp['\x241'];
            break;
        
        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
            result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
            break;
    }
           
    baidu.extend(baidu, result);

    return result;
}();

baidu.id = function() {
    var maps = baidu.global("_maps_id")
        ,key = baidu.key;

    // 2012.12.21 与老版本同步
    window[ baidu.guid ]._counter = window[ baidu.guid ]._counter || 1;

    return function( object, command ) {
        var e
            ,str_1= baidu.isString( object )
            ,obj_1= baidu.isObject( object )
            ,id = obj_1 ? object[ key ] : str_1 ? object : "";

        // 第二个参数为 String
        if ( baidu.isString( command ) ) {
            switch ( command ) {
            case "get" :
                return obj_1 ? id : maps[id];
//          break;
            case "remove" :
            case "delete" :
                if ( e = maps[id] ) {
                    // 20120827 mz IE低版本(ie6,7)给 element[key] 赋值时会写入DOM树，因此在移除的时候需要使用remove
                    if (baidu.isElement(e) && baidu.browser.ie < 8) {
                        e.removeAttribute(key);
                    } else {
                        delete e[ key ];
                    }
                    delete maps[ id ];
                }
                return id;
//          break;
            default :
                if ( str_1 ) {
                    (e = maps[ id ]) && delete maps[ id ];
                    e && ( maps[ e[ key ] = command ] = e );
                } else if ( obj_1 ) {
                    id && delete maps[ id ];
                    maps[ object[ key ] = command ] = object;
                }
                return command;
            }
        }

        // 第一个参数不为空
        if ( obj_1 ) {
            !id && (maps[ object[ key ] = id = baidu.id() ] = object);
            return id;
        } else if ( str_1 ) {
            return maps[ object ];
        }

        return "TANGRAM_" + baidu._global_._counter ++;
    };
}();

//TODO: mz 20120827 在低版本IE做delete操作时直接 delete e[key] 可能出错，这里需要重新评估，重写

baidu._util_ = baidu._util_ || {};

baidu._util_.support = baidu._util_.support || function(){
    var div = document.createElement('div'),
        baseSupport, a, input, select, opt;
    div.setAttribute('className', 't');
    div.innerHTML = ' <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
    a = div.getElementsByTagName('A')[0];
    a.style.cssText = 'top:1px;float:left;opacity:.5';
    select = document.createElement('select');
    opt = select.appendChild(document.createElement('option'));
    input = div.getElementsByTagName('input')[0];
    input.checked = true;
    
    baseSupport = {
        dom: {
            div: div,
            a: a,
            select: select,
            opt: opt,
            input: input
        }
//      radioValue: only import by baidu._util.attr
//      hrefNormalized: only import by baidu._util.attr
//      style: only import by baidu._util.attr
//      optDisabled: only import by baidu.dom.val
//      checkOn: only import by baidu.dom.val
//      noCloneEvent: only import by baidu.dom.clone
//      noCloneChecked: only import by baidu.dom.clone
//      cssFloat: only import baidu.dom.styleFixer
//      htmlSerialize: only import baidu.dom.html
//      leadingWhitespace: only import baidu.dom.html
    };
    return baseSupport;
}();

baidu.createChain("event",

    // method
    function(){
        var lastEvt = {};
        return function( event, json ){
            switch( baidu.type( event ) ){
                // event
                case "object":
                    return lastEvt.originalEvent === event ? 
                        lastEvt : lastEvt = new baidu.event.$Event( event );

                case "$Event":
                    return event;

                // event type
//              case "string" :
//                  var e = new baidu.event.$Event( event );
//                  if( typeof json == "object" ) 
//                      baidu.forEach( e, json );
//                  return e;
            }
        }
    }(),

    // constructor
    function( event ){
        var e, t, f;
        var me = this;

        this._type_ = "$Event";

        if( typeof event == "object" && event.type ){

            me.originalEvent = e = event;

            for( var name in e )
                if( typeof e[name] != "function" )
                    me[ name ] = e[ name ];

            if( e.extraData )
                baidu.extend( me, e.extraData );

            me.target = me.srcElement = e.srcElement || (
                ( t = e.target ) && ( t.nodeType == 3 ? t.parentNode : t )
            );

            me.relatedTarget = e.relatedTarget || (
                ( t = e.fromElement ) && ( t === me.target ? e.toElement : t )
            );

            me.keyCode = me.which = e.keyCode || e.which;

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if( !me.which && e.button !== undefined )
                me.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );

            var doc = document.documentElement, body = document.body;

            me.pageX = e.pageX || (
                e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
            );

            me.pageY = e.pageY || (
                e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0)
            );

            me.data;
        }

        // event.type
//      if( typeof event == "string" )
//          this.type = event;

        // event.timeStamp
        this.timeStamp = new Date().getTime();
    }

).extend({
    stopPropagation : function() {
        var e = this.originalEvent;
        e && ( e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true );
    },

    preventDefault : function() {
        var e = this.originalEvent;
        e && ( e.preventDefault ? e.preventDefault() : e.returnValue = false );
    }
});

baidu.merge = function(first, second) {
    var i = first.length,
        j = 0;

    if ( typeof second.length === "number" ) {
        for ( var l = second.length; j < l; j++ ) {
            first[ i++ ] = second[ j ];
        }

    } else {
        while ( second[j] !== undefined ) {
            first[ i++ ] = second[ j++ ];
        }
    }

    first.length = i;

    return first;
};

baidu.array.extend({
    unique : function (fn) {
        var len = this.length,
            result = this.slice(0),
            i, datum;
            
        if ('function' != typeof fn) {
            fn = function (item1, item2) {
                return item1 === item2;
            };
        }
        
        // 从后往前双重循环比较
        // 如果两个元素相同，删除后一个
        while (--len > 0) {
            datum = result[len];
            i = len;
            while (i--) {
                if (fn(datum, result[i])) {
                    result.splice(len, 1);
                    break;
                }
            }
        }

        len = this.length = result.length;
        for ( i=0; i<len; i++ ) {
            this[ i ] = result[ i ];
        }

        return this;
    }
});

baidu.query = baidu.query || function(){
    var rId = /^(\w*)#([\w\-\$]+)$/
       ,rId0= /^#([\w\-\$]+)$/
       ,rTag = /^\w+$/
       ,rClass = /^(\w*)\.([\w\-\$]+)$/
       ,rComboClass = /^(\.[\w\-\$]+)+$/
       ,rDivider = /\s*,\s*/
       ,rSpace = /\s+/g
       ,slice = Array.prototype.slice;

    // selector: #id, .className, tagName, *
    function query(selector, context) {
        var t, x, id, dom, tagName, className, arr, list, array = [];

        // tag#id
        if (rId.test(selector)) {
            id = RegExp.$2;
            tagName = RegExp.$1 || "*";

            // 本段代码效率很差，不过极少流程会走到这段
            baidu.forEach(context.getElementsByTagName(tagName), function(dom) {
                dom.id == id && array.push(dom);
            });

        // tagName or *
        } else if (rTag.test(selector) || selector == "*") {
            baidu.merge(array, context.getElementsByTagName(selector));

        // .className
        } else if (rClass.test(selector)) {
            arr = [];
            tagName = RegExp.$1;
            className = RegExp.$2;
            t = " " + className + " ";
            // bug: className: .a.b

            if (context.getElementsByClassName) {
                arr = context.getElementsByClassName(className);
            } else {
                baidu.forEach(context.getElementsByTagName("*"), function(dom) {
                    dom.className && ~(" " + dom.className + " ").indexOf(t) && (arr.push(dom));
                });
            }

            if (tagName && (tagName = tagName.toUpperCase())) {
                baidu.forEach(arr, function(dom) {
                    dom.tagName.toUpperCase() === tagName && array.push(dom);
                });
            } else {
                baidu.merge(array, arr);
            }
        
        // IE 6 7 8 里组合样式名(.a.b)
        } else if (rComboClass.test(selector)) {
            list = selector.substr(1).split(".");

            baidu.forEach(context.getElementsByTagName("*"), function(dom) {
                if (dom.className) {
                    t = " " + dom.className + " ";
                    x = true;

                    baidu.forEach(list, function(item){
                        ~t.indexOf(" "+ item +" ") || (x = false);
                    });

                    x && array.push(dom);
                }
            });
        }

        return array;
    }

    // selector 还可以是上述四种情况的组合，以空格分隔
    // @return ArrayLike
    function queryCombo(selector, context) {
        var a, s = selector, id = "__tangram__", array = [];

        // 在 #id 且没有 context 时取 getSingle，其它时 getAll
        if (!context && rId0.test(s) && (a=document.getElementById(s.substr(1)))) {
            return [a];
        }

        context = context || document;

        // 用 querySelectorAll 时若取 #id 这种唯一值时会多选
        if (context.querySelectorAll) {
            // 在使用 querySelectorAll 时，若 context 无id将貌似 document 而出错
            if (context.nodeType == 1 && !context.id) {
                context.id = id;
                a = context.querySelectorAll("#" + id + " " + s);
                context.id = "";
            } else {
                a = context.querySelectorAll(s);
            }
            return a;
        } else {
            if (!~s.indexOf(" ")) {
                return query(s, context);
            }

            baidu.forEach(query(s.substr(0, s.indexOf(" ")), context), function(dom) { // 递归
                baidu.merge(array, queryCombo(s.substr(s.indexOf(" ") + 1), dom));
            });
        }

        return array;
    }

    return function(selector, context, results) {
        if (!selector || typeof selector != "string") {
            return results || [];
        }

        var arr = [];
        selector = selector.replace(rSpace, " ");
        results && baidu.merge(arr, results) && (results.length = 0);

        baidu.forEach(selector.indexOf(",") > 0 ? selector.split(rDivider) : [selector], function(item) {
            baidu.merge(arr, queryCombo(item, context));
        });

        return baidu.merge(results || [], baidu.array(arr).unique());
    };
}();

baidu.createChain("dom",

// method function

function(selector, context) {
    var e, me = new baidu.dom.$DOM(context);

    // Handle $(""), $(null), or $(undefined)
    if (!selector) {
        return me;
    }

    // Handle $($DOM)
    if (selector._type_ == "$DOM") {
        return selector;

    // Handle $(DOMElement)
    } else if (selector.nodeType || selector == selector.window) {
        me[0] = selector;
        me.length = 1;
        return me;

    // Handle $(Array) or $(Collection) or $(NodeList)
    } else if (selector.length && me.toString.call(selector) != "[object String]") {
        return baidu.merge(me, selector);

    } else if (typeof selector == "string") {
        // HTMLString
        if (selector.charAt(0) == "<" && selector.charAt(selector.length - 1) == ">" && selector.length > 2) {
            // Match a standalone tag
            var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
                doc = context && context._type_ === '$DOM' ? context[0] : context,
                ret = rsingleTag.exec(selector);
            doc = doc && doc.nodeType ? doc.ownerDocument || doc : document;
            ret = ret ? [doc.createElement(ret[1])] : (baidu.dom.createElements ? baidu.dom.createElements( selector ) : []);
            baidu.merge( me, ret);
        // baidu.query
        } else {
            baidu.query(selector, context, me);
        }
    
    // document.ready
    } else if (typeof selector == "function") {
        return me.ready ? me.ready(selector) : me;
    }

    return me;
},

// constructor
function(context) {
    this.length = 0;
    this._type_ = "$DOM";
    this.context = context || document;
}

).extend({

    
    size: function() {
        return this.length;
    }

    // 2012.11.27 mz 拥有 .length 和 .splice() 方法，console.log() 就认为该对象是 ArrayLike
    ,splice : function(){}

    
    ,get: function(index) {

        if ( typeof index == "number" ) {
            return index < 0 ? this[this.length + index] : this[index];
        }

        return Array.prototype.slice.call(this, 0);
    }

    // 将 $DOM 转换成 Array(dom, dom, ...) 返回
    ,toArray: function(){
        return this.get();
    }

});

baidu.dom.extend({
    each : function (iterator) {
        baidu.check("function", "baidu.dom.each");
        var i, result,
            n = this.length;

        for (i=0; i<n; i++) {
            result = iterator.call( this[i], i, this[i], this );

            if ( result === false || result == "break" ) { break;}
        }

        return this;
    }
});

baidu._util_.eventBase = baidu._util_.eventBase || {};

void function( base, listener ){
    if( base.listener )return ;
    
    listener = base.listener = {};
    
    if( window.addEventListener )
        listener.add = function( target, name, fn ){
            target.addEventListener( name, fn, false );
        };
    else if( window.attachEvent )
        listener.add = function( target, name, fn ){
            target.attachEvent( "on" + name, fn );
        };
}( baidu._util_.eventBase );

void function( base, be ){
    if( base.queue )return ;

    var I = baidu.id;
    var queue = base.queue = {};
    var attaCache = queue.attaCache = baidu.global( "eventQueueCache" );
    var listener = base.listener;

    queue.get = function( target, type, bindType, attachElements ){
        var id = I( target ), c;

        if( !attaCache[id] )
            attaCache[id] = {};

        c = attaCache[id];

        if( type ){
            if( !c[type] && bindType ){
                this.setupCall( target, type, bindType, c[ type ] = [], attachElements );
            }
            return c[type] || [];
        }else return c;
    };

    queue.add = function( target, type, bindType, item, attachElements ){
        this.get( target, type, bindType, attachElements ).push( item );
    };

    queue.remove = function( target, type, fn ){
        var arr, c;
        if( type ){
            var arr = this.get( target, type );
            if( fn ){
                for(var i = arr.length - 1; i >= 0; i --)
                    if( arr[i].orig == fn )
                        arr.splice( i, 1 );
            }else{
                arr.length = 0;
            }
        }else{
            var c = this.get( target );
            for(var i in c)
                c[i].length = 0;
        }
    };
    
    queue.handlerList = function(target, fnAry){
        var handlerQueue = [];
        //对delegate进行处理，这里牺牲性能换取事件执行顺序
        for(var i = 0, item; item = fnAry[i]; i++){
            if(item.delegate
                && baidu.dom(item.delegate, target).size() < 1){
                continue;
            }
            handlerQueue.push(item);
        }
        return handlerQueue;
    }

    queue.call = function( target, type, fnAry, e ){
        if( fnAry ){
            if( !fnAry.length )
                return ;

            var args = [].slice.call( arguments, 1 ), one = [];
                args.unshift( e = baidu.event( e || type ) );         
                e.type = type;

            if( !e.currentTarget )
                e.currentTarget = target;

            if( !e.target )
                e.target = target;
                
            //这里加入判断处理delegate 过滤fnAry 类似jq的功能
            fnAry = queue.handlerList(target, fnAry);
            
            for( var i = 0, r, l = fnAry.length; i < l; i ++ )
                if(r = fnAry[i]){
                    r.pkg.apply( target, args );
                    if( r.one )
                        one.unshift( i );
                }

            if( one.length )
                for(var i = 0, l = one.length; i < l; i ++)
                    this.remove( target, type, fnAry[i].fn );
                
        }else{
            fnAry = this.get( target, type );
            this.call( target, type, fnAry, e );
        }
    };

    queue.setupCall = function(){
        var add = function( target, type, bindType, fnAry ){
            listener.add( target, bindType, function( e ){
                queue.call( target, type, fnAry, e );
            } );
        };
        return function( target, type, bindType, fnAry, attachElements ){
            if( !attachElements )
                add( target, type, bindType, fnAry );
            else{
                target = baidu.dom( attachElements, target );
                for(var i = 0, l = target.length; i < l; i ++)
                    add( target[i], type, bindType, fnAry );
            }
        };
    }();

}( baidu._util_.eventBase, baidu.event );

void function( base, be ){
    if( base.core )return ;

    var queue = base.queue;
    var core = base.core = {};
    var special = be.special = {};
    var push = [].push;

    var findVestedEl = function( target, parents ){
        for( var i = 0, l = parents.length; i < l; i ++ )
            if( parents.get(i).contains( target ) )
                return parents[i];
    };

    core.build = function( target, name, fn, selector, data ){

        var bindElements;

        if( selector )
            bindElements = baidu.dom( selector, target );

        if( ( name in special ) && special[name].pack )
            fn = special[name].pack( fn );

        return function( e ){ // e is instance of baidu.event()
            var t = baidu.dom( e.target ), args = [ e ], bindElement;

            if( data && !e.data ) 
                e.data = data;
            if( e.triggerData )
                push.apply( args, e.triggerData );

            if( !bindElements )
                return e.result = fn.apply( target, args );

            for(var i = 0; i < 2; i ++){
                if( bindElement = findVestedEl( e.target, bindElements ) )
                    return e.result = fn.apply( bindElement, args );
                bindElements = baidu.dom( selector, target );
            }
        };
    };

    core.add = function( target, type, fn, selector, data, one ){
        var pkg = this.build( target, type, fn, selector, data ), attachElements, bindType;
        bindType = type;
        if(type in special)
            attachElements = special[type].attachElements,
            bindType = special[type].bindType || type;

        queue.add( target, type, bindType, { type: type, pkg: pkg, orig: fn, one: one, delegate: selector }, attachElements );
    };

    core.remove = function( target, type, fn, selector ){
        queue.remove( target, type, fn, selector );
    };

}( baidu._util_.eventBase, baidu.event );

baidu.dom.extend({
    on: function( events, selector, data, fn, _one ){
        var eb = baidu._util_.eventBase.core;
        // var specials = { mouseenter: 1, mouseleave: 1, focusin: 1, focusout: 1 };

        if( typeof selector == "object" && selector )
            fn = data,
            data = selector,
            selector = null;
        else if( typeof data == "function" )
            fn = data,
            data = null;
        else if( typeof selector == "function" )
            fn = selector,
            selector = data = null;

        if( typeof events == "string" ){
            events = events.split(/[ ,]+/);
            this.each(function(){
                baidu.forEach(events, function( event ){
                    // if( specials[ event ] )
                    //   baidu( this )[ event ]( data, fn );
                    // else
                    eb.add( this, event, fn, selector, data, _one );
                }, this);
            });
        }else if( typeof events == "object" ){
            if( fn )
                fn = null;
            baidu.forEach(events, function( fn, eventName ){
                this.on( eventName, selector, data, fn, _one );
            }, this);
        }

        return this;
    }

    // _on: function( name, data, fn ){
    //   var eb = baidu._util_.eventBase;
    //   this.each(function(){
    //       eb.add( this, name, fn, undefined, data );
    //   });
    //   return this;
    // }
});

/// support - magic Tangram 1.x Code Start
/// support magic - Tangram 1.x Code Start

baidu.dom.g = function(id) {
    if (!id) return null; //修改IE下baidu.dom.g(baidu.dom.g('dose_not_exist_id'))报错的bug，by Meizz, dengping
    if ('string' == typeof id || id instanceof String) {
        return document.getElementById(id);
    } else if (id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
        return id;
    }
    return null;
};

/// support magic - Tangram 1.x Code End

baidu.event.on = baidu.on = function( element, evtName, handler ){
    if( typeof element == "string" )
        element = baidu.dom.g( element );
    baidu.dom( element ).on( evtName.replace(/^\s*on/, ""), handler );
    return element;
};
/// support - magic Tangram 1.x Code End

 

 

void function(){
    var ajaxLocation = document.URL,
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
        rprotocol = /^\/\//,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        rhash = /#.*$/,
        rbracket = /\[\]$/,
        rnoContent = /^(?:GET|HEAD)$/,
        rts = /([?&])_=[^&]*/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
        
        // JSON RegExp
        rvalidchars = /^[\],:{}\s]*$/,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
        
        
        
        allTypes = ['*/'] + ['*'],
        
        prefilters = {},
        transports = {},
        
        lastModified = {},
        etag = {},
        
        
        
        ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];
        
    function parseXML(data){
        var xml, tmp;
        if (!data || baidu.type(data) !== 'string') {
            return null;
        }
        try {
            if ( window.DOMParser ) { // Standard
                tmp = new DOMParser();
                xml = tmp.parseFromString( data , "text/xml" );
            } else { // IE
                xml = new ActiveXObject( "Microsoft.XMLDOM" );
                xml.async = "false";
                xml.loadXML( data );
            }
        } catch( e ) {
            xml = undefined;
        }
        if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
            throw new Error( "Invalid XML: " + data );
        }
        return xml;
    }
    
    function parseJSON(data){
        if(!data || baidu.type(data) !== 'string'){return null;}
        data = baidu.string(data).trim();
        if ( window.JSON && window.JSON.parse ) {
            return window.JSON.parse( data );
        }
        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
            .replace( rvalidtokens, ']')
            .replace( rvalidbraces, ''))) {

            return ( new Function( 'return ' + data ) )();

        }
        throw new Error( "Invalid JSON: " + data );
    }
    
    function globalEval( data ) {
        if ( data && /\S/.test( data ) ) {
            ( window.execScript || function( data ) {
                window[ "eval" ].call( window, data );
            } )( data );
        }
    }
    
    function toPrefiltersOrTransports(structure){
        return function(expression, func){
            if(baidu.type(expression) !== 'string'){
                func = expression;
                expression = '*';
            }
            var dataTypes = expression.toLowerCase().split(/\s+/),
                placeBefore, array;
            
            if(baidu.type(func) === 'function'){
                for(var i = 0, item; item = dataTypes[i]; i++){
                    placeBefore = /^\+/.test(item);
                    placeBefore && (item = item.substr(1) || '*');
                    array = structure[item] = structure[item] || [];
                    array[placeBefore ? 'unshift' : 'push'](func);
                }
            }
        };
    }
    
    
    function ajaxHandleResponses(opts, tangXHR, responses){
        var ct, type, finalDataType, firstDataType,
            contents = opts.contents,
            dataTypes = opts.dataTypes,
            responseFields = opts.responseFields;
        
        for ( type in responseFields ) {
            if ( type in responses ) {
                tangXHR[responseFields[type]] = responses[ type ];
            }
        }
        while(dataTypes[0] === '*'){
            dataTypes.shift();
            if (ct === undefined){
                ct = opts.mimeType || tangXHR.getResponseHeader('content-type');
            }
        }
        if(ct){
            for(type in contents ){
                if(contents[type] && contents[type].test(ct)){
                    dataTypes.unshift(type);
                    break;
                }
            }
        }
        if (dataTypes[0] in responses){
            finalDataType = dataTypes[0];
        } else {
            for (type in responses){
                if (!dataTypes[0] || opts.converters[type + ' ' + dataTypes[0]]){
                    finalDataType = type;
                    break;
                }
                if (!firstDataType) {
                    firstDataType = type;
                }
            }
            finalDataType = finalDataType || firstDataType;
        }
        if(finalDataType){
            if(finalDataType !== dataTypes[0]){
                dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
        }
    }
    
    function ajaxConvert(opts, response){
        var dataTypes = opts.dataTypes.slice(),
            prev = dataTypes[0],
            converters = {},
            conv, array;
            
            
            
        opts.dataFilter && (response = opts.dataFilter(response, opts.dataType));
        if(dataTypes[1]){
            for(var i in opts.converters){
                converters[i.toLowerCase()] = opts.converters[i];
            }
        }
        for(var i = 0, curr; curr = dataTypes[++i];){
            if(curr !== '*'){
                if(prev !== '*' && prev !== curr){
                    conv = converters[prev + ' ' + curr] || converters['* ' + curr];
                    if(!conv){
                        for(var key in converters){
                            array = key.split(' ');
                            if(array[1] === curr){
                                conv = converters[prev + ' ' + array[0]]
                                    || converters['* ' + array[0]];
                                if(conv){
                                    if(conv === true){
                                        conv = converters[key];
                                    }else if(converters[key] !== true){
                                        curr = array[0];
                                        dataTypes.splice(i--, 0, curr);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    
                    if(conv !== true){
                        if(conv && opts['throws']){
                            response = conv(response);
                        }else{
                            try{
                                response = conv(response);
                            }catch(e){
                                return { state: 'parsererror', error: conv ? e : 'No conversion from ' + prev + ' to ' + curr };
                            }
                        }
                    }
                }
                prev = curr;
            }
        }
        return { state: 'success', data: response };
    }
    
    
    function inspectPrefiltersOrTransports(structure, options, originalOptions, tangXHR, dataType, inspected){
        dataType = dataType || options.dataTypes[0];
        inspected = inspected || {};
        inspected[dataType] = true;
        
        var selection,
        list = structure[ dataType ],
        length = list ? list.length : 0,
        executeOnly = ( structure === prefilters );
        
        for (var i = 0; i < length && ( executeOnly || !selection ); i++ ) {
            selection = list[ i ]( options, originalOptions, tangXHR );
            if ( typeof selection === "string" ) {
                if ( !executeOnly || inspected[selection]){
                    selection = undefined;
                } else {
                    options.dataTypes.unshift(selection);
                    selection = inspectPrefiltersOrTransports(
                            structure, options, originalOptions, tangXHR, selection, inspected );
                }
            }
        }
        if ( ( executeOnly || !selection ) && !inspected['*'] ) {
            selection = inspectPrefiltersOrTransports(
                    structure, options, originalOptions, tangXHR, '*', inspected );
        }
        return selection;
    }
    
    baidu.createChain('ajax', function(url, options){
        if(baidu.object.isPlain(url)){
            options = url;
            url = undefined;
        }
        options = options || {};
        
        var opts = baidu.ajax.setup({}, options),
            callbackContext = opts.context || opts,
            fireGlobals,
            ifModifiedKey,
            parts,
            
            //tangXHR
            
            deferred = baidu.Deferred(),
            completeDeferred = baidu.Callbacks('once memory'),
            statusCode = opts.statusCode || {},
            
            state = 0,
            requestHeadersNames = {},
            requestHeaders = {},
            strAbort = 'canceled',
            responseHeadersString,
            responseHeaders,
            transport,
            //tangXHR
            //done
            
            //done
            tangXHR = baidu.extend(new baidu.ajax.$Ajax(url, opts), {
                readyState: 0,
                setRequestHeader: function(name, value){
                    if(!state){
                        var lname = name.toLowerCase();
                        name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
                        requestHeaders[ name ] = value;
                    }
                },
                getAllResponseHeaders: function(){
                    return state === 2 ? responseHeadersString : null;
                },
                
                getResponseHeader: function(key){
                    var match;
                    if(state === 2){
                        if(!responseHeaders){
                            responseHeaders = {};
                            while(match = rheaders.exec(responseHeadersString)){
                                responseHeaders[match[1].toLowerCase()] = match[2];
                            }
                        }
                        match = responseHeaders[key.toLowerCase()];
                    }
                    return match === undefined ? null : match;
                },
                
                overrideMimeType: function(type){
                    !state && (opts.mimeType = type);
                    return this;
                },
                
                abort: function(statusText){
                    statusText = statusText || strAbort;
                    transport && transport.abort(statusText);
                    done(0, statusText);
                    return this;
                }
            });
        var timeoutTimer;
        
        
        function done(status, nativeStatusText, responses, headers){
            var statusText = nativeStatusText,
                isSuccess, success, error, response, modified;
            if(state === 2){return;}
            state = 2;
            timeoutTimer && clearTimeout(timeoutTimer);
            transport = undefined;
            responseHeadersString = headers || '';
            tangXHR.readyState = status > 0 ? 4 : 0;
            responses && (response = ajaxHandleResponses(opts, tangXHR, responses));
            
            if(status >= 200 && status < 300 || status === 304){
                if(opts.ifModified){
                    modified = tangXHR.getResponseHeader('Last-Modified');
                    modified && (lastModified[ifModifiedKey] = modified);
                    modified = tangXHR.getResponseHeader('Etag');
                    modified && (etag[ifModifiedKey] = modified);
                }
                if(status === 304){
                    statusText = 'notmodified';
                    isSuccess = true;
                }else{
                    isSuccess = ajaxConvert(opts, response);
                    statusText = isSuccess.state;
                    success = isSuccess.data;
                    error = isSuccess.error;
                    isSuccess = !error;
                }
            }else{
                error = statusText;
                if(!statusText || status){
                    statusText = 'error';
                    status < 0 && (status = 0);
                }
            }
            
            tangXHR.status = status;
            tangXHR.statusText = '' + (nativeStatusText || statusText);
            
            if(isSuccess){
                deferred.resolveWith(callbackContext, [success, statusText, tangXHR]);
            }else{
                deferred.rejectWith(callbackContext, [tangXHR, statusText, error]);
            }
            tangXHR.statusCode(statusCode);
            statusCode = undefined;
            
//          fireGlobals && globalEventContext.trigger('ajax' + (isSuccess ? 'Success' : 'Error'),
//                      [tangXHR, opts, isSuccess ? success : error]);
            completeDeferred.fireWith(callbackContext, [tangXHR, statusText]);
            //TODO ajaxComplete event;
        }
        
        deferred.promise(tangXHR);
        tangXHR.success = tangXHR.done;
        tangXHR.error = tangXHR.fail;
        tangXHR.complete = completeDeferred.add;
        
        tangXHR.statusCode = function(map){
            if(map){
                if(state < 2){
                    for(var i in map){
                        statusCode[i] = [statusCode[i], map[i]];
                    }
                }else{
                    tangXHR.always(map[tangXHR.status]);
                }
            }
            return this;
        };
        
        //if url is window.location must + ''
        opts.url = ((url || opts.url) + '').replace(rhash, '').replace(rprotocol, ajaxLocParts[1] + '//');
        opts.dataTypes = baidu.string(opts.dataType || '*').trim().toLowerCase().split(/\s+/);
        // Determine if a cross-domain request is in order
        if (opts.crossDomain == null){
            parts = rurl.exec(opts.url.toLowerCase());
            opts.crossDomain = !!(parts && (parts[1] != ajaxLocParts[1] || parts[2] != ajaxLocParts[2]
                || (parts[3] || (parts[1] === 'http:' ? 80 : 443)) !=
                    (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? 80 : 443))));
        }
        if(opts.data && opts.processData && baidu.type(opts.data) !== 'string'){
            opts.data = baidu.ajax.param(opts.data, opts.traditional );
        }
        
        inspectPrefiltersOrTransports(prefilters, opts, options, tangXHR);//运行prefilter()
        
        if(state === 2){return '';}
        fireGlobals = opts.global;
        opts.type = opts.type.toUpperCase();
        opts.hasContent = !rnoContent.test(opts.type);
        
        //trigger ajaxStart start;
        //trigger ajaxStart end;
        if(!opts.hasContent){
            if(opts.data){
                opts.url += (~opts.url.indexOf('?') ? '&' : '?') + opts.data;
                delete opts.data;
            }
            ifModifiedKey = opts.url;
            if(opts.cache === false){
                var now = new Date().getTime(),
                    ret = opts.url.replace(rts, '$1_=' + now);
                opts.url = ret + (ret === opts.url ? (~opts.url.indexOf('?') ? '&' : '?') + '_=' + now : '');
            }
        }
        if(opts.data && opts.hasContent && opts.contentType !== false
            || options.contentType){
                tangXHR.setRequestHeader('Content-Type', opts.contentType);
        }
        if(opts.ifModified){
            ifModifiedKey = ifModifiedKey || opts.url;
            lastModified[ifModifiedKey]
                && tangXHR.setRequestHeader('If-Modified-Since', lastModified[ifModifiedKey]);
            etag[ifModifiedKey]
                && tangXHR.setRequestHeader('If-None-Match', etag[ifModifiedKey]);
        }
        
        tangXHR.setRequestHeader('Accept',
            opts.dataTypes[0] && opts.accepts[opts.dataTypes[0]] ?
                opts.accepts[opts.dataTypes[0]] + (opts.dataTypes[0] !== '*' ? ', ' + allTypes + '; q=0.01' : '')
                    : opts.accepts['*']);
        
        for(var i in opts.headers){
            tangXHR.setRequestHeader(i, opts.headers[i]);
        }
        if(opts.beforeSend && (opts.beforeSend.call(callbackContext, tangXHR, opts) === false || state === 2)){
            return tangXHR.abort();
        }
        strAbort = 'abort';
        for(var i in {success: 1, error: 1, complete: 1}){
            tangXHR[i](opts[i]);
        }
        transport = inspectPrefiltersOrTransports(transports, opts, options, tangXHR);
        if(!transport){
            done(-1, 'No Transport');
        }else{
            tangXHR.readyState = 1;
            //TODO trigger ajaxSend
            if(opts.async && opts.timeout > 0){
                timeoutTimer = setTimeout(function(){
                    tangXHR.abort('timeout')
                }, opts.timeout);
            }
            try{
                state = 1;
                transport.send(requestHeaders, done);
            }catch(e){
                if(state < 2){
                    done(-1, e);
                }else{
                    throw e;
                }
            }
        }
        return tangXHR;
    }, function(url, options){
        this.url = url;
        this.options = options;
    });
    
    baidu.ajax.settings = {
       url: ajaxLocation,
        isLocal: rlocalProtocol.test(ajaxLocParts[1]),
        global: true,
        type: 'GET',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        processData: true,
        async: true,
        
        accepts: {
            xml: 'application/xml, text/xml',
            html: 'text/html',
            text: 'text/plain',
            json: 'application/json, text/javascript',
            '*': allTypes
        },
        contents: {
            xml: /xml/,
            html: /html/,
            json: /json/
        },
        responseFields: {
            xml: 'responseXML',
            text: 'responseText'
        },
        converters: {
            '* text': window.String,
            'text html': true,
            'text json': parseJSON,
            'text xml': parseXML
        },
        flatOptions: {
            context: true,
            url: true
        }
    };
    //
    function ajaxExtend(target, src){
        var flatOpt = baidu.ajax.settings.flatOptions || {},
            deep;
        for(var i in src){
            if(src[i] !== undefined){
                (flatOpt[i] ? target : (deep || (deep = {})))[i] = src[i]
            }
        }
        deep && baidu.extend(true, target, deep);
    }
    
    baidu.ajax.setup = function(target, settings){
        if(settings){
            ajaxExtend(target, baidu.ajax.settings);
        }else{
            settings = target;
            target = baidu.ajax.settings;
        }
        ajaxExtend(target, settings);
        return target;
    };
    
    //
    
    function addParam(array, key, val){
        val = baidu.type(val) === 'function' ? val() : (typeof val == 'undefined' || val == null ? '' : val);
        array.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
    }
    function buildParams(array, key, val, traditional){
        if(baidu.type(val) === 'array'){
            baidu.forEach(val, function(item, index){
                if(traditional || rbracket.test(key)){
                    addParam(array, key, item);
                }else{
                    buildParams(array, key + '[' + (typeof item === 'object' ? index : '') + ']', item, traditional);
                }
            });
        }else if(!traditional && baidu.type(val) === "object"){
            for(var i in val){
                buildParams(array, key + '[' + i + ']', val[i], traditional);
            }
        }else{
            addParam(array, key, val);
        }
    }
    
    baidu.ajax.param = function(src, traditional){
        var ret = [];
        if(baidu.type(src) === 'array'){
            baidu.forEach(src, function(item){
                addParam(ret, item.name, item.value);
            });
        }else{
            for(var i in src){
                buildParams(ret, i, src[i], traditional);
            }
        }
        return ret.join('&').replace(/%20/g, '+');
    };
    
    baidu.ajax.prefilter = toPrefiltersOrTransports(prefilters);
    baidu.ajax.transport = toPrefiltersOrTransports(transports);
    
    //jsonp
    var oldCallbacks = [],
        rjsonp = /(=)\?(?=&|$)|\?\?/,
        nonce = new Date().getTime();
    baidu.ajax.setup({
        jsonp: 'callback',
        jsonpCallback: function(){
            var callback = oldCallbacks.pop() || (baidu.key + '_' + (nonce++));
            this[callback] = true;
            return callback;
        }
    });
    baidu.ajax.prefilter('json jsonp', function(opts, originalSettings, tangXHR){
        var callbackName, overwritten, responseContainer,
            data = opts.data,
            url = opts.url,
            hasCallback = opts.jsonp !== false,
            replaceInUrl = hasCallback && rjsonp.test(url),
            replaceInData = hasCallback && !replaceInUrl && baidu.type(data) === 'string'
                // && !~(opts.contentType || '').indexOf('application/x-www-form-urlencoded')
                && !(opts.contentType || '').indexOf('application/x-www-form-urlencoded')
                && rjsonp.test(data);
        if(opts.dataTypes[0] === 'jsonp' || replaceInUrl || replaceInData){
            callbackName = opts.jsonpCallback = baidu.type(opts.jsonpCallback) === 'function' ?
                opts.jsonpCallback() : opts.jsonpCallback;
            overwritten = window[callbackName];
            
            if (replaceInUrl) {
                opts.url = url.replace(rjsonp, '$1' + callbackName );
            } else if (replaceInData) {
                opts.data = data.replace(rjsonp, '$1' + callbackName );
            } else if (hasCallback) {
                opts.url += (/\?/.test(url) ? '&' : '?') + opts.jsonp + '=' + callbackName;
            }
            
            opts.converters['script json'] = function() {
//              !responseContainer && baidu.error( callbackName + " was not called" );
                return responseContainer[0];
            }
            
            opts.dataTypes[0] = 'json';
            window[callbackName] = function(){responseContainer = arguments;}
            tangXHR.always(function(){
                window[callbackName] = overwritten;
                if (opts[callbackName]){
                    opts.jsonpCallback = originalSettings.jsonpCallback;
                    oldCallbacks.push(callbackName);
                }
                if (responseContainer && baidu.type(overwritten) === 'function'){
                    overwritten(responseContainer[0]);
                }
                responseContainer = overwritten = undefined;
            });
            return 'script';
        }
    });
    
    baidu.ajax.setup({
        accepts: {script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'},
        contents: {script: /javascript|ecmascript/},
        converters: {'text script': function(txt){
            globalEval(txt);
            return txt;
        }}
    });
    
    baidu.ajax.prefilter('script', function(opts){
        opts.cache === undefined && (opts.cache = false);
        if(opts.crossDomain){
            opts.type = 'GET';
            opts.global = false;
        }
    });
    
    baidu.ajax.transport('script', function(opts){
        if(opts.crossDomain){
            var script,
                head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
            return {
                send: function(arg, callback){
                    script = document.createElement('script');
                    script.async = 'async';
                    opts.scriptCharset && (script.charset = opts.scriptCharset);
                    script.src = opts.url;
                    script.onload = script.onreadystatechange = function(arg, isAbort){
                        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState)){
                            script.onload = script.onreadystatechange = null;
                            head && script.parentNode && head.removeChild( script );
                            script = undefined;
                            !isAbort && callback(200, 'success');
                        }
                    }
                    head.insertBefore(script, head.firstChild);
                },
                
                abort: function(){
                    script && script.onload(0, 1);
                }
            };
        }
    });
    
    var xhrCallbacks,
        xhrId = 0,
        xhrOnUnloadAbort = window.ActiveXObject ? function(){
            for ( var key in xhrCallbacks ) {
                xhrCallbacks[ key ]( 0, 1 );
            }
        } : false;
        
    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch( e ) {}
    }
    
    function createActiveXHR() {
        try {
            return new window.ActiveXObject('Microsoft.XMLHTTP');
        } catch( e ) {}
    }
    
    baidu.ajax.settings.xhr = window.ActiveXObject ? function(){
        return !this.isLocal && createStandardXHR() || createActiveXHR();
    } : createStandardXHR;
    
    void function(xhr){
        baidu.extend(baidu._util_.support, {
            ajax: !!xhr,
            cors: !!xhr && ('withCredentials' in xhr)
        });
    }(baidu.ajax.settings.xhr());
    
    if(baidu._util_.support.ajax){
        baidu.ajax.transport(function(opts){
            if(!opts.crossDomain || baidu._util_.support.cors){
                var callback;
                return {
                    send: function(headers, complete){
                        var handle, xhr = opts.xhr();
                        //it's can not use apply here
                        if(opts.username){
                            xhr.open(opts.type, opts.url, opts.async, opts.username, opts.password);
                        }else{
                            xhr.open(opts.type, opts.url, opts.async);
                        }
                        
                        if(opts.xhrFields){
                            for(var i in opts.xhrFields){
                                xhr[i] = opts.xhrFields[i];
                            }
                        }
                        
                        if(opts.mimeType && xhr.overrideMimeType){
                            xhr.overrideMimeType(opts.mimeType);
                        }
                        
                        if(!opts.crossDomain && !headers['X-Requested-With']){
                            headers['X-Requested-With'] = 'XMLHttpRequest';
                        }
                        
                        try{
                            for(var i in headers){
                                xhr.setRequestHeader(i, headers[i]);
                            }
                        }catch(e){}

                        xhr.send((opts.hasContent && opts.data) || null);
                        
                        callback = function(arg, isAbort){
                            var status,
                                statusText,
                                responseHeaders,
                                responses,
                                xml;
                            try{
                                if(callback && (isAbort || xhr.readyState === 4)){
                                    callback = undefined;
                                    if (handle){
                                        xhr.onreadystatechange = function(){};
                                        xhrOnUnloadAbort && (delete xhrCallbacks[handle]);
                                    }
                                    
                                    if(isAbort){
                                        xhr.readyState !== 4 && xhr.abort();
                                    }else{
                                        status = xhr.status;
                                        responseHeaders = xhr.getAllResponseHeaders();
                                        responses = {};
                                        xml = xhr.responseXML;
                                        xml && xml.documentElement && (responses.xml = xml);
                                        try{
                                            responses.text = xhr.responseText;
                                        }catch(e){}
                                        
                                        try{
                                            statusText = xhr.statusText;
                                        }catch(e){statusText = '';}
                                        if(!status && opts.isLocal && !opts.crossDomain){
                                            status = responses.text ? 200 : 404;
                                        }else if(status === 1223){
                                            status = 204;
                                        }
                                    }
                                }
                            }catch(firefoxAccessException){
                                !isAbort && complete(-1, firefoxAccessException);
                            }
                            responses && complete(status, statusText, responses, responseHeaders);
                        }
                        
                        if(!opts.async){
                            callback();
                        }else if(xhr.readyState === 4){
                            setTimeout(callback, 0)
                        }else{
                            handle = ++xhrId;
                            if(xhrOnUnloadAbort){
                                if(!xhrCallbacks){
                                    xhrCallbacks = {};
                                    baidu.dom(window).on('unload', xhrOnUnloadAbort);
                                }
                                xhrCallbacks[handle] = callback;
                            }
                            xhr.onreadystatechange = callback;
                        }
                    },
                    
                    abort: function(){
                        callback && callback(0, 1);
                    }
                };
            }
        });
    }
}();

baidu.array.extend({
    contains : function (item) {
        return !!~this.indexOf(item);
    }
});

baidu.each = function( enumerable, iterator, context ) {
    var i, n, t, result;

    if ( typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if ( typeof n == "number" ) {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for ( i=0; i<n; i++ ) {
                //enumerable[ i ] 有可能会是0
                t = enumerable[ i ];
                t === undefined && (t = enumerable.charAt && enumerable.charAt( i ));
                // 被循环执行的函数，默认会传入三个参数(i, array[i], array)
                result = iterator.call( context || t, i, t, enumerable );

                // 被循环执行的函数的返回值若为 false 和"break"时可以影响each方法的流程
                if ( result === false || result == "break" ) {break;}
            }
        
        // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i=0; i<enumerable; i++) {
                result = iterator.call( context || i, i, i, i);
                if ( result === false || result == "break" ) { break;}
            }
        
        // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if ( enumerable.hasOwnProperty(i) ) {
                    result = iterator.call( context || enumerable[ i ], i, enumerable[ i ], enumerable );

                    if ( result === false || result == "break" ) { break;}
                }
            }
        }
    }

    return enumerable;
};

baidu.array.extend({
    each: function(iterator, context){
        return baidu.each(this, iterator, context);
    },
    
    forEach: function(iterator, context){
        return baidu.forEach(this, iterator, context);
    }
});

baidu.array.extend({
    empty : function () {
        this.length = 0;
        return this;
    }
});

baidu.array.extend({
    filter: function(iterator, context) {
        var result = baidu.array([]),
            i, n, item, index=0;
    
        if (baidu.type(iterator) === "function") {
            for (i=0, n=this.length; i<n; i++) {
                item = this[i];
    
                if (iterator.call(context || this, item, i, this) === true) {
                    result[index ++] = item;
                }
            }
        }
        return result;
    }
});

baidu.array.extend({
    find : function (iterator) {
        var i, item, n=this.length;

        if (baidu.type(iterator) == "function") {
            for (i=0; i<n; i++) {
                item = this[i];
                if (iterator.call(this, item, i, this) === true) {
                    return item;
                }
            }
        }

        return null;
    }
});

baidu.array.extend({
    hash : function (values) {
        var result = {},
            vl = values && values.length,
            i, n;

        for (i=0, n=this.length; i < n; i++) {
            result[this[i]] = (vl && vl > i) ? values[i] : true;
        }
        return result;
    }
});

baidu.array.extend({
    lastIndexOf : function (match, fromIndex) {
        baidu.check(".+(,number)?", "baidu.array.lastIndexOf");
        var len = this.length;

        (!(fromIndex = fromIndex | 0) || fromIndex >= len) && (fromIndex = len - 1);
        fromIndex < 0 && (fromIndex += len);

        for(; fromIndex >= 0; fromIndex --){
            if(fromIndex in this && this[fromIndex] === match){
                return fromIndex;
            }
        }
        
        return -1;
    }
});

baidu.array.extend({
    map: function(iterator, context){
        baidu.check("function(,.+)?","baidu.array.map");
        var len = this.length,
            array = baidu.array([]);
        for(var i = 0; i < len; i++){
            array[i] = iterator.call(context || this, this[i], i, this);
        }
        return array;
    }
});

baidu.array.extend({
    remove : function (match) {
        var n = this.length;
            
        while (n--) {
            if (this[n] === match) {
                this.splice(n, 1);
            }
        }
        return this;
    }
});

baidu.array.extend({
    removeAt : function (index) {
        baidu.check("number", "baidu.array.removeAt");
        return this.splice(index, 1)[0];
    }
});

baidu.base = baidu.base || {blank: function(){}};

baidu.base.Class = (function() {
    var instances = (baidu._global_ = window[baidu.guid])._instances;
    instances || (instances = baidu._global_._instances = {});

    // constructor
    return function() {
        this.guid = baidu.id();
        this._decontrol_ || (instances[this.guid] = this);
    }
})();

baidu.extend(baidu.base.Class.prototype, {
    
    toString: baidu.base.Class.prototype.toString = function(){
        return "[object " + ( this._type_ || "Object" ) + "]";
    }

    
    ,dispose: function() {
        // 2013.1.11 暂时关闭此事件的派发
        // if (this.fire("ondispose")) {
            // decontrol
            delete baidu._global_._instances[this.guid];

            if (this._listeners_) {
                for (var item in this._listeners_) {
                    this._listeners_[item].length = 0;
                    delete this._listeners_[item];
                }
            }

            for (var pro in this) {
                if ( !baidu.isFunction(this[pro]) ) delete this[pro];
                else this[pro] = baidu.base.blank;
            }

            this.disposed = true;   //20100716
        // }
    }

    
    ,fire: function(event, options) {
        baidu.isString(event) && (event = new baidu.base.Event(event));

        var i, n, list, item
            , t=this._listeners_
            , type=event.type
            // 20121023 mz 修正事件派发多参数时，参数的正确性验证
            , argu=[event].concat( Array.prototype.slice.call(arguments, 1) );
        !t && (t = this._listeners_ = {});

        // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
        baidu.extend(event, options || {});

        event.target = event.target || this;
        event.currentTarget = this;

        type.indexOf("on") && (type = "on" + type);

        baidu.isFunction(this[type]) && this[type].apply(this, argu);
        (i=this._options) && baidu.isFunction(i[type]) && i[type].apply(this, argu);

        if (baidu.isArray(list = t[type])) {
            for ( i=list.length-1; i>-1; i-- ) {
                item = list[i];
                item && item.handler.apply( this, argu );
                item && item.once && list.splice( i, 1 );
            }
        }

        return event.returnValue;
    }

    
    ,on: function(type, handler, once) {
        if (!baidu.isFunction(handler)) {
            return this;
        }

        var list, t = this._listeners_;
        !t && (t = this._listeners_ = {});

        type.indexOf("on") && (type = "on" + type);

        !baidu.isArray(list = t[type]) && (list = t[type] = []);
        t[type].unshift( {handler: handler, once: !!once} );

        return this;
    }
    // 20120928 mz 取消on()的指定key

    ,once: function(type, handler) {
        return this.on(type, handler, true);
    }
    ,one: function(type, handler) {
        return this.on(type, handler, true);
    }

    
    ,off: function(type, handler) {
        var i, list,
            t = this._listeners_;
        if (!t) return this;

        // remove all event listener
        if (typeof type == "undefined") {
            for (i in t) {
                delete t[i];
            }
            return this;
        }

        type.indexOf("on") && (type = "on" + type);

        // 移除某类事件监听
        if (typeof handler == "undefined") {
            delete t[type];
        } else if (list = t[type]) {

            for (i = list.length - 1; i >= 0; i--) {
                list[i].handler === handler && list.splice(i, 1);
            }
        }

        return this;
    }
});
baidu.base.Class.prototype.addEventListener = 
baidu.base.Class.prototype.on;
baidu.base.Class.prototype.removeEventListener =
baidu.base.Class.prototype.un =
baidu.base.Class.prototype.off;
baidu.base.Class.prototype.dispatchEvent =
baidu.base.Class.prototype.fire;

window["baiduInstance"] = function(guid) {
    return window[baidu.guid]._instances[ guid ];
}

baidu.base.Event = function(type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
    this.preventDefault = function() {this.returnValue = false;};
};

//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性

baidu.base.inherits = function (subClass, superClass, type) {
    var key, proto, 
        selfProps = subClass.prototype, 
        clazz = new Function();
        
    clazz.prototype = superClass.prototype;
    proto = subClass.prototype = new clazz();

    for (key in selfProps) {
        proto[key] = selfProps[key];
    }
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;

    // 类名标识，兼容Class的toString，基本没用
    typeof type == "string" && (proto._type_ = type);

    subClass.extend = function(json) {
        for (var i in json) proto[i] = json[i];
        return subClass;
    }
    
    return subClass;
};

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写

baidu.base.register = function (Class, constructorHook, methods) {
    (Class._reg_ || (Class._reg_ = [])).push( constructorHook );

    for (var method in methods) {
        Class.prototype[method] = methods[method];
    }
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129 meizz   添加第三个参数，可以直接挂载方法到目标类原型链上

//baidu.browser.chrome = /chrome\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;

//baidu.browser.firefox = /firefox\/(\d+\.\d+)/i.test(navigator.userAgent) ? + RegExp['\x241'] : undefined;

//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;

//baidu.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);

//baidu.browser.isStrict = document.compatMode == "CSS1Compat";

//baidu.browser.isWebkit = /webkit/i.test(navigator.userAgent);

//try {
//  if (/(\d+\.\d+)/.test(external.max_version)) {

//      baidu.browser.maxthon = + RegExp['\x241'];
//  }
//} catch (e) {}

//baidu.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;

//(function(){
//  var ua = navigator.userAgent;
    
    
    
//  baidu.browser.safari = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) ? + (RegExp['\x241'] || RegExp['\x242']) : undefined;
//})();

baidu.cookie = baidu.cookie || {};

baidu.cookie._isValidKey = function (key) {
    // http://www.w3.org/Protocols/rfc2109/rfc2109
    // Syntax:  General
    // The two state management headers, Set-Cookie and Cookie, have common
    // syntactic properties involving attribute-value pairs.  The following
    // grammar uses the notation, and tokens DIGIT (decimal digits) and
    // token (informally, a sequence of non-special, non-white space
    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
    // their syntax.
    // av-pairs   = av-pair *(";" av-pair)
    // av-pair  = attr ["=" value] ; optional value
    // attr    = token
    // value      = word
    // word    = token | quoted-string
    
    // http://www.ietf.org/rfc/rfc2068.txt
    // token      = 1*<any CHAR except CTLs or tspecials>
    // CHAR    = <any US-ASCII character (octets 0 - 127)>
    // CTL      = <any US-ASCII control character
    //            (octets 0 - 31) and DEL (127)>
    // tspecials  = "(" | ")" | "<" | ">" | "@"
    //            | "," | ";" | ":" | "\" | <">
    //            | "/" | "[" | "]" | "?" | "="
    //            | "{" | "}" | SP | HT
    // SP        = <US-ASCII SP, space (32)>
    // HT        = <US-ASCII HT, horizontal-tab (9)>
        
    return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
};

baidu.cookie.getRaw = function (key) {
    if (baidu.cookie._isValidKey(key)) {
        var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
            result = reg.exec(document.cookie);
            
        if (result) {
            return result[2] || null;
        }
    }

    return null;
};

 
baidu.cookie.get = function (key) {
    var value = baidu.cookie.getRaw(key);
    if ('string' == typeof value) {
        value = decodeURIComponent(value);
        return value;
    }
    return null;
};

baidu.cookie.setRaw = function (key, value, options) {
    if (!baidu.cookie._isValidKey(key)) {
        return;
    }
    
    options = options || {};
    //options.path = options.path || "/"; // meizz 20100402 设定一个初始值，方便后续的操作
    //berg 20100409 去掉，因为用户希望默认的path是当前路径，这样和浏览器对cookie的定义也是一致的
    
    // 计算cookie过期时间
    var expires = options.expires;
    if ('number' == typeof options.expires) {
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires);
    }
    
    document.cookie =
        key + "=" + value
        + (options.path ? "; path=" + options.path : "")
        + (expires ? "; expires=" + expires.toGMTString() : "")
        + (options.domain ? "; domain=" + options.domain : "")
        + (options.secure ? "; secure" : ''); 
};

baidu.cookie.remove = function (key, options) {
    options = options || {};
    options.expires = new Date(0);
    baidu.cookie.setRaw(key, '', options);
};

baidu.cookie.set = function (key, value, options) {
    baidu.cookie.setRaw(key, encodeURIComponent(value), options);
};

baidu.createClass = function(constructor, type, options) {
    constructor = baidu.isFunction(constructor) ? constructor : function(){};
    options = typeof type == "object" ? type : options || {};

    // 创建新类的真构造器函数
    var fn = function(){
        var me = this;

        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
        options.decontrolled && (me._decontrol_ = true);

        // 继承父类的构造器
        fn.superClass.apply(me, arguments);

        // 全局配置
        for (var i in fn.options) me[i] = fn.options[i];

        constructor.apply(me, arguments);

        for (var i=0, reg=fn._reg_; reg && i<reg.length; i++) {
            reg[i].apply(me, arguments);
        }
    };

    baidu.extend(fn, {
        superClass: options.superClass || baidu.base.Class

        ,inherits: function(superClass){
            if (typeof superClass != "function") return fn;

            var C = function(){};
            C.prototype = (fn.superClass = superClass).prototype;

            // 继承父类的原型（prototype)链
            var fp = fn.prototype = new C();
            // 继承传参进来的构造器的 prototype 不会丢
            baidu.extend(fn.prototype, constructor.prototype);
            // 修正这种继承方式带来的 constructor 混乱的问题
            fp.constructor = constructor;

            return fn;
        }

        ,register: function(hook, methods) {
            (fn._reg_ || (fn._reg_ = [])).push( hook );
            methods && baidu.extend(fn.prototype, methods);
            return fn;
        }
        
        ,extend: function(json){baidu.extend(fn.prototype, json); return fn;}
    });

    type = baidu.isString(type) ? type : options.className || options.type;
    baidu.isString(type) && (constructor.prototype._type_ = type);
    baidu.isFunction(fn.superClass) && fn.inherits(fn.superClass);

    return fn;
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20121105 meizz   给类添加了几个静态属性方法：.options .superClass .inherits() .extend() .register()

baidu.createSingle = function (methods, type) {
    var me = new baidu.base.Class();
    baidu.isString(type) && ( me._type_ = type );
    return baidu.extend(me, methods);
};

baidu.date = baidu.date || {};

baidu.createChain('number', function(number){
    var nan = parseFloat(number),
        val = isNaN(nan) ? nan : number,
        clazz = typeof val === 'number' ? Number : String,
        pro = clazz.prototype;
    val = new clazz(val);
    baidu.forEach(baidu.number.$Number.prototype, function(value, key){
        pro[key] || (val[key] = value);
    });
    return val;
});

baidu.number.extend({
    pad : function (length) {
        var source = this;
        var pre = "",
            negative = (source < 0),
            string = String(Math.abs(source));
    
        if (string.length < length) {
            pre = (new Array(length - string.length + 1)).join('0');
        }
    
        return (negative ?  "-" : "") + pre + string;
    }
});

baidu.date.format = function (source, pattern) {
    if ('string' != typeof pattern) {
        return source.toString();
    }

    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }
    
    var pad  = baidu.number.pad,
        year    = source.getFullYear(),
        month   = source.getMonth() + 1,
        date2   = source.getDate(),
        hours   = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();

    replacer(/yyyy/g, pad(year, 4));
    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
    replacer(/MM/g, pad(month, 2));
    replacer(/M/g, month);
    replacer(/dd/g, pad(date2, 2));
    replacer(/d/g, date2);

    replacer(/HH/g, pad(hours, 2));
    replacer(/H/g, hours);
    replacer(/hh/g, pad(hours % 12, 2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, pad(minutes, 2));
    replacer(/m/g, minutes);
    replacer(/ss/g, pad(seconds, 2));
    replacer(/s/g, seconds);

    return pattern;
};

baidu.date.parse = function (source) {
    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
    if ('string' == typeof source) {
        if (reg.test(source) || isNaN(Date.parse(source))) {
            var d = source.split(/ |T/),
                d1 = d.length > 1 
                        ? d[1].split(/[^\d]/) 
                        : [0, 0, 0],
                d0 = d[0].split(/[^\d]/);
            return new Date(d0[0] - 0, 
                            d0[1] - 1, 
                            d0[2] - 0, 
                            d1[0] - 0, 
                            d1[1] - 0, 
                            d1[2] - 0);
        } else {
            return new Date(source);
        }
    }
    
    return new Date();
};

baidu.dom.extend({

    pushStack : function ( elems ) {
        var ret = baidu.dom();

        baidu.merge(ret, elems);

        ret.prevObject = this;
        ret.context = this.context;

        return ret;
    }
});

baidu.dom.createElements = function() {
    var tagReg  = /<(\w+)/i,
        rhtml = /<|&#?\w+;/,
        tagMap  = {
            area    : [1, "<map>", "</map>"],
            col  : [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            legend  : [1, "<fieldset>", "</fieldset>"],
            option  : [1, "<select multiple='multiple'>", "</select>"],
            td    : [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            thead   : [1, "<table>", "</table>"],
            tr    : [2, "<table><tbody>", "</tbody></table>"],
            _default: [0, "", ""]
        };

    // 建立映射
    tagMap.optgroup = tagMap.option;
    tagMap.tbody = tagMap.tfoot = tagMap.colgroup = tagMap.caption = tagMap.thead;
    tagMap.th = tagMap.td;

    // 将<script>解析成正常可执行代码
    function parseScript ( box, doc ) {
        var list = box.getElementsByTagName("SCRIPT"),
            i, script, item;

        for ( i=list.length-1; i>=0; i-- ) {
            item = list[ i ];
            script = doc.createElement( "SCRIPT" );

            item.id && (script.id = item.id);
            item.src && (script.src = item.src);
            item.type && (script.type = item.type);
            script[ item.text ? "text" : "textContent" ] = item.text || item.textContent;

            item.parentNode.replaceChild( script, item );
        }
    }

    return function( htmlstring, doc ) {
        baidu.isNumber( htmlstring ) && ( htmlstring = htmlstring.toString() );
        doc = doc || document;

        var wrap, depth, box,
            hs  = htmlstring,
            n   = hs.length,
            div = doc.createElement("div"),
            df  = doc.createDocumentFragment(),
            result = [];

        if ( baidu.isString( hs ) ) {
            if(!rhtml.test(hs)){// TextNode
                result.push( doc.createTextNode( hs ) );
            }else {//htmlString
                wrap = tagMap[ hs.match( tagReg )[1].toLowerCase() ] || tagMap._default;

                div.innerHTML = "<i>mz</i>" + wrap[1] + hs + wrap[2];
                div.removeChild( div.firstChild );  // for ie (<script> <style>)
                parseScript(div, doc);

                depth = wrap[0];
                box = div;
                while ( depth -- ) { box = box.firstChild; };

                baidu.merge( result, box.childNodes );

                // 去除 item.parentNode
                baidu.forEach( result, function (dom) {
                    df.appendChild( dom );
                } );

                div = box = null;
            }
        }

        div = null;

        return result;
    };
}();

baidu.dom.extend({
    add : function (object, context) {
        var a = baidu.array(this.get());

        switch (baidu.type(object)) {
            case "HTMLElement" :
                a.push(object);
                break;

            case "$DOM" :
            case "array" :
                baidu.merge(a, object)
                break;

            // HTMLString or selector
            case "string" :
                baidu.merge(a, baidu.dom(object, context));
                break;
            // [TODO] case "NodeList" :
            default :
                if (typeof object == "object" && object.length) {
                    baidu.merge(a, object)
                }
        }
        return this.pushStack( a.unique() );
    }
});

// meizz 20120601 add方法可以完全使用 baidu.merge(this, baidu.dom(object, context)) 这一句代码完成所有功能，但为节约内存和提高效率的原因，将几个常用分支单独处理了

baidu.dom.extend({
    addClass: function( value ){

        if( !arguments.length )
            return this;

        var t = typeof value, b = " ";

        if( t == "string" ){
            value = baidu.string.trim(value);
            
            var arr = value.split(" ");

            baidu.forEach( this, function(item, index){
                var str = item.className;
                
                for(var i = 0; i < arr.length; i ++)
                    if(!~(b + str + b).indexOf(b + arr[i] + b))
                        str += " " + arr[i];
                
                item.className = str.replace(/^\s+/g, "");
            } );
        }else if( t == "function" )
            baidu.forEach(this, function(item, index){
                baidu.dom(item).addClass(value.call(item, index, item.className));
            });

        return this;
    }
});

baidu.dom.extend({
    getDocument: function(){
        if(this.size()<=0){return undefined;}
        var ele = this[0];
        return ele.nodeType == 9 ? ele : ele.ownerDocument || ele.document;
    }
});

 
 

baidu._util_.cleanData = function(array){
    var tangId;
    for(var i = 0, ele; ele = array[i]; i++){
        tangId = baidu.id(ele, 'get');
        if(!tangId){continue;}
        baidu._util_.eventBase.queue.remove(ele);
        baidu.id(ele, 'remove');
    }
};

baidu.dom.extend({
    empty: function(){
        for(var i = 0, item; item = this[i]; i++){
            item.nodeType === 1 && baidu._util_.cleanData(item.getElementsByTagName('*'));
            while(item.firstChild){
                item.removeChild(item.firstChild);
            }
        }
        return this;
    }
});

baidu.dom.extend({
    append: function(){
        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.append');
        baidu._util_.smartInsert(this, arguments, function(child){
            this.nodeType === 1 && this.appendChild(child);
        });
        return this;
    }
});

baidu.dom.extend({
    html: function(value){

        var bd = baidu.dom,
            bt = baidu._util_,
            me = this,
            isSet = false,
            htmlSerialize = !!bt.support.dom.div.getElementsByTagName('link').length,
            leadingWhitespace = (bt.support.dom.div.firstChild.nodeType === 3),
            result;

        //当dom选择器为空时
        if( !this.size() )
            switch(typeof value){
                case 'undefined':
                    return undefined;
                default:
                    return me;
            }
        
        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
        "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
            rnoInnerhtml = /<(?:script|style|link)/i,
            rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
            rleadingWhitespace = /^\s+/,
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            wrapMap = {
                option: [ 1, "<select multiple='multiple'>", "</select>" ],
                legend: [ 1, "<fieldset>", "</fieldset>" ],
                thead: [ 1, "<table>", "</table>" ],
                tr: [ 2, "<table><tbody>", "</tbody></table>" ],
                td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
                col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
                area: [ 1, "<map>", "</map>" ],
                _default: [ 0, "", "" ]
            };
        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;

        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
        // unless wrapped in a div with non-breaking characters in front of it.
        if ( !htmlSerialize )
            wrapMap._default = [ 1, "X<div>", "</div>" ];

        baidu.forEach( me, function( elem, index ){
            
            if( result )
                return;

            var tangramDom = bd(elem);

            switch( typeof value ){
                case 'undefined':
                    result = ( elem.nodeType === 1 ? elem.innerHTML : undefined );
                    return ;
 
                case 'number':
                    value = String(value);

                case 'string':
                    isSet = true;

                    // See if we can take a shortcut and just use innerHTML
                    if ( !rnoInnerhtml.test( value ) &&
                        ( htmlSerialize || !rnoshimcache.test( value )  ) &&
                        ( leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
                        !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

                        value = value.replace( rxhtmlTag, "<$1></$2>" );

                        try {

                            // Remove element nodes and prevent memory leaks
                            if ( elem.nodeType === 1 ) {
                                tangramDom.empty();
                                elem.innerHTML = value;
                            }

                            elem = 0;

                        // If using innerHTML throws an exception, use the fallback method
                        } catch(e) {}
                    }

                    if ( elem ) {
                        me.empty().append( value );
                    }

                break;

                case 'function':
                    isSet = true;
                    tangramDom.html(value.call(elem, index, tangramDom.html()));
                break;
            };
        });
        
        return isSet ? me : result;
    }
});

baidu._util_.smartInsert = function(tang, args, callback){
    if(args.length <= 0 || tang.size() <= 0){return;}
    if(baidu.type(args[0]) === 'function'){
        var fn = args[0],
            tangItem;
        return baidu.forEach(tang, function(item, index){
            tangItem = baidu.dom(item);
            args[0] = fn.call(item, index, tangItem.html());
            baidu._util_.smartInsert(tangItem, args, callback);
        });
    }
    var doc = tang.getDocument() || document,
        fragment = doc.createDocumentFragment(),
        len = tang.length - 1,
        firstChild;
    for(var i = 0, item; item = args[i]; i++){
        if(item.nodeType){
            fragment.appendChild(item);
        }else{
            baidu.forEach(~'string|number'.indexOf(baidu.type(item)) ?
                baidu.dom.createElements(item, doc)
                    : item, function(ele){
                        fragment.appendChild(ele);
                    });
        }
    }
    if(!(firstChild = fragment.firstChild)){return;}
    baidu.forEach(tang, function(item, index){
        callback.call(item.nodeName.toLowerCase() === 'table'
            && firstChild.nodeName.toLowerCase() === 'tr' ?
                item.tBodies[0] || item.appendChild(item.ownerDocument.createElement('tbody'))
                    : item, index < len ? fragment.cloneNode(true) : fragment);
    });
};

baidu.dom.extend({
    after: function(){
        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.after');

        baidu._util_.smartInsert(this, arguments, function(node){
            this.parentNode && this.parentNode.insertBefore(node, this.nextSibling);
        });

        return this;
    }
});

baidu.makeArray = function(array, results){
    var ret = results || [];
    if(!array){return ret;}
    array.length == null || ~'string|function|regexp'.indexOf(baidu.type(array)) ?
        [].push.call(ret, array) : baidu.merge(ret, array);
    return ret;
};

baidu.dom.extend({
    map : function (iterator) {
        baidu.check("function","baidu.dom.map");
        var ret = [],
            i = 0;

        baidu.forEach(this, function( dom, index ){
            ret[ i++ ] = iterator.call( dom, index, dom, dom );
        });

        return this.pushStack( ret );
    }
});

//Sizzle.isXML

baidu._util_.isXML = function(ele) {
    var docElem = (ele ? ele.ownerDocument || ele : 0).documentElement;
    return docElem ? docElem.nodeName !== 'HTML' : false;
};

baidu.dom.extend({
    clone: function(){
        var util = baidu._util_,
            eventCore = util.eventBase.core,
            eventQueue = util.eventBase.queue,
            div = util.support.dom.div,
            noCloneChecked = util.support.dom.input.cloneNode(true).checked,//用于判断ie是否支持clone属性
            noCloneEvent = true;
        if (!div.addEventListener && div.attachEvent && div.fireEvent){
            div.attachEvent('onclick', function(){noCloneEvent = false;});
            div.cloneNode(true).fireEvent('onclick');
        }
        //
        function getAll(ele){
            return ele.getElementsByTagName ? ele.getElementsByTagName('*')
                : (ele.querySelectorAll ? ele.querySelectorAll('*') : []);
        }
        //
        function cloneFixAttributes(src, dest){
            dest.clearAttributes && dest.clearAttributes();
            dest.mergeAttributes && dest.mergeAttributes(src);
            switch(dest.nodeName.toLowerCase()){
                case 'object':
                    dest.outerHTML = src.outerHTML;
                    break;
                case 'textarea':
                case 'input':
                    if(~'checked|radio'.indexOf(src.type)){
                        src.checked && (dest.defaultChecked = dest.checked = src.checked);
                        dest.value !== src.value && (dest.value = src.value);
                    }
                    dest.defaultValue = src.defaultValue;
                    break;
                case 'option':
                    dest.selected = src.defaultSelected;
                    break;
                case 'script':
                    dest.text !== src.text && (dest.text = src.text);
                    break;
            }
            dest[baidu.key] && dest.removeAttribute(baidu.key);
        }
        //
        function cloneCopyEvent(src, dest){
            if(dest.nodeType !== 1 || !baidu.id(src, 'get')){return;}
            var defaultEvents = eventQueue.get(src);
            for(var i in defaultEvents){
                for(var j = 0, handler; handler = defaultEvents[i][j]; j++){
                    eventCore.add(dest, i, handler.orig, null, null, handler.one);
                }
            }
        }
        //
        function clone(ele, dataAndEvents, deepDataAndEvents){
            var cloneNode = ele.cloneNode(true),
                srcElements, destElements, len;
            //IE
            if((!noCloneEvent || !noCloneChecked)
                && (ele.nodeType === 1 || ele.nodeType === 11) && !baidu._util_.isXML(ele)){
                    cloneFixAttributes(ele, cloneNode);
                    srcElements = getAll( ele );
                    destElements = getAll( cloneNode );
                    len = srcElements.length;
                    for(var i = 0; i < len; i++){
                        destElements[i] && cloneFixAttributes(srcElements[i], destElements[i]);
                    }
            }
            if(dataAndEvents){
                cloneCopyEvent(ele, cloneNode);
                if(deepDataAndEvents){
                    srcElements = getAll( ele );
                    destElements = getAll( cloneNode );
                    len = srcElements.length;
                    for(var i = 0; i < len; i++){
                        cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                }
            }
            return cloneNode;
        }
        //
        return function(dataAndEvents, deepDataAndEvents){
            dataAndEvents = !!dataAndEvents;
            deepDataAndEvents = !!deepDataAndEvents;
            return this.map(function(){
                return clone(this, dataAndEvents, deepDataAndEvents);
            });
        }
    }()
});

baidu._util_.contains = document.compareDocumentPosition ?
    function(container, contained){
        return !!(container.compareDocumentPosition( contained ) & 16);
    } : function(container, contained){
        if(container === contained){return false;}
        if(container.contains && contained.contains){
            return container.contains(contained);
        }else{
            while(contained = contained.parentNode){
                if(contained === container){return true;}
            }
            return false;
        }
    };

 
baidu.dom.extend({
    contains : function(contained) {
        var container = this[0];
            contained = baidu.dom(contained)[0];
        if(!container || !contained){return false;}
        return baidu._util_.contains(container, contained);
    }   
});

baidu._util_.smartInsertTo = function(tang, target, callback, orie){
    var insert = baidu.dom(target),
        first = insert[0],
        tangDom;
        
    if(orie && first && (!first.parentNode || first.parentNode.nodeType === 11)){
        orie = orie === 'before';
        tangDom = baidu.merge(orie ? tang : insert, !orie ? tang : insert);
        if(tang !== tangDom){
            tang.length = 0;
            baidu.merge(tang, tangDom);
        }
    }else{
        for(var i = 0, item; item = insert[i]; i++){
            baidu._util_.smartInsert(baidu.dom(item), i > 0 ? tang.clone(true, true) : tang, callback);
        }
    }
};

baidu.dom.extend({
    appendTo: function(target){
        var ret = [],
            array_push = ret.push;

        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.appendTo');
        baidu._util_.smartInsertTo(this, target, function(child){
            array_push.apply(ret, baidu.makeArray(child.childNodes));
            this.appendChild(child);
        });
        return this.pushStack(ret);
    }
});

 

baidu._util_.access = function(tang, key, value, callback, pass){
    if(tang.size() <= 0){return tang;}
    switch(baidu.type(key)){
        case 'string': //高频
            if(value === undefined){
                return callback.call(tang, tang[0], key);
            }else{
                tang.each(function(index, item){
                    callback.call(tang, item, key,
                        (baidu.type(value) === 'function' ? value.call(item, index, callback.call(tang, item, key)) : value),
                        pass);
                });
            }
            break;
        case 'object':
            for(var i in key){
                baidu._util_.access(tang, i, key[i], callback, value);
            }
            break;
    }
    return tang;
};

baidu._util_.nodeName = function(ele, nodeName){
    return ele.nodeName && ele.nodeName.toLowerCase() === nodeName.toLowerCase();
};

baidu._util_.propFixer = {
    tabindex: 'tabIndex',
    readonly: 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'classname': 'className',
    maxlength: 'maxLength',
    cellspacing: 'cellSpacing',
    cellpadding: 'cellPadding',
    rowspan: 'rowSpan',
    colspan: 'colSpan',
    usemap: 'useMap',
    frameborder: 'frameBorder',
    contenteditable: 'contentEditable',
    
    
    //rboolean在baidu._util_.removeAttr 和 baidu._util_.attr中需要被共同使用
    rboolean: /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i
};
// IE6/7 call enctype encoding
!document.createElement('form').enctype
    && (baidu._util_.propFixer.enctype = 'encoding');

baidu._util_.prop = function(){
    var rfocusable = /^(?:button|input|object|select|textarea)$/i,
        rclickable = /^a(?:rea|)$/i,
        select = document.createElement('select'),
        opt = select.appendChild(document.createElement('option')),
        propHooks = {
            tabIndex: {
                get: function(ele){
                    var attrNode = ele.getAttributeNode('tabindex');
                    return attrNode && attrNode.specified ? parseInt(attrNode.value, 10)
                        : rfocusable.test(ele.nodeName) || rclickable.test(ele.nodeName)
                            && ele.href ? 0 : undefined;
                }
            }
        };
        !opt.selected && (propHooks.selected = {
            get: function(ele){
                var par = ele.parentNode;
                if(par){
                    par.selectedIndex;
                    par.parentNode && par.parentNode.selectedIndex;
                }
                return null;
            }
        });
        select = opt = null;
    
    return function(ele, key, val){
        var nType = ele.nodeType,
            hooks, ret;
        if(!ele || ~'238'.indexOf(nType)){return;}
        if(nType !== 1 || !baidu._util_.isXML(ele)){
            key = baidu._util_.propFixer[key] || key;
            hooks = propHooks[key] || {};
        }
        if(val !== undefined){
            if(hooks.set && (ret = hooks.set(ele, key, val)) !== undefined){
                return ret;
            }else{
                return (ele[key] = val);
            }
        }else{
            if(hooks.get && (ret = hooks.get(ele, key)) !== null){
                return ret;
            }else{
                return ele[key];
            }
        }
    }
}();

baidu._util_.support.getSetAttribute = baidu._util_.support.dom.div.className !== 't';

baidu._util_.nodeHook = function(){
    if(baidu._util_.support.getSetAttribute){return;}
    var fixSpecified = {};
    fixSpecified.name = fixSpecified.id = fixSpecified.coords = true;
    return {
        get: function(ele, key){
            var ret = ele.getAttributeNode(key);
            return ret && (fixSpecified[key] ? ret.value !== '' : ret.specified) ?
                 ret.value : undefined;
        },
        set: function(ele, key, val){
            // Set the existing or create a new attribute node
            var ret = ele.getAttributeNode(key);
            if(!ret){
                ret = document.createAttribute(key);
                ele.setAttributeNode(ret);
            }
            return (ret.value = val + '');
        }
    };
}();

baidu._util_.removeAttr = function(){
    var propFixer = baidu._util_.propFixer,
        core_rspace = /\s+/,
        getSetAttribute = baidu._util_.support.getSetAttribute;
    return function(ele, key){
        if(!key || ele.nodeType !==1){return;}
        var array = key.split(core_rspace),
            propName, isBool;
        for(var i = 0, attrName; attrName = array[i]; i++){
            propName = propFixer[attrName] || attrName;
            isBool = propFixer.rboolean.test(attrName);
            !isBool && baidu._util_.attr(ele, attrName, '');
            ele.removeAttribute(getSetAttribute ? attrName : propName);
            isBool && (propName in ele) && (ele[propName] = false);
        }
    }
}();

baidu._util_.attr = function(){
    var util = baidu._util_,
        rtype = /^(?:button|input)$/i,
        supportDom = util.support.dom,
        radioValue = supportDom.input.value === 't',
        hrefNormalized = supportDom.a.getAttribute('href') === '/a',
        style = /top/.test(supportDom.a.getAttribute('style')),
        nodeHook = util.nodeHook,
        attrFixer = {
            className: 'class'
        },
        boolHook = {//处理对属性值是布尔值的情况
            get: function(ele, key){
                var val = util.prop(ele, key), attrNode;
                return val === true || typeof val !== 'boolean'
                    && (attrNode = ele.getAttributeNode(key))
                    && attrNode.nodeValue !== false ? key.toLowerCase() : undefined;
            },
            set: function(ele, key, val){
                if(val === false){
                    util.removeAttr(ele, key);
                }else{
                    var propName = util.propFixer[key] || key;
                    (propName in ele) && (ele[propName] = true);
                    ele.setAttribute(key, key.toLowerCase());
                }
                return key;
            }
        },
        attrHooks = {
            type: {
                set: function(ele, key, val){
                    // We can't allow the type property to be changed (since it causes problems in IE)
//                  if(rtype.test(ele.nodeName) && util.contains(document.body, ele)){return val;};
                    if(rtype.test(ele.nodeName) && ele.parentNode){return val;};
                    if(!radioValue && val === 'radio' && util.nodeName(ele, 'input')){
                        var v = ele.value;
                        ele.setAttribute('type', val);
                        v && (ele.value = v);
                        return val;
                    };
                }
            },
            value: {
                get: function(ele, key){
                    if(nodeHook && util.nodeName(ele, 'button')){
                        return nodeHook.get(ele, key);
                    }
                    return key in ele ? ele.value : null;
                },
                set: function(ele, key, val){
                    if(nodeHook && util.nodeName(ele, 'button')){
                        return nodeHook.set(ele, key, val);
                    }
                    ele.value = val;
                }
            }
        };
    // Set width and height to auto instead of 0 on empty string
    // This is for removals
    if(!util.support.getSetAttribute){//
        baidu.forEach(['width', 'height'], function(item){
            attrHooks[item] = {
                set: function(ele, key, val){
                    if(val === ''){
                        ele.setAttribute(key, 'auto');
                        return val;
                    }
                }
            };
        });
        attrHooks.contenteditable = {
            get: nodeHook.get,
            set: function(ele, key, val){
                val === '' && (val = false);
                nodeHook.set(ele, key, val);
            }
        };
    }
    // Some attributes require a special call on IE
    if(!hrefNormalized){
        baidu.forEach(['href', 'src', 'width', 'height'], function(item){
            attrHooks[item] = {
                get: function(ele, key){
                    var ret = ele.getAttribute(key, 2);
                    return ret === null ? undefined : ret;
                }
            };
        });
    }
    if(!style){
        attrHooks.style = {
            get: function(ele){return ele.style.cssText.toLowerCase() || undefined;},
            set: function(ele, key, val){return (ele.style.cssText = val + '');}
        };
    }
    //attr
    return function(ele, key, val, pass){
        var nType = ele.nodeType,
            notxml = nType !== 1 || !util.isXML(ele),
            hooks, ret;
        if(!ele || ~'238'.indexOf(nType)){return;}
        if(pass && baidu.dom.fn[key]){
            return baidu.dom(ele)[key](val);
        }
        //if getAttribute is undefined, use prop interface
        if(notxml){
            key = attrFixer[key] || key.toLowerCase();
            hooks = attrHooks[key] || (util.propFixer.rboolean.test(key) ? boolHook : nodeHook);
        }
        if(val!== undefined){
            if(val === null){
                util.removeAttr(ele, key);
                return
            }else if(notxml && hooks && hooks.set && (ret = hooks.set(ele, key, val)) !== undefined){
                return ret;
            }else{
                ele.setAttribute(key, val + '');
                return val;
            }
        }else if(notxml && hooks && hooks.get && (ret = hooks.get(ele, key)) !== null){
            return ret;
        }else{
            ret = ele.getAttribute(key);
            return ret === null ? undefined : ret;
        }
   }
}();

baidu.dom.extend({
    attr: function(key, value){
        return baidu._util_.access(this, key, value, function(ele, key, val, pass){
            return baidu._util_.attr(ele, key, val, pass);
        });
    }
});

baidu.dom.extend({
    before: function(){
        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.before');

        baidu._util_.smartInsert(this, arguments, function(node){
            this.parentNode && this.parentNode.insertBefore(node, this);
        });

        return this;
    }
});

baidu.dom.extend({
    bind: function( type, data, fn ){
        return this.on( type, undefined, data, fn );
    }
});

baidu.dom.match = function(){
    var reg = /^[\w\#\-\$\.\*]+$/,

        // 使用这个临时的 div 作为CSS选择器过滤
        div = document.createElement("DIV");
        div.id = "__tangram__";

    return function( array, selector, context ){
        var root, results = baidu.array();

        switch ( baidu.type(selector) ) {
            // 取两个 TangramDom 的交集
            case "$DOM" :
                for (var x=array.length-1; x>-1; x--) {
                    for (var y=selector.length-1; y>-1; y--) {
                        array[x] === selector[y] && results.push(array[x]);
                    }
                }
                break;

            // 使用过滤器函数，函数返回值是 Array
            case "function" :
                baidu.forEach(array, function(item, index){
                    selector.call(item, index) && results.push(item);
                });
                break;
            
            case "HTMLElement" :
                baidu.forEach(array, function(item){
                    item == selector && results.push(item);
                });
                break;

            // CSS 选择器
            case "string" :
                var da = baidu.query(selector, context || document);
                baidu.forEach(array, function(item){
                    if ( root = getRoot(item) ) {
                        var t = root.nodeType == 1
                            // in DocumentFragment
                            ? baidu.query(selector, root)
                            : da;

                        for (var i=0, n=t.length; i<n; i++) {
                            if (t[i] === item) {
                                results.push(item);
                                break;
                            }
                        }
                    }
                });
                results = results.unique();
                break;

            default :
                results = baidu.array( array ).unique();
                break;
        }
        return results;

    };

    function getRoot(dom) {
        var result = [], i;

        while(dom = dom.parentNode) {
            dom.nodeType && result.push(dom);
        }

        for (var i=result.length - 1; i>-1; i--) {
            // 1. in DocumentFragment
            // 9. Document
            if (result[i].nodeType == 1 || result[i].nodeType == 9) {
                return result[i];
            }
        }
        return null;
    }
}();

baidu.dom.extend({
    children : function (selector) {
        var a = [];

        this.each(function(){
            baidu.forEach(this.children || this.childNodes, function(dom){
                dom.nodeType == 1 && a.push(dom);
            });
        });

        return this.pushStack( baidu.dom.match(a, selector) );
    }
});

baidu.dom.extend({
    closest : function (selector, context) {
        var results = baidu.array();

        baidu.forEach ( this, function(dom) {
            var t = [dom];
            while ( dom = dom.parentNode ) {
                dom.nodeType && t.push( dom );
            }
            t = baidu.dom.match( t, selector, context );

            t.length && results.push(t[0]);
        });
        
        return this.pushStack( results.unique() );
    }
});

baidu.dom.extend({
    contents: function(){
        var ret = [], nodeName;
        for(var i = 0, ele; ele = this[i]; i++){
            nodeName = ele.nodeName;
            ret.push.apply(ret, baidu.makeArray(nodeName && nodeName.toLowerCase() === 'iframe' ?
                ele.contentDocument || ele.contentWindow.document
                    : ele.childNodes));
        }
        return this.pushStack(ret);
    }
});

baidu.dom.extend({
    getComputedStyle: function(key){
        if(!this[0].ownerDocument){return;}// document can not get style;
        var defaultView = this[0].ownerDocument.defaultView,
            computedStyle = defaultView && defaultView.getComputedStyle
                && defaultView.getComputedStyle(this[0], null),
            val = computedStyle ? (computedStyle.getPropertyValue(key) || computedStyle[key]) : '';
        return val || this[0].style[key];
    }
});

baidu.dom.extend({
    getCurrentStyle: function(){
        var css = document.documentElement.currentStyle ?
            function(key){return this[0].currentStyle ? this[0].currentStyle[key] : this[0].style[key];}
                : function(key){return this.getComputedStyle(key);}
        return function(key){
            return css.call(this, key);
        }
    }()
});

baidu._util_.getWidthOrHeight = function(){
    var ret = {},
        cssShow = {position: 'absolute', visibility: 'hidden', display: 'block'},
        rdisplayswap = /^(none|table(?!-c[ea]).+)/;
    function swap(ele, options){
        var defaultVal = {};
        for(var i in options){
            defaultVal[i] = ele.style[i];
            ele.style[i] = options[i];
        }
        return defaultVal;
    }
    baidu.forEach(['Width', 'Height'], function(item){
        var cssExpand = {Width: ['Right', 'Left'], Height: ['Top', 'Bottom']}[item];
        ret['get' + item] = function(ele, extra){
            var tang = baidu.dom(ele),
                defaultValue = ele.offsetWidth === 0
                    && rdisplayswap.test(tang.getCurrentStyle('display'))
                    && (swap(ele, cssShow)),
                rect = ele['offset' + item] || parseInt(tang.getCurrentStyle(item.toLowerCase())) || 0,
                delString = 'padding|border';
            extra && baidu.forEach(extra.split('|'), function(val){
                if(!~delString.indexOf(val)){//if val is margin
                    rect += parseFloat(tang.getCurrentStyle(val + cssExpand[0])) || 0;
                    rect += parseFloat(tang.getCurrentStyle(val + cssExpand[1])) || 0;
                }else{//val is border or padding
                    delString = delString.replace(new RegExp('\\|?' + val + '\\|?'), '');
                }
            });
            delString && baidu.forEach(delString.split('|'), function(val){
                rect -= parseFloat(tang.getCurrentStyle(val + cssExpand[0] + (val === 'border' ? 'Width' : ''))) || 0;
                rect -= parseFloat(tang.getCurrentStyle(val + cssExpand[1] + (val === 'border' ? 'Width' : ''))) || 0;
            });
            defaultValue && swap(ele, defaultValue);
            return rect;
        }
    });
    //
    return function(ele, key, extra){
        return ret[key === 'width' ? 'getWidth' : 'getHeight'](ele, extra);
    }
}();

baidu._util_.setPositiveNumber = function(){
    var core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        rnumsplit = new RegExp('^(' + core_pnum + ')(.*)$', 'i');
    return function(ele, val, subtract){
        var mc = rnumsplit.exec(val);
        return mc ?
            Math.max(0, mc[1] - (subtract || 0)) + (mc[2] || 'px') : val;
    };
}();

baidu._util_.style = baidu.extend({
    set: function(ele, key, val){ele.style[key] = val;}
}, document.documentElement.currentStyle? {
    get: function(ele, key){
        var val = baidu.dom(ele).getCurrentStyle(key),
            defaultLeft;
        if(/^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i.test(val)){
            defaultLeft = ele.style.left;
            ele.style.left = key === 'fontSize' ? '1em' : val;
            val = ele.style.pixelLeft + 'px';
            ele.style.left = defaultLeft;
        }
        return val;
    }
} : {
    get: function(ele, key){
        return baidu.dom(ele).getCurrentStyle(key);
    }
});

baidu._util_.cssHooks = function(){
    var alpha = /alpha\s*\(\s*opacity\s*=\s*(\d{1,3})/i,
        style = baidu._util_.style,
//      nonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
        anchor = baidu._util_.support.dom.a,
        cssMapping = {
            fontWeight: {normal: 400, bold: 700, bolder: 700, lighter: 100}
        },
        cssHooks = {
            opacity: {},
            width: {},
            height: {},
            fontWeight: {
                get: function(ele, key){
                    var ret = style.get(ele, key);
                    return cssMapping.fontWeight[ret] || ret;
                }
            }
        };
    //
    function setValue(ele, key, val){
        baidu.type(val) === 'string' && (val = baidu._util_.setPositiveNumber(ele, val));
        style.set(ele, key, val);
    }
    //
    baidu.extend(cssHooks.opacity, /^0.5/.test(anchor.style.opacity) ? {
        get: function(ele, key){
            var ret = baidu.dom(ele).getCurrentStyle(key);
            return ret === '' ? '1' : ret;
        }
    } : {
        get: function(ele){
            return alpha.test((ele.currentStyle || ele.style).filter || '') ? parseFloat(RegExp.$1) / 100 : '1';
        },
        set: function(ele, key, value){
            var filterString = (ele.currentStyle || ele.style).filter || '',
                opacityValue = value * 100;
                ele.style.zoom = 1;
                ele.style.filter = alpha.test(filterString) ? filterString.replace(alpha, 'Alpha(opacity=' + opacityValue)
                    : filterString + ' progid:dximagetransform.microsoft.Alpha(opacity='+ opacityValue +')';
        }
    });
    //
    baidu.forEach(['width', 'height'], function(item){
        cssHooks[item] = {
            get: function(ele){
                return baidu._util_.getWidthOrHeight(ele, item) + 'px';
            },
            set: setValue
        };
    });

    baidu.each({
        padding: "",
        border: "Width"
    }, function( prefix, suffix ) {
        cssHooks[prefix + suffix] = {set: setValue};
        var cssExpand = [ "Top", "Right", "Bottom", "Left" ],
            i=0;
        for ( ; i < 4; i++ ) {
            cssHooks[ prefix + cssExpand[ i ] + suffix ] = {
                set: setValue
            };
        }
    });
    return cssHooks;
}();

baidu._util_.cssNumber = {
    'columnCount': true,
    'fillOpacity': true,
    'fontWeight': true,
    'lineHeight': true,
    'opacity': true,
    'orphans': true,
    'widows': true,
    'zIndex': true,
    'zoom': true
};

 //支持单词以“-_”分隔
 //todo:考虑以后去掉下划线支持？
baidu.string.extend({
    toCamelCase : function () {
        var source = this.valueOf();
        //提前判断，提高getStyle等的效率 thanks xianwei
        if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
            return source;
        }
        return source.replace(/[-_][^-_]/g, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }
});

baidu.dom.styleFixer = function(){
    var style = baidu._util_.style,
        cssHooks = baidu._util_.cssHooks,
        cssNumber = baidu._util_.cssNumber,
        cssProps = {
            'float': !!baidu._util_.support.dom.a.style.cssFloat ? 'cssFloat' : 'styleFloat'
        };
    return function(ele, key, val){
        var origKey = baidu.string.toCamelCase(key),
            method = val === undefined ? 'get' : 'set',
            origVal, hooks;
        origKey = cssProps[origKey] || origKey;
        origVal = baidu.type(val) === 'number' && !cssNumber[origKey] ? val + 'px' : val;
        hooks = cssHooks.hasOwnProperty(origKey) && cssHooks[origKey][method] || style[method];
        return hooks(ele, origKey, origVal);
    }
}();

baidu.dom.extend({
    css: function(key, value){
        baidu.check('^(?:(?:string(?:,(?:number|string|function))?)|object)$', 'baidu.dom.css');
        return baidu._util_.access(this, key, value, function(ele, key, val){
            var styleFixer = baidu.dom.styleFixer;
            return styleFixer ? styleFixer(ele, key, val)
                : (val === undefined ? this.getCurrentStyle(key) : ele.style[key] = val);
        });
    }
});

 
baidu.dom.extend({
    data : function () {
        var   guid = baidu.key
            , maps = baidu.global("_maps_HTMLElementData");

        return function( key, value ) {
            baidu.forEach( this, function( dom ) {
                !dom[ guid ] && ( dom[ guid ] = baidu.id() );
            });

            if ( baidu.isString(key) ) {

                // get first
                if ( typeof value == "undefined" ) {
                    var data,result;
                    result = this[0] && (data = maps[ this[0][guid] ]) && data[ key ];
                    if(typeof result != 'undefined'){
                        return result;
                    }else{

                        //取得自定义属性
                        var attr = this[0].getAttribute('data-'+key);
                        return !~String(attr).indexOf('{') ? attr:Function("return "+attr)();
                    }
                }

                // set all
                baidu.forEach(this, function(dom){
                    var data = maps[ dom[ guid ] ] = maps[ dom[ guid ] ] || {};
                    data[ key ] = value;
                });
            
            // json
            } else if ( baidu.type(key) == "object") {

                // set all
                baidu.forEach(this, function(dom){
                    var data = maps[ dom[ guid ] ] = maps[ dom[ guid ] ] || {};

                    baidu.forEach( key , function(item,index) {
                        data[ index ] = key[ index ];
                    });
                });
            }

            return this;
        }
    }()
});

/// support magic - Tangram 1.x Code Start

baidu.lang.Class = baidu.base.Class;
//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
//  2011.11.22  meizz   废除 baidu.lang._instances 模块，由统一的global机制完成；

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.lang.Event = baidu.base.Event;

//  2011.12.19  meizz   很悲剧，第三个参数 key 还需要支持一段时间，以兼容老版本脚本
//  2011.11.24  meizz   事件添加监听方法 addEventListener 移除第三个参数 key，添加返回值 handler
//  2011.11.23  meizz   事件handler的存储对象由json改成array，以保证注册函数的执行顺序
//  2011.11.22  meizz   将 removeEventListener 方法分拆到 baidu.lang.Class.removeEventListener 中，以节约主程序代码

/// support magic - Tangram 1.x Code End

baidu.dom.extend({
    delegate: function( selector, type, data, fn ){
        if( typeof data == "function" )
            fn = data,
            data = null;
        return this.on( type, selector, data, fn );
    }
});

 

baidu.dom.extend({
    filter : function (selector) {
        return this.pushStack( baidu.dom.match(this, selector) );
    }
});

baidu.dom.extend({
    remove: function(selector, keepData){
        arguments.length > 0
            && baidu.check('^string(?:,boolean)?$', 'baidu.dom.remove');
        var array = selector ? this.filter(selector) : this;
        for(var i = 0, ele; ele = array[i]; i++){
           if(!keepData && ele.nodeType === 1){
               baidu._util_.cleanData(ele.getElementsByTagName('*'));
               baidu._util_.cleanData([ele]);
            }
            ele.parentNode && ele.parentNode.removeChild(ele);
        }
        return this;
    }
});

baidu.dom.extend({
    detach: function(selector){
        selector && baidu.check('^string$', 'baidu.dom.detach');
        return this.remove(selector, true);
    }
});
/// support magic - Tangram 1.x Code Start

//baidu.object.extend = function (target, source) {
//  for (var p in source) {
//      if (source.hasOwnProperty(p)) {
//          target[p] = source[p];
//      }
//  }
//  
//  return target;
//};
baidu.object.extend = baidu.extend;

/// support magic - Tangram 1.x Code Start

// TODO
// 1. 无法解决px/em单位统一的问题（IE）
// 2. 无法解决样式值为非数字值的情况（medium等 IE）
baidu.dom.getStyle = function (element, key) {
    return baidu.dom(baidu.dom.g(element)).css(key);
};

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

baidu.page = baidu.page || {};

/// support magic - Tangram 1.x Code End

baidu.page.getScrollTop = function () {
    var d = document;
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.page.getScrollLeft = function () {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};
/// support magic - Tangram 1.x Code End

(function(){

 baidu.page.getMousePosition = function(){
     return {
        x : baidu.page.getScrollLeft() + xy.x,
        y : baidu.page.getScrollTop() + xy.y
     };
 };

 var xy = {x:0, y:0};

 // 监听当前网页的 mousemove 事件以获得鼠标的实时坐标
 baidu.event.on(document, "onmousemove", function(e){
    e = window.event || e;
    xy.x = e.clientX;
    xy.y = e.clientY;
 });

})();
/// support magic - Tangram 1.x Code End

baidu.dom.extend({
    off: function( events, selector, fn ){
        var eb = baidu._util_.eventBase.core, me = this;
        if( !events )
            baidu.forEach( this, function( item ){
                eb.remove( item );
            } );
        else if( typeof events == "string" ){
            if( typeof selector == "function" )
                fn = selector,
                selector = null;
            events = events.split(/[ ,]/);
            baidu.forEach( this, function( item ){
                baidu.forEach( events, function( event ){
                    eb.remove( item, event, fn, selector );
                });
            });
        }else if( typeof events == "object" )
            baidu.forEach( events, function(fn, event){
                me.off( event, selector, fn );
            } );

        return this;
    }
});

/// support - magic Tangram 1.x Code Start

baidu.event.un = baidu.un = function(element, evtName, handler){
    if( typeof element == "string" )
        element = baidu.dom.g( element );
    baidu.dom(element).off(evtName.replace(/^\s*on/, ''), handler);
    return element;
 };
 /// support - magic Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.event.preventDefault = function (event) {
    return new baidu.event(event).preventDefault();
};
/// support magic - Tangram 1.x Code End

(function(){
    var dragging = false,
        target, // 被拖曳的DOM元素
        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
    baidu.dom.drag = function(element, options){
        if(!(target = baidu.dom.g(element))){return false;}
        op = baidu.object.extend({
            autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            capture: true,  // 鼠标拖曳粘滞
            interval: 16    // 拖曳行为的触发频度（时间：毫秒）
        }, options);
        lastLeft = left = parseInt(baidu.dom.getStyle(target, 'left')) || 0;
        lastTop = top = parseInt(baidu.dom.getStyle(target, 'top')) || 0;
        dragging = true;
        setTimeout(function(){
            var mouse = baidu.page.getMousePosition();  // 得到当前鼠标坐标值
            ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
            oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
            clearInterval(timer);
            timer = setInterval(render, op.interval);
        }, 1);
        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        var tangramDom = baidu.dom(document);
        op.autoStop && tangramDom.on('mouseup', stop);
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        tangramDom.on('selectstart', unselect);
        // 设置鼠标粘滞
        if (op.capture && target.setCapture) {
            target.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';
        baidu.isFunction(op.ondragstart)
            && op.ondragstart(target, op);
        return {
            stop: stop, dispose: stop,
            update: function(options){
                baidu.object.extend(op, options);
            }
        }
    }
    // 停止拖曳
    function stop() {
        dragging = false;
        clearInterval(timer);
        // 解除鼠标粘滞
        if (op.capture && target.releaseCapture) {
            target.releaseCapture();
        } else if (op.capture && window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        var tangramDom = baidu.dom(document);
        tangramDom.off('selectstart', unselect);
        op.autoStop && tangramDom.off('mouseup', stop);
        // ondragend 事件
        baidu.isFunction(op.ondragend)
            && op.ondragend(target, op, {left: lastLeft, top: lastTop});
    }
    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        if(!dragging){
            clearInterval(timer);
            return;
        }
        var rg = op.range || [],
            mouse = baidu.page.getMousePosition(),
            el = left + mouse.x - ox,
            et = top  + mouse.y - oy;

        // 如果用户限定了可拖动的范围
        if (baidu.isObject(rg) && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.offsetWidth, el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.offsetHeight, et);
        }
        target.style.left = el + 'px';
        target.style.top  = et + 'px';
        lastLeft = el;
        lastTop = et;
        baidu.isFunction(op.ondrag)
            && op.ondrag(target, op, {left: lastLeft, top: lastTop});
    }
    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();
// [TODO] 20100625 添加cursorAt属性，absolute定位的定位的元素在不设置top|left值时，初始值有问题，得动态计算
// [TODO] 20101101 在drag方法的返回对象中添加 dispose() 方法析构drag
/// support magic - Tangram 1.x Code End

/// support maigc - Tangram 1.x Code Start

/// support maigc - Tangram 1.x Code End

//baidu.lang.isFunction = function (source) {
    // chrome下,'function' == typeof /a/ 为true.
//  return '[object Function]' == Object.prototype.toString.call(source);
//};
baidu.lang.isFunction = baidu.isFunction;

baidu.dom.extend({
    end : function ( ) {
        return this.prevObject || baidu.dom();
    }
});

baidu.dom.extend({
    eq : function (index) {
        baidu.check("number","baidu.dom.eq");
        var item = this.get( index );
        return this.pushStack( typeof item === "undefined" ? []: [item] );
    }
});

baidu.dom.extend({
    find : function (selector) {
        var a=[],
            expr,
            id = "__tangram__find__",
            td = [];

        switch (baidu.type(selector)) {
        case "string" :
            this.each(function(){baidu.merge(td, baidu.query(selector, this));});
            break;
        case "HTMLElement" :
            expr = selector.tagName +"#"+ (selector.id ? selector.id : (selector.id = id));
            this.each(function(){if(baidu.query(expr, this).length > 0) a.push(selector);});
            selector.id == id && (selector.id = "");
            if (a.length > 0) baidu.merge(td, a);
            break;
        case "$DOM" :
            a = selector.get();
            this.each(function(){
                baidu.forEach(baidu.query("*", this), function(dom){
                    for (var i=0, n=a.length; i<n; i++) {
                        dom === a[i] && (td[td.length ++] = a[i]);
                    }
                });
            });
            break;      
        }
        return this.pushStack( td );
    }
});

baidu.dom.extend({
    first : function () {
        return this.eq( 0 );
    }
});

/// support magic - Tangram 1.x Code Start

 

baidu.dom.getAttr = function(element, key){
    return baidu.dom(baidu.dom.g(element)).attr(key);
};
/// support magic - Tangram 1.x Code End

baidu.dom.extend({
    getWindow: function(){
        var doc = this.getDocument();
        return (this.size()<=0)? undefined :(doc.parentWindow || doc.defaultView);
    }
});

baidu.dom.extend({
    offsetParent: function(){
        return this.map(function(){
            var offsetParent = this.offsetParent || document.body,
                exclude = /^(?:body|html)$/i;
            while(offsetParent && baidu.dom(offsetParent).getCurrentStyle('position') === 'static'
                && !exclude.test(offsetParent.nodeName)){
                    offsetParent = offsetParent.offsetParent;
            }
            return offsetParent;
        });
    }
});

baidu.dom.extend({
    position: function(){
        if(this.size()<=0){return 0;}       
        var patrn = /^(?:body|html)$/i,
            coordinate = this.offset(),
            offsetParent = this.offsetParent(),
            parentCoor = patrn.test(offsetParent[0].nodeName) ? {left: 0, top: 0}
                : offsetParent.offset();
        coordinate.left -= parseFloat(this.getCurrentStyle('marginLeft')) || 0;
        coordinate.top -= parseFloat(this.getCurrentStyle('marginTop')) || 0;
        parentCoor.left += parseFloat(offsetParent.getCurrentStyle('borderLeftWidth')) || 0;
        parentCoor.top += parseFloat(offsetParent.getCurrentStyle('borderTopWidth')) || 0;
        return {
            left: coordinate.left - parentCoor.left,
            top: coordinate.top - parentCoor.top
        }
    }
});

baidu.dom.extend({
    offset: function(){
        
        function setOffset(ele, options, index){
            var tang = tang = baidu.dom(ele),
                position = tang.getCurrentStyle('position');
            position === 'static' && (ele.style.position = 'relative');
            var currOffset = tang.offset(),
                currLeft = tang.getCurrentStyle('left'),
                currTop = tang.getCurrentStyle('top'),
                calculatePosition = (~'absolute|fixed'.indexOf(position)) && ~('' + currLeft + currTop).indexOf('auto'),
                curPosition = calculatePosition && tang.position();
            currLeft = curPosition && curPosition.left || parseFloat(currLeft) || 0;
            currTop = curPosition && curPosition.top || parseFloat(currTop) || 0;
            baidu.type('options') === 'function' && (options = options.call(ele, index, currOffset));
            options.left != undefined && (ele.style.left = options.left - currOffset.left + currLeft + 'px');
            options.top != undefined && (ele.style.top = options.top - currOffset.top + currTop + 'px');
        }
        
        return function(options){
            if(options){
                baidu.check('^(?:object|function)$', 'baidu.dom.offset');
                for(var i = 0, item; item = this[i]; i++){
                    setOffset(item, options, i);
                }
                return this;
            }
            var ele = this[0],
                doc = this.getDocument(),
                box = {left: 0, top: 0},
                win, docElement;
            if(!doc){return;}
            docElement = doc.documentElement;
            if(!baidu._util_.contains(docElement, ele)){return box;}
            (typeof ele.getBoundingClientRect) !== 'undefined' && (box = ele.getBoundingClientRect());
            win = this.getWindow();
            return {
                left: box.left + (win.pageXOffset || docElement.scrollLeft) - (docElement.clientLeft || 0),
                top: box.top  + (win.pageYOffset || docElement.scrollTop)  - (docElement.clientTop  || 0)
            };
        }
    }()
});

baidu.dom.extend({
    has: function (selector) {
        var a = []
            ,td = baidu.dom(document.body);

        baidu.forEach(this, function(dom){
            td[0] = dom;
            td.find(selector).length && a.push(dom);
        });

        return baidu.dom(a);
    }
});

 

baidu.dom.extend({
    hasClass: function(value){
        //异常处理
        if(arguments.length <= 0 || typeof value === 'function'){
            return this;
        };
        
        if(this.size()<=0){
            return false;
        };

        //对输入进行处理
        value = value.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');
        var arr = value.split(' ');
        var result;
        baidu.forEach(this, function(item){
            var str = item.className;
            for(var i = 0;i<arr.length;i++){
                if(!~(' '+str+' ').indexOf(' '+arr[i]+' ')){
                    //有一个不含有
                    result = false;
                    return;
                };
            };
            if(result!==false){result = true;return;};
        });
        return result;
    }
});

baidu._util_.getWindowOrDocumentWidthOrHeight = baidu._util_.getWindowOrDocumentWidthOrHeight || function(){
    var ret = {'window': {}, 'document': {}};
    baidu.forEach(['Width', 'Height'], function(item){
        var clientProp = 'client' + item,
            offsetProp = 'offset' + item,
            scrollProp = 'scroll' + item;
        ret['window']['get' + item] = function(ele){
            var doc = ele.document,
                rectValue = doc.documentElement[clientProp];
            return baidu.browser.isStrict && rectValue
                || doc.body && doc.body[clientProp] || rectValue;
        };
        ret['document']['get' + item] = function(ele){
            var doc = ele.documentElement;
            return doc[clientProp] >= doc[scrollProp] ? doc[clientProp]
                : Math.max(ele.body[scrollProp], doc[scrollProp], ele.body[offsetProp], doc[offsetProp]);
        }
    });
    return function(ele, type, key){
        return ret[type][key === 'width' ? 'getWidth' : 'getHeight'](ele);
    }
}();

 

baidu.dom.extend({
    height: function(value){
        return baidu._util_.access(this, 'height', value, function(ele, key, val){
            var hasValue = val !== undefined,
                parseValue = hasValue && parseFloat(val),
                type = ele != null && ele == ele.window ? 'window'
                    : (ele.nodeType === 9 ? 'document' : false);
            if(hasValue && parseValue < 0 || isNaN(parseValue)){return;}
            hasValue && /^(?:\d*\.)?\d+$/.test(val += '') && (val += 'px');
            return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, key)
                : (hasValue ? ele.style.height = val : baidu._util_.getWidthOrHeight(ele, key));
        });
    }
});

baidu._util_.isHidden = function(ele){
    return baidu.dom(ele).getCurrentStyle('display') === 'none'
        || !baidu._util_.contains(ele.ownerDocument, ele);
}

baidu.dom.extend({
    hide: function(){
        var vals = [],
            tang, isHidden, display;
        return this.each(function(index, ele){
            if(!ele.style){return;}//当前的这个不做操作
            tang = baidu(ele);
            vals[index] = tang.data('olddisplay');
            display = ele.style.display;
            if(!vals[index]){
                isHidden = baidu._util_.isHidden(ele);
                if(display && display !== 'none' || !isHidden){
                    tang.data('olddisplay', isHidden ? display : tang.getCurrentStyle('display'));
                }
            }
            ele.style.display = 'none';
        });
    }
});

baidu.dom.extend({
    innerHeight: function(){
        if(this.size()<=0){
            return 0;
        }
        var ele = this[0],
            type = ele != null && ele === ele.window ? 'window'
                : (ele.nodeType === 9 ? 'document' : false);
        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'height')
            : baidu._util_.getWidthOrHeight(ele, 'height', 'padding');
    }
});

baidu.dom.extend({
    innerWidth: function(){
        if(this.size()<=0){return 0;}
        var ele = this[0],
            type = ele != null && ele === ele.window ? 'window'
                : (ele.nodeType === 9 ? 'document' : false);
        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'width')
            : baidu._util_.getWidthOrHeight(ele, 'width', 'padding');
    }
});

baidu.dom.extend({
    insertAfter: function(target){
        var ret = [],
            array_push = ret.push;

        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.insertAfter');

        baidu._util_.smartInsertTo(this, target, function(node){
            array_push.apply(ret, baidu.makeArray(node.childNodes));
            this.parentNode.insertBefore(node, this.nextSibling);
        }, 'after');

        return this.pushStack(ret);
    }
});

baidu.dom.extend({
    insertBefore: function(target){
        var ret = [],
            array_push = ret.push;
        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.insertBefore');
        baidu._util_.smartInsertTo(this, target, function(node){
            array_push.apply(ret, baidu.makeArray(node.childNodes));
            this.parentNode.insertBefore(node, this);
        }, 'before');
        return this.pushStack(ret);
    }
});

baidu.dom.extend({
    insertHTML: function ( position, html) {
        var range,begin,element = this[0];
    
        //在opera中insertAdjacentHTML方法实现不标准，如果DOMNodeInserted方法被监听则无法一次插入多element
        //by lixiaopeng @ 2011-8-19
        if (element.insertAdjacentHTML && !baidu.browser.opera) {
            element.insertAdjacentHTML(position, html);
        } else {
            // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
            // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
            range = element.ownerDocument.createRange();
            // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
            // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
            position = position.toUpperCase();
            if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
                range.selectNodeContents(element);
                range.collapse(position == 'AFTERBEGIN');
            } else {
                begin = position == 'BEFOREBEGIN';
                range[begin ? 'setStartBefore' : 'setEndAfter'](element);
                range.collapse(begin);
            }
            range.insertNode(range.createContextualFragment(html));
        }
        return element;
    }
});

baidu.dom.extend({
    is : function (selector) {
        return baidu.dom.match(this, selector).length > 0;
    }
});

baidu.dom.extend({
    last : function () {
        return this.eq( -1 );
    }
});

baidu.dom.extend({
    next : function (filter) {
        var td = [];

        baidu.forEach(this, function(dom){
            while((dom = dom.nextSibling) && dom && dom.nodeType != 1);
            dom && (td[td.length ++] = dom);
        });

        return this.pushStack( filter ? baidu.dom.match(td, filter) : td );
    }
});

baidu.dom.extend({
    nextAll : function (selector) {
        var array = [];

        baidu.forEach(this, function(dom){
            while(dom = dom.nextSibling) {
                dom && (dom.nodeType == 1) && array.push(dom);
            };
        });

        return this.pushStack( baidu.dom.match(array, selector) );
    }
});

baidu.dom.extend({
    nextUntil : function (selector, filter) {
        var array = baidu.array();

        baidu.forEach(this, function(dom){
            var a = baidu.array();

            while(dom = dom.nextSibling) {
                dom && (dom.nodeType == 1) && a.push(dom);
            };

            if (selector && a.length) {
                var b = baidu.dom.match(a, selector);
                // 有符合 selector 的目标存在
                if (b.length) {
                    a = a.slice(0, a.indexOf(b[0]));
                }
            }
            baidu.merge(array, a);
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    not : function (selector) {
        var i, j, n
            ,all= this.get()
            ,a  = baidu.isArray(selector) ? selector
                : baidu.dom.match(this, selector);

        for (i=all.length - 1; i>-1; i--) {
            for (j=0, n=a.length; j<n; j++) {
                a[j] === all[i] && all.splice(i, 1);
            }
        }

        return this.pushStack(all);
    }
});

baidu.dom.extend({
    one: function( types, selector, data, fn  ){
        return this.on( types, selector, data, fn, 1 );
    }
});

baidu.dom.extend({
    outerHeight: function(margin){
        if(this.size()<=0){return 0;}
        var ele = this[0],
            type = ele != null && ele === ele.window ? 'window'
                : (ele.nodeType === 9 ? 'document' : false);
        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'height')
            : baidu._util_.getWidthOrHeight(ele, 'height', 'padding|border' + (margin ? '|margin' : ''));
    }
});

baidu.dom.extend({
    outerWidth: function(margin){
        if(this.size()<=0){return 0;}    
        var ele = this[0],
            type = ele != null && ele === ele.window ? 'window'
                : (ele.nodeType === 9 ? 'document' : false);
        return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, 'width')
            : baidu._util_.getWidthOrHeight(ele, 'width', 'padding|border' + (margin ? '|margin' : ''));
    }
});

baidu.dom.extend({
    parent : function (filter) {
        var array = [];

        baidu.forEach(this, function(dom) {
            (dom = dom.parentNode) && dom.nodeType == 1 && array.push(dom);
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    parents : function (filter) {
        var array = [];

        baidu.forEach(this, function(dom) {
            var a = [];

            while ((dom = dom.parentNode) && dom.nodeType == 1) a.push(dom);

            baidu.merge(array, a);
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    parentsUntil : function (selector, filter) {
        baidu.check("(string|HTMLElement)(,.+)?","baidu.dom.parentsUntil");
        var array = [];

        baidu.forEach(this, function(dom){
            var a = baidu.array();

            while ((dom = dom.parentNode) && dom.nodeType == 1) a.push(dom);

            if (selector && a.length) {
                var b = baidu.dom.match(a, selector);
                // 有符合 selector 的目标存在
                if (b.length) {
                    a = a.slice(0, a.indexOf(b[0]));
                }
            }
            baidu.merge(array, a);
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    prepend: function(){
        baidu.check('^(?:string|function|HTMLElement|\\$DOM)(?:,(?:string|array|HTMLElement|\\$DOM))*$', 'baidu.dom.prepend');
        baidu._util_.smartInsert(this, arguments, function(child){
            this.nodeType === 1 && this.insertBefore(child, this.firstChild);
        });
        return this;
    }
});

baidu.dom.extend({
    prependTo: function(target){
        var ret = [],
            array_push = ret.push;
        baidu.check('^(?:string|HTMLElement|\\$DOM)$', 'baidu.dom.prependTo');
        baidu._util_.smartInsertTo(this, target, function(child){
            array_push.apply(ret, baidu.makeArray(child.childNodes));
            this.insertBefore(child, this.firstChild);
        });
        return this.pushStack( ret );
    }
});

baidu.dom.extend({
    prev : function (filter) {
        var array = [];

        baidu.forEach(this, function(dom) {
            while (dom = dom.previousSibling) {
                if (dom.nodeType == 1) {
                    array.push(dom);
                    break;
                }
            }
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    prevAll : function (filter) {
        var array = baidu.array();

        baidu.forEach(this, function(dom) {
            var a = [];
            while (dom = dom.previousSibling) dom.nodeType == 1 && a.push(dom);

            baidu.merge(array, a.reverse());
        });

        return this.pushStack(typeof filter == "string" ? baidu.dom.match(array, filter) : array.unique());
    }
});

baidu.dom.extend({
    prevUntil : function (selector, filter) {
        baidu.check("(string|HTMLElement)(,.+)?", "baidu.dom.prevUntil");
        var array = [];

        baidu.forEach(this, function(dom) {
            var a = baidu.array();

            while(dom = dom.previousSibling) {
                dom && (dom.nodeType == 1) && a.push(dom);
            };

            if (selector && a.length) {
                var b = baidu.dom.match(a, selector);
                // 有符合 selector 的目标存在
                if (b.length) {
                    a = a.slice(0, a.indexOf(b[0]));
                }
            }

            baidu.merge(array, a);
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

 

baidu.dom.extend({
    prop: function(propName, value){
        return baidu._util_.access(this, propName, value, function(ele, key, val){
            return baidu._util_.prop(ele, key, val);
        });
    }
});

baidu.string.extend({
    escapeReg : function () {
        return this.replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
    }
});

void function( window, undefined ) {

 //在用户选择使用 Sizzle 时会被覆盖原有简化版本的baidu.query方法

    baidu.query = function( selector, context, results ) {
        return baidu.merge( results || [], baidu.sizzle(selector, context) );
    };

    var document = window.document,
        docElem = document.documentElement,

        expando = "sizcache" + (Math.random() + '').replace('.', ''),
        done = 0,

        toString = Object.prototype.toString,
        strundefined = "undefined",

        hasDuplicate = false,
        baseHasDuplicate = true,

        // Regex
        rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
        chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,

        rbackslash = /\\/g,
        rnonWord = /\W/,
        rstartsWithWord = /^\w/,
        rnonDigit = /\D/,
        rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
        radjacent = /^\+|\s*/g,
        rheader = /h\d/i,
        rinputs = /input|select|textarea|button/i,
        rtnfr = /[\t\n\f\r]/g,

        characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
        matchExpr = {
            ID: new RegExp("#(" + characterEncoding + "+)"),
            CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
            NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
            TAG: new RegExp("^(" + characterEncoding.replace( "[-", "[-\\*" ) + "+)"),
            ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
            PSEUDO: new RegExp(":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?"),
            CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
            POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
        },

        origPOS = matchExpr.POS,

        leftMatchExpr = (function() {
            var type,
                // Increments parenthetical references
                // for leftMatch creation
                fescape = function( all, num ) {
                    return "\\" + ( num - 0 + 1 );
                },
                leftMatch = {};

            for ( type in matchExpr ) {
                // Modify the regexes ensuring the matches do not end in brackets/parens
                matchExpr[ type ] = new RegExp( matchExpr[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
                // Adds a capture group for characters left of the match
                leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace( /\\(\d+)/g, fescape ) );
            }

            // Expose origPOS
            // "global" as in regardless of relation to brackets/parens
            matchExpr.globalPOS = origPOS;

            return leftMatch;
        })(),

        // Used for testing something on an element
        assert = function( fn ) {
            var pass = false,
                div = document.createElement("div");
            try {
                pass = fn( div );
            } catch (e) {}
            // release memory in IE
            div = null;
            return pass;
        },

        // Check to see if the browser returns elements by name when
        // querying by getElementById (and provide a workaround)
        assertGetIdNotName = assert(function( div ) {
            var pass = true,
                id = "script" + (new Date()).getTime();
            div.innerHTML = "<a name ='" + id + "'/>";

            // Inject it into the root element, check its status, and remove it quickly
            docElem.insertBefore( div, docElem.firstChild );

            if ( document.getElementById( id ) ) {
                pass = false;
            }
            docElem.removeChild( div );
            return pass;
        }),

        // Check to see if the browser returns only elements
        // when doing getElementsByTagName("*")
        assertTagNameNoComments = assert(function( div ) {
            div.appendChild( document.createComment("") );
            return div.getElementsByTagName("*").length === 0;
        }),

        // Check to see if an attribute returns normalized href attributes
        assertHrefNotNormalized = assert(function( div ) {
            div.innerHTML = "<a href='#'></a>";
            return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
                div.firstChild.getAttribute("href") === "#";
        }),

        // Determines a buggy getElementsByClassName
        assertUsableClassName = assert(function( div ) {
            // Opera can't find a second classname (in 9.6)
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
                return false;
            }

            // Safari caches class attributes, doesn't catch changes (in 3.2)
            div.lastChild.className = "e";
            return div.getElementsByClassName("e").length !== 1;
        });

    // Check if the JavaScript engine is using some sort of
    // optimization where it does not always call our comparision
    // function. If that is the case, discard the hasDuplicate value.
    //   Thus far that includes Google Chrome.
    [0, 0].sort(function() {
        baseHasDuplicate = false;
        return 0;
    });

    var Sizzle = function( selector, context, results ) {
        results = results || [];
        context = context || document;
        var match, elem, contextXML,
            nodeType = context.nodeType;

        if ( nodeType !== 1 && nodeType !== 9 ) {
            return [];
        }

        if ( !selector || typeof selector !== "string" ) {
            return results;
        }else{
            selector = baidu.string(selector).trim();
            if(!selector){return results;};
        }

        contextXML = isXML( context );

        if ( !contextXML ) {
            if ( (match = rquickExpr.exec( selector )) ) {
                // Speed-up: Sizzle("#ID")
                if ( match[1] ) {
                    if ( nodeType === 9 ) {
                        elem = context.getElementById( match[1] );
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if ( elem && elem.parentNode ) {
                            // Handle the case where IE, Opera, and Webkit return items
                            // by name instead of ID
                            if ( elem.id === match[1] ) {
                                return makeArray( [ elem ], results );
                            }
                        } else {
                            return makeArray( [], results );
                        }
                    } else {
                        // Context is not a document
                        if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( match[1] )) &&
                            contains( context, elem ) && elem.id === match[1] ) {
                            return makeArray( [ elem ], results );
                        }
                    }

                // Speed-up: Sizzle("TAG")
                } else if ( match[2] ) {
                    // Speed-up: Sizzle("body")
                    if ( selector === "body" && context.body ) {
                        return makeArray( [ context.body ], results );
                    }
                    return makeArray( context.getElementsByTagName( selector ), results );
                // Speed-up: Sizzle(".CLASS")
                } else if ( assertUsableClassName && match[3] && context.getElementsByClassName ) {
                    return makeArray( context.getElementsByClassName( match[3] ), results );
                }
            }
        }

        // All others
        return select( selector, context, results, undefined, contextXML );
    };

    var select = function( selector, context, results, seed, contextXML ) {
        var m, set, checkSet, extra, ret, cur, pop, i,
            origContext = context,
            prune = true,
            parts = [],
            soFar = selector;

        do {
            // Reset the position of the chunker regexp (start from head)
            chunker.exec( "" );
            m = chunker.exec( soFar );

            if ( m ) {
                soFar = m[3];

                parts.push( m[1] );

                if ( m[2] ) {
                    extra = m[3];
                    break;
                }
            }
        } while ( m );

        if ( parts.length > 1 && origPOS.exec( selector ) ) {

            if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
                set = posProcess( parts[0] + parts[1], context, seed, contextXML );

            } else {
                set = Expr.relative[ parts[0] ] ?
                    [ context ] :
                    Sizzle( parts.shift(), context );

                while ( parts.length ) {
                    selector = parts.shift();

                    if ( Expr.relative[ selector ] ) {
                        selector += parts.shift();
                    }

                    set = posProcess( selector, set, seed, contextXML );
                }
            }

        } else {
            // Take a shortcut and set the context if the root selector is an ID
            // (but not if it'll be faster if the inner selector is an ID)
            if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                    matchExpr.ID.test( parts[0] ) && !matchExpr.ID.test( parts[parts.length - 1] ) ) {

                ret = find( parts.shift(), context, contextXML );
                context = ret.expr ?
                    filter( ret.expr, ret.set )[0] :
                    ret.set[0];
            }

            if ( context ) {
                ret = seed ?
                    { expr: parts.pop(), set: makeArray( seed ) } :
                    find( parts.pop(), (parts.length >= 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode) || context, contextXML );

                set = ret.expr ?
                    filter( ret.expr, ret.set ) :
                    ret.set;

                if ( parts.length > 0 ) {
                    checkSet = makeArray( set );

                } else {
                    prune = false;
                }

                while ( parts.length ) {
                    cur = parts.pop();
                    pop = cur;

                    if ( !Expr.relative[ cur ] ) {
                        cur = "";
                    } else {
                        pop = parts.pop();
                    }

                    if ( pop == null ) {
                        pop = context;
                    }

                    Expr.relative[ cur ]( checkSet, pop, contextXML );
                }

            } else {
                checkSet = parts = [];
            }
        }

        if ( !checkSet ) {
            checkSet = set;
        }

        if ( !checkSet ) {
            error( cur || selector );
        }

        if ( toString.call(checkSet) === "[object Array]" ) {
            if ( !prune ) {
                results.push.apply( results, checkSet );

            } else if ( context && context.nodeType === 1 ) {
                for ( i = 0; checkSet[i] != null; i++ ) {
                    if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains( context, checkSet[i] )) ) {
                        results.push( set[i] );
                    }
                }

            } else {
                for ( i = 0; checkSet[i] != null; i++ ) {
                    if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
                        results.push( set[i] );
                    }
                }
            }

        } else {
            makeArray( checkSet, results );
        }

        if ( extra ) {
            select( extra, origContext, results, seed, contextXML );
            uniqueSort( results );
        }

        return results;
    };

    var isXML = baidu._util_.isXML;
    //var isXML = Sizzle.isXML = function( elem ) {
    //  // documentElement is verified for cases where it doesn't yet exist
    //  // (such as loading iframes in IE - #4833)
    //  var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
    //  return documentElement ? documentElement.nodeName !== "HTML" : false;
    //};

    // Slice is no longer used
    // It is not actually faster
    // Results is expected to be an array or undefined
    // typeof len is checked for if array is a form nodelist containing an element with name "length" (wow)
    //var makeArray = function( array, results ) {
    //  results = results || [];
    //  var i = 0,
    //      len = array.length;
    //  if ( typeof len === "number" ) {
    //      for ( ; i < len; i++ ) {
    //          results.push( array[i] );
    //      }
    //  } else {
    //      for ( ; array[i]; i++ ) {
    //          results.push( array[i] );
    //      }
    //  }
    //  return results;
    //};
    var makeArray = baidu.makeArray;

    var uniqueSort = function( results ) {
        if ( sortOrder ) {
            hasDuplicate = baseHasDuplicate;
            results.sort( sortOrder );

            if ( hasDuplicate ) {
                for ( var i = 1; i < results.length; i++ ) {
                    if ( results[i] === results[ i - 1 ] ) {
                        results.splice( i--, 1 );
                    }
                }
            }
        }

        return results;
    };

    // Element contains another
    //var contains = Sizzle.contains = docElem.compareDocumentPosition ?
    //  function( a, b ) {
    //      return !!(a.compareDocumentPosition( b ) & 16);
    //  } :
    //  docElem.contains ?
    //  function( a, b ) {
    //      return a !== b && ( a.contains ? a.contains( b ) : false );
    //  } :
    //  function( a, b ) {
    //      while ( (b = b.parentNode) ) {
    //          if ( b === a ) {
    //              return true;
    //          }
    //      }
    //      return false;
    //  };
    var contains = baidu._util_.contains;

    // Sizzle.matchesSelector = function( node, expr ) {
    //   return select( expr, document, [], [ node ], isXML( document ) ).length > 0;
    // };

    var find = function( expr, context, contextXML ) {
        var set, i, len, match, type, left;

        if ( !expr ) {
            return [];
        }

        for ( i = 0, len = Expr.order.length; i < len; i++ ) {
            type = Expr.order[i];

            if ( (match = leftMatchExpr[ type ].exec( expr )) ) {
                left = match[1];
                match.splice( 1, 1 );

                if ( left.substr( left.length - 1 ) !== "\\" ) {
                    match[1] = (match[1] || "").replace( rbackslash, "" );
                    set = Expr.find[ type ]( match, context, contextXML );

                    if ( set != null ) {
                        expr = expr.replace( matchExpr[ type ], "" );
                        break;
                    }
                }
            }
        }

        if ( !set ) {
            set = typeof context.getElementsByTagName !== strundefined ?
                context.getElementsByTagName( "*" ) :
                [];
        }

        return { set: set, expr: expr };
    };

    var filter = function( expr, set, inplace, not ) {
        var match, anyFound,
            type, found, item, filter, left,
            i, pass,
            old = expr,
            result = [],
            curLoop = set,
            isXMLFilter = set && set[0] && isXML( set[0] );

        while ( expr && set.length ) {
            for ( type in Expr.filter ) {
                if ( (match = leftMatchExpr[ type ].exec( expr )) != null && match[2] ) {
                    filter = Expr.filter[ type ];
                    left = match[1];

                    anyFound = false;

                    match.splice( 1, 1 );

                    if ( left.substr( left.length - 1 ) === "\\" ) {
                        continue;
                    }

                    if ( curLoop === result ) {
                        result = [];
                    }

                    if ( Expr.preFilter[ type ] ) {
                        match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

                        if ( !match ) {
                            anyFound = found = true;

                        } else if ( match === true ) {
                            continue;
                        }
                    }

                    if ( match ) {
                        for ( i = 0; (item = curLoop[i]) != null; i++ ) {
                            if ( item ) {
                                found = filter( item, match, i, curLoop );
                                pass = not ^ found;

                                if ( inplace && found != null ) {
                                    if ( pass ) {
                                        anyFound = true;

                                    } else {
                                        curLoop[i] = false;
                                    }

                                } else if ( pass ) {
                                    result.push( item );
                                    anyFound = true;
                                }
                            }
                        }
                    }

                    if ( found !== undefined ) {
                        if ( !inplace ) {
                            curLoop = result;
                        }

                        expr = expr.replace( matchExpr[ type ], "" );

                        if ( !anyFound ) {
                            return [];
                        }

                        break;
                    }
                }
            }

            // Improper expression
            if ( expr === old ) {
                if ( anyFound == null ) {
                    error( expr );

                } else {
                    break;
                }
            }

            old = expr;
        }

        return curLoop;
    };

    var error = function( msg ) {
        throw new Error( msg );
    };

    
    var getText = function( elem ) {
        var i, node,
            nodeType = elem.nodeType,
            ret = "";

        if ( nodeType ) {
            if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
                // Use textContent for elements
                // innerText usage removed for consistency of new lines (see #11153)
                if ( typeof elem.textContent === "string" ) {
                    return elem.textContent;
                } else {
                    // Traverse it's children
                    for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                        ret += getText( elem );
                    }
                }
            } else if ( nodeType === 3 || nodeType === 4 ) {
                return elem.nodeValue;
            }
        } else {

            // If no nodeType, this is expected to be an array
            for ( i = 0; (node = elem[i]); i++ ) {
                // Do not traverse comment nodes
                if ( node.nodeType !== 8 ) {
                    ret += getText( node );
                }
            }
        }
        return ret;
    };

    var Expr = {

        match: matchExpr,
        leftMatch: leftMatchExpr,

        order: [ "ID", "NAME", "TAG" ],

        attrMap: {
            "class": "className",
            "for": "htmlFor"
        },

        attrHandle: {
            href: assertHrefNotNormalized ?
                function( elem ) {
                    return elem.getAttribute( "href" );
                } :
                function( elem ) {
                    return elem.getAttribute( "href", 2 );
                },
            type: function( elem ) {
                return elem.getAttribute( "type" );
            }
        },

        relative: {
            "+": function( checkSet, part ) {
                var isPartStr = typeof part === "string",
                    isTag = isPartStr && !rnonWord.test( part ),
                    isPartStrNotTag = isPartStr && !isTag;

                if ( isTag ) {
                    part = part.toLowerCase();
                }

                for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
                    if ( (elem = checkSet[i]) ) {
                        while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

                        checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                            elem || false :
                            elem === part;
                    }
                }

                if ( isPartStrNotTag ) {
                    filter( part, checkSet, true );
                }
            },

            ">": function( checkSet, part ) {
                var elem,
                    isPartStr = typeof part === "string",
                    i = 0,
                    l = checkSet.length;

                if ( isPartStr && !rnonWord.test( part ) ) {
                    part = part.toLowerCase();

                    for ( ; i < l; i++ ) {
                        elem = checkSet[i];

                        if ( elem ) {
                            var parent = elem.parentNode;
                            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                        }
                    }

                } else {
                    for ( ; i < l; i++ ) {
                        elem = checkSet[i];

                        if ( elem ) {
                            checkSet[i] = isPartStr ?
                                elem.parentNode :
                                elem.parentNode === part;
                        }
                    }

                    if ( isPartStr ) {
                        filter( part, checkSet, true );
                    }
                }
            },

            "": function( checkSet, part, xml ) {
                dirCheck( "parentNode", checkSet, part, xml );
            },

            "~": function( checkSet, part, xml ) {
                dirCheck( "previousSibling", checkSet, part, xml );
            }
        },

        find: {
            ID: assertGetIdNotName ?
                function( match, context, xml ) {
                    if ( typeof context.getElementById !== strundefined && !xml ) {
                        var m = context.getElementById( match[1] );
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        return m && m.parentNode ? [m] : [];
                    }
                } :
                function( match, context, xml ) {
                    if ( typeof context.getElementById !== strundefined && !xml ) {
                        var m = context.getElementById( match[1] );

                        return m ?
                            m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").nodeValue === match[1] ?
                                [m] :
                                undefined :
                            [];
                    }
                },

            NAME: function( match, context ) {
                if ( typeof context.getElementsByName !== strundefined ) {
                    var ret = [],
                        results = context.getElementsByName( match[1] ),
                        i = 0,
                        len = results.length;

                    for ( ; i < len; i++ ) {
                        if ( results[i].getAttribute("name") === match[1] ) {
                            ret.push( results[i] );
                        }
                    }

                    return ret.length === 0 ? null : ret;
                }
            },

            TAG: assertTagNameNoComments ?
                function( match, context ) {
                    if ( typeof context.getElementsByTagName !== strundefined ) {
                        return context.getElementsByTagName( match[1] );
                    }
                } :
                function( match, context ) {
                    var results = context.getElementsByTagName( match[1] );

                    // Filter out possible comments
                    if ( match[1] === "*" ) {
                        var tmp = [],
                            i = 0;

                        for ( ; results[i]; i++ ) {
                            if ( results[i].nodeType === 1 ) {
                                tmp.push( results[i] );
                            }
                        }

                        results = tmp;
                    }
                    return results;
                }
        },

        preFilter: {
            CLASS: function( match, curLoop, inplace, result, not, xml ) {
                match = " " + match[1].replace( rbackslash, "" ) + " ";

                if ( xml ) {
                    return match;
                }

                for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
                    if ( elem ) {
                        if ( not ^ (elem.className && ~(" " + elem.className + " ").replace( rtnfr, " " ).indexOf( match ) ) ) {
                            if ( !inplace ) {
                                result.push( elem );
                            }

                        } else if ( inplace ) {
                            curLoop[i] = false;
                        }
                    }
                }

                return false;
            },

            ID: function( match ) {
                return match[1].replace( rbackslash, "" );
            },

            TAG: function( match, curLoop ) {
                return match[1].replace( rbackslash, "" ).toLowerCase();
            },

            CHILD: function( match ) {
                if ( match[1] === "nth" ) {
                    if ( !match[2] ) {
                        error( match[0] );
                    }

                    match[2] = match[2].replace( radjacent, "" );

                    // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                    var test = rnth.exec(
                        match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                        !rnonDigit.test( match[2] ) && "0n+" + match[2] || match[2] );

                    // calculate the numbers (first)n+(last) including if they are negative
                    match[2] = (test[1] + (test[2] || 1)) - 0;
                    match[3] = test[3] - 0;
                } else if ( match[2] ) {
                    error( match[0] );
                }

                // TODO: Move to normal caching system
                match[0] = done++;

                return match;
            },

            ATTR: function( match, curLoop, inplace, result, not, xml ) {
                var name = match[1] = match[1].replace( rbackslash, "" );

                if ( !xml && Expr.attrMap[ name ] ) {
                    match[1] = Expr.attrMap[ name ];
                }

                // Handle if an un-quoted value was used
                match[4] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

                if ( match[2] === "~=" ) {
                    match[4] = " " + match[4] + " ";
                }

                return match;
            },

            PSEUDO: function( match, curLoop, inplace, result, not, xml ) {
                if ( match[1] === "not" ) {
                    // If we're dealing with a complex expression, or a simple one
                    if ( ( chunker.exec( match[3] ) || "" ).length > 1 || rstartsWithWord.test( match[3] ) ) {
                        match[3] = select( match[3], document, [], curLoop, xml );

                    } else {
                        var ret = filter( match[3], curLoop, inplace, !not );

                        if ( !inplace ) {
                            result.push.apply( result, ret );
                        }

                        return false;
                    }

                } else if ( matchExpr.POS.test( match[0] ) || matchExpr.CHILD.test( match[0] ) ) {
                    return true;
                }

                return match;
            },

            POS: function( match ) {
                match.unshift( true );

                return match;
            }
        },

        filters: {
            enabled: function( elem ) {
                return elem.disabled === false;
            },

            disabled: function( elem ) {
                return elem.disabled === true;
            },

            checked: function( elem ) {
                // In CSS3, :checked should return both checked and selected elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                var nodeName = elem.nodeName.toLowerCase();
                return (nodeName === "input" && !! elem.checked) || (nodeName === "option" && !!elem.selected);
            },

            selected: function( elem ) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                if ( elem.parentNode ) {
                    elem.parentNode.selectedIndex;
                }

                return elem.selected === true;
            },

            parent: function( elem ) {
                return !!elem.firstChild;
            },

            empty: function( elem ) {
                return !elem.firstChild;
            },

            has: function( elem, i, match ) {
                return !!Sizzle( match[3], elem ).length;
            },

            header: function( elem ) {
                return rheader.test( elem.nodeName );
            },

            text: function( elem ) {
                var attr = elem.getAttribute( "type" ), type = elem.type;
                // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                // use getAttribute instead to test this case
                return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
            },

            radio: function( elem ) {
                return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
            },

            checkbox: function( elem ) {
                return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
            },

            file: function( elem ) {
                return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
            },

            password: function( elem ) {
                return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
            },

            submit: function( elem ) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && "submit" === elem.type;
            },

            image: function( elem ) {
                return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
            },

            reset: function( elem ) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && "reset" === elem.type;
            },

            button: function( elem ) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && "button" === elem.type || name === "button";
            },

            input: function( elem ) {
                return rinputs.test( elem.nodeName );
            },

            focus: function( elem ) {
                var doc = elem.ownerDocument;
                return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
            },

            active: function( elem ) {
                return elem === elem.ownerDocument.activeElement;
            },

            contains: function( elem, i, match ) {
                return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( match[3] ) >= 0;
            }
        },

        setFilters: {
            first: function( elem, i ) {
                return i === 0;
            },

            last: function( elem, i, match, array ) {
                return i === array.length - 1;
            },

            even: function( elem, i ) {
                return i % 2 === 0;
            },

            odd: function( elem, i ) {
                return i % 2 === 1;
            },

            lt: function( elem, i, match ) {
                return i < match[3] - 0;
            },

            gt: function( elem, i, match ) {
                return i > match[3] - 0;
            },

            nth: function( elem, i, match ) {
                return match[3] - 0 === i;
            },

            eq: function( elem, i, match ) {
                return match[3] - 0 === i;
            }
        },

        filter: {
            PSEUDO: function( elem, match, i, array ) {
                var name = match[1],
                    filter = Expr.filters[ name ];

                if ( filter ) {
                    return filter( elem, i, match, array );

                } else if ( name === "not" ) {
                    var not = match[3],
                        j = 0,
                        len = not.length;

                    for ( ; j < len; j++ ) {
                        if ( not[j] === elem ) {
                            return false;
                        }
                    }

                    return true;

                } else {
                    error( name );
                }
            },

            CHILD: function( elem, match ) {
                var first, last,
                    doneName, parent, cache,
                    count, diff,
                    type = match[1],
                    node = elem;

                switch ( type ) {
                    case "only":
                    case "first":
                        while ( (node = node.previousSibling) ) {
                            if ( node.nodeType === 1 ) {
                                return false;
                            }
                        }

                        if ( type === "first" ) {
                            return true;
                        }

                        node = elem;

                        
                    case "last":
                        while ( (node = node.nextSibling) ) {
                            if ( node.nodeType === 1 ) {
                                return false;
                            }
                        }

                        return true;

                    case "nth":
                        first = match[2];
                        last = match[3];

                        if ( first === 1 && last === 0 ) {
                            return true;
                        }

                        doneName = match[0];
                        parent = elem.parentNode;

                        if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
                            count = 0;

                            for ( node = parent.firstChild; node; node = node.nextSibling ) {
                                if ( node.nodeType === 1 ) {
                                    node.nodeIndex = ++count;
                                }
                            }

                            parent[ expando ] = doneName;
                        }

                        diff = elem.nodeIndex - last;

                        if ( first === 0 ) {
                            return diff === 0;

                        } else {
                            return ( diff % first === 0 && diff / first >= 0 );
                        }
                }
            },

            ID: assertGetIdNotName ?
                function( elem, match ) {
                    return elem.nodeType === 1 && elem.getAttribute("id") === match;
                } :
                function( elem, match ) {
                    var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                    return elem.nodeType === 1 && node && node.nodeValue === match;
                },

            TAG: function( elem, match ) {
                return ( match === "*" && elem.nodeType === 1 ) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
            },

            CLASS: function( elem, match ) {
                return ( " " + ( elem.className || elem.getAttribute("class") ) + " " ).indexOf( match ) > -1;
            },

            ATTR: function( elem, match ) {
                var name = match[1],
                    result = Expr.attrHandle[ name ] ?
                        Expr.attrHandle[ name ]( elem ) :
                        elem[ name ] != null ?
                            elem[ name ] :
                            elem.getAttribute( name ),
                    value = result + "",
                    type = match[2],
                    check = match[4];

                return result == null ?
                    type === "!=" :
                    // !type && Sizzle.attr ?
                    // result != null :
                    type === "=" ?
                    value === check :
                    type === "*=" ?
                    value.indexOf( check ) >= 0 :
                    type === "~=" ?
                    ( " " + value + " " ).indexOf( check ) >= 0 :
                    !check ?
                    value && result !== false :
                    type === "!=" ?
                    value !== check :
                    type === "^=" ?
                    value.indexOf( check ) === 0 :
                    type === "$=" ?
                    value.substr( value.length - check.length ) === check :
                    type === "|=" ?
                    value === check || value.substr( 0, check.length + 1 ) === check + "-" :
                    false;
            },

            POS: function( elem, match, i, array ) {
                var name = match[2],
                    filter = Expr.setFilters[ name ];

                if ( filter ) {
                    return filter( elem, i, match, array );
                }
            }
        }
    };

    // Add getElementsByClassName if usable
    if ( assertUsableClassName ) {
        Expr.order.splice( 1, 0, "CLASS" );
        Expr.find.CLASS = function( match, context, xml ) {
            if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
                return context.getElementsByClassName( match[1] );
            }
        };
    }

    var sortOrder, siblingCheck;

    if ( docElem.compareDocumentPosition ) {
        sortOrder = function( a, b ) {
            if ( a === b ) {
                hasDuplicate = true;
                return 0;
            }

            if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
                return a.compareDocumentPosition ? -1 : 1;
            }

            return a.compareDocumentPosition(b) & 4 ? -1 : 1;
        };

    } else {
        sortOrder = function( a, b ) {
            // The nodes are identical, we can exit early
            if ( a === b ) {
                hasDuplicate = true;
                return 0;

            // Fallback to using sourceIndex (in IE) if it's available on both nodes
            } else if ( a.sourceIndex && b.sourceIndex ) {
                return a.sourceIndex - b.sourceIndex;
            }

            var al, bl,
                ap = [],
                bp = [],
                aup = a.parentNode,
                bup = b.parentNode,
                cur = aup;

            // If the nodes are siblings (or identical) we can do a quick check
            if ( aup === bup ) {
                return siblingCheck( a, b );

            // If no parents were found then the nodes are disconnected
            } else if ( !aup ) {
                return -1;

            } else if ( !bup ) {
                return 1;
            }

            // Otherwise they're somewhere else in the tree so we need
            // to build up a full list of the parentNodes for comparison
            while ( cur ) {
                ap.unshift( cur );
                cur = cur.parentNode;
            }

            cur = bup;

            while ( cur ) {
                bp.unshift( cur );
                cur = cur.parentNode;
            }

            al = ap.length;
            bl = bp.length;

            // Start walking down the tree looking for a discrepancy
            for ( var i = 0; i < al && i < bl; i++ ) {
                if ( ap[i] !== bp[i] ) {
                    return siblingCheck( ap[i], bp[i] );
                }
            }

            // We ended someplace up the tree so do a sibling check
            return i === al ?
                siblingCheck( a, bp[i], -1 ) :
                siblingCheck( ap[i], b, 1 );
        };

        siblingCheck = function( a, b, ret ) {
            if ( a === b ) {
                return ret;
            }

            var cur = a.nextSibling;

            while ( cur ) {
                if ( cur === b ) {
                    return -1;
                }

                cur = cur.nextSibling;
            }

            return 1;
        };
    }

    if ( document.querySelectorAll ) {
        (function(){
            var oldSelect = select,
                id = "__sizzle__",
                rrelativeHierarchy = /^\s*[+~]/,
                rapostrophe = /'/g,
                // Build QSA regex
                // Regex strategy adopted from Diego Perini
                rbuggyQSA = [];

            assert(function( div ) {
                div.innerHTML = "<select><option selected></option></select>";

                // IE8 - Some boolean attributes are not treated correctly
                if ( !div.querySelectorAll("[selected]").length ) {
                    rbuggyQSA.push("\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
                }

                // Webkit/Opera - :checked should return selected option elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                // IE8 throws error here (do not put tests after this one)
                if ( !div.querySelectorAll(":checked").length ) {
                    rbuggyQSA.push(":checked");
                }
            });

            assert(function( div ) {

                // Opera 10/IE - ^= $= *= and empty values
                div.innerHTML = "<p class=''></p>";
                // Should not select anything
                if ( div.querySelectorAll("[class^='']").length ) {
                    rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
                }

                // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                // IE8 throws error here (do not put tests after this one)
                div.innerHTML = "<input type='hidden'>";
                if ( !div.querySelectorAll(":enabled").length ) {
                    rbuggyQSA.push(":enabled", ":disabled");
                }
            });

            rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

            select = function( selector, context, results, seed, contextXML ) {
                // Only use querySelectorAll when not filtering,
                // when this is not xml,
                // and when no QSA bugs apply
                if ( !seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
                    if ( context.nodeType === 9 ) {
                        try {
                            return makeArray( context.querySelectorAll( selector ), results );
                        } catch(qsaError) {}
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    // IE 8 doesn't work on object elements
                    } else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
                        var oldContext = context,
                            old = context.getAttribute( "id" ),
                            nid = old || id,
                            parent = context.parentNode,
                            relativeHierarchySelector = rrelativeHierarchy.test( selector );

                        if ( !old ) {
                            context.setAttribute( "id", nid );
                        } else {
                            nid = nid.replace( rapostrophe, "\\$&" );
                        }
                        if ( relativeHierarchySelector && parent ) {
                            context = parent;
                        }

                        try {
                            if ( !relativeHierarchySelector || parent ) {
                                return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + selector ), results );
                            }
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                oldContext.removeAttribute( "id" );
                            }
                        }
                    }
                }

                return oldSelect( selector, context, results, seed, contextXML );
            };
        })();
    }

    function dirCheck( dir, checkSet, part, xml ) {
        var elem, match, isElem, nodeCheck,
            doneName = done++,
            i = 0,
            len = checkSet.length;

        if ( typeof part === "string" && !rnonWord.test( part ) ) {
            part = part.toLowerCase();
            nodeCheck = part;
        }

        for ( ; i < len; i++ ) {
            elem = checkSet[i];

            if ( elem ) {
                match = false;
                elem = elem[ dir ];

                while ( elem ) {
                    if ( elem[ expando ] === doneName ) {
                        match = checkSet[ elem.sizset ];
                        break;
                    }

                    isElem = elem.nodeType === 1;
                    if ( isElem && !xml ) {
                        elem[ expando ] = doneName;
                        elem.sizset = i;
                    }

                    if ( nodeCheck ) {
                        if ( elem.nodeName.toLowerCase() === part ) {
                            match = elem;
                            break;
                        }
                    } else if ( isElem ) {
                        if ( typeof part !== "string" ) {
                            if ( elem === part ) {
                                match = true;
                                break;
                            }

                        } else if ( filter( part, [elem] ).length > 0 ) {
                            match = elem;
                            break;
                        }
                    }

                    elem = elem[ dir ];
                }

                checkSet[i] = match;
            }
        }
    }

    var posProcess = function( selector, context, seed, contextXML ) {
        var match,
            tmpSet = [],
            later = "",
            root = context.nodeType ? [ context ] : context,
            i = 0,
            len = root.length;

        // Position selectors must be done after the filter
        // And so must :not(positional) so we move all PSEUDOs to the end
        while ( (match = matchExpr.PSEUDO.exec( selector )) ) {
            later += match[0];
            selector = selector.replace( matchExpr.PSEUDO, "" );
        }

        if ( Expr.relative[ selector ] ) {
            selector += "*";
        }

        for ( ; i < len; i++ ) {
            select( selector, root[i], tmpSet, seed, contextXML );
        }

        return filter( later, tmpSet );
    };

    // EXPOSE

    window.Sizzle = baidu.sizzle = Sizzle;
    baidu.query.matches = function( expr, set ) {
        return select( expr, document, [], set, isXML( document ) );
    };

}( window );

baidu.dom.extend({
    ready: function(){

        var me = this,

            // The deferred used on DOM ready
            readyList,

            // Use the correct document accordingly with window argument (sandbox)
            document = window.document;

        // Is the DOM ready to be used? Set to true once it occurs.
        baidu._util_.isDomReady = false;

        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        baidu._util_._readyWait = 1;

        // Hold (or release) the ready event
        baidu.dom.holdReady = function( hold ) {
            if ( hold ) {
                baidu._util_.readyWait++;
            } else {
                _ready( true );
            }
        };

        // Handle when the DOM is ready
        var _ready = function( wait ) {

            // Abort if there are pending holds or we're already ready
            if ( wait === true ? --baidu._util_.readyWait : baidu._util_.isDomReady ) {
                return;
            }

            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( !document.body ) {
                return setTimeout( _ready, 1 );
            }

            // Remember that the DOM is ready
            baidu._util_.isReady = true;

            // If a normal DOM Ready event fired, decrement, and wait if need be
            if ( wait !== true && --baidu._util_.readyWait > 0 ) {
                return;
            }

            // If there are functions bound, to execute
            readyList.resolveWith( document );

            // Trigger any bound ready events
            if ( baidu.dom.trigger ) {
                baidu.dom( document ).trigger("ready").off("ready");
            }
        };

        var DOMContentLoaded = function() {
            if ( document.addEventListener ) {
                document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                _ready();
            } else if ( document.readyState === "complete" ) {
                // we're here because readyState === "complete" in oldIE
                // which is good enough for us to call the dom ready!
                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                _ready();
            }
        };

        var readyPromise = function( obj ) {
            if ( !readyList ) {

                readyList = baidu.Deferred();

                // Catch cases where $(document).ready() is called after the browser event has already occurred.
                // we once tried to use readyState "interactive" here, but it caused issues like the one
                // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
                if ( document.readyState === "complete" ) {
                    // Handle it asynchronously to allow scripts the opportunity to delay ready
                    setTimeout( _ready, 1 );

                // Standards-based browsers support DOMContentLoaded
                } else if ( document.addEventListener ) {
                    // Use the handy event callback
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

                    // A fallback to window.onload, that will always work
                    window.addEventListener( "load", _ready, false );

                // If IE event model is used
                } else {
                    // Ensure firing before onload, maybe late but safe also for iframes
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );

                    // A fallback to window.onload, that will always work
                    window.attachEvent( "onload", _ready );

                    // If IE and not a frame
                    // continually check to see if the document is ready
                    var top = false;

                    try {
                        top = window.frameElement == null && document.documentElement;
                    } catch(e) {}

                    if ( top && top.doScroll ) {
                        (function doScrollCheck() {
                            if ( !baidu._util_.isDomReady ) {

                                try {
                                    // Use the trick by Diego Perini
                                    // http://javascript.nwbox.com/IEContentLoaded/
                                    top.doScroll("left");
                                } catch(e) {
                                    return setTimeout( doScrollCheck, 50 );
                                }

                                // and execute any waiting functions
                                _ready();
                            }
                        })();
                    }
                }
            }
            return readyList.promise( obj );
        };

        return function( fn ) {

            // Add the callback
            readyPromise().done( fn );

            return me;
        }

    }()
});

 

baidu.dom.extend({
    removeAttr: function(key){
        this.each(function(index, item){
            baidu._util_.removeAttr(item, key);
        });
        return this;
    }
});

baidu.dom.extend({
    removeClass: function(value){

        var type = typeof value, b = " ";

        if( !arguments.length )
            baidu.forEach(this, function(item){
                item.className = "";
            });

        if( type == "string" ){
            value = baidu.string.trim(value);
            var arr = value.split(" ");

            baidu.forEach(this, function(item){
                var str = item.className ;
                for(var i = 0; i < arr.length; i ++)
                    while(~(b + str + b).indexOf(b + arr[i] + b))
                       str = (b + str + b).replace(b + arr[i] + b, b);
                item.className = baidu.string.trim(str);
            });

        }else if(type == "function"){
            baidu.forEach(this, function(item, index ,className){
                baidu.dom(item).removeClass(value.call(item, index, item.className));
            }); 
        }

        return this;
    }
});

baidu.dom.extend({
    removeData : function () {
        var   guid = baidu.key
            , maps = baidu.global("_maps_HTMLElementData");

        return function( key ) {
            baidu.forEach( this, function( dom ) {
                !dom[ guid ] && ( dom[ guid ] = baidu.id() );
            });

            // set all
            baidu.forEach(this, function(dom){
                var map = maps[dom[ guid ]];

                if (typeof key == "string") {
                    map && delete map[ key ];

                } else if (baidu.type( key) == "array") {
                    baidu.forEach( key, function(i) {
                        map && delete map[ i ];
                    });
                }
            });

            return this;
        }
    }()
});

baidu.dom.extend({
    removeProp: function(key){
        key = baidu._util_.propFixer[key] || key;
        this.each(function(index, item){
            // try/catch handles cases where IE balks (such as removing a property on window)
            try{
                item[key] = undefined;
                delete item[key];
            }catch(e){}
        });
        return this;
    }
});

baidu._util_.smartScroll = function(axis){
    var orie = {scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset'}[axis],
        is = axis === 'scrollLeft',
        ret = {};
    function isDocument(ele){
        return ele && ele.nodeType === 9;
    }
    function getWindow(ele){
        return baidu.type(ele) == "Window" ? ele
            : isDocument(ele) ? ele.defaultView || ele.parentWindow : false;
    }
    return {
        get: function(ele){
            var win = getWindow(ele);
            return win ? (orie in win) ? win[orie]
                : baidu.browser.isStrict && win.document.documentElement[axis]
                    || win.document.body[axis] : ele[axis];
        },
        
        set: function(ele, val){
            if(!ele){return;}
            var win = getWindow(ele);
            win ? win.scrollTo(is ? val : this.get(ele), !is ? val : this.get(ele))
                : ele[axis] = val;
        }
    };
};

baidu.dom.extend({
    scrollLeft: function(){
        var ret = baidu._util_.smartScroll('scrollLeft');
        return function(value){
            value && baidu.check('^(?:number|string)$', 'baidu.dom.scrollLeft');
            if(this.size()<=0){
                return value === undefined ? 0 : this;
            };
            return value === undefined ? ret.get(this[0])
                : ret.set(this[0], value) || this;
        }
    }()
});

baidu.dom.extend({
    scrollTop: function(){
        var ret = baidu._util_.smartScroll('scrollTop');
        return function(value){
            value && baidu.check('^(?:number|string)$', 'baidu.dom.scrollTop');
            if(this.size()<=0){
                return value === undefined ? 0 : this;
            };
            return value === undefined ? ret.get(this[0])
                : ret.set(this[0], value) || this;
        }
    }()
});

/// support magic - Tangram 1.x Code Start

baidu.dom.setPixel = function (el, style, n) {
    typeof n != "undefined" &&
    (baidu.dom.g(el).style[style] = n +(!isNaN(n) ? "px" : ""));
};
/// support magic - Tangram 1.x Code End

baidu._util_.getDefaultDisplayValue = function(){
    var valMap = {};
    return function(tagName){
        if(valMap[tagName]){return valMap[tagName];}
        var ele = document.createElement(tagName),
            val, frame, ownDoc;
        document.body.appendChild(ele);
        val = baidu.dom(ele).getCurrentStyle('display');
        document.body.removeChild(ele);
        if(val === '' || val === 'none'){
            frame = document.body.appendChild(document.createElement('iframe'));
            frame.frameBorder =
            frame.width =
            frame.height = 0;
            ownDoc = (frame.contentWindow || frame.contentDocument).document;
            ownDoc.writeln('<!DOCTYPE html><html><body>');
            ownDoc.close();
            ele = ownDoc.appendChild(ownDoc.createElement(tagName));
            val = baidu.dom(ele).getCurrentStyle('display');
            document.body.removeChild(frame);
            frame = null;
        }
        ele = null;
        return valMap[tagName] = val;
    }
}();

baidu.dom.extend({
    show: function(){
        var vals = [],
            display, tang;
        this.each(function(index, ele){
            if(!ele.style){return;}
            tang = baidu.dom(ele);
            display = ele.style.display;
            vals[index] = tang.data('olddisplay');
            if(!vals[index] && display === 'none'){
                ele.style.display = '';
            }
            if(ele.style.display === ''
                && baidu._util_.isHidden(ele)){
                    tang.data('olddisplay', (vals[index] = baidu._util_.getDefaultDisplayValue(ele.nodeName)));
            }
        });
        
        return this.each(function(index, ele){
            if(!ele.style){return;}
            if(ele.style.display === 'none'
                || ele.style.display === ''){
                    ele.style.display = vals[index] || '';
            }
        });
    }
});

baidu.dom.extend({
    siblings : function (filter) {
        var array = [];

        baidu.forEach(this, function(dom){
            var p = [], n = [], t = dom;

            while(t = t.previousSibling) t.nodeType == 1 && p.push(t);
            while(dom = dom.nextSibling) dom.nodeType==1 && n.push(dom);

            baidu.merge(array, p.reverse().concat(n));
        });

        return this.pushStack( baidu.dom.match(array, filter) );
    }
});

baidu.dom.extend({
    slice : function(){
        var slice = Array.prototype.slice;

        return function (start, end) {
            baidu.check("number(,number)?","baidu.dom.slice");

            // ie bug
            // return baidu.dom( this.toArray().slice(start, end) );
            return this.pushStack( slice.apply(this, arguments) );
        }
    }()
});

baidu.dom.extend({
    text: function(value){

        var bd = baidu.dom,
            me = this,
            isSet = false,
            result;

        //当dom选择器为空时
        if(this.size()<=0){
            switch(typeof value){
                case 'undefined':
                    return undefined;
                // break;
                default:
                    return me;
                // break;
            }           
        }

        
        var getText = function( elem ) {
            var node,
                ret = "",
                i = 0,
                nodeType = elem.nodeType;

            if ( nodeType ) {
                if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
                    // Use textContent for elements
                    // innerText usage removed for consistency of new lines (see #11153)
                    if ( typeof elem.textContent === "string" ) {
                        return elem.textContent;
                    } else {
                        // Traverse its children
                        for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
                            ret += getText( elem );
                        }
                    }
                } else if ( nodeType === 3 || nodeType === 4 ) {
                    return elem.nodeValue;
                }
                // Do not include comment or processing instruction nodes
            }
            //  else {

            //   // If no nodeType, this is expected to be an array
            //   for ( ; (node = elem[i]); i++ ) {
            //       // Do not traverse comment nodes
            //       ret += getText( node );
            //   }
            // }
            return ret;
        };

        baidu.forEach(me,function(elem, index){
            
            var tangramDom = bd(elem);
            if(result){return;};

            switch(typeof value){
                case 'undefined':
        
                    //get first
                    result = getText(elem);
                    return result;

                // break;

                case 'number':
                    value = String(value);
                case 'string':

                    //set all
                    isSet = true;
                    tangramDom.empty().append( ( elem && elem.ownerDocument || document ).createTextNode( value ) );
                break;

                case 'function':

                    //set all
                    isSet = true;
                    tangramDom.text(value.call(elem, index, tangramDom.text()));

                break;
            };
        });

        return isSet?me:result;
    }
});

baidu.dom.extend({
    toggle: function(){
        for(var i = 0 , num = this.size(); i < num ; i++ ){
            var ele = this.eq(i);
            if(ele.css('display') != 'none'){
                ele.hide();
            }else{
                ele.show();
            };
        };
    }
});

baidu.dom.extend({
    toggleClass: function(value,status){
        var type = typeof value;
        var status = (typeof status === 'undefined')? status : Boolean(status);

        if(arguments.length <= 0 ){
            baidu.forEach(this,function(item){
                item.className = '';
            });
        };

        switch(typeof value){
            case 'string':

                //对输入进行处理
                value = value.replace(/^\s+/g,'').replace(/\s+$/g,'').replace(/\s+/g,' ');

                var arr = value.split(' ');
                baidu.forEach(this, function(item){
                    var str = item.className;
                    for(var i = 0;i<arr.length;i++){

                        //有这个className
                        if((~(' '+str+' ').indexOf(' '+arr[i]+' '))&&(typeof status === 'undefined')){
                            str = (' '+str+' ').replace(' '+arr[i]+' ',' ');
                            
                        }else if((!~(' '+str+' ').indexOf(' '+arr[i]+' '))&&(typeof status === 'undefined')){
                            str += ' '+arr[i];

                        }else if((!~(' '+str+' ').indexOf(' '+arr[i]+' '))&&(status === true)){
                            str += ' '+arr[i];

                        }else if((~(' '+str+' ').indexOf(' '+arr[i]+' '))&&(status === false)){
                            str = str.replace(arr[i],'');
                        };
                    };
                    item.className = str.replace(/^\s+/g,'').replace(/\s+$/g,'');
                });
            break;
            case 'function':

                baidu.forEach(this, function(item, index){
                    baidu.dom(item).toggleClass(value.call(item, index, item.className),status);
                });

            break;
        };

        return this;
    }
});

void function( special ){
    if( special.mousewheel )return ;
    var ff = /firefox/i.test(navigator.userAgent), 
        ie = /msie/i.test(navigator.userAgent);

    baidu.each( { mouseenter: "mouseover", mouseleave: "mouseout" }, function( name, fix ){
        special[ name ] = {
            bindType: fix,
            pack: function( fn ){
                var contains = baidu.dom.contains;
                return function( e ){ // e instance of baidu.event
                    var related = e.relatedTarget;
                    e.type = name;
                    if( !related || ( related !== this && !contains( this, related ) ) )
                        return fn.apply( this, arguments );
                }
            }
        }
    } );

    if( !ie )
        baidu.each( { focusin: "focus", focusout: "blur" }, function( name, fix ){
            special[ name ] = {
                bindType: fix,
                attachElements: "textarea,select,input,button,a"
            }
        } );

    special.mousewheel = {
        bindType: ff ? "DOMMouseScroll" : "mousewheel",
        pack: function( fn ){
            return function( e ){ // e instance of baidu.event
                var oe = e.originalEvent;
                e.type = "mousewheel";
                e.wheelDelta = e.wheelDelta || ( ff ? oe.detail * -40 : oe.wheelDelta ) || 0;
                return fn.apply( this, arguments );
            }
        }
    };

}( baidu.event.special );

void function( base ){
    var queue = base.queue;

    baidu.dom.extend({
        triggerHandler: function( type, triggerData, _e ){
            if( _e && !_e.triggerData )
                _e.triggerData = triggerData;

            baidu.forEach(this, function(item){
                queue.call( item, type, undefined, _e );
            });
            return this;
        }
    });

}( baidu._util_.eventBase );

void function( base, be ){
    var special = be.special;
    var queue = base.queue;
    var dom = baidu.dom;

    var ie = !window.addEventListener, firefox = /firefox/i.test(navigator.userAgent);

    var abnormals = { submit: 3, focus: ie ? 3 : 2, blur: ie ? 3 : firefox ? 1 : 2 };

    var createEvent = function( type, opts ){
        var evnt;

        if( document.createEvent )
            evnt = document.createEvent( "HTMLEvents" ),
            evnt.initEvent( type, true, true );
        else if( document.createEventObject )
            evnt = document.createEventObject(),
            evnt.type = type;

        var extraData = {};

           if( opts )for( var name in opts )
               try{
                   evnt[ name ] = opts[ name ];
               }catch(e){
                   if( !evnt.extraData )
                       evnt.extraData = extraData;
                   extraData[ name ] = opts[ name ];
               }

        return evnt;
    };

    var dispatchEvent = function( element, type, event ){
       if( element.dispatchEvent )
           return element.dispatchEvent( event );
       else if( element.fireEvent )
           return element.fireEvent( "on" + type, event );
    };

//  var upp = function( str ){
//      return str.toLowerCase().replace( /^\w/, function( s ){
//          return s.toUpperCase();
//      } );
//  };

    var fire = function( element, type, triggerData, _eventOptions, special ){
        var evnt, eventReturn;

        if( evnt = createEvent( type, _eventOptions ) ){
            if( triggerData )
                evnt.triggerData = triggerData;
            
            if( special )
                queue.call( element, type, null, evnt );
            else{
                var abnormalsType = element.window === window ? 3 : abnormals[ type ];

                try{
                    if( abnormalsType & 1 || !( type in abnormals ) )
                        eventReturn = dispatchEvent( element, type, evnt );
                }catch(e){
                    dom( element ).triggerHandler( type, triggerData, evnt );
                }

                if( eventReturn !== false && abnormalsType & 2 ){
                    try{
                        if( element[ type ] )
                            element[ type ]();
                    }catch(e){
                    }
                }
            }
        }
    };

    baidu.dom.extend({
        trigger: function( type, triggerData, _eventOptions ){
            var sp;

            if( type in special )
                sp = special[type];

            this.each(function(){
                fire( this, type, triggerData, _eventOptions, sp );
            });

            return this;
        }
    });
}( baidu._util_.eventBase, baidu.event );

baidu.dom.extend({
    unbind: function(type, fn){
        return this.off(type, fn);
    }
});

baidu.dom.extend({
    undelegate: function( selector, type, fn ){
        return this.off( type, selector, fn );
    }
});

baidu.dom.extend({
    unique : function (fn) {
        return baidu.dom(baidu.array(this.toArray()).unique(fn));
    }
});

baidu._util_.inArray = function(ele, array, index){
    if(!array){return -1;}
    var indexOf = Array.prototype.indexOf,
        len;
    if(indexOf){return indexOf.call(array, ele, index);}
    len = array.length;
    index = index ? index < 0 ? Math.max(0, len + index) : index : 0;
    for(; index < len; index++){
        if(index in array && array[index] === ele){
            return index;
        }
    }
    return -1;
};

baidu.dom.extend({
    val: function(){
        baidu._util_.support.dom.select.disabled = true;
        var util = baidu._util_,
            checkOn = util.support.dom.input.value === 'on',
            optDisabled = !util.support.dom.opt.disabled,
            inputType = ['radio', 'checkbox'],
            valHooks = {
                option: {
                    get: function(ele){
                        var val = ele.attributes.value;
                        return !val || val.specified ? ele.value : ele.text;
                    }
                },
                select: {
                    get: function(ele){
                        var options = ele.options,
                            index = ele.selectedIndex,
                            one = ele.type === 'select-one' || index < 0,
                            ret = one ? null : [],
                            len = one ? index + 1 : options.length,
                            i = index < 0 ? len : one ? index : 0,
                            item, val;
                        for(; i < len; i++){
                            item = options[i];
                            if((item.selected || i === index)
                                && (optDisabled ? !item.disabled : item.getAttribute('disabled') === null)
                                && (!item.parentNode.disabled || !util.nodeName(item.parentNode, 'optgroup'))){
                                val = baidu.dom(item).val();
                                if(one){return val;}
                                ret.push(val);
                            }
                        }
                        return ret;
                    },
                    set: function(ele, key, val){
                        var ret = baidu.makeArray(val);
                        baidu.dom(ele).find('option').each(function(index, item){
                            item.selected = util.inArray(baidu.dom(this).val(), ret) >= 0;
                        });
                        !ret.length && (ele.selectedIndex = -1);
                        return ret;
                    }
                }
            };
        !util.support.getSetAttribute && (valHooks.button = util.nodeHook);
        if(!checkOn){
            baidu.forEach(inputType, function(item){
                valHooks[item] = {
                    get: function(ele){
                        return ele.getAttribute('value') === null ? 'on' : ele.value;
                    }
                };
            });
        }
        baidu.forEach(inputType, function(item){
            valHooks[item] = valHooks[item] || {};
            valHooks[item].set = function(ele, key, val){
                if(baidu.type(val) === 'array'){
                    return (ele.checked = util.inArray(baidu.dom(ele).val(), val) >= 0);
                }
            }
        });
        
        return function(value){
            var ele, hooks;
            if(value === undefined){
                if(!(ele = this[0])){return;}
                hooks = valHooks[ele.type] || valHooks[ele.nodeName.toLowerCase()] || {};
                return hooks.get && hooks.get(ele, 'value') || ele.value;
            }
            this.each(function(index, item){
                if(item.nodeType !== 1){return;}
                var tang = baidu.dom(item),
                    val = baidu.type(value) === 'function' ?
                        value.call(item, index, tang.val()) : value;
                if(val == null){
                    val = '';
                }else if(baidu.type(val) === 'number'){
                    val += '';
                }else if(baidu.type(val) === 'array'){
                    val = baidu.array(val).map(function(it){
                        return it == null ? '' : it + '';
                    });
                }
                hooks = valHooks[item.type] || valHooks[item.nodeName.toLowerCase()] || {};
                if(!hooks.set || hooks.set(item, 'value', val) === undefined){
                    item.value = val;
                }
            });
            return this;
        }
    }()
});

baidu.dom.extend({
    width: function(value){
        return baidu._util_.access(this, 'width', value, function(ele, key, val){
            var hasValue = val !== undefined,
                parseValue = hasValue && parseFloat(val),
                type = ele != null && ele == ele.window ? 'window'
                    : (ele.nodeType === 9 ? 'document' : false);
            if(hasValue && parseValue < 0 || isNaN(parseValue)){return;}
            hasValue && /^(?:\d*\.)?\d+$/.test(val += '') && (val += 'px');
            return type ? baidu._util_.getWindowOrDocumentWidthOrHeight(ele, type, key)
                : (hasValue ? ele.style.width = val : baidu._util_.getWidthOrHeight(ele, key));
        });
    }
});

baidu.dom.extend({

    end : function () {
        return this.prevObject || baidu.dom(null);
    }

});

void function(){
    var arr = ("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave mousewheel " +
    "change select submit keydown keypress keyup error contextmenu").split(" ");

    var conf = {};
    var create = function( name ){
        conf[ name ] = function( data, fn ){
            if( fn == null )
                fn = data,
                data = null;

            return arguments.length > 0 ?
                this.on( name, null, data, fn ) :
                this.trigger( name );
        }
    };

    for(var i = 0, l = arr.length; i < l; i ++)
        create( arr[i] );

    baidu.dom.extend( conf );
}();

baidu.createChain("fn",

// 执行方法
function(fn){
    return new baidu.fn.$Fn(~'function|string'.indexOf(baidu.type(fn)) ? fn : function(){});
},

// constructor
function(fn){
    this.fn = fn;
});

baidu.fn.extend({
    bind: function(scope){
        var func = this.fn,
            xargs = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
        return function(){
            var fn = baidu.type(func) === 'string' ? scope[func] : func,
                args = xargs ? xargs.concat(Array.prototype.slice.call(arguments, 0)) : arguments;
            return fn.apply(scope || fn, args);
        }
    }
});

/// support magic - support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

baidu.fx = baidu.fx || {} ;

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.lang.inherits = baidu.base.inherits;

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
/// support magic - Tangram 1.x Code End

 
 
 

baidu.fx.Timeline = function(options){
    baidu.lang.Class.call(this);

    this.interval = 16;
    this.duration = 500;
    this.dynamic  = true;

    baidu.object.extend(this, options);
};
baidu.lang.inherits(baidu.fx.Timeline, baidu.lang.Class, "baidu.fx.Timeline").extend({

    
    launch : function(){
        var me = this;
        me.dispatchEvent("onbeforestart");

        
        typeof me.initialize =="function" && me.initialize();

        me["\x06btime"] = new Date().getTime();
        me["\x06etime"] = me["\x06btime"] + (me.dynamic ? me.duration : 0);
        me["\x06pulsed"]();

        return me;
    }

    
    ,"\x06pulsed" : function(){
        var me = this;
        var now = new Date().getTime();
        // 当前时间线的进度百分比
        me.percent = (now - me["\x06btime"]) / me.duration;
        me.dispatchEvent("onbeforeupdate");

        // 时间线已经走到终点
        if (now >= me["\x06etime"]){
            typeof me.render == "function" && me.render(me.transition(me.percent = 1));

            // [interface run] finish()接口，时间线结束时对应的操作
            typeof me.finish == "function" && me.finish();

            me.dispatchEvent("onafterfinish");
            me.dispose();
            return;
        }

        
        typeof me.render == "function" && me.render(me.transition(me.percent));
        me.dispatchEvent("onafterupdate");

        me["\x06timer"] = setTimeout(function(){me["\x06pulsed"]()}, me.interval);
    }
    
    ,transition: function(percent) {
        return percent;
    }

    
    ,cancel : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];

        // [interface run] restore() 当时间线被撤销时的恢复操作
        typeof this.restore == "function" && this.restore();
        this.dispatchEvent("oncancel");

        this.dispose();
    }

    
    ,end : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];
        this["\x06pulsed"]();
    }
});
/// support magic - Tangram 1.x Code End

baidu.fx.create = function(element, options, fxName) {
    var timeline = new baidu.fx.Timeline(options);

    timeline.element = element;
    timeline.__type = fxName || timeline.__type;
    timeline["\x06original"] = {};   // 20100708
    var catt = "baidu_current_effect";

    
    timeline.addEventListener("onbeforestart", function(){
        var me = this, guid;
        me.attribName = "att_"+ me.__type.replace(/\W/g, "_");
        guid = me.element.getAttribute(catt);
        me.element.setAttribute(catt, (guid||"") +"|"+ me.guid +"|", 0);

        if (!me.overlapping) {
            (guid = me.element.getAttribute(me.attribName)) 
                && baiduInstance(guid).cancel();

            //在DOM元素上记录当前效果的guid
            me.element.setAttribute(me.attribName, me.guid, 0);
        }
    });

    
    timeline["\x06clean"] = function(e) {
        var me = this, guid;
        if (e = me.element) {
            e.removeAttribute(me.attribName);
            guid = e.getAttribute(catt);
            guid = guid.replace("|"+ me.guid +"|", "");
            if (!guid) e.removeAttribute(catt);
            else e.setAttribute(catt, guid, 0);
        }
    };

    
    timeline.addEventListener("oncancel", function() {
        this["\x06clean"]();
        this["\x06restore"]();
    });

    
    timeline.addEventListener("onafterfinish", function() {
        this["\x06clean"]();
        this.restoreAfterFinish && this["\x06restore"]();
    });

    
    timeline.protect = function(key) {
        this["\x06original"][key] = this.element.style[key];
    };

    
    timeline["\x06restore"] = function() {
        var o = this["\x06original"],
            s = this.element.style,
            v;
        for (var i in o) {
            v = o[i];
            if (typeof v == "undefined") continue;

            s[i] = v;   // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!v && s.removeAttribute) s.removeAttribute(i);  // IE
            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    return timeline;
};

/// support magic - support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.fx.current = function(element) {
    if (!(element = baidu.dom.g(element))) return null;
    var a, guids, reg = /\|([^\|]+)\|/g;

    // 可以向<html>追溯
    do {if (guids = element.getAttribute("baidu_current_effect")) break;}
    while ((element = element.parentNode) && element.nodeType == 1);

    if (!guids) return null;

    if ((a = guids.match(reg))) {
        //fix
        //在firefox中使用g模式，会出现ture与false交替出现的问题
        reg = /\|([^\|]+)\|/;
        
        for (var i=0; i<a.length; i++) {
            reg.test(a[i]);
//          a[i] = window[baidu.guid]._instances[RegExp["\x241"]];
            a[i] = baidu._global_._instances[RegExp["\x241"]];
        }
    }
    return a;
};

/// support magic - Tangram 1.x Code End

baidu.string.extend({
    formatColor: function(){
        // 将正则表达式预创建，可提高效率
        var reg1 = /^\#[\da-f]{6}$/i,
            reg2 = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i,
            keyword = {
                black: '#000000',
                silver: '#c0c0c0',
                gray: '#808080',
                white: '#ffffff',
                maroon: '#800000',
                red: '#ff0000',
                purple: '#800080',
                fuchsia: '#ff00ff',
                green: '#008000',
                lime: '#00ff00',
                olive: '#808000',
                yellow: '#ffff0',
                navy: '#000080',
                blue: '#0000ff',
                teal: '#008080',
                aqua: '#00ffff'
            };
            
        return function(){
            var color = this.valueOf();
            if(reg1.test(color)) {
                // #RRGGBB 直接返回
                return color;
            } else if(reg2.test(color)) {
                // 非IE中的 rgb(0, 0, 0)
                for (var s, i=1, color="#"; i<4; i++) {
                    s = parseInt(RegExp["\x24"+ i]).toString(16);
                    color += ("00"+ s).substr(s.length);
                }
                return color;
            } else if(/^\#[\da-f]{3}$/.test(color)) {
                // 简写的颜色值: #F00
                var s1 = color.charAt(1),
                    s2 = color.charAt(2),
                    s3 = color.charAt(3);
                return "#"+ s1 + s1 + s2 + s2 + s3 + s3;
            }else if(keyword[color])
                return keyword[color];
            
            return '';
        }
    }()
});

/// support magic - Tangram 1.x Code Start

 

baidu.fx.move = function(element, options) {
    if (!(element = baidu.dom.g(element))
        || baidu.dom.getStyle(element, "position") == "static") return null;
    
    options = baidu.object.extend({x:0, y:0}, options || {});
    if (options.x == 0 && options.y == 0) return null;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            this.protect("top");
            this.protect("left");

            this.originX = parseInt(baidu.dom.getStyle(element, "left"))|| 0;
            this.originY = parseInt(baidu.dom.getStyle(element, "top")) || 0;
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.style.top  = (this.y * schedule + this.originY) +"px";
            element.style.left = (this.x * schedule + this.originX) +"px";
        }
    }, options), "baidu.fx.move");

    return fx.launch();
};

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

 

baidu.fx.moveTo = function(element, point, options) {
    if (!(element = baidu.dom.g(element))
        || baidu.dom.getStyle(element, "position") == "static"
        || typeof point != "object") return null;

    var p = [point[0] || point.x || 0,point[1] || point.y || 0];
    var x = parseInt(baidu.dom.getStyle(element, "left")) || 0;
    var y = parseInt(baidu.dom.getStyle(element, "top"))  || 0;

    var fx = baidu.fx.move(element, baidu.object.extend({x: p[0]-x, y: p[1]-y}, options||{}));

    return fx;
};

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

 

baidu.fx.scrollBy = function(element, distance, options) {
    if (!(element = baidu.dom.g(element)) || typeof distance != "object") return null;
    
    var d = {}, mm = {};
    d.x = distance[0] || distance.x || 0;
    d.y = distance[1] || distance.y || 0;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            var t = mm.sTop   = element.scrollTop;
            var l = mm.sLeft  = element.scrollLeft;

            mm.sx = Math.min(element.scrollWidth - element.clientWidth - l, d.x);
            mm.sy = Math.min(element.scrollHeight- element.clientHeight- t, d.y);
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.scrollTop  = (mm.sy * schedule + mm.sTop);
            element.scrollLeft = (mm.sx * schedule + mm.sLeft);
        }

        ,restore : function(){
            element.scrollTop   = mm.sTop;
            element.scrollLeft  = mm.sLeft;
        }
    }, options), "baidu.fx.scroll");

    return fx.launch();
};

/// support magic - Tangram 1.x Code End
/// support magic - Tangram 1.x Code Start

 

baidu.fx.scrollTo = function(element, point, options) {
    if (!(element = baidu.dom.g(element)) || typeof point != "object") return null;
    
    var d = {};
    d.x = (point[0] || point.x || 0) - element.scrollLeft;
    d.y = (point[1] || point.y || 0) - element.scrollTop;

    return baidu.fx.scrollBy(element, d, options);
};

/// support magic - Tangram 1.x Code End

baidu._util_.smartAjax = baidu._util_.smartAjax || function(method){
    return function(url, data, callback, type){
        if(baidu.type(data) === 'function'){
            type = type || callback;
            callback = data;
            data = undefined;
        }
        baidu.ajax({
            type: method,
            url: url,
            data: data,
            success: callback,
            dataType: type
        });
    };
};

baidu.get = baidu.get || baidu._util_.smartAjax('get');

/// support magic - Tangram 1.x Code Start

baidu.global.get = function(key){
    return baidu.global(key);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

baidu.global.set = function(key, value, overwrite){
    return baidu.global(key, value, !overwrite);
};
/// support magic - Tangram 1.x Code End

baidu.global.getZIndex = function(key, step) {
    var zi = baidu.global.get("zIndex");
    if (key) {
        zi[key] = zi[key] + (step || 1);
    }
    return zi[key];
};
baidu.global.set("zIndex", {popup : 50000, dialog : 1000}, true);
/// support magic - Tangram 1.x Code End
/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start

baidu.i18n = baidu.i18n || {};
/// support magic - Tangram 1.x Code End

baidu.i18n.cultures = baidu.i18n.cultures || {};
/// support magic - Tangram 1.x Code End

baidu.i18n.cultures['en-US'] = baidu.object.extend(baidu.i18n.cultures['en-US'] || {}, {
    calendar: {
        dateFormat: 'yyyy-MM-dd',
        titleNames: '#{MM}&nbsp;#{yyyy}',
        monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: {mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'}
    },
    
    timeZone: -5,
    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),

    number: {
        group: ",",
        groupLength: 3,
        decimal: ".",
        positive: "",
        negative: "-",

        _format: function(number, isNegative){
            return baidu.i18n.number._format(number, {
                group: this.group,
                groupLength: this.groupLength,
                decimal: this.decimal,
                symbol: isNegative ? this.negative : this.positive 
            });
        }
    },

    currency: {
        symbol: '$'        
    },

    language: {
        ok: 'ok',
        cancel: 'cancel',
        signin: 'signin',
        signup: 'signup'
    }
});

baidu.i18n.currentLocale = 'en-US';
/// support magic - Tangram 1.x Code Start

baidu.i18n.date = baidu.i18n.date || {

    
    getDaysInMonth: function(year, month) {
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month == 1 && baidu.i18n.date.isLeapYear(year)) {
            return 29;
        }
        return days[month];
    },

    
    isLeapYear: function(year) {
        return !(year % 400) || (!(year % 4) && !!(year % 100));
    },

    
    toLocaleDate: function(dateObject, sLocale, tLocale) {
        return this._basicDate(dateObject, sLocale, tLocale || baidu.i18n.currentLocale);
    },

    
    _basicDate: function(dateObject, sLocale, tLocale) {
        var tTimeZone = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].timeZone,
            tTimeOffset = tTimeZone * 60,
            sTimeZone,sTimeOffset,
            millisecond = dateObject.getTime();

        if(sLocale){
            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
            sTimeOffset = sTimeZone * 60;
        }else{
            sTimeOffset = -1 * dateObject.getTimezoneOffset();
            sTimeZone = sTimeOffset / 60;
        }

        return new Date(sTimeZone != tTimeZone ? (millisecond  + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
    },

    
    format: function(dateObject, tLocale) {
        // 拿到对应locale的format类型配置
        var c = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale];
        return baidu.date.format(
            baidu.i18n.date.toLocaleDate(dateObject, "", tLocale),
            c.calendar.dateFormat);
    }
};
/// support magic -  Tangram 1.x Code End

baidu.isDate = function( unknow ) {
    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
};

baidu.isDocument = function( unknow ) {
    return baidu.type( unknow ) == "Document";
};

baidu.isElement = function( unknow ) {
    return baidu.type(unknow) == "HTMLElement";
};

// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
// baidu.isEnumerable = function( unknow ){
//   return unknow != null
//       && (typeof unknow == "object" || ~Object.prototype.toString.call( unknow ).indexOf( "NodeList" ))
//       &&(typeof unknow.length == "number"
//       || typeof unknow.byteLength == "number"     //ArrayBuffer
//       || typeof unknow[0] != "undefined");
// };

baidu.isNumber = function( unknow ) {
    return baidu.type( unknow ) == "number" && isFinite( unknow );
};

baidu.isObject = function( unknow ) {
    return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null );
};

// 20120903 mz 检查对象是否为一个简单对象 {}
baidu.isPlainObject = function(unknow) {
    var key,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    if ( baidu.type(unknow) != "object" ) {
        return false;
    }

    //判断new fn()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( unknow.constructor &&
        !hasOwnProperty.call(unknow, "constructor") &&
        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in unknow ) break;

    // nodelist for ie
    if( unknow.item && typeof unknow.length == "number" )
        return false;

    return key === undefined || hasOwnProperty.call( unknow, key );
};

baidu.isWindow = function( unknow ) {
    return baidu.type( unknow ) == "Window";
};

baidu.json = baidu.json || {};

baidu.json.parse = function (data) {
    //2010/12/09：更新至不使用原生parse，不检测用户输入是否正确
    return (new Function("return (" + data + ")"))();
};

baidu.json.stringify = (function () {
    
    var escapeMap = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };
    
    
    function encodeString(source) {
        if (/["\\\x00-\x1f]/.test(source)) {
            source = source.replace(
                /["\\\x00-\x1f]/g, 
                function (match) {
                    var c = escapeMap[match];
                    if (c) {
                        return c;
                    }
                    c = match.charCodeAt();
                    return "\\u00" 
                            + Math.floor(c / 16).toString(16) 
                            + (c % 16).toString(16);
                });
        }
        return '"' + source + '"';
    }
    
    
    function encodeArray(source) {
        var result = ["["], 
            l = source.length,
            preComma, i, item;
            
        for (i = 0; i < l; i++) {
            item = source[i];
            
            switch (typeof item) {
            case "undefined":
            case "function":
            case "unknown":
                break;
            default:
                if(preComma) {
                    result.push(',');
                }
                result.push(baidu.json.stringify(item));
                preComma = 1;
            }
        }
        result.push("]");
        return result.join("");
    }
    
    
    function pad(source) {
        return source < 10 ? '0' + source : source;
    }
    
    
    function encodeDate(source){
        return '"' + source.getFullYear() + "-" 
                + pad(source.getMonth() + 1) + "-" 
                + pad(source.getDate()) + "T" 
                + pad(source.getHours()) + ":" 
                + pad(source.getMinutes()) + ":" 
                + pad(source.getSeconds()) + '"';
    }
    
    return function (value) {
        switch (typeof value) {
        case 'undefined':
            return 'undefined';
            
        case 'number':
            return isFinite(value) ? String(value) : "null";
            
        case 'string':
            return encodeString(value);
            
        case 'boolean':
            return String(value);
            
        default:
            if (value === null) {
                return 'null';
            } else if (baidu.type(value) === 'array') {
                return encodeArray(value);
            } else if (baidu.type(value) === 'date') {
                return encodeDate(value);
            } else {
                var result = ['{'],
                    encode = baidu.json.stringify,
                    preComma,
                    item;
                    
                for (var key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        item = value[key];
                        switch (typeof item) {
                        case 'undefined':
                        case 'unknown':
                        case 'function':
                            break;
                        default:
                            if (preComma) {
                                result.push(',');
                            }
                            preComma = 1;
                            result.push(encode(key) + ':' + encode(item));
                        }
                    }
                }
                result.push('}');
                return result.join('');
            }
        }
    };
})();

/// support magic - Tangram 1.x Code Start

baidu.lang.createClass = baidu.createClass;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上

/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.lang.guid = function() {
    return baidu.id();
};

//不直接使用window，可以提高3倍左右性能
//baidu.$$._counter = baidu.$$._counter || 1;

// 20111129 meizz   去除 _counter.toString(36) 这步运算，节约计算量
/// support magic - Tangram 1.x Code End

//baidu.lang.isArray = function (source) {
//  return '[object Array]' == Object.prototype.toString.call(source);
//};
baidu.lang.isArray = baidu.isArray;

/// support maigc - Tangram 1.x Code Start

//baidu.lang.isDate = function(o) {
//  // return o instanceof Date;
//  return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
//};

baidu.lang.isDate = baidu.isDate;
/// support maigc Tangram 1.x Code End
/// support maigc - Tangram 1.x Code Start

//baidu.lang.isElement = function (source) {
//  return !!(source && source.nodeName && source.nodeType == 1);
//};
baidu.lang.isElement = baidu.isElement;
/// support maigc - Tangram 1.x Code End

//baidu.lang.isObject = function (source) {
//  return 'function' == typeof source || !!(source && 'object' == typeof source);
//};
baidu.lang.isObject = baidu.isObject;

//baidu.lang.isString = function (source) {
//  return '[object String]' == Object.prototype.toString.call(source);
//};
baidu.lang.isString = baidu.isString;

/// support magic - Tangram 1.x Code Start

baidu.lang.register = baidu.base.register;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129 meizz   添加第三个参数，可以直接挂载方法到目标类原型链上
/// support magic - Tangram 1.x Code End

baidu.lang.toArray = function (source) {
    if (source === null || source === undefined)
        return [];
    if (baidu.lang.isArray(source))
        return source;

    // The strings and functions also have 'length'
    if (typeof source.length !== 'number' || typeof source === 'string' || baidu.lang.isFunction(source)) {
        return [source];
    }

    //nodeList, IE 下调用 [].slice.call(nodeList) 会报错
    if (source.item) {
        var l = source.length, array = new Array(l);
        while (l--)
            array[l] = source[l];
        return array;
    }

    return [].slice.call(source);
};

baidu.number.extend({
    comma : function (length) {
        var source = this;
        if (!length || length < 1) {
            length = 3;
        }
    
        source = String(source).split(".");
        source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{'+length+'})+$)','ig'),"$1,");
        return source.join(".");
    }   
});

baidu.number.randomInt = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};

baidu.object.clone  = function (source) {
    var result = source, i, len;
    if (!source
        || source instanceof Number
        || source instanceof String
        || source instanceof Boolean) {
        return result;
    } else if (baidu.lang.isArray(source)) {
        result = [];
        var resultLen = 0;
        for (i = 0, len = source.length; i < len; i++) {
            result[resultLen++] = baidu.object.clone(source[i]);
        }
    } else if (baidu.object.isPlain(source)) {
        result = {};
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                result[i] = baidu.object.clone(source[i]);
            }
        }
    }
    return result;
};

baidu.object.each = function (source, iterator) {
    var returnValue, key, item; 
    if ('function' == typeof iterator) {
        for (key in source) {
            if (source.hasOwnProperty(key)) {
                item = source[key];
                returnValue = iterator.call(source, item, key);
        
                if (returnValue === false) {
                    break;
                }
            }
        }
    }
    return source;
};

baidu.object.isEmpty = function(obj) {
    var ret = true;
    if('[object Array]' === Object.prototype.toString.call(obj)){
        ret = !obj.length;
    }else{
        obj = new Object(obj);
        for(var key in obj){
            return false;
        }
    }
    return ret;
};

baidu.object.keys = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = k;
        }
    }
    return result;
};

baidu.object.map = function (source, iterator) {
    var results = {};
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            results[key] = iterator(source[key], key);
        }
    }
    return results;
};

baidu.object.merge = function(){
    function isPlainObject(source) {
        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
    };
    function mergeItem(target, source, index, overwrite, recursive) {
        if (source.hasOwnProperty(index)) {
            if (recursive && isPlainObject(target[index])) {
                // 如果需要递归覆盖，就递归调用merge
                baidu.object.merge(
                    target[index],
                    source[index],
                    {
                        'overwrite': overwrite,
                        'recursive': recursive
                    }
                );
            } else if (overwrite || !(index in target)) {
                // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                target[index] = source[index];
            }
        }
    };
    
    return function(target, source, opt_options){
        var i = 0,
            options = opt_options || {},
            overwrite = options['overwrite'],
            whiteList = options['whiteList'],
            recursive = options['recursive'],
            len;
    
        // 只处理在白名单中的属性
        if (whiteList && whiteList.length) {
            len = whiteList.length;
            for (; i < len; ++i) {
                mergeItem(target, source, whiteList[i], overwrite, recursive);
            }
        } else {
            for (i in source) {
                mergeItem(target, source, i, overwrite, recursive);
            }
        }
        return target;
    };
}();

baidu.object.values = function (source) {
    var result = [], resultLen = 0, k;
    for (k in source) {
        if (source.hasOwnProperty(k)) {
            result[resultLen++] = source[k];
        }
    }
    return result;
};

/// support magic - Tangram 1.x Code Start

baidu.page.getHeight = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.page.getViewHeight = function () {
    var doc = document,
        ie = baidu.browser.ie || 1,
        client = doc.compatMode === 'BackCompat'
            && ie < 9 ? doc.body : doc.documentElement;
        //ie9浏览器需要取得documentElement才能取得到正确的高度
    return client.clientHeight;
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start

baidu.page.getViewWidth = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientWidth;
};
/// support magic - Tangram 1.x Code End
/// support maigc - Tangram 1.x Code Start

baidu.page.getWidth = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
};
/// support maigc - Tangram 1.x Code End

baidu.platform = baidu.platform || function(){
    var ua = navigator.userAgent,
        result = function(){};

    baidu.forEach("Android iPad iPhone Linux Macintosh Windows X11".split(" "), function(item ) {
        var key = item.charAt(0).toUpperCase() + item.toLowerCase().substr( 1 );
        baidu[ "is" + key ] = result[ "is" + key ] = !!~ua.indexOf( item );//) && (result = item);
    });

    return result;
}();

//baidu.platform.isAndroid = /android/i.test(navigator.userAgent);

//baidu.platform.isIpad = /ipad/i.test(navigator.userAgent);

//baidu.platform.isIphone = /iphone/i.test(navigator.userAgent);

//baidu.platform.isMacintosh = /macintosh/i.test(navigator.userAgent);

 
//baidu.platform.isWindows = /windows/i.test(navigator.userAgent);

//baidu.platform.isX11 = /x11/i.test(navigator.userAgent);

baidu.plugin = function(chainName, copy, fn, constructor){
    var isCopy = baidu.isPlainObject(copy), chain;
    if(!isCopy){
        constructor = fn;
        fn = copy;
    }
    baidu.type(fn) != 'function' && (fn = undefined);
    baidu.type(constructor) != 'function' && (constructor = undefined);
    chain = baidu.createChain(chainName, fn, constructor);
    isCopy && chain.extend(copy);
    return chain;
};

baidu.post = baidu.post || baidu._util_.smartAjax('post');

baidu.setBack = function(current, oldChain) {
    current._back_ = oldChain;
    current.getBack = function() {
        return this._back_;
    }
    return current;
};

baidu.createChain("sio",

// 执行方法
function(url){
    switch (typeof url) {
        case "string" :
            return new baidu.sio.$Sio(url);
        // break;
    }
},

// constructor
function(url){
    this.url = url;
});

baidu.sio._createScriptTag = function(scr, url, charset){
    scr.setAttribute('type', 'text/javascript');
    charset && scr.setAttribute('charset', charset);
    scr.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(scr);
};

baidu.sio._removeScriptTag = function(scr){
    if (scr.clearAttributes) {
        scr.clearAttributes();
    } else {
        for (var attr in scr) {
            if (scr.hasOwnProperty(attr)) {
                delete scr[attr];
            }
        }
    }
    if(scr && scr.parentNode){
        scr.parentNode.removeChild(scr);
    }
    scr = null;
};

 
baidu.sio.extend({
    callByBrowser : function (opt_callback, opt_options) {
        var url = this.url ;
        var scr = document.createElement("SCRIPT"),
            scriptLoaded = 0,
            options = opt_options || {},
            charset = options['charset'],
            callback = opt_callback || function(){},
            timeOut = options['timeOut'] || 0,
            timer;
        
        // IE和opera支持onreadystatechange
        // safari、chrome、opera支持onload
        scr.onload = scr.onreadystatechange = function () {
            // 避免opera下的多次调用
            if (scriptLoaded) {
                return;
            };
            
            var readyState = scr.readyState;
            if ('undefined' == typeof readyState
                || readyState == "loaded"
                || readyState == "complete") {
                scriptLoaded = 1;
                try {
                    callback();
                    clearTimeout(timer);
                } finally {
                    scr.onload = scr.onreadystatechange = null;
                    baidu.sio._removeScriptTag(scr);
                }
            }
        };

        if( timeOut ){
            timer = setTimeout(function(){
                scr.onload = scr.onreadystatechange = null;
                baidu.sio._removeScriptTag(scr);
                options.onfailure && options.onfailure();
            }, timeOut);
        };
        baidu.sio._createScriptTag(scr, url, charset);
    } 
});

 
baidu.sio.extend({
    callByServer : function( callback, opt_options) {
        var url = this.url ;
        var scr = document.createElement('SCRIPT'),
            prefix = 'bd__cbs__',
            callbackName,
            callbackImpl,
            options = opt_options || {},
            charset = options['charset'],
            queryField = options['queryField'] || 'callback',
            timeOut = options['timeOut'] || 0,
            timer,
            reg = new RegExp('(\\?|&)' + queryField + '=([^&]*)'),
            matches;

        if (baidu.lang.isFunction(callback)) {
            callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
            window[callbackName] = getCallBack(0);
        } else if(baidu.lang.isString(callback)){
            // 如果callback是一个字符串的话，就需要保证url是唯一的，不要去改变它
            // TODO 当调用了callback之后，无法删除动态创建的script标签
            callbackName = callback;
        } else {
            if (matches = reg.exec(url)) {
                callbackName = matches[2];
            }
        }

        if( timeOut ){
            timer = setTimeout(getCallBack(1), timeOut);
        }

        //如果用户在URL中已有callback，用参数传入的callback替换之
        url = url.replace(reg, '\x241' + queryField + '=' + callbackName);
        
        if (url.search(reg) < 0) {
            url += (url.indexOf('?') < 0 ? '?' : '&') + queryField + '=' + callbackName;
        }
        baidu.sio._createScriptTag(scr, url, charset);

        
        function getCallBack(onTimeOut){
            
            return function(){
                try {
                    if( onTimeOut ){
                        options.onfailure && options.onfailure();
                    }else{
                        callback.apply(window, arguments);
                        clearTimeout(timer);
                    }
                    window[callbackName] = null;
                    delete window[callbackName];
                } catch (exception) {
                    // ignore the exception
                } finally {
                    baidu.sio._removeScriptTag(scr);
                }
            }
        }
    }

});

 
baidu.sio.extend({
  log : function() {
    var url = this.url ;
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

baidu.string.extend({
    decodeHTML : function () {
        var str = this
                    .replace(/&quot;/g,'"')
                    .replace(/&lt;/g,'<')
                    .replace(/&gt;/g,'>')
                    .replace(/&amp;/g, "&");
        //处理转义的中文和实体字符
        return str.replace(/&#([\d]+);/g, function(_0, _1){
            return String.fromCharCode(parseInt(_1, 10));
        });
    }
});

baidu.string.extend({
    encodeHTML : function () {
        return this.replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    }
});

//format(a,a,d,f,c,d,g,c);
baidu.string.extend({
    format : function (opts) {
        var source = this.valueOf(),
            data = Array.prototype.slice.call(arguments,0), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
});

baidu.string.extend({
    getByteLength : function () {
        return this.replace(/[^\x00-\xff]/g, 'ci').length;
    }
    //获取字符在gbk编码下的字节长度, 实现原理是认为大于127的就一定是双字节。如果字符超出gbk编码范围, 则这个计算不准确
});

baidu.string.extend({
    stripTags : function() {
        return (this || '').replace(/<[^>]+>/g, '');
    }
}); 

baidu.string.extend({
    subByte : function (len, tail) {
        baidu.check('number(,string)?$', 'baidu.string.subByte');

        if(len < 0 || this.getByteLength() <= len){
            return this.valueOf(); // 20121109 mz 去掉tail
        }
        //thanks 加宽提供优化方法
        var source = this.substr(0, len)
            .replace(/([^\x00-\xff])/g,"\x241 ")//双字节字符替换成两个
            .substr(0, len)//截取长度
            .replace(/[^\x00-\xff]$/,"")//去掉临界双字节字符
            .replace(/([^\x00-\xff]) /g,"\x241");//还原
        return source + (tail || "");
    }
});

baidu.string.extend({
    toHalfWidth : function () {
        return this.replace(/[\uFF01-\uFF5E]/g,
            function(c){
                return String.fromCharCode(c.charCodeAt(0) - 65248);
            }).replace(/\u3000/g," ");
    }
});

baidu.string.extend({
    wbr : function () {
        return this.replace(/(?:<[^>]+>)|(?:&#?[0-9a-z]{2,6};)|(.{1})/gi, '$&<wbr>')
            .replace(/><wbr>/g, '>');
    }
});

baidu.swf = baidu.swf || {};

baidu.swf.version = (function () {
    var n = navigator;
    if (n.plugins && n.mimeTypes.length) {
        var plugin = n.plugins["Shockwave Flash"];
        if (plugin && plugin.description) {
            return plugin.description
                    .replace(/([a-zA-Z]|\s)+/, "")
                    .replace(/(\s)+r/, ".") + ".0";
        }
    } else if (window.ActiveXObject && !window.opera) {
        for (var i = 12; i >= 2; i--) {
            try {
                var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                if (c) {
                    var version = c.GetVariable("$version");
                    return version.replace(/WIN/g,'').replace(/,/g,'.');
                }
            } catch(e) {}
        }
    }
})();

baidu.swf.createHTML = function (options) {
    options = options || {};
    var version = baidu.swf.version, 
        needVersion = options['ver'] || '6.0.0', 
        vUnit1, vUnit2, i, k, len, item, tmpOpt = {},
        encodeHTML = baidu.string.encodeHTML;
    
    // 复制options，避免修改原对象
    for (k in options) {
        tmpOpt[k] = options[k];
    }
    options = tmpOpt;
    
    // 浏览器支持的flash插件版本判断
    if (version) {
        version = version.split('.');
        needVersion = needVersion.split('.');
        for (i = 0; i < 3; i++) {
            vUnit1 = parseInt(version[i], 10);
            vUnit2 = parseInt(needVersion[i], 10);
            if (vUnit2 < vUnit1) {
                break;
            } else if (vUnit2 > vUnit1) {
                return ''; // 需要更高的版本号
            }
        }
    } else {
        return ''; // 未安装flash插件
    }
    
    var vars = options['vars'],
        objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
    
    // 初始化object标签需要的classid、codebase属性值
    options['align'] = options['align'] || 'middle';
    options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
    options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
    options['movie'] = options['url'] || '';
    delete options['vars'];
    delete options['url'];
    
    // 初始化flashvars参数的值
    if ('string' == typeof vars) {
        options['flashvars'] = vars;
    } else {
        var fvars = [];
        for (k in vars) {
            item = vars[k];
            fvars.push(k + "=" + encodeURIComponent(item));
        }
        options['flashvars'] = fvars.join('&');
    }
    
    // 构建IE下支持的object字符串，包括属性和参数列表
    var str = ['<object '];
    for (i = 0, len = objProperties.length; i < len; i++) {
        item = objProperties[i];
        str.push(' ', item, '="', encodeHTML(options[item]), '"');
    }
    str.push('>');
    var params = {
        'wmode'          : 1,
        'scale'          : 1,
        'quality'          : 1,
        'play'            : 1,
        'loop'            : 1,
        'menu'            : 1,
        'salign'            : 1,
        'bgcolor'          : 1,
        'base'            : 1,
        'allowscriptaccess' : 1,
        'allownetworking'   : 1,
        'allowfullscreen'   : 1,
        'seamlesstabbing'   : 1,
        'devicefont'        : 1,
        'swliveconnect'  : 1,
        'flashvars'      : 1,
        'movie'          : 1
    };
    
    for (k in options) {
        item = options[k];
        k = k.toLowerCase();
        if (params[k] && (item || item === false || item === 0)) {
            str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
        }
    }
    
    // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
    options['src']  = options['movie'];
    options['name'] = options['id'];
    delete options['id'];
    delete options['movie'];
    delete options['classid'];
    delete options['codebase'];
    options['type'] = 'application/x-shockwave-flash';
    options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
    
    
    // 构建embed标签的字符串
    str.push('<embed');
    // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
    // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
    var salign;
    for (k in options) {
        item = options[k];
        if (item || item === false || item === 0) {
            if ((new RegExp("^salign\x24", "i")).test(k)) {
                salign = item;
                continue;
            }
            
            str.push(' ', k, '="', encodeHTML(item), '"');
        }
    }
    
    if (salign) {
        str.push(' salign="', encodeHTML(salign), '"');
    }
    str.push('></embed></object>');
    
    return str.join('');
};

baidu.swf.create = function (options, target) {
    options = options || {};
    var html = baidu.swf.createHTML(options) 
               || options['errorMessage'] 
               || '';
                
    if (target && 'string' == typeof target) {
        target = document.getElementById(target);
    }
    baidu.dom.insertHTML( target || document.body ,'beforeEnd',html );
};

baidu.swf.getMovie = function (name) {
    //ie9下, Object标签和embed标签嵌套的方式生成flash时,
    //会导致document[name]多返回一个Object元素,而起作用的只有embed标签
    var movie = document[name], ret;
    return baidu.browser.ie == 9 ?
        movie && movie.length ? 
            (ret = baidu.array.remove(baidu.lang.toArray(movie),function(item){
                return item.tagName.toLowerCase() != "embed";
            })).length == 1 ? ret[0] : ret
            : movie
        : movie || window[name];
};

baidu.swf.Proxy = function(id, property, loadedHandler) {
    
    var me = this,
        flash = this._flash = baidu.swf.getMovie(id),
        timer;
    if (! property) {
        return this;
    }
    timer = setInterval(function() {
        try {
            
            if (flash[property]) {
                me._initialized = true;
                clearInterval(timer);
                if (loadedHandler) {
                    loadedHandler();
                }
            }
        } catch (e) {
        }
    }, 100);
};

baidu.swf.Proxy.prototype.getFlash = function() {
    return this._flash;
};

baidu.swf.Proxy.prototype.isReady = function() {
    return !! this._initialized;
};

baidu.swf.Proxy.prototype.call = function(methodName, var_args) {
    try {
        var flash = this.getFlash(),
            args = Array.prototype.slice.call(arguments);

        args.shift();
        if (flash[methodName]) {
            flash[methodName].apply(flash, args);
        }
    } catch (e) {
    }
};

(function(support){
    var div = document.createElement("div");

    support.inlineBlockNeedsLayout = false;
    support.shrinkWrapBlocks = false;

    baidu(document).ready(function(){
        var body = document.body,
            container = document.createElement("div");
        container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

        body.appendChild( container ).appendChild( div );

        if ( typeof div.style.zoom !== "undefined" ) {
            div.style.cssText = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;width:1px;padding:1px;display:inline;zoom:1";
            support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

            // Support: IE6
            // Check if elements with layout shrink-wrap their children
            div.style.display = "block";
            div.innerHTML = "<div></div>";
            div.firstChild.style.width = "5px";
            support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );
        }

        body.removeChild( container );
        container = div = body = null;
    });
})(baidu._util_.support);

 return baidu;
}();


/**
 * baiduTemplate ----------------------------------------------------
 */
/**
 * baiduTemplate简单好用的Javascript模板引擎 1.0.6 版本
 * http://baidufe.github.com/BaiduTemplate
 * 开源协议：BSD License
 * 浏览器环境占用命名空间 bdvgus.template ，nodejs环境直接安装 npm install baidutemplate
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @author wangxiao 
 * @email 1988wangxiao@gmail.com
*/
(function(window){

    //模板函数（放置于baidu.vtemplate命名空间下
    window.bdvsug = window.bdvsug || {};
    window.bdvsug.template = function(str, data){

        //检查是否有该id的元素存在，如果有元素则获取元素的innerHTML/value，否则认为字符串为模板
        var fn = (function(){

            //判断如果没有document，则为非浏览器环境
            if(!window.document){
                return bt._compile(str);
            };

            //HTML5规定ID可以由任何不包含空格字符的字符串组成
            var element = document.getElementById(str);
            if (element) {
                    
                //取到对应id的dom，缓存其编译后的HTML模板函数
                if (bt.cache[str]) {
                    return bt.cache[str];
                };

                //textarea或input则取value，其它情况取innerHTML
                var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML;
                return bt._compile(html);

            }else{

                //是模板字符串，则生成一个函数
                //如果直接传入字符串作为模板，则可能变化过多，因此不考虑缓存
                return bt._compile(str);
            };

        })();

        //有数据则返回HTML字符串，没有数据则返回函数 支持data={}的情况
        var result = bt._isObject(data) ? fn( data ) : fn;
        fn = null;

        return result;
    };

    //取得命名空间 baidu.vtemplate
    var bt = window.bdvsug.template;

    //标记当前版本
    bt.versions = bt.versions || [];
    bt.versions.push('1.0.6');

    //缓存  将对应id模板生成的函数缓存下来。
    bt.cache = {};
    
    //自定义分隔符，可以含有正则中的字符，可以是HTML注释开头 <! !>
    bt.LEFT_DELIMITER = bt.LEFT_DELIMITER||'<%';
    bt.RIGHT_DELIMITER = bt.RIGHT_DELIMITER||'%>';

    //自定义默认是否转义，默认为默认自动转义
    bt.ESCAPE = true;

    //HTML转义
    bt._encodeHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/\\/g,'&#92;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    };

    //转义影响正则的字符
    bt._encodeReg = function (source) {
        return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g,'\\$1');
    };

    //转义UI UI变量使用在HTML页面标签onclick等事件函数参数中
    bt._encodeEventHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;')
            .replace(/\\\\/g,'\\')
            .replace(/\\\//g,'\/')
            .replace(/\\n/g,'\n')
            .replace(/\\r/g,'\r');
    };

    //将字符串拼接生成函数，即编译过程(compile)
    bt._compile = function(str){
        var funBody = "var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('"+bt._analysisStr(str)+"');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";
        return new Function("_template_object",funBody);
    };

    //判断是否是Object类型
    bt._isObject = function (source) {
        return 'function' === typeof source || !!(source && 'object' === typeof source);
    };

    //解析模板字符串
    bt._analysisStr = function(str){

        //取得分隔符
        var _left_ = bt.LEFT_DELIMITER;
        var _right_ = bt.RIGHT_DELIMITER;

        //对分隔符进行转义，支持正则中的元字符，可以是HTML注释 <!  !>
        var _left = bt._encodeReg(_left_);
        var _right = bt._encodeReg(_right_);

        str = String(str)
            
            //去掉分隔符中js注释
            .replace(new RegExp("("+_left+"[^"+_right+"]*)//.*\n","g"), "$1")

            //去掉注释内容  <%* 这里可以任意的注释 *%>
            //默认支持HTML注释，将HTML注释匹配掉的原因是用户有可能用 <! !>来做分割符
            .replace(new RegExp("<!--.*?-->", "g"),"")
            .replace(new RegExp(_left+"\\*.*?\\*"+_right, "g"),"")

            //把所有换行去掉  \r回车符 \t制表符 \n换行符
            .replace(new RegExp("[\\r\\t\\n]","g"), "")

            //用来处理非分隔符内部的内容中含有 斜杠 \ 单引号 ‘ ，处理办法为HTML转义
            .replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function (item, $1) {
                var str = '';
                if($1){

                    //将 斜杠 单引 HTML转义
                    str = $1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;');
                    while(/<[^<]*?&#39;[^<]*?>/g.test(str)){

                        //将标签内的单引号转义为\r  结合最后一步，替换为\'
                        str = str.replace(/(<[^<]*?)&#39;([^<]*?>)/g,'$1\r$2')
                    };
                }else{
                    str = item;
                }
                return str ;
            });


        str = str 
            //定义变量，如果没有分号，需要容错  <%var val='test'%>
            .replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_)

            //对变量后面的分号做容错(包括转义模式 如<%:h=value%>)  <%=value;%> 排除掉函数的情况 <%fun1();%> 排除定义变量情况  <%var val='test';%>
            .replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_)

            //按照 <% 分割为一个个数组，再用 \t 和在一起，相当于将 <% 替换为 \t
            //将模板按照<%分为一段一段的，再在每段的结尾加入 \t,即用 \t 将每个模板片段前面分隔开
            .split(_left_).join("\t");

        //支持用户配置默认是否自动转义
        if(bt.ESCAPE){
            str = str

                //找到 \t=任意一个字符%> 替换为 ‘，任意字符,'
                //即替换简单变量  \t=data%> 替换为 ',data,'
                //默认HTML转义  也支持HTML转义写法<%:h=value%>  
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':bdvsug.template._encodeHTML($1),'");
        }else{
            str = str
                
                //默认不转义HTML转义
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$1,'");
        };

        str = str

            //支持HTML转义写法<%:h=value%>  
            .replace(new RegExp("\\t:h=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':bdvsug.template._encodeHTML($1),'")

            //支持不转义写法 <%:=value%>和<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$1,'")

            //支持url转义 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':encodeURIComponent($1),'")

            //支持UI 变量使用在HTML页面标签onclick等事件函数参数中  <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':bdvsug.template._encodeEventHTML($1),'")

            //将字符串按照 \t 分成为数组，在用'); 将其合并，即替换掉结尾的 \t 为 ');
            //在if，for等语句前面加上 '); ，形成 ');if  ');for  的形式
            .split("\t").join("');")

            //将 %> 替换为_template_fun_array.push('
            //即去掉结尾符，生成函数中的push方法
            //如：if(list.length=5){%><h2>',list[4],'</h2>');}
            //会被替换为 if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")

            //将 \r 替换为 \
            .split("\r").join("\\'");

        return str;
    };

})(window);


/**
 * magic ------------------------------------------------------------
 */
if (typeof magic != "function") {
    var magic = function () {
        // TODO: 
    };
}
magic.resourcePath = "";
magic.skinName = "default";
magic.version = "1.1.0.4";
/msie 6/i.test(navigator.userAgent) && document.execCommand("BackgroundImageCache", false, true);

/**
 * Suggestion依赖的magic组件
 */
//magic.Base
magic.Base = function () {
    baidu.lang.Class.call(this);
    this._ids = {};
    this._eid = this.guid + "__";
}
baidu.lang.inherits(magic.Base, baidu.lang.Class, "magic.Base").extend({
    getElement: function (id) {
        return document.getElementById(this.$getId(id));
    },
    getElements: function () {
        var result = {};
        var _ids = this._ids;
        for (var key in _ids) result[key] = this.getElement(key);
        return result;
    },
    $getId: function (key) {
        key = baidu.lang.isString(key) ? key : "";
        // 2012-3-23: 使 _ids 存入所以可能被建立映射的 key
        return this._ids[key] || (this._ids[key] = this._eid + key);
    },
    $mappingDom: function (key, dom) {
        if (baidu.lang.isString(dom)) {
            this._ids[key] = dom;
        } else if (dom && dom.nodeType) {
            dom.id ? this._ids[key] = dom.id : dom.id = this.$getId(key);
        }
        return this;
    },
    $dispose: function () {
        this.fire("ondispose") && baidu.lang.Class.prototype.dispose.call(this);
    }
});

magic.control = magic.control || {};
// magic.contro.Layer
magic.control.Layer = baidu.lang.createClass(function (setting) {
    this.width = "auto";
    this.height = "auto";
    baidu.object.extend(this, setting || {});
}, {
    type: "magic.control.Layer",
    superClass: magic.Base
}).extend({
    show: function () {
        if (this.fire("onbeforeshow")) {
            this.getElement().style.display = "";
            this.fire("onshow");
        }
    },
    hide: function () {
        if (this.fire("onbeforehide")) {
            this.getElement().style.display = "none";
            this.fire("onhide");
        }
    },
    setWidth: function (width) {
        this.width = width;
        baidu(this.getElement()).width(width);
    },
    setHeight: function (height) {
        this.height = height;
        baidu.dom(this.getElement()).height(height);
    },
    setSize: function (size) {
        this.setWidth(size.width || size[0]);
        this.setHeight(size.height || size[1]);
    }
});

// magic.control.Popup
magic.control.Popup = baidu.lang.createClass(function (options) {
    var me = this;
    me.visible = false;
    me.autoHide = true;
    me.hideOnEscape = true;
    me.disposeOnHide = false;
    me.smartPosition = false;
    me.offsetX = 0;
    me.offsetY = 0;
    baidu.object.extend(this, options || {});
    // [private]
    me._parent = null; // 可以多级 popup 嵌套
    me._host = null; // 被绑定的DOM对象，作为定位
    me._init_control_popup();
}, {
    superClass: magic.control.Layer,
    type: "magic.control.Popup"
}).extend({
    setContent: function (content) {
        this.getElement("content").innerHTML = content;
    },
    attach: function (el, options) {
        if (baidu.dom(el).size()) {
            baidu.object.extend(this, options || {});
            this._host = baidu(el)[0];
            this.show();
        }
    },
    reposition: function (position) {
        var me = this;
        !position && me._host && (position = baidu.dom(me._host).offset());
        if (position) {
            me.top = position.top + me.offsetY + me._host.offsetHeight;
            me.left = position.left + me.offsetX;
            // 20120116 meizz
            me._resupinate = false; // 向上翻转的
            if (me.smartPosition) {
                var oh = me.getElement().offsetHeight; // popup.offsetHeight
                var ph = baidu.page.getViewHeight(); // 浏览器可视区域高
                var st = baidu.page.getScrollTop(); // 浏览器滚动条位置 Y
                var up = position.top - me.offsetY - oh; // popup向上翻时的 top 值
                if (me.top + oh > st + ph && up > st && up < st + ph) {
                    me.top = position.top - me.offsetY - oh;
                    me._resupinate = true;
                }
            }
        }
        me.fire("reposition");
        me.setPosition([me.left, me.top]);
    },
    setPosition: function (position) {
        this.setTop(position.top || position[1]);
        this.setLeft(position.left || position[0]);
    },
    setTop: function (top) {
        baidu.dom(this.getElement()).css("top", (this.top = top) + "px");
    },
    setLeft: function (left) {
        baidu.dom(this.getElement()).css("left", (this.left = left) + "px");
    },
    _init_control_popup: function () {
        var me = this;
        function resize() {
            me.reposition();
        }
        function escape(e) {
            e.keyCode == 27 && me.hideOnEscape && me.autoHide && me.hide();
        }
        function protect() {
            var pp = me;
            do {
                prot[pp.guid] = true;
            }
            while (pp = pp._parent);
        }
        var list = baidu.global.get("popupList");
        var prot = baidu.global.get("popupProtect");
        me.on("show", function () {
            me.reposition();
            // 这句延迟是为了el.click->show()，doc.click->hide()导致popup不能显示的问题
            setTimeout(function () {
                me.guid && (list[me.guid] = true);
            }, 1);
            me._host && baidu.dom(me._host).on("click", protect);
            baidu.dom(me.getElement()).on("click", protect);
            baidu.dom(window).on("resize", resize);
            baidu.dom(document).on("keyup", escape);
            me.width != "auto" && me.setWidth(me.width);
            me.height != "auto" && me.setHeight(me.height);
            me.visible = true;
        });
        function hide(val) {
            me.visible = false;
            delete list[me.guid];
            me._host && baidu.dom(me._host).off("click", protect);
            baidu.dom(me.getElement()).off("click", protect);
            baidu.dom(window).off("resize", resize);
            baidu.dom(document).off("keyup", escape);
            val && me.$dispose();
            //          me.disposeOnHide && me.$dispose();
        }
        me.on('hide', function () {
            hide(me.disposeOnHide)
        });
        me.on('dispose', function () {
            hide(false)
        });
    }
});

// 页面全局管理 popup，自动隐藏
(function () {
    var list = baidu.global.set("popupList", {}, true);
    var protect = baidu.global.set("popupProtect", {}, true);

    function hide() {
        for (var guid in list) {
            var pop = baiduInstance(guid);
            !protect[guid] && pop.autoHide && pop.hide();
        }
        for (var guid in protect) delete protect[guid];
    }
    baidu.dom(window).on("resize", hide);
    baidu.dom(window).on("scroll", hide);
    baidu.dom(document).on("click", hide);
})();

// magic.Background
magic.Background = baidu.lang.createClass(function (options) {
    var opt = options || {}, me = this;
    me.coverable = opt.coverable || false; // 是否创建<iframe>覆盖<select>|Flash
    me.styleBox = opt.styleBox;
    me.tagName = "div";
    // 一个透明的层能够阻止鼠标“穿透”图层
    var _cssText = "filter:progid:DXImageTransform.Microsoft.Alpha(opacity:0);position:absolute;z-index:-1;top:0;left:0;width:100%;height:100%;";
    me._coverDom = "<div style='" + _cssText + "opacity:0;background-color:#FFFFFF'></div>";
    // 针对IE浏览器需要用一个定时器来维持高宽的正确性
    var bb = baidu.browser;
    bb.ie < 7 && (me._coverDom = "<iframe frameborder='0' style='" + _cssText + "' src='about:blank'></iframe>");
    if (bb.ie && (!bb.isStrict || bb.ie < 8)) {
        me.size = [0, 0];
        me.timer = setInterval(function () {
            me._forIE()
        }, 80);
    }
    this._innerHTML = "<div class='tang-background-inner' style='width:100%;height:100%;' id='" + this.$getId("inner") + "'></div>";
}, {
    type: "magic.Background",
    superClass: magic.Base
}).extend({
    render: function (container) {
        var box = baidu.dom(container).get(0);
        box != document.body && baidu.dom(box).css('position') == "static" && (box.style.position = "relative");
        baidu.dom(box).prepend(this.toHTMLString());
    },
    $dispose: function () {
        var layer = this.getElement();
        layer.parentNode.removeChild(layer);
        clearInterval(this.timer);
    },
    toHTMLString: function (tagName) {
        return ["<", (tagName || this.tagName), " class='tang-background", (baidu.browser.ie < 7 ? " ie6__" : ""), "' id='", this.$getId(), "' style='position:absolute; top:0px; left:0px;", (this.timer ? "width:10px;height:10px;" : "width:100%;height:100%;"), "z-index:-9; -webkit-user-select:none; -moz-user-select:none;' ", "onselectstart='return false'>", this._innerHTML, (this.coverable ? this._coverDom || "" : ""), "</", (tagName || this.tagName), ">"].join("");
    },
    setContent: function (content) {
        this.getElement("inner").innerHTML = content;
    },
    _forIE: function () {
        if (this.guid && this.layer || ((this.layer = this.getElement()) && this.layer.offsetHeight)) {
            var bgl = this.layer;
            var box = this.container || bgl.parentNode;
            // 在 dispose 后取不到 parentNode 会报错 20120207
            if (box && box.style) {
                var bs = box.style,
                    bt = parseInt(bs.borderTopWidth) || 0,
                    br = parseInt(bs.borderRightWidth) || 0,
                    bb = parseInt(bs.borderBottomWidth) || 0,
                    bl = parseInt(bs.borderLeftWidth) || 0,
                    w = box.offsetWidth - br - bl,
                    h = box.offsetHeight - bt - bb;
                if (this.size[0] != w || this.size[1] != h) {
                    bgl.style.width = (this.size[0] = w) + "px";
                    bgl.style.height = (this.size[1] = h) + "px";
                }
                // 20120207 meizz 针对IE对于Table行高分配不公的处理
                if (this.styleBox && this.table || (this.table = this.getElement("table"))) {
                    var h0, h1, h2;
                    h0 = h0 || parseInt(baidu.dom(this.table.rows[0]).getCurrentStyle("height"));
                    h2 = h2 || parseInt(baidu.dom(this.table.rows[2]).getCurrentStyle("height"));
                    this.table.rows[0].style.height = h0 + "px";
                    this.table.rows[2].style.height = h2 + "px";
                    this.table.rows[1].style.height = (this.layer.offsetHeight - h0 - h2) + "px";
                }
            }
        }
    }
});

// magic.Popup
(function () {
    magic.Popup = function (options) {
        var me = this;
        magic.control.Popup.call(me, options);
        me.content = "";
        me.className = "";
        me.styleBox = false;
        baidu.object.extend(this, options || {});
        var box = factory.produce();
        me.$mappingDom("", box.getElement());
        me.$mappingDom("content", box.getElement("content"));
        box.getElement().style.zIndex = baidu.global.getZIndex("popup");
        me.setContent(me.content);
        me.className && baidu.dom(box.getElement()).addClass(me.className);
        me.on("dispose", function () {
            me.className && baidu.dom(box.getElement()).removeClass(me.className);
            me.setContent("");
            box.busy = false;
        });
    };
    baidu.lang.inherits(magic.Popup, magic.control.Popup, "magic.Popup");
    // 工厂模式：重复使用popup壳体DOM，减少DOM的生成与销毁
    var factory = {
        list: [],
        produce: function () {
            for (var i = 0, n = this.list.length; i < n; i++) {
                if (!this.list[i].busy) {
                    this.list[i].busy = true;
                    return this.list[i];
                }
            }
            var box = new magic.Base();
            baidu.dom(document.body).prepend(["<div class='tang-popup' id='", box.$getId(), "' ", "style='position:absolute; display:none;'>", (box.background = new magic.Background({
                    coverable: true
                })).toHTMLString(), "<div class='tang-foreground' id='", box.$getId("content"), "'></div>", "</div>"].join(""));
            box.busy = true;
            this.list.push(box);
            return box;
        }
    };
})();

//表单序列化
//@param {string||dom} $form 表单容器
function serialize($form) {
    var elements = baidu.dom($form).find('input'),
        params = [];
    if ( elements.length > 0 ) {
        elements.each(function(index, item) {
            if ( item.nodeName.toLowerCase() === 'input' && item.type !== 'submit' && item.name ) {
                params.push(item.name + '=' + encodeURIComponent(item.value));
            }
        });
    }
    return params.join('&');
}

/**
 * Suggestion 数据接口
 */
var APIS = {
    //sug接口
    //@param wd，必填，关键字
    //@param prod，必填，产品线，video：旧版数据，video_ala：新版数据，包含query类型信息
    //@param oe，可选，query编码，utf-8
    //@param t，可选，时间戳
    //回调函数名固定为window.baidu.sug
    //@return {Object} 数据对象
    //@return {String} Object.q 检索词
    //@return {Array} Object.s 相关query列表
    //@return {String} Object.s[i] 相关query，新版格式："非诚勿扰{#S+_}{"id":"290","type":"show"}"，{#S+_}为分隔符
    sug: 'http://nssug.baidu.com/su',
    //热搜榜接口
    //@param callback，可选，JSONP回调函数
    hotlist: 'http://v.baidu.com/staticapi/api_hotlist.json',
    //作品信息接口
    //@param id，必填，作品id值
    //@param frp，必填，使用环境，sug：旧版，opensug：新版
    //@param site，可选，使用站点
    //@param callback，可选，回调函数名
    videos: {
        //电影
        movie: 'http://v.baidu.com/movie_sug/',
        //电视剧
        tv: 'http://v.baidu.com/tv_sug/',
        //综艺
        show: 'http://v.baidu.com/show_sug/',
        //动漫
        comic: 'http://v.baidu.com/comic_sug/',
        //人物
        person: 'http://v.baidu.com/person_sug/'
    },
    //普通结果数据接口
    //@param word，必填，query
    //@param ct，必填，固定为905969664
    //@param rn，可选，返回视频数量
    //@param jsonFn，可选，JSONP回调函数
    ugc: 'http://v.baidu.com/v?ct=905969664'
};

/**
 * 作品数据
 */
//作品类型
var videoTypes = {
    movie: '\u7535\u5f71',
    tv: '\u7535\u89c6\u5267',
    show: '\u7efc\u827a',
    comic: '\u52a8\u6f2b',
    person: '\u4eba\u7269'
};
//本地缓存作品数据
var dataVideoCache = {
    movie: {},
    tv: {},
    show: {},
    comic: {},
    person: {}
};
//本地缓存热搜榜数据
var dataHotCache = null;
//已预加载结果的querys
var dataPreloaded = {
    //用户输入的querys
    inputs: {},
    //根据sug实际预加载的querys
    words: {}
};

/**
 * HTML模板
 */
//suggestion模板
var tplSuggestion = '<div id="<%=me.$getId(\'wrap-\' + data.length)%>" class="<%=me._getClass(\'wrap\' + data.length)%>">\
    <div id="<%=me.$getId(\'inner\')%>" class="<%=me._getClass(\'inner\')%>">\
        <ul class="bdv-suggestion-list">\
            <%\
                var ins = "baiduInstance(\'" + me.guid + "\')";\
                for ( var i = 0, len = data.length; i < len; i++ ) {\
                    var item = data[i];\
                    var meta = item.meta;\
                    var typecn = meta && meta.type && videoTypes[meta.type];\
            %>\
                <li id="<%=me.$getId(\'item\' + i)%>" onmouseover="<%=ins + \'._mouseOver(event, \' + i + \')\'%>" onmouseout="<%=ins + \'._mouseOut(event, \' + i + \')\'%>" onmousedown="<%=ins + \'._mouseDown(event, \' + i + \')\'%>" onclick="<%=ins + \'._mouseClick(event, \' + i + \')\'%>"<%if (typecn) { %>class="bdv-suggestion-<%=meta.type%>"<% } %>>\
                    <span style="color: <%=item.color%>" class="bdv-suggestion-item <%=item.newClass%>"><%:=item.content.replace(query, \'<span class="bdv-suggestion-query">\' + query + \'</span>\')%><%if (typecn) { %><span class="bdv-suggestion-type"><%=typecn%><i>></i></span><% } %></span>\
                </li>\
            <%\
                }\
            %>\
        </ul>\
        <div id="<%=me.$getId(\'videoitem\')%>" class="<%=me._getClass(\'videoitem\')%>"></div>\
        <div id="<%=me.$getId(\'close\')%>" class="<%=me._getClass(\'close\')%>">\
            <a href="javascript:void(0);" onclick="<%=ins + \'._mouseClickClose(event)\'%>">\u5173\u95ed</a>\
        </div>\
    </div>\
</div>';

//热搜榜模板
var tplHotList = '<div id="<%=me.$getId(\'wrap-\' + data.length)%>" class="<%=me._getClass(\'wrap\' + data.length)%>">\
    <div id="<%=me.$getId(\'inner\')%>" class="<%=me._getClass(\'inner\')%>">\
        <ul class="bdv-suggestion-hot-list">\
            <%\
                var ins = "baiduInstance(\'" + me.guid + "\')";\
                for ( var i = 0, len = data.length; i < len && i < 10; i++ ) {\
                    var item = data[i];\
            %>\
                <li id="<%=me.$getId(\'item\' + i)%>" onmouseover="<%=ins + \'._mouseOver(event, \' + i + \')\'%>" onmouseout="<%=ins + \'._mouseOut(event, \' + i + \')\'%>" onmousedown="<%=ins + \'._mouseDown(event, \' + i + \')\'%>" onclick="<%=ins + \'._mouseClick(event, \' + i + \')\'%>" class="bdv-suggestion-li-<%=i%><% if (item.hot_day == 1) { %> bdv-suggestion-li-new<% }else if (item.hot_day == 2) { %> bdv-suggestion-li-hot<% } %>">\
                    <span class="bdv-suggestion-no"><%=i+1%></span>\
                    <span class="bdv-suggestion-item"><%:=item.title%></span>\
                </li>\
            <%\
                }\
            %>\
        </ul>\
        <div class="bdv-suggestion-hot-title"></div>\
    </div>\
</div>';

//视频块模板
var tplSuggestionVideo = '<div class="bdv-suggestion-video">\
    <div class="bdv-suggestion-pic">\
        <a href="http://v.baidu.com<%=video.url%>" target="_blank" class="bdv-suggestion-poster" data-type="poster">\
            <img src="<%=video.poster%>" alt="<%=video.title%>" />\
            <% var caten = video.category; if ( caten === "tvshow" ) { %>\
                <% if ( video.update ) { %>\
                <span class="bdv-suggestion-mask"></span>\
                <span class="bdv-suggestion-update">\u66f4\u65b0\u81f3<%=video.update.replace(/(\\d{4})(\\d{2})(\\d{2})/,"$1-$2-$3")%></span>\
                <% } %>\
            <% } else if ( caten === "comic" ) { %>\
                <% if ( video.update ) { %>\
                <span class="bdv-suggestion-mask"></span>\
                <span class="bdv-suggestion-update">\u66f4\u65b0\u81f3<%=video.update%>\u96c6</span>\
                <% } %>\
            <% } else if ( caten === "movie" ) { %>\
                <% if ( video.pubtime ) { %>\
                <span class="bdv-suggestion-mask"></span>\
                <span class="bdv-suggestion-update"><%=video.pubtime%></span>\
                <% } %>\
            <% } else if ( caten === "tvplay" ) { %>\
                <% if ( video.update && video.episodes_count ) { %>\
                <span class="bdv-suggestion-mask"></span>\
                <span class="bdv-suggestion-update">\
                        <% if ( video.update < video.episodes_count ) { %>\
                        \u66f4\u65b0\u81f3<%=video.update%>\u96c6\
                        <% } else { %>\
                        \u5168<%=video.episodes_count%>\u96c6\
                        <% } %>\
                </span>\
                <% } %>\
            <% } %>\
        </a>\
    </div>\
    <div class="bdv-suggestion-text">\
        <% if ( video.rating ) { %>\
        <span class="bdv-suggestion-text-rating"><%=video.rating%></span>\
        <% } %>\
        <h3><a href="http://v.baidu.com<%=video.url%>" target="_blank" data-type="title"><%=video.title%></a></h3>\
        <div class="bdv-suggestion-text-meta">\
            <%\
                var metas = {};\
                var categorys = {\
                    movie: [\'actors\', \'directors\', \'genres\'],\
                    tvplay: [\'actors\', \'year\', \'genres\'],\
                    tvshow: [\'hosts\', \'areas\', \'genres\'],\
                    comic: [\'year\', \'areas\', \'genres\']\
                };\
                var fieldLabels = {\
                    actors: \'\u4e3b\u6f14\',\
                    directors: \'\u5bfc\u6f14\',\
                    hosts: \'\u4e3b\u6301\',\
                    areas: \'\u5730\u533a\',\
                    year: \'\u5e74\u4ee3\',\
                    genres: \'\u7c7b\u578b\'\
                };\
                var cur = categorys[video.category];\
                if ( cur ) {\
                    for ( var i = 0, len = cur.length; i < len; i++ ) {\
                        var field = cur[i];\
                        if ( video[field] ) {\
                            metas[field] = video[field];\
                        }\
                    }\
                }\
            %>\
            <% for ( var key in metas ) { var meta = metas[key]; %>\
            <p class="bdv-suggestion-text-<%=key%>">\
                <span class="bdv-suggestion-text-label"><%=fieldLabels[key]%>\uff1a</span>\
                <% if ( typeof meta === \'object\' ) { %>\
                    <% for ( var i = 0, len = meta.length; i < len; i++ ) { var item = meta[i]; %>\
                        <span class="bdv-suggestion-text-field"><%=item%></span>\
                    <% } %>\
                <% } else if ( typeof meta === \'string\' ) { %>\
                    <span class="bdv-suggestion-text-field"><%=meta%></span>\
                <% } %>\
            </p>\
            <% } %>\
        </div>\
        <div class="bdv-suggestion-text-links">\
            <a href="http://v.baidu.com<%=video.url%>" target="_blank" data-type="more">\u67e5\u770b\u8be6\u60c5<i>>></i></a>\
        </div>\
    </div>\
</div>';

//人物特型模板
var tplSuggestionPerson = '<div class="bdv-suggestion-video">\
    <div class="bdv-suggestion-person-pic">\
        <a href="<%=video.detail_url%>" target="_blank" class="bdv-suggestion-person-photo" data-type="person_photo">\
            <img src="<%=video.photo%>" alt="<%=video.name%>" />\
        </a>\
    </div>\
    <div class="bdv-suggestion-person-text">\
        <h3>\
            <a href="<%=video.detail_url%>" target="_blank" data-type="person_title"><%=video.name%></a>\
        </h3>\
        <% if ( typeof ugc === \'object\' && ugc.dispNum ) { %>\
        <p class="bdv-suggestion-person-result">共<%=ugc.dispNum.toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, "$1,")%>条</p>\
        <% } %>\
        <ul class="bdv-suggestion-person-tags">\
            <%\
                var tag = video.tag;\
                for ( var i = 0, len = tag.length; i < len && i < 2; i++ ) {\
                    var item = tag[i];\
            %>\
                <li>\
                    <a href="<%=video.detail_url%>" target="_blank" data-type="person_tag"><%=item.name%></a><% if ( parseInt(item.num) ) { %><span>(<%=item.num%>)</span><% } %>\
                </li>\
            <%\
                }\
            %>\
        </ul>\
    </div>\
    <% if ( typeof ugc === \'object\' && ugc.data && ugc.data.length ) { var ugcdata = ugc.data; %>\
    <div class="bdv-suggestion-person-videos">\
        <% for ( var i = 0, len = ugcdata.length; i < len && i < 3; i++ ) { var item = ugcdata[i]; %>\
        <div class="bdv-suggestion-person-video">\
            <a href="<%=item.url%>" target="_blank" class="bdv-suggestion-person-video-img" title="<%=item.ti%>" data-type="person_ugc_img">\
                <img src="<%=item.pic%>" alt="<%=item.ti%>" />\
                <span class="bdv-suggestion-mask"></span>\
                <span class="bdv-suggestion-duration"><%=item.duration%></span>\
            </a>\
            <a href="<%=item.url%>" target="_blank" class="bdv-suggestion-person-video-title" title="<%=item.ti%>" data-type="person_ugc_title"><%:=item.abstract%></a>\
        </div>\
        <% } %>\
    </div>\
    <% } %>\
</div>';

//cache
var userinfo;

//增加vip通道 2013/12/25
var vipCheck = function(callback) {

    //把get请求改为callByServer，使用get请求时执行不了回调  2013/12/25 liwei24
     baidu.sio.callByServer('/commonapi/pay/pay_result_by_uid/?service=1&t=' + new Date().getTime(), function(result) {
        userinfo.vipinfo = result;
        callback(result.isvip && result.isvalid);
    });     
}

//增加用户登录检测通道 2013/12/25
var loginVipCheck = function(callback) {
    var isvip = false;

    //百度域用户
    if ( location.hostname.match(/\.baidu\.com$/) ) {
        window['video_login_callback'] = function(data) {
                userinfo = data;
                //登陆用户再进行vip校验          
                if ( data && data.value ) {
                    vipCheck(callback);   
                }else {
                    callback(isvip);
                }
                window['video_login_callback'] = null;
            };
        baidu.sio('http://v.baidu.com/d?m=uss&word=' + (new Date()).getTime()).callByServer('video_login_callback');
    }else {
        window['video_login_callback'] = function(data) {
                var results = baidu.json.parse(data);
                userinfo = results;
                callback(results && results.vipinfo && results.vipinfo.isvalid && results.vipinfo.isvip);
                window['video_login_callback'] = null;
        };
        baidu(function() {
            var iframe = document.createElement('iframe');
            iframe.src = 'http://v.baidu.com/dev_proxy_logininfo.html?v=' + Math.ceil(new Date() / 7200000);
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        });
    }
}
/**
 * 新版Suggestion组件
 * 1. 改造magic.control.Suggestion组件；
 * 2. 扩展功能：在输入提示上显示Query相关的作品信息。
 */
magic.control.Suggestion = baidu.lang.createClass(function (el, options) {
    var me = this;

    baidu.object.extend(this, options || {});

    me.dataCache = {}; //本地缓存suggestion数据
    me.enableIndexs = []; //包含enable的选项数组
    me.selectedIndex = -1; //指当前选中的选项的索引在enableIndexs数组中的索引
    me.currentQuery = ''; //currentQuery保存当前suggestion对应的query，用于在某些情况下还原input中的值
    me.currentVideoMeta = null; //当前视频块信息
    me.currentVideoData = null; //当前视频块数据
    me.oldInputValue = ''; //存储input中的值，用于轮询器与当前input值对比
    me.upDownArrowTimer = null; //用来处理键盘上下键一直被按下的情况
    me._preTimer = 0;
    me._objAjax = null;

    me.$mappingDom('input', baidu.dom('#' + el).get(0));

    //监听suggestion的load事件，onload后初始化
    me.on('onload', function () {
        var input_el = me.getElement("input"),
            timer = null;
        baidu.dom(me.getElement("input")).attr("autocomplete", "off");
        me.oldInputValue = me.getElement("input").value;

        //轮询器，检查input中值的变化
        function createTimer() {
            timer = setInterval(function () {
                var query = input_el.value;
                if(baidu.dom.hasClass(input_el,'place-holder')){
                    return;
                }
                if (!query && !me.isShowHot && me.isShowing()) {
                    me._hide();
                } else if (query != me.oldInputValue) {
                    query && me.fire("onneeddata", query);
                    me.oldInputValue = query;
                }
            }, 100);
        }
        createTimer();

        //监听键盘按键
        var _keydownHandler = (function () {
            return me._keydownHandler();
        })();
        var _keyupHandler = function (e) {
            if (timer) {
                clearInterval(timer);
                createTimer();
            }
            //处理上下键长按的延时器
            if (me.upDownArrowTimer) {
                clearTimeout(me.upDownArrowTimer);
                me.upDownArrowTimer = null;
            }
        };
        //监听鼠标点击事件
        var _clickHandler = function (e) {
            if (!input_el.value) {
                me.currentQuery = '';
                me.fire("onneedhotdata");
            }
        };
        baidu.dom(input_el).on("click", _clickHandler);
        baidu.dom(input_el).on("keydown", _keydownHandler);
        baidu.dom(input_el).on("keyup", _keyupHandler);

        //解决某些输入法输入过程中会将字符上框的问题
        me.on("onmousedownitem", function () {
            clearInterval(timer);
            setTimeout(function () {
                createTimer();
            }, 500);
        });

        //dispose时移除事件监听
        me.on('ondispose', function () {
            baidu.dom(input_el).off("keydown", _keydownHandler);
            baidu.dom(input_el).off("keyup", _keyupHandler);
            clearInterval(timer);
        });
    });

    //监听suggestion的render事件，suggestion在第一次请求数据时渲染
    me.on("onrender", function () {
        var input_el = me.getElement("input"),
            suggestion_el = me.getElement("suggestion"),
            windowBlurHandler = function () {
                me.hide();
            },
            documentClickHandler = function (e) {
                var e = e || window.event,
                    element = e.target || e.srcElement;
                if (!me.suggestion) {
                    return;
                }
                if (element == suggestion_el || baidu.dom.contains(suggestion_el, element) || element == me.getElement("input")) {
                    return;
                }
                me.hide();
            };
        baidu.dom(window).on('blur', windowBlurHandler);
        baidu.dom(document).on("click", documentClickHandler);
        //dispose时移除事件监听
        me.on('ondispose', function () {
            baidu.dom(window).off('blur', windowBlurHandler);
            baidu.dom(document).off('click', documentClickHandler);
        });
        //监听视频链接点击事件
        baidu.dom(me.getElement('suggestion')).delegate('a[data-type]', 'click', function(e) {
            var index = me.selectedIndex < 0 ? 0 : me.selectedIndex,
                meta = me.currentVideoMeta;
            me.fire('onclickvideo', {
                query: me.currentQuery,
                title: me.getDataByIndex(index).value,
                id: meta.id,
                type: meta.type,
                index: index,
                target: this.getAttribute('data-type'),
                url: this.href
            });
        });
    });

    //监听suggestion的needdata事件，取suggestion数据渲染到弹层中
    me.on('onneeddata', function (ev, query) {
        var dataCache = me.dataCache;
        me.currentQuery = query;
        window.baidu = window.baidu || {};
        window.baidu.sug = me.nssugCallback;
        if (typeof dataCache[query] == 'undefined') {
            //没有数据就去取数据
            me.getData(query);
        } else {
            //有数据就直接显示，（需要排除缓存的数据为空数组的情况）
            me.currentData = dataCache[query];
            (me.currentData.length > 0) ? me.show() : me.hide();
        }
    });

    //监听suggestion的needhotdata事件，取热搜榜数据渲染到弹层中
    me.on('onneedhotdata', function() {
        if (dataHotCache) {
            me.currentData = dataHotCache;
            (dataHotCache.length > 0) ? me.show() : me.hide();
        } else {
            me.getHotData();
        }
    });

    //在显示suggestion之前，保存所有enable数据项的索引
    me.on("beforeshow", function () {
        var data = me.currentData,
            i = 0,
            len = data.length;
        me.enableIndexs = [];
        for (; i < len; i++) {
            if (typeof data[i]['disable'] == 'undefined' || data[i]['disable'] == false) {
                me.enableIndexs.push(i);
            }
        }
        /* //触发极速搜索
        if ( me.openQuickSearch && me.enableIndexs.length) {
            bdvQuickSearch.trigger("search", me.currentData[me.enableIndexs[0]].value);
        } */
    });

    //检查query是否包含作品信息，包含作品信息则取数据渲染到弹层中
    function videoItemHandler(index) {
        var data = me.getDataByIndex(index),
            meta = data.meta;
        if (meta && APIS.videos[meta.type]) {
            me.fire('onneedvideo', {
                meta: meta
            });
        } else {
            me.hideVideoItem();
        }
    }

    // 取消鼠标悬浮取详情操作
    /* //监听suggestion的onshow事件，渲染壳体时触发，只会触发一次
    me.on('onshow', function () {
        if (me.getInputValue()) {
            videoItemHandler(0);
        }
    });

    //监听suggestion的onpick事件，将某个选项上框时触发
    me.on('onpick', function (evt) {
        videoItemHandler(evt.index);
    });

    //监听suggestion的onmouseoveritem事件，鼠标选中某个选项时触发
    me.on('onmouseoveritem', function (evt) {
        videoItemHandler(evt.index);
    }); */

    //监听suggestion的needvideo事件，取作品数据渲染到弹层中
    me.on('onneedvideo', function (evt) {
        var meta = evt.meta,
            dataCache = dataVideoCache[meta.type];
        if (typeof dataCache[meta.id] === 'undefined') {
            me.getVideoData(meta);
        } else {
            me.currentVideoMeta = meta;
            me.currentVideoData = dataCache[meta.id];
            me.currentVideoData && me.currentVideoData.video ? me.showVideoItem() : me.hideVideoItem();
        }
    });

    //极速搜索逻辑
    baidu(function() {
        me.openQuickSearch = me.openQuickSearch && (typeof bdvQuickSearch === 'object');

        if ( me.openQuickSearch ) {
            var currentQuery = '',                        // 当前检索query，用于判断query的变化
                predictCache = me._predictCache = {};     // 预测query缓存
                $form = baidu.dom('#' + sugOptions.form), // 检索表单
                input_el = me.getElement('input'),        // 输入框
                moveEvt = null;                           // move事件对象，用于保存输入query后鼠标移动信息


            // 预加载事件处理函数
            // @param {string} eventtype 交互方式，click 百度一下、keydown 键盘
            function _handlePreload(eventtype) {
                if ( me.currentQuery && currentQuery !== me.currentQuery && !dataPreloaded.inputs[me.currentQuery] ) {
                    me.preload(eventtype);
                    currentQuery = me.currentQuery;
                }
            }

            // 鼠标移除事件处理函数
            function _handleMove(e) {
                if ( moveEvt ) {
                    if ( e.x - 10 > moveEvt.x || e.y - 5 > moveEvt.y ) {
                        _handlePreload('click');
                        moveEvt = e;
                    }
                } else {
                    moveEvt = e;
                }
            }

            // 极速搜索query切换事件处理函数
            function _handleSearch(query) {
                input_el.blur();
                if ( query !== currentQuery ) {
                    me.oldInputValue = input_el.value = currentQuery = query;
                    me.hide();
                }
            }

            function _getFormData(){
                var $form = baidu.dom('#' + sugOptions.form);
                return serialize($form);
            }

            // 预测query提示逻辑
            (function() {
                var $input         = baidu(input_el),
                    $preQuery      = baidu($form).find('.predict-query'),
                    $preQueryInput = baidu($form).find('.predict-input'),
                    oldInputQuery  = '',
                    oldPreQuery    = '',
                    timer          = null;

                // 设置预测query
                function setPreQuery() {
                    var inputQuery = input_el.value,
                        preQuery   = predictCache[inputQuery];
                    if ( oldInputQuery === inputQuery && oldPreQuery === preQuery ) return;

                    if ( preQuery ) {
                        if ( oldPreQuery !== preQuery ) {
                            $preQuery.html('→' + preQuery);
                            oldPreQuery = preQuery;
                        }
                        $preQuery.css('visibility', 'visible');
                    } else {
                        clearPreQuery();
                    }

                    if ( oldPreQuery ) {
                        $preQuery.css('left', $preQueryInput.html(inputQuery).width());
                    }

                    oldInputQuery = inputQuery;
                }

                // 清除预测query
                function clearPreQuery() {
                    $preQuery.html('');
                    oldPreQuery = '';
                }

                // 按键盘右键补齐query
                function keydownHandler(e) {
                    if ( e.keyCode == 39 ) {
                        var query = input_el.value, preQuery;
                        if ( query && query.length === input_el.selectionStart && (preQuery = predictCache[query]) ) {
                            input_el.value = preQuery;
                            if ( localStorage && localStorage.qsKeyTip < 3 ) {
                                localStorage.qsKeyTip = 3;
                            }
                        }
                    }
                }

                // 侦听输入框query变化
                function createTimer() {
                    timer = setInterval(function() {
                        setPreQuery();
                    }, 100);
                }

                // 显示快捷键提示
                function keyTip() {
                    var $tips = baidu('<span class="tips">按键盘右键快速选择<b></b></span>');
                    $preQuery.css('z-index', 1).append($tips);
                    localStorage.qsKeyTip = Number(localStorage.qsKeyTip) + 1 || 1;
                    setTimeout(function() {
                        $tips.hide();
                    }, 3000);
                }

                // 侦听相关事件
                $input.focus(function() {
                    clearInterval(timer);
                    createTimer();
                }).blur(function() {
                    clearInterval(timer);
                }).keydown(keydownHandler);

                me.on('onconfirm', function() {
                    if ( oldPreQuery ) {
                        clearPreQuery();
                    }
                });

                if ( localStorage && (!localStorage.qsKeyTip || localStorage.qsKeyTip < 3) ) {
                    $preQuery.css('z-index', 11).mousemove(keyTip);
                }
            }());

            // 选项上框时、鼠标选中某个选项时、鼠标移动时预加载
            // 极速搜索预判
            var _fnPredict = function(evt, query){
                var result = predictCache[query];

                if (result){
                    return bdvQuickSearch.trigger("search", result);
                }

                me._objAjax && me._objAjax.abort();
                me._objAjax = T.ajax({
                    url: APIS.sug + "?wd="+encodeURIComponent(query)+"&json=1&predict=1&istype=1&cb=?&prod=video_ala", 
                    dataType: "jsonp",
                    jsonp: "cb",
                    success: function(ret){
                        if (typeof ret == "string"){
                            ret = baidu.json.parse(ret);
                        }
                        if (ret.need_predict == 0) return;

                        result = predictCache[query] = ret.predict_query.replace(/(\{.+\})?/g, "");

                        window._bdvSearchLogType = "pre";
                        bdvQuickSearch.trigger("search", result);
                    }
                });
            }

            // 根据输入框中数据进行预判
            me.on('onneeddata', function(evt, query){
                clearTimeout(me._preTimer);
                me._objAjax && me._objAjax.abort();
                me._preTimer = setTimeout(function(){
                    _fnPredict(evt, query);
                }, 180);
            });

            // suggestion条目选中
            me.on('onhighlight', function(evt, para){
                if (para.hasUrl || evt.eventType === 'hover') return;
                clearTimeout(me._preTimer); // 取消预判
                me._objAjax && me._objAjax.abort();
                me._preTimer = setTimeout(function(){
                    if (window._bdvSearchLogType == "click" || window._bdvSearchLogType == "enter"){
                        return;
                    }
                    window._bdvSearchLogType = "hl";
                    bdvQuickSearch.trigger("search", para.value);
                }, 300); //“极速”与性能的博弈
            });
            //me.on('onpick', _handlePreload);
            //me.on('onmouseoveritem', _handlePreload);
            /* baidu.dom(input_el).on('focus', function() {
                moveEvt = null;
                baidu.dom(document.body).on('mousemove', _handleMove);
            });
            baidu.dom(input_el).on('blur', function() {
                baidu.dom(document.body).off('mousemove', _handleMove);
            }); */

            //侦听极速搜索query切换事件
            bdvQuickSearch.on('init', _handleSearch);

            // 提交表单
            bdvQuickSearch.on("submit", function(){
                $form.submit();
            });

            //设置搜索框默认query
            if ( !input_el.value && document.body.getAttribute('query') ) {
                _handleSearch(document.body.getAttribute('query'));
            }
        }
    });

    me.fire('onload');
}, {
    type: "magic.control.Suggestion",
    superClass: magic.Base
}).extend({
    //创建一个magic.Popup实例，第一个执行show方法时执行
    render: function () {
        var me = this,
            popup = new magic.Popup({
                "autoHide": false,
                "autoTurn": false,
                'disposeOnHide': false
            }),
            popupContainer = popup.getElement();
        baidu.dom(popupContainer).addClass("bdv-suggestion");
        me.$mappingDom("suggestion", popupContainer);
        me.suggestion = popup; //指向suggestion的popup实例
        me.fire("onrender");
        return popupContainer;
    },
    //检查suggestion弹层是否处于显示状态
    isShowing: function () {
        var me = this,
            suggestion = me.getElement("suggestion");
        return suggestion && baidu.dom(suggestion).css('display') != "none";
    },
    //显示suggestion弹层
    show: function () {
        var me = this,
            suggestion_el = me.getElement("suggestion") || me.render(),
            input_el = me.getElement("input");
        me.isShowHot = me.getInputValue() ? 0 : 1;
        me.fire("beforeshow");
        //设置suggestion的内容
        me.suggestion.setContent(me._getSuggestionString());
        //调用popup的attach方法定位
        me.suggestion.attach(input_el, {
            "offsetX": (me.offset && me.offset.offsetX) || 0,
            "offsetY": (me.offset && me.offset.offsetY) || -1
        });
        //显示suggestion
        baidu.dom(suggestion_el).css("display", "block");
        me.selectedIndex = -1;
        me.fire("onshow");
        me._onShowedEvent();
    },
    // 显示弹层后侦听resize和scroll事件
    _onShowedEvent: function() {
        var me = this;
        me._handleShowed = function() {
            me.hide();
        }
        baidu(window).on('resize', me._handleShowed);
        baidu(window).on('scroll', me._handleShowed);
    },
    //隐藏suggestion弹层
    hide: function () {
        var me = this,
            suggestion = me.getElement("suggestion");
        //如果不存在suggestion或者suggestion处于关闭状态，不需要后续操作
        if (!suggestion || !me.isShowing()) {
            return;
        }
        //如果当前有选中的条目，将其放到input中
        // if (me.selectedIndex >= 0 && me.holdHighLight) {
        //     var currentData = me.currentData,
        //         i = me.enableIndexs[me.selectedIndex];
        //     if (currentData[i] && (typeof currentData[i].disable == 'undefined' || currentData[i].disable == false)) {
        //         me.$pick(i);
        //     }
        // } else {
        //     me.oldInputValue = me.getElement("input").value;
        // }
        me.oldInputValue = me.getElement("input").value;
        me._hide();
        me.hideVideoItem();
    },
    _hide: function () {
        var me = this,
            suggestion = me.getElement("suggestion");
        baidu.dom(suggestion).css("display", "none");
        //重置selectedIndex
        me.selectedIndex = -1;
        me.fire("onhide");
        if (me._handleShowed) {
            baidu(window).off('resize', me._handleShowed);
            baidu(window).off('scroll', me._handleShowed);
        }
    },
    //解析suggestion模板和数据，生成HTML返回
    _getSuggestionString: function() {
        var me = this;
        //取出按序排好的data (模糊匹配，只要开头能匹配即可)
        if(!myNewSug.isIE67){
            //靠前缀关联
            var cached = myNewSug.get(me.currentQuery, 'fuzzy');
            //与me.currentData合并
            var cachedLen = cached.length;
            var curDataLen = me.currentData.length;
            var curData = [];
            var tempArr = [];
            //这里直接对me.currentData进行操作，会影响到dataCache，所以拷贝到临时数组
            for(var ii=0;ii<curDataLen;ii++){
                curData.push(me.currentData[ii]);
            }
            //如果有记录
            if(cached.length && me.currentQuery){
                //截取长度，这里默认设为2
                //按照timestamp排序
                cached = myNewSug.assort(cached, 'timestamp', 'desc');
                (cached.length > 2) && (cached.length = 2);
                //将该命中数组中的项与me.currentData中的项做对比，并删除me.currentData中与cached重复的项
                var cachedLen = cached.length;
                //与query相比
                for(var i=0;i<cachedLen;i++){
                    if (cached[i]['data']['content'] || cached[i]['data']['value']){
                        tempArr.push({
                            'content': cached[i]['data']['content'] || cached[i]['data']['value'],
                            'meta': cached[i]['data']['meta'],
                            'value': cached[i]['data']['value'],
                            'newClass': 'hitted',
                            'color': '#4271af',
                            'timestamp': cached[i]['timestamp']
                        });
                    }
                }
            }
            //靠后台返回的sug关联
            var sugCached = myNewSug.getAll(),
                sugCachedLen = sugCached.length,
                sugVal;
            if(sugCached.length && me.currentQuery){
                //与query相比
                for(var i=0;i<sugCachedLen;i++){
                    for(var j=0;j<curDataLen;j++){
                        if(sugCached[i]['name'] == curData[j]['content']){
                            sugVal = sugCached[i]['data']['content'] || sugCached[i]['data']['value'];
                            if (sugVal){
                                tempArr.push({
                                    'content': sugVal,
                                    'meta': sugCached[i]['data']['meta'],
                                    'value': sugCached[i]['data']['value'],
                                    'newClass': 'hitted',
                                    'color': '#4271af',
                                    'timestamp': sugCached[i]['timestamp']
                                });
                            }
                        }
                    }
                }
            }
            //tempArr合并去重
            var tempArrLen = tempArr.length;
            var tempJson = {};
            for(var i=0;i<tempArrLen;i++){
                tempJson[tempArr[i]['content']] = tempArr[i];
            }
            tempArr = [];
            for(var j in tempJson){
                tempArr.push(tempJson[j]);
            }
            //根据时间戳排序
            tempArr = myNewSug.assort(tempArr, 'timestamp', 'desc');
            (tempArr.length > 2) && (tempArr.length = 2);
            //将sug中和缓存中的数据合并去重
            for(var i=0;i<tempArr.length;i++){
                for(var j=0;j<curDataLen;j++){
                    if(tempArr[i]['content'] == curData[j]['content']){
                        curData.splice(j, 1);
                        curDataLen = curData.length;
                    }
                }
            }
            
            //最后合并进currentData
            if(tempArr.length || me.currentQuery){
                me.currentData = tempArr.concat(curData);
                //如果currentData长度大于6 则截取前6个
                (me.currentData.length > 4) && (me.currentData.length = 4);
                me.dataCache = me.currentData;
                me.enableIndexs = [];
                for(var i=0;i<me.currentData.length;i++){
                    me.enableIndexs.push(i);
                }
                myNewSug.log('http://nsclick.baidu.com/p.gif?pid=104&tpl=history_sug&searchpage=&wd='+this.currentQuery+'&sug='+this.oldInputValue+'&li='+this.selectedIndex);
            }
        }

        var html = bdvsug.template(me.getInputValue() ? tplSuggestion : tplHotList, {
            me: me,
            data: me.currentData,
            query: me.currentQuery,
            videoTypes: videoTypes
        });
        return html;
    },
    //取得input中的值
    getInputValue: function () {
        return this.getElement("input").value;
    },
    //根据index获取对应的输入框提示值
    getDataByIndex: function (index) {
        return this.currentData[index];
    },
    _isEnable: function (index) {
        var me = this;
        return baidu.array(me.enableIndexs).contains(index);
    },
    //获取提示项DOM节点
    _getItemDom: function (index) {
        return baidu.dom('#' + this.$getId('item' + index)).get(0);
    },
    //返回suggestion内的class值
    _getClass: function (name) {
        return "bdv-suggestion-" + name;
    },
    //响应上下按键交互
    _focus: function (selectedIndex) {
        var enableIndexs = this.enableIndexs;
        //将选中项上框
        this.$pick(enableIndexs[selectedIndex]);
        //将选中项高亮
        this.$highlight(enableIndexs[selectedIndex]);
    },
    //将选中项高亮
    $highlight: function (index, eventType) {
        var me = this,
            enableIndexs = me.enableIndexs,
            item = null;
        //若需要高亮的选项被设置了disable，则直接返回
        if (!me._isEnable(index)) return;
        me.selectedIndex >= 0 && me.$clearHighlight();
        item = me._getItemDom(index);
        baidu.dom(item).addClass('bdv-suggestion-current');
        //修改索引
        me.selectedIndex = baidu.array(enableIndexs).indexOf(index);

        var currentItem = me.getDataByIndex(index)
        me.fire('onhighlight', {
            'index': index,
            'value': currentItem.value,
            'hasUrl': !!currentItem.url,
            'eventType': eventType
        });
    },
    //取消高亮
    $clearHighlight: function () {
        var me = this,
            selectedIndex = me.selectedIndex,
            item = null,
            index = 0;
        index = me.enableIndexs[selectedIndex];
        if (selectedIndex >= 0) {
            item = me._getItemDom(index);
            baidu.dom(item).removeClass(me._getClass('current'));
            me.selectedIndex = -1;
            me.fire('onclearhighlight', {
                index: index,
                value: me.getDataByIndex(index).value
            });
        }
    },
    //将选中项上框
    $pick: function (index) {
        // 不检查index的有效性
        var me = this,
            currentData = me.currentData,
            returnData = currentData[index];
        if (me.fire('onbeforepick', {
            'index': index,
            'value': returnData.value
        })) {
            me.getElement("input").value = returnData.value;
            me.oldInputValue = returnData.value;
            me.fire('onpick', {
                'index': index,
                'value': returnData.value
            });
        }
    },
    //提交选中项
    //@param {number} index 选中项序号
    //@param {string} eventType 触发提交的事件类型
    $confirm: function (index, eventType) {
        // 不检查index的有效性
        var me = this;
        if (!me._isEnable(index)) {
            return;
        }
        me.$pick(index);
        me.fire('onconfirm', {
            'index': index,
            'value': me.getDataByIndex(index).value,
            'eventType': eventType
        });
        me._hide();
    },
    //打开选中项url
    $confirmOpen: function (index) {
        // 不检查index的有效性
        var me = this,
            currentIndex = me.getDataByIndex(index);
        if (!me._isEnable(index)) {
            return;
        }
        me.$pick(index);
        me.fire('onconfirmopen', {
            'index': index,
            'value': currentIndex.value,
            'url': currentIndex.url
        });
        me._hide();
    },
    //向服务器请求suggestion数据
    getData: function (query) {
        baidu.sio(APIS.sug + '?wd=' + encodeURIComponent(query) + '&prod=video_ala&oe=utf-8&t=' + Math.random()).callByBrowser(function(){}, { charset: 'gb2312' });
    },
    //接收suggestion数据
    receiveData: function (query, data) {
        var me = this,
            _data = me.$cacheData(query, data);
        me.selectedIndex = -1;
        if (query == me.getInputValue()) {
            me.currentData = _data;
            (data.length > 0) ? me.show() : me.hide(); //返回的数组为空则不显示suggestion
        }
    },
    //处理接收到的数据
    $cacheData: function (query, data) {
        var me = this,
            _data = me._wrapData(data);
        me.dataCache[query] = _data;
        return _data;
    },
    //包装接收到的数据
    _wrapData: function (data) {
        var me = this,
            _data = [],
            i = 0,
            len = data.length,
            split;
        //Attention: 对返回值中可能包含的实体字符，如：<、>等，使用encodeHTML转义
        for (; i < len; i++) {
            if (typeof data[i].value != 'undefined') {
                _data.push(data[i]);
            } else {
                split = data[i].split('{#S+_}');
                _data.push({
                    'value': split[0],
                    'content': baidu.string.encodeHTML(split[0]),
                    'meta': split[1] ? baidu.json.parse(split[1]) : null
                });
            }
        }
        return _data;
    },

    //向服务器请求热搜榜数据
    getHotData: function () {
        var me = this;
          window['videoHotlistMIS'] = function(result) {
                if (result && result[0] && result[0].data && result[0].data.videos) {
                        me.receiveHotData(result[0].data.videos);
                }
                window['videoHotlistMIS'] = null;
            };

            //先读缓存，防止多次请求
            if(userinfo) {
                if (userinfo.vipinfo.isvalid && userinfo.vipinfo.isvip) {
                     APIS.hotlist ="http://v.baidu.com/staticapi/api_hotlist_vip.json";
                } 
                baidu.sio(APIS.hotlist + '?v=' + new Date().getTime()).callByBrowser();
            } else{
                loginVipCheck(function(isvip) {
                    if (isvip) {
                        APIS.hotlist ="http://v.baidu.com/staticapi/api_hotlist_vip.json";
                    }
                  baidu.sio(APIS.hotlist + '?v=' + new Date().getTime()).callByBrowser();

                });
            }
       
    },
    //接收热搜榜数据
    receiveHotData: function (data) {
        var me = this;
        dataHotCache = data.slice(0, 10);
        //保持与suggestion接口数据结构一致
        for ( var i = 0, len = dataHotCache.length; i < len; i++ ) {
            dataHotCache[i].value = dataHotCache[i].title;
        }
        if (!me.getInputValue()) {
            me.currentData = dataHotCache;
            (dataHotCache.length > 0) ? me.show() : me.hide();
        }
    },
    //向服务器请求视频数据
    getVideoData: function (meta) {
        var me = this,
            json = 'json' + new Date().getTime();
        window[json] = function (data) {
            me.receiveVideoData(meta, data);
            window[json] = null;
        };
        me.currentVideoMeta = meta;
        baidu.sio(APIS.videos[meta.type] + '?id=' + meta.id + '&frp=opensug&callback=' + json).callByBrowser(function(){}, { charset: 'utf-8' });
    },
    //接收视频数据
    receiveVideoData: function (meta, data) {
        var currentMeta = this.currentVideoMeta;
        dataVideoCache[meta.type][meta.id] = data;
        if (currentMeta.type === 'person') {
            this.getUGCData(meta, data.video.name_encode);
        } else {
            if (currentMeta.type === meta.type && currentMeta.id === meta.id) {
                this.currentVideoData = data;
                data && data.video ? this.showVideoItem() : this.hideVideoItem();
            }
        }
    },
    //向服务器请求普通结果数据
    getUGCData: function (meta, query) {
        var me = this,
            json = 'json' + new Date().getTime();
        window[json] = function (data) {
            me.receiveUGCData(meta, data);
            window[json] = null;
        };
        baidu.sio(APIS.ugc + '&word=' + query + '&rn=' + 3 + '&jsonFn=' + json).callByBrowser(function(){}, { charset: 'gbk' });
    },
    //接收普通结果数据
    receiveUGCData: function (meta, data) {
        var currentMeta = this.currentVideoMeta,
            currentData = dataVideoCache[meta.type][meta.id];
        currentData.ugc = data;
        if (currentMeta.type === meta.type && currentMeta.id === meta.id) {
            this.currentVideoData = currentData;
            currentData && currentData.video ? this.showVideoItem() : this.hideVideoItem();
        }
    },
    //显示视频区块
    showVideoItem: function () {
        this.getElement('videoitem').innerHTML = bdvsug.template(this.currentVideoMeta.type === 'person' ? tplSuggestionPerson : tplSuggestionVideo, this.currentVideoData);
        baidu(this.getElement('inner')).addClass('bdv-suggestion-video-show');
    },
    //隐藏视频区块
    hideVideoItem: function () {
        baidu(this.getElement('inner')).removeClass('bdv-suggestion-video-show');
    },
    //预加载当前query相关的结果页
    //@param {string} eventtype 交互方式，click 百度一下、keydown 键盘  
    preload: function(eventtype) {
        var me = this,
            querys = [],
            //sug列表
            currentData = me.currentData,
            //输入框query
            oldInputValue = me.oldInputValue,
            //已预加载的query结果页
            dataPreloadedWords = dataPreloaded.words;

        dataPreloaded.inputs[me.currentQuery] = true;

        //如果是用户交互是移动鼠标，预加载query增加input框的输入
        if ( eventtype === 'click' ) {
            querys.push(oldInputValue);
        }

        //预加载sug中的前两个query结果页
        if ( currentData ) {
            for ( var i = 0, len = currentData.length; i < len && i < 2; i++ ) {
                var query = currentData[i].value;
                if ( !dataPreloadedWords[query] ) {
                    dataPreloadedWords[query] = true;
                    querys.push(query);
                }
            }
        }

        //调用极速搜索预加载方法
        if ( querys.length > 0 && me.openQuickSearch) {
            window._bdvSearchLogType = eventtype;
            bdvQuickSearch.trigger("preSearch", querys.slice(0, 2));
        }   
    },
    /**
     * 事件响应
     */
    //鼠标移入某个选项时触发
    _mouseOver: function (e, index) {
        var me = this;
        e = baidu.event(e);
        e.stopPropagation();
        if (me._isEnable(index)) {
            me.$highlight(index, 'hover');
            me.selectedIndex = baidu.array(me.enableIndexs).indexOf(index);
        }

        var currentItem = me.getDataByIndex(index);
        me.fire('onmouseoveritem', {
            'index': index,
            'value': currentItem.value,
            'hasUrl': !!currentItem.url
        });
    },
    //onmouseoutitem
    _mouseOut: function (e, index) {
        var me = this;
        e = baidu.event(e);
        e.stopPropagation();
        if (!me.holdHighLight) {
            me._isEnable(index) && me.$clearHighlight();
        }

        var currentItem = me.getDataByIndex(index);
        me.fire('onmouseoutitem', {
            'index': index,
            'value': me.getDataByIndex(index).value,
            'hasUrl': !!currentItem.url
        });
    },
    //鼠标选中某个选项时触发
    _mouseDown: function (e, index) {
        var me = this;
        e = baidu.event(e);
        e.stopPropagation();

        var currentItem = me.getDataByIndex(index);
        me.fire('onmousedownitem', {
            'index': index,
            'value': me.getDataByIndex(index).value,
            'hasUrl': !!currentItem.url
        });
    },
    //鼠标点击某个选项时触发
    _mouseClick: function (e, index) {
        var me = this,
            currentItem = me.getDataByIndex(index);
        e = baidu.event(e);
        e.stopPropagation();
        me.fire('onmouseclick', {
            'index': index,
            'value': currentItem.value,
            'hasUrl': !!currentItem.url
        });
        if (currentItem.url) {
            me.$confirmOpen(index);
        } else {
            me.$confirm(index, 'click');
        }
    },
    //关闭按钮事件处理函数
    _mouseClickClose: function (e) {
        e = baidu.event(e);
        e.stopPropagation();
        this.hide();
    },
    //向下按键事件处理函数
    _keydownHandler: function () {
        var me = this;

        function upDownArrowHandler(direction) {
            var query = me.getInputValue(),
                enableIndexs = me.enableIndexs,
                selectedIndex = me.selectedIndex;
            /** 添加热搜榜，移除此逻辑
            if (!query) { //input中没有值时，理论上suggestion不显示，直接返回
                return;
            }
            */
            if ((query && !me.isShowing())) { //suggestion没有显示
                me.fire("onneeddata", query);
                return;
            }
            //只剩下suggestion处于显示状态且当前suggestion对应的query与input中的query一致的情况
            //当所有的选项都处于disable状态,直接返回
            if (enableIndexs.length == 0) {
                return;
            }
            //如果处于延时处理状态，则返回
            if (me.upDownArrowTimer) {
                return;
            }
            me.upDownArrowTimer = setTimeout(function () {
                clearTimeout(me.upDownArrowTimer);
                me.upDownArrowTimer = null;
            }, 200);
            if ("up" == direction) {
                switch (selectedIndex) {
                case -1:
                    me.$clearHighlight();
                    selectedIndex = enableIndexs.length - 1;
                    me._focus(selectedIndex);
                    break;
                case 0:
                    selectedIndex = -1;
                    me.$clearHighlight();
                    me.getElement("input").value = me.currentQuery;
                    me.oldInputValue = me.currentQuery;
                    break;
                default:
                    selectedIndex--;
                    me._focus(selectedIndex);
                    break;
                }
            } else {
                switch (selectedIndex) {
                case -1:
                    selectedIndex = 0;
                    me._focus(selectedIndex);
                    break;
                case enableIndexs.length - 1:
                    selectedIndex = -1;
                    me.$clearHighlight();
                    me.getElement("input").value = me.currentQuery;
                    me.oldInputValue = me.currentQuery;
                    break;
                default:
                    selectedIndex++;
                    me._focus(selectedIndex);
                    break;
                }
            }
            me.selectedIndex = selectedIndex;
        }
        return function (e) {
            var direction = "up";
            switch (e.keyCode) {
            case 27:
                //esc
            case 9:
                //tab
                me.hide();
                break;
            case 13:
                //回车，默认为表单提交
                e.preventDefault();
                e.stopPropagation();
                //当前有选中的选项且holdHighLight打开
                if (me.selectedIndex >= 0 && me.holdHighLight) {
                    me.$confirm(me.enableIndexs[me.selectedIndex], 'keydown');
                } else {
                    me.fire('onconfirm', {
                        'value': me.getInputValue(),
                        'eventType': 'keydown'
                    });
                    if (me.isShowing()) {
                        me._hide();
                    }
                }
                break;
            case 40:
                //向下
                direction = "down";
            case 38:
                //向上
                e.preventDefault();
                e.stopPropagation();
                upDownArrowHandler(direction);
                break;
            default:
                break;
            }
        };
    },
    $dispose: function () {
        var me = this;
        if (me.disposed) {
            return;
        }
        if (me.suggestion) {
            me.suggestion.$dispose();
            me.hide();
        }
        magic.Base.prototype.$dispose.call(me);
    }
});

/**
 * 初始化suggestion
 */
//默认配置
var sugOptions = {
    form: 'bdvSearch',
    input: 'bdvSearvhInput',
    num: 6,
    openQuickSearch: true
};
//创建suggestion实例
function createSuggestion() {
    var sug = new magic.control.Suggestion(sugOptions.input, {
        holdHighLight: true,
        openQuickSearch: sugOptions.openQuickSearch,
        form: sugOptions.form
    });
    //suggestion数据接口回调函数
    sug.nssugCallback = function(data) {
        if ( data && data.q && data.s ) {
            var querys = data.s.length > sugOptions.num ? data.s.splice(0, sugOptions.num) : data.s;
            sug.receiveData(data.q, querys);
        }
    };
    //定义可配置事件
    sugSetting(sug);
}
//配置suggestion实例事件
function sugSetting(sug) {
    //监听选项上框事件
    sug.on('onpick', function(evt) {
        if ( evt.index > -1 ) {
            var fields = baidu('#' + sugOptions.form).find('input[name=oq], input[name=f], input[name=rsp]');
            if ( fields.length === 3 ) {
                fields.attr('disabled', false);
                fields[0].value = sug.currentQuery;
                fields[2].value = evt.index;
            }
        }
    });
    //监听表单提交事件
    var $form = baidu.dom('#' + sugOptions.form);
    sug.on('onconfirm', function (evt) {
        //记录用户搜索内容到localstorage
        var data = {};
        if(this.selectedIndex > -1){
            data = this.currentData[this.selectedIndex];
        }
        else{
            data = {
                'content': this.currentQuery,
                'meta': null,
                'value': this.currentQuery
            }
        }
        if(this.currentQuery && !myNewSug.isIE67){
            myNewSug.set({
                name: this.oldInputValue,
                data: data
            });
        }

        if ( sug.openQuickSearch ) {
            sug._objAjax && sug._objAjax.abort();
            clearTimeout(sug._preTimer);
            //打点统计
            if(data.newClass){
                myNewSug.log('http://nsclick.baidu.com/v.gif?pid=104&tpl=history_sug&searchpage=&wd='+this.currentQuery+'&sug='+this.oldInputValue+'&li='+this.selectedIndex);
            }
            
            var formParams = serialize($form);
            if (evt.eventType == "keydown"){
                window._bdvSearchLogType = "enter";
            }
            sug.getElement('input').blur();
            bdvQuickSearch.trigger("search", evt.value, formParams);
        } else {
            if(data.newClass){
                myNewSug.log('http://nsclick.baidu.com/v.gif?pid=104&tpl=history_sug&searchpage=&wd='+this.currentQuery+'&sug='+this.oldInputValue+'&li='+this.selectedIndex);
            }

            if ( sugOptions.delay ) {
                setTimeout(function() {
                    $form.submit();
                }, sugOptions.delay);
            } else {
                $form.submit();
            }
        }
    });
    //监听热搜榜链接点击事件
    sug.on('onconfirmopen', function (evt) {
        window.open(evt.url);
    });
    //监听自定义表单提交事件
    if ( baidu.type(sugOptions.onsubmit) === 'function' ) {
        sug.on('onconfirm', function(evt) {
            sugOptions.onsubmit({
                query: sug.currentQuery,
                title: evt.value,
                index: evt.index,
                eventType: evt.eventType
            });
        });
        sug.on('onconfirmopen', function(evt) {
            sugOptions.onsubmit({
                url: evt.url,
                title: evt.value,
                index: evt.index
            });
        });
    }
    //监听自定义链接点击事件
    if ( baidu.type(sugOptions.onclicklink) === 'function' ) {
        sug.on('onclickvideo', function(evt) {
            sugOptions.onclicklink(evt);
        });
    }
    //添加自定义class值到suggestion容器上
    if ( baidu.type(sugOptions.classname) === 'string' ) {
        sug.on('onrender', function() {
            baidu(sug.getElement('suggestion')).addClass(sugOptions.classname);
        });
    }
}
//初始化
function init() {
    if ( typeof bdvSugConfig === 'object' ) {
        baidu.object.extend(sugOptions, bdvSugConfig);
    }
    if ( baidu('#' + sugOptions.form + ', #' + sugOptions.input).length === 2 ) {
        createSuggestion();
    }
}
init();

//End
}());