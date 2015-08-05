// Copyright (c) 2009-2012, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



var T, baidu = T = baidu || function(q, c) {
    return baidu.dom ? baidu.dom(q, c) : null;
};
module.exports = T;

baidu.version = '2.0.2.5';
baidu.guid = "$BAIDU$";
baidu.key = "tangram_guid";

// Tangram 可能被放在闭包中
// 一些页面级别唯一的属性，需要挂载在 window[baidu.guid]上

var _ = window[baidu.guid] = window[baidu.guid] || {};
(_.versions || (_.versions = [])).push(baidu.version);

// 20120709 mz 添加参数类型检查器，对参数做类型检测保护
baidu.check = baidu.check || function() {};

if (typeof jQuery != 'undefined') {
    baidu.dom = jQuery;
}



baidu.lang = baidu.lang || {};



baidu.forEach = function(enumerable, iterator, context) {
    var i, n, t;

    if (typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if (typeof n == "number") {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for (i = 0; i < n; i++) {

                t = enumerable[i]
                t === undefined && (t = enumerable.charAt && enumerable.charAt(i));

                // 被循环执行的函数，默认会传入三个参数(array[i], i, array)
                iterator.call(context || null, t, i, enumerable);
            }

            // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i = 0; i < enumerable; i++) {
                iterator.call(context || null, i, i, i);
            }

            // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if (enumerable.hasOwnProperty(i)) {
                    iterator.call(context || null, enumerable[i], i, enumerable);
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
        retryType = {
            'object': 1,
            'function': '1'
        }, //解决safari对于childNodes算为function的问题
        toString = objectType.toString;

    // 给 objectType 集合赋值，建立映射
    baidu.forEach(str.split(" "), function(name) {
        objectType["[object " + name + "]"] = name.toLowerCase();

        baidu["is" + name] = function(unknow) {
            return baidu.type(unknow) == name.toLowerCase();
        }
    });

    // 方法主体
    return function(unknow) {
        var s = typeof unknow;
        return !retryType[s] ? s : unknow == null ? "null" : unknow._type_ || objectType[toString.call(unknow)] || nodeType[unknow.nodeType] || (unknow == unknow.window ? "Window" : "") || "object";
    };
})();

// extend
baidu.isDate = function(unknow) {
    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
};

baidu.isElement = function(unknow) {
    return baidu.type(unknow) == "HTMLElement";
};

// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
baidu.isEnumerable = function(unknow) {
    return unknow != null && (typeof unknow == "object" || ~Object.prototype.toString.call(unknow).indexOf("NodeList")) && (typeof unknow.length == "number" || typeof unknow.byteLength == "number" //ArrayBuffer
        || typeof unknow[0] != "undefined");
};
baidu.isNumber = function(unknow) {
    return baidu.type(unknow) == "number" && isFinite(unknow);
};

// 20120903 mz 检查对象是否为一个简单对象 {}
baidu.isPlainObject = function(unknow) {
    var key,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    if (baidu.type(unknow) != "object") {
        return false;
    }

    //判断new fn()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if (unknow.constructor &&
        !hasOwnProperty.call(unknow, "constructor") &&
        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf")) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for (key in unknow) {}
    return key === undefined || hasOwnProperty.call(unknow, key);
};

baidu.isObject = function(unknow) {
    return typeof unknow === "function" || (typeof unknow === "object" && unknow != null);
};



baidu.global = baidu.global || (function() {
    var me = baidu._global_ = window[baidu.guid],
        // 20121116 mz 在多个tangram同时加载时有互相覆写的风险
        global = me._ = me._ || {};

    return function(key, value, overwrite) {
        if (typeof value != "undefined") {
            overwrite || (value = typeof global[key] == "undefined" ? value : global[key]);
            global[key] = value;

        } else if (key && typeof global[key] == "undefined") {
            global[key] = {};
        }

        return global[key];
    }
})();



baidu.extend = function(depthClone, object) {
    var second, options, key, src, copy,
        i = 1,
        n = arguments.length,
        result = depthClone || {},
        copyIsArray, clone;

    baidu.isBoolean(depthClone) && (i = 2) && (result = object || {});
    !baidu.isObject(result) && (result = {});

    for (; i < n; i++) {
        options = arguments[i];
        if (baidu.isObject(options)) {
            for (key in options) {
                src = result[key];
                copy = options[key];
                // Prevent never-ending loop
                if (src === copy) {
                    continue;
                }

                if (baidu.isBoolean(depthClone) && depthClone && copy && (baidu.isPlainObject(copy) || (copyIsArray = baidu.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && baidu.isArray(src) ? src : [];
                    } else {
                        clone = src && baidu.isPlainObject(src) ? src : {};
                    }
                    result[key] = baidu.extend(depthClone, clone, copy);
                } else if (copy !== undefined) {
                    result[key] = copy;
                }
            }
        }
    }
    return result;
};



baidu.browser = baidu.browser || function() {
    var ua = navigator.userAgent;

    var result = {
        isStrict: document.compatMode == "CSS1Compat",
        isGecko: /gecko/i.test(ua) && !/like gecko/i.test(ua),
        isWebkit: /webkit/i.test(ua)
    };

    try {
        /(\d+\.\d+)/.test(external.max_version) && (result.maxthon = +RegExp['\x241'])
    } catch (e) {};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua):
            result.ie = document.documentMode || +RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua):
            result.chrome = +RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua):
            result.safari = +(RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua):
            result.firefox = +RegExp['\x241'];
            break;

        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua):
            result.opera = +(RegExp["\x244"] || RegExp["\x241"]);
            break;
    }

    baidu.extend(baidu, result);

    return result;
}();



baidu.id = function() {
    var maps = baidu.global("_maps_id"),
        key = baidu.key;

    // 2012.12.21 与老版本同步
    window[baidu.guid]._counter = window[baidu.guid]._counter || 1;

    return function(object, command) {
        var e, str_1 = baidu.isString(object),
            obj_1 = baidu.isObject(object),
            id = obj_1 ? object[key] : str_1 ? object : "";

        // 第二个参数为 String
        if (baidu.isString(command)) {
            switch (command) {
                case "get":
                    return obj_1 ? id : maps[id];
                    //            break;
                case "remove":
                case "delete":
                    if (e = maps[id]) {
                        // 20120827 mz IE低版本(ie6,7)给 element[key] 赋值时会写入DOM树，因此在移除的时候需要使用remove
                        if (baidu.isElement(e) && baidu.browser.ie < 8) {
                            e.removeAttribute(key);
                        } else {
                            delete e[key];
                        }
                        delete maps[id];
                    }
                    return id;
                    //            break;
                default:
                    if (str_1) {
                        (e = maps[id]) && delete maps[id];
                        e && (maps[e[key] = command] = e);
                    } else if (obj_1) {
                        id && delete maps[id];
                        maps[object[key] = command] = object;
                    }
                    return command;
            }
        }

        // 第一个参数不为空
        if (obj_1) {
            !id && (maps[object[key] = id = baidu.id()] = object);
            return id;
        } else if (str_1) {
            return maps[object];
        }

        return "TANGRAM_" + baidu._global_._counter++;
    };
}();

//TODO: mz 20120827 在低版本IE做delete操作时直接 delete e[key] 可能出错，这里需要重新评估，重写



baidu.base = baidu.base || {
    blank: function() {}
};



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

    toString: baidu.base.Class.prototype.toString = function() {
        return "[object " + (this._type_ || "Object") + "]";
    }


    ,
    dispose: function() {
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
            if (!baidu.isFunction(this[pro])) delete this[pro];
            else this[pro] = baidu.base.blank;
        }

        this.disposed = true; //20100716
        // }
    }


    ,
    fire: function(event, options) {
        baidu.isString(event) && (event = new baidu.base.Event(event));

        var i, n, list, item, t = this._listeners_,
            type = event.type
            // 20121023 mz 修正事件派发多参数时，参数的正确性验证
            ,
            argu = [event].concat(Array.prototype.slice.call(arguments, 1));
        !t && (t = this._listeners_ = {});

        // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
        baidu.extend(event, options || {});

        event.target = event.target || this;
        event.currentTarget = this;

        type.indexOf("on") && (type = "on" + type);

        baidu.isFunction(this[type]) && this[type].apply(this, argu);
        (i = this._options) && baidu.isFunction(i[type]) && i[type].apply(this, argu);

        if (baidu.isArray(list = t[type])) {
            for (i = list.length - 1; i > -1; i--) {
                item = list[i];
                item && item.handler.apply(this, argu);
                item && item.once && list.splice(i, 1);
            }
        }

        return event.returnValue;
    }


    ,
    on: function(type, handler, once) {
            if (!baidu.isFunction(handler)) {
                return this;
            }

            var list, t = this._listeners_;
            !t && (t = this._listeners_ = {});

            type.indexOf("on") && (type = "on" + type);

            !baidu.isArray(list = t[type]) && (list = t[type] = []);
            t[type].unshift({
                handler: handler,
                once: !!once
            });

            return this;
        }
        // 20120928 mz 取消on()的指定key

    ,
    once: function(type, handler) {
        return this.on(type, handler, true);
    },
    one: function(type, handler) {
        return this.on(type, handler, true);
    }


    ,
    off: function(type, handler) {
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
    return window[baidu.guid]._instances[guid];
}



baidu.base.Event = function(type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
    this.preventDefault = function() {
        this.returnValue = false;
    };
};


//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性


/// support magic - Tangram 1.x Code Start



baidu.lang.Class = baidu.base.Class;
//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
//  2011.11.22  meizz   废除 baidu.lang._instances 模块，由统一的global机制完成；


/// support magic - Tangram 1.x Code End



baidu.createClass = function(constructor, type, options) {
    constructor = baidu.isFunction(constructor) ? constructor : function() {};
    options = typeof type == "object" ? type : options || {};

    // 创建新类的真构造器函数
    var fn = function() {
        var me = this;

        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
        options.decontrolled && (me._decontrol_ = true);

        // 继承父类的构造器
        fn.superClass.apply(me, arguments);

        // 全局配置
        for (var i in fn.options) me[i] = fn.options[i];

        constructor.apply(me, arguments);

        for (var i = 0, reg = fn._reg_; reg && i < reg.length; i++) {
            reg[i].apply(me, arguments);
        }
    };

    baidu.extend(fn, {
        superClass: options.superClass || baidu.base.Class

        ,
        inherits: function(superClass) {
            if (typeof superClass != "function") return fn;

            var C = function() {};
            C.prototype = (fn.superClass = superClass).prototype;

            // 继承父类的原型（prototype)链
            var fp = fn.prototype = new C();
            // 继承传参进来的构造器的 prototype 不会丢
            baidu.extend(fn.prototype, constructor.prototype);
            // 修正这种继承方式带来的 constructor 混乱的问题
            fp.constructor = constructor;

            return fn;
        }

        ,
        register: function(hook, methods) {
            (fn._reg_ || (fn._reg_ = [])).push(hook);
            methods && baidu.extend(fn.prototype, methods);
            return fn;
        }

        ,
        extend: function(json) {
            baidu.extend(fn.prototype, json);
            return fn;
        }
    });

    type = baidu.isString(type) ? type : options.className || options.type;
    baidu.isString(type) && (constructor.prototype._type_ = type);
    baidu.isFunction(fn.superClass) && fn.inherits(fn.superClass);

    return fn;
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20121105 meizz   给类添加了几个静态属性方法：.options .superClass .inherits() .extend() .register()


/// support magic - Tangram 1.x Code Start



baidu.lang.createClass = baidu.createClass;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上

/// support magic - Tangram 1.x Code End



baidu.base.inherits = function(subClass, superClass, type) {
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


/// support magic - Tangram 1.x Code Start



baidu.lang.inherits = baidu.base.inherits;

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
/// support magic - Tangram 1.x Code End



baidu.base.register = function(Class, constructorHook, methods) {
    (Class._reg_ || (Class._reg_ = [])).push(constructorHook);

    for (var method in methods) {
        Class.prototype[method] = methods[method];
    }
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129    meizz    添加第三个参数，可以直接挂载方法到目标类原型链上


/// support magic - Tangram 1.x Code Start



baidu.lang.register = baidu.base.register;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129    meizz    添加第三个参数，可以直接挂载方法到目标类原型链上
/// support magic - Tangram 1.x Code End

/// support maigc - Tangram 1.x Code Start



//baidu.lang.isDate = function(o) {
//    // return o instanceof Date;
//    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
//};

baidu.lang.isDate = baidu.isDate;
/// support maigc Tangram 1.x Code End



//baidu.lang.isString = function (source) {
//    return '[object String]' == Object.prototype.toString.call(source);
//};
baidu.lang.isString = baidu.isString;

/// support magic - Tangram 1.x Code Start



baidu.lang.guid = function() {
    return baidu.id();
};

//不直接使用window，可以提高3倍左右性能
//baidu.$$._counter = baidu.$$._counter || 1;


// 20111129    meizz    去除 _counter.toString(36) 这步运算，节约计算量
/// support magic - Tangram 1.x Code End



baidu.object = baidu.object || {};



//baidu.object.extend = function (target, source) {
//    for (var p in source) {
//        if (source.hasOwnProperty(p)) {
//            target[p] = source[p];
//        }
//    }
//    
//    return target;
//};
baidu.object.extend = baidu.extend;



//baidu.lang.isObject = function (source) {
//    return 'function' == typeof source || !!(source && 'object' == typeof source);
//};
baidu.lang.isObject = baidu.isObject;



//baidu.lang.isFunction = function (source) {
// chrome下,'function' == typeof /a/ 为true.
//    return '[object Function]' == Object.prototype.toString.call(source);
//};
baidu.lang.isFunction = baidu.isFunction;



baidu.object.merge = function() {
    function isPlainObject(source) {
        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
    };

    function mergeItem(target, source, index, overwrite, recursive) {
        if (source.hasOwnProperty(index)) {
            if (recursive && isPlainObject(target[index])) {
                // 如果需要递归覆盖，就递归调用merge
                baidu.object.merge(
                    target[index],
                    source[index], {
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

    return function(target, source, opt_options) {
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



baidu.object.isPlain = baidu.isPlainObject;



baidu.createChain = function(chainName, fn, constructor) {
    // 创建一个内部类名
    var className = chainName == "dom" ? "$DOM" : "$" + chainName.charAt(0).toUpperCase() + chainName.substr(1),
        slice = Array.prototype.slice,
        chain = baidu[chainName];
    if (chain) {
        return chain
    }
    // 构建链头执行方法
    chain = baidu[chainName] = fn || function(object) {
        return baidu.extend(object, baidu[chainName].fn);
    };

    // 扩展 .extend 静态方法，通过本方法给链头对象添加原型方法
    chain.extend = function(extended) {
        var method;

        // 直接构建静态接口方法，如 baidu.array.each() 指向到 baidu.array().each()
        for (method in extended) {
            (function(method) { //解决通过静态方法调用的时候，调用的总是最后一个的问题。
                // 20121128 这个if判断是防止console按鸭子判断规则将本方法识别成数组
                if (method != "splice") {
                    chain[method] = function() {
                        var id = arguments[0];

                        // 在新版接口中，ID选择器必须用 # 开头
                        chainName == "dom" && baidu.type(id) == "string" && (id = "#" + id);

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

baidu.createChain('string',
    // 执行方法
    function(string) {
        var type = baidu.type(string),
            str = new String(~'string|number'.indexOf(type) ? string : type),
            pro = String.prototype;
        baidu.forEach(baidu.string.$String.prototype, function(fn, key) {
            pro[key] || (str[key] = fn);
        });
        return str;
    }
);



baidu.merge = function(first, second) {
    var i = first.length,
        j = 0;

    if (typeof second.length === "number") {
        for (var l = second.length; j < l; j++) {
            first[i++] = second[j];
        }

    } else {
        while (second[j] !== undefined) {
            first[i++] = second[j++];
        }
    }

    first.length = i;

    return first;
};



//format(a,a,d,f,c,d,g,c);
baidu.string.extend({
    format: function(opts) {
        var source = this.valueOf(),
            data = Array.prototype.slice.call(arguments, 0),
            toString = Object.prototype.toString;
        if (data.length) {
            data = data.length == 1 ?

                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) : data;
            return source.replace(/#\{(.+?)\}/g, function(match, key) {
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if ('[object Function]' == toString.call(replacer)) {
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
});



baidu.string.extend({
    encodeHTML: function() {
        return this.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
});

/// support magic - Tangram 1.x Code Start



baidu.global.set = function(key, value, overwrite) {
    return baidu.global(key, value, !overwrite);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start



baidu.global.get = function(key) {
    return baidu.global(key);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start



baidu.global.getZIndex = function(key, step) {
    var zi = baidu.global.get("zIndex");
    if (key) {
        zi[key] = zi[key] + (step || 1);
    }
    return zi[key];
};
baidu.global.set("zIndex", {
    popup: 50000,
    dialog: 1000
}, true);
/// support magic - Tangram 1.x Code End



baidu.createChain("fn",

    // 执行方法
    function(fn) {
        return new baidu.fn.$Fn(~'function|string'.indexOf(baidu.type(fn)) ? fn : function() {});
    },

    // constructor
    function(fn) {
        this.fn = fn;
    });



baidu.fn.extend({
    bind: function(scope) {
        var func = this.fn,
            xargs = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
        return function() {
            var fn = baidu.type(func) === 'string' ? scope[func] : func,
                args = xargs ? xargs.concat(Array.prototype.slice.call(arguments, 0)) : arguments;
            return fn.apply(scope || fn, args);
        }
    }
});
/// Tangram 1.x Code Start

baidu.fn.bind = function(func, scope) {
    var fn = baidu.fn(func);
    return fn.bind.apply(fn, Array.prototype.slice.call(arguments, 1));
};
/// Tangram 1.x Code End

/// support maigc - Tangram 1.x Code Start



//baidu.lang.isElement = function (source) {
//    return !!(source && source.nodeName && source.nodeType == 1);
//};
baidu.lang.isElement = baidu.isElement;
/// support maigc - Tangram 1.x Code End



baidu.makeArray = function(array, results) {
    var ret = results || [];
    if (!array) {
        return ret;
    }
    array.length == null || ~'string|function|regexp'.indexOf(baidu.type(array)) ?
        [].push.call(ret, array) : baidu.merge(ret, array);
    return ret;
};



baidu.createChain("array", function(array) {
    var pro = baidu.array.$Array.prototype,
        ap = Array.prototype,
        key;

    baidu.type(array) != "array" && (array = []);

    for (key in pro) {
        //ap[key] || (array[key] = pro[key]);
        array[key] = pro[key];
    }

    return array;
});

// 对系统方法新产生的 array 对象注入自定义方法，支持完美的链式语法
baidu.overwrite(baidu.array.$Array, "concat slice".split(" "), function(key) {
    return function() {
        return baidu.array(Array.prototype[key].apply(this, arguments));
    }
});



baidu.array.extend({
    indexOf: function(match, fromIndex) {
        baidu.check(".+(,number)?", "baidu.array.indexOf");
        var len = this.length;

        // 小于 0
        (fromIndex = fromIndex | 0) < 0 && (fromIndex = Math.max(0, len + fromIndex));

        for (; fromIndex < len; fromIndex++) {
            if (fromIndex in this && this[fromIndex] === match) {
                return fromIndex;
            }
        }

        return -1;
    }
});



baidu.array.extend({
    contains: function(item) {
        return !!~this.indexOf(item);
    }
});



baidu.array.extend({
    remove: function(match) {
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
    filter: function(iterator, context) {
        var result = baidu.array([]),
            i, n, item, index = 0;

        if (baidu.type(iterator) === "function") {
            for (i = 0, n = this.length; i < n; i++) {
                item = this[i];

                if (iterator.call(context || this, item, i, this) === true) {
                    result[index++] = item;
                }
            }
        }
        return result;
    }
});
/// Tangram 1.x Code Start
// TODO: delete in tangram 3.0
baidu.array.filter = function(array, filter, context) {
    return baidu.isArray(array) ? baidu.array(array).filter(filter, context) : [];
};
/// Tangram 1.x Code End



baidu.createChain("event",

    // method
    function() {
        var lastEvt = {};
        return function(event, json) {
            switch (baidu.type(event)) {
                // event
                case "object":
                    return lastEvt.originalEvent === event ?
                        lastEvt : lastEvt = new baidu.event.$Event(event);

                case "$Event":
                    return event;

                    // event type
                    //                case "string" :
                    //                    var e = new baidu.event.$Event( event );
                    //                    if( typeof json == "object" ) 
                    //                        baidu.forEach( e, json );
                    //                    return e;
            }
        }
    }(),

    // constructor
    function(event) {
        var e, t, f;
        var me = this;

        this._type_ = "$Event";

        if (typeof event == "object" && event.type) {

            me.originalEvent = e = event;

            for (var name in e)
                if (typeof e[name] != "function")
                    me[name] = e[name];

            if (e.extraData)
                baidu.extend(me, e.extraData);

            me.target = me.srcElement = e.srcElement || (
                (t = e.target) && (t.nodeType == 3 ? t.parentNode : t)
            );

            me.relatedTarget = e.relatedTarget || (
                (t = e.fromElement) && (t === me.target ? e.toElement : t)
            );

            me.keyCode = me.which = e.keyCode || e.which;

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if (!me.which && e.button !== undefined)
                me.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));

            var doc = document.documentElement,
                body = document.body;

            me.pageX = e.pageX || (
                e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
            );

            me.pageY = e.pageY || (
                e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)
            );

            me.data;
        }

        // event.type
        //        if( typeof event == "string" )
        //            this.type = event;

        // event.timeStamp
        this.timeStamp = new Date().getTime();
    }

).extend({
    stopPropagation: function() {
        var e = this.originalEvent;
        e && (e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true);
    },

    preventDefault: function() {
        var e = this.originalEvent;
        e && (e.preventDefault ? e.preventDefault() : e.returnValue = false);
    }
});

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start



baidu.i18n = baidu.i18n || {};
/// support magic - Tangram 1.x Code End

baidu.i18n.cultures = baidu.i18n.cultures || {};
/// support magic - Tangram 1.x Code End



baidu.i18n.cultures['zh-CN'] = baidu.object.extend(baidu.i18n.cultures['zh-CN'] || {}, function() {
    var numArray = '%u4E00,%u4E8C,%u4E09,%u56DB,%u4E94,%u516D,%u4E03,%u516B,%u4E5D,%u5341'.split(',');
    //
    return {
        calendar: {
            dateFormat: 'yyyy-MM-dd',
            titleNames: '#{yyyy}' + unescape('%u5E74') + '&nbsp;#{MM}' + unescape('%u6708'),
            monthNamesShort: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            monthNames: function() {
                var len = numArray.length,
                    ret = [];
                for (var i = 0; i < 12; i++) {
                    ret.push(unescape(numArray[i] || numArray[len - 1] + numArray[i - len]));
                }
                return ret;
            }(),
            dayNames: function() {
                var key = {
                    mon: 0,
                    tue: 1,
                    wed: 2,
                    thu: 3,
                    fri: 4,
                    sat: 5,
                    sun: '%u65E5'
                };
                for (var i in key) {
                    key[i] = unescape(numArray[key[i]] || key[i]);
                }
                return key;
            }()
        },
        timeZone: 8,
        whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
        number: {
            group: ',',
            groupLength: 3,
            decimal: ".",
            positive: '',
            negative: '-',

            _format: function(number, isNegative) {
                return baidu.i18n.number._format(number, {
                    group: this.group,
                    groupLength: this.groupLength,
                    decimal: this.decimal,
                    symbol: isNegative ? this.negative : this.positive
                });
            }
        },

        currency: {
            symbol: unescape('%uFFE5')
        },

        language: function() {
            var ret = {
                ok: '%u786E%u5B9A',
                cancel: '%u53D6%u6D88',
                signin: '%u6CE8%u518C',
                signup: '%u767B%u5F55'
            };
            for (var i in ret) {
                ret[i] = unescape(ret[i]);
            }
            return ret;
        }()
    };
}());
baidu.i18n.currentLocale = 'zh-CN';

/// support magic - Tangram 1.x Code Start



baidu.date = baidu.date || {};



baidu.createChain('number', function(number) {
    var nan = parseFloat(number),
        val = isNaN(nan) ? nan : number,
        clazz = typeof val === 'number' ? Number : String,
        pro = clazz.prototype;
    val = new clazz(val);
    baidu.forEach(baidu.number.$Number.prototype, function(value, key) {
        pro[key] || (val[key] = value);
    });
    return val;
});



baidu.number.extend({
    pad: function(length) {
        var source = this;
        var pre = "",
            negative = (source < 0),
            string = String(Math.abs(source));

        if (string.length < length) {
            pre = (new Array(length - string.length + 1)).join('0');
        }

        return (negative ? "-" : "") + pre + string;
    }
});



baidu.date.format = function(source, pattern) {
    if ('string' != typeof pattern) {
        return source.toString();
    }

    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }

    var pad = baidu.number.pad,
        year = source.getFullYear(),
        month = source.getMonth() + 1,
        date2 = source.getDate(),
        hours = source.getHours(),
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
            sTimeZone, sTimeOffset,
            millisecond = dateObject.getTime();

        if (sLocale) {
            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
            sTimeOffset = sTimeZone * 60;
        } else {
            sTimeOffset = -1 * dateObject.getTimezoneOffset();
            sTimeZone = sTimeOffset / 60;
        }

        return new Date(sTimeZone != tTimeZone ? (millisecond + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
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



baidu.each = function(enumerable, iterator, context) {
    var i, n, t, result;

    if (typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if (typeof n == "number") {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for (i = 0; i < n; i++) {
                //enumerable[ i ] 有可能会是0
                t = enumerable[i];
                t === undefined && (t = enumerable.charAt && enumerable.charAt(i));
                // 被循环执行的函数，默认会传入三个参数(i, array[i], array)
                result = iterator.call(context || t, i, t, enumerable);

                // 被循环执行的函数的返回值若为 false 和"break"时可以影响each方法的流程
                if (result === false || result == "break") {
                    break;
                }
            }

            // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i = 0; i < enumerable; i++) {
                result = iterator.call(context || i, i, i, i);
                if (result === false || result == "break") {
                    break;
                }
            }

            // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if (enumerable.hasOwnProperty(i)) {
                    result = iterator.call(context || enumerable[i], i, enumerable[i], enumerable);

                    if (result === false || result == "break") {
                        break;
                    }
                }
            }
        }
    }

    return enumerable;
};



//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;



baidu.page = baidu.page || {};
baidu.page.getWidth = function() {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
};

baidu.page.getHeight = function() {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};


baidu.page.getScrollTop = function() {
    var d = document;
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
};


baidu.page.getScrollLeft = function() {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};

baidu.browser = baidu.browser || function() {
    var ua = navigator.userAgent;

    var result = {
        isStrict: document.compatMode == "CSS1Compat",
        isGecko: /gecko/i.test(ua) && !/like gecko/i.test(ua),
        isWebkit: /webkit/i.test(ua)
    };

    try {
        /(\d+\.\d+)/.test(external.max_version) && (result.maxthon = +RegExp['\x241'])
    } catch (e) {};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua):
            result.ie = document.documentMode || +RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua):
            result.chrome = +RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua):
            result.safari = +(RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua):
            result.firefox = +RegExp['\x241'];
            break;

        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua):
            result.opera = +(RegExp["\x244"] || RegExp["\x241"]);
            break;
    }

    baidu.extend(baidu, result);

    return result;
}();

//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;


baidu.page.getViewHeight = function() {
    var doc = document,
        ie = baidu.browser.ie || 1,
        client = doc.compatMode === 'BackCompat' && ie < 9 ? doc.body : doc.documentElement;
    //ie9浏览器需要取得documentElement才能取得到正确的高度
    return client.clientHeight;
};
baidu.page.getViewWidth = function() {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientWidth;
};

(function() {

    baidu.page.getMousePosition = function() {
        return {
            x: baidu.page.getScrollLeft() + xy.x,
            y: baidu.page.getScrollTop() + xy.y
        };
    };

    var xy = {
        x: 0,
        y: 0
    };

    // 监听当前网页的 mousemove 事件以获得鼠标的实时坐标
    baidu.dom(document).mousemove(function(e) {
        e = window.event || e;
        xy.x = e.clientX;
        xy.y = e.clientY;
    });
})();

baidu.extend({
    contains: function(target) {
        return jQuery.contains(this, target);
    }
});

baidu.fx = baidu.fx || {};

baidu.fx.current = function(element) {
    if (!(element = $(element).get(0))) return null;
    var a, guids, reg = /\|([^\|]+)\|/g;

    // 可以向<html>追溯
    do {
        if (guids = element.getAttribute("baidu_current_effect")) break;
    }
    while ((element = element.parentNode) && element.nodeType == 1);

    if (!guids) return null;

    if ((a = guids.match(reg))) {
        //fix
        //在firefox中使用g模式，会出现ture与false交替出现的问题
        reg = /\|([^\|]+)\|/;

        for (var i = 0; i < a.length; i++) {
            reg.test(a[i]);
            //            a[i] = window[baidu.guid]._instances[RegExp["\x241"]];
            a[i] = baidu._global_._instances[RegExp["\x241"]];
        }
    }
    return a;
};

baidu.fx.Timeline = function(options) {
    baidu.lang.Class.call(this);

    this.interval = 16;
    this.duration = 500;
    this.dynamic = true;

    baidu.object.extend(this, options);
};
baidu.lang.inherits(baidu.fx.Timeline, baidu.lang.Class, "baidu.fx.Timeline").extend({


    launch: function() {
        var me = this;
        me.dispatchEvent("onbeforestart");


        typeof me.initialize == "function" && me.initialize();

        me["\x06btime"] = new Date().getTime();
        me["\x06etime"] = me["\x06btime"] + (me.dynamic ? me.duration : 0);
        me["\x06pulsed"]();

        return me;
    }


    ,
    "\x06pulsed": function() {
        var me = this;
        var now = new Date().getTime();
        // 当前时间线的进度百分比
        me.percent = (now - me["\x06btime"]) / me.duration;
        me.dispatchEvent("onbeforeupdate");

        // 时间线已经走到终点
        if (now >= me["\x06etime"]) {
            typeof me.render == "function" && me.render(me.transition(me.percent = 1));

            // [interface run] finish()接口，时间线结束时对应的操作
            typeof me.finish == "function" && me.finish();

            me.dispatchEvent("onafterfinish");
            me.dispose();
            return;
        }


        typeof me.render == "function" && me.render(me.transition(me.percent));
        me.dispatchEvent("onafterupdate");

        me["\x06timer"] = setTimeout(function() {
            me["\x06pulsed"]()
        }, me.interval);
    }

    ,
    transition: function(percent) {
        return percent;
    }


    ,
    cancel: function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];

        // [interface run] restore() 当时间线被撤销时的恢复操作
        typeof this.restore == "function" && this.restore();
        this.dispatchEvent("oncancel");

        this.dispose();
    }


    ,
    end: function() {
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
    timeline["\x06original"] = {}; // 20100708
    var catt = "baidu_current_effect";


    timeline.addEventListener("onbeforestart", function() {
        var me = this,
            guid;
        me.attribName = "att_" + me.__type.replace(/\W/g, "_");
        guid = $(me.element).attr(catt);
        $(me.element).attr(catt, (guid || "") + "|" + me.guid + "|", 0);

        if (!me.overlapping) {
            (guid = $(me.element).attr(me.attribName)) && baiduInstance(guid).cancel();

            //在DOM元素上记录当前效果的guid
            $(me.element).attr(me.attribName, me.guid, 0);
        }
    });


    timeline["\x06clean"] = function(e) {
        var me = this,
            guid;
        if (e = me.element) {
            e.removeAttribute(me.attribName);
            guid = e.getAttribute(catt);
            guid = guid.replace("|" + me.guid + "|", "");
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

            s[i] = v; // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!v && s.removeAttribute) s.removeAttribute(i); // IE
            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    return timeline;
};



/// support magic - support magic - Tangram 1.x Code End



baidu.fx.scrollBy = function(element, distance, options) {
    if (!(element = $(element).get(0)) || typeof distance != "object") return null;

    var d = {},
        mm = {};
    d.x = distance[0] || distance.x || 0;
    d.y = distance[1] || distance.y || 0;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize: function() {
            var t = mm.sTop = element.scrollTop;
            var l = mm.sLeft = element.scrollLeft;

            mm.sx = Math.min(element.scrollWidth - element.clientWidth - l, d.x);
            mm.sy = Math.min(element.scrollHeight - element.clientHeight - t, d.y);
        }

        //[Implement Interface] transition
        ,
        transition: function(percent) {
            return 1 - Math.pow(1 - percent, 2);
        }

        //[Implement Interface] render
        ,
        render: function(schedule) {
            element.scrollTop = (mm.sy * schedule + mm.sTop);
            element.scrollLeft = (mm.sx * schedule + mm.sLeft);
        }

        ,
        restore: function() {
            element.scrollTop = mm.sTop;
            element.scrollLeft = mm.sLeft;
        }
    }, options), "baidu.fx.scroll");

    return fx.launch();
};

/// support magic - Tangram 1.x Code End



baidu.fx.scrollTo = function(element, point, options) {
    if (!(element = $(element).get(0)) || typeof point != "object") return null;

    var d = {};
    d.x = (point[0] || point.x || 0) - element.scrollLeft;
    d.y = (point[1] || point.y || 0) - element.scrollTop;

    return baidu.fx.scrollBy(element, d, options);
};



(function() {
    var dragging = false,
        target, // 被拖曳的DOM元素
        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
    baidu.dom.drag = function(element, options) {
            if (!(target = baidu.dom(element))) {
                return false;
            }
            op = baidu.object.extend({
                autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
                capture: true, // 鼠标拖曳粘滞
                interval: 16 // 拖曳行为的触发频度（时间：毫秒）
            }, options);
            lastLeft = left = target.css('left').replace('px', '') - 0 || 0;
            lastTop = top = target.css('top').replace('px', '') - 0 || 0;
            dragging = true;
            setTimeout(function() {
                var mouse = baidu.page.getMousePosition(); // 得到当前鼠标坐标值
                ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
                oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
                clearInterval(timer);
                timer = setInterval(render, op.interval);
            }, 1);
            // 这项为 true，缺省在 onmouseup 事件终止拖曳
            var tangramDom = baidu(document);
            op.autoStop && tangramDom.on('mouseup', stop);
            // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
            tangramDom.on('selectstart', unselect);
            // 设置鼠标粘滞
            if (op.capture && target.setCapture) {
                target.setCapture();
            } else if (op.capture && window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            // fixed for firefox
            mozUserSelect = document.body.style.MozUserSelect;
            document.body.style.MozUserSelect = 'none';
            baidu.isFunction(op.ondragstart) && op.ondragstart(target, op);
            return {
                stop: stop,
                dispose: stop,
                update: function(options) {
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
                window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            }
            // 拖曳时网页内容被框选
            document.body.style.MozUserSelect = mozUserSelect;
            var tangramDom = baidu.dom(document);
            tangramDom.off('selectstart', unselect);
            op.autoStop && tangramDom.off('mouseup', stop);
            // ondragend 事件
            baidu.isFunction(op.ondragend) && op.ondragend(target, op, {
                left: lastLeft,
                top: lastTop
            });
        }
        // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
            if (!dragging) {
                clearInterval(timer);
                return;
            }
            var rg = op.range || [],
                mouse = baidu.page.getMousePosition(),
                el = left + mouse.x - ox,
                et = top + mouse.y - oy;

            // 如果用户限定了可拖动的范围
            if (baidu.isObject(rg) && rg.length == 4) {
                el = Math.max(rg[3], el);
                el = Math.min(rg[1] - target.outerWidth(), el);
                et = Math.max(rg[0], et);
                et = Math.min(rg[2] - target.outerHeight(), et);
            }
            target.css('left', el + 'px');
            target.css('top', et + 'px');
            lastLeft = el;
            lastTop = et;
            baidu.isFunction(op.ondrag) && op.ondrag(target, op, {
                left: lastLeft,
                top: lastTop
            });
        }
        // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();

baidu.fx.move = function(element, options) {
    if (!(element = $(element).get(0)) || $(element).css("position") == "static") return null;

    options = baidu.object.extend({
        x: 0,
        y: 0
    }, options || {});
    if (options.x == 0 && options.y == 0) return null;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize: function() {
            this.protect("top");
            this.protect("left");

            this.originX = parseInt($(element).css("left")) || 0;
            this.originY = parseInt($(element).css("top")) || 0;
        }

        //[Implement Interface] transition
        ,
        transition: function(percent) {
            return 1 - Math.pow(1 - percent, 2);
        }

        //[Implement Interface] render
        ,
        render: function(schedule) {
            element.style.top = (this.y * schedule + this.originY) + "px";
            element.style.left = (this.x * schedule + this.originX) + "px";
        }
    }, options), "baidu.fx.move");

    return fx.launch();
};

baidu.fx.moveTo = function(element, point, options) {
    if (!(element = $(element)) || element.css("position") == "static" || typeof point != "object") return null;

    var p = [point[0] || point.x || 0, point[1] || point.y || 0];
    var x = parseInt($(element).css("left")) || 0;
    var y = parseInt($(element).css("top")) || 0;

    var fx = baidu.fx.move(element, baidu.object.extend({
        x: p[0] - x,
        y: p[1] - y
    }, options || {}));

    return fx;
};

baidu.string.extend({
    trim: function() {
        return jQuery.trim(this);
    }
});