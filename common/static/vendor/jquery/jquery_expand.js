/**
 * Created by hejie on 14-7-12.
 */
!(function(w){
    var $ = require('common:static/vendor/jquery/jquery.js'),
        T = $;
    //cookie
    $.extend({
        cookie:{
            _isValidKey : function (key) {
                // http://www.w3.org/Protocols/rfc2109/rfc2109
                // Syntax:  General
                // The two state management headers, Set-Cookie and Cookie, have common
                // syntactic properties involving attribute-value pairs.  The following
                // grammar uses the notation, and tokens DIGIT (decimal digits) and
                // token (informally, a sequence of non-special, non-white space
                // characters) from the HTTP/1.1 specification [RFC 2068] to describe
                // their syntax.
                // av-pairs   = av-pair *(";" av-pair)
                // av-pair    = attr ["=" value] ; optional value
                // attr       = token
                // value      = word
                // word       = token | quoted-string

                // http://www.ietf.org/rfc/rfc2068.txt
                // token      = 1*<any CHAR except CTLs or tspecials>
                // CHAR       = <any US-ASCII character (octets 0 - 127)>
                // CTL        = <any US-ASCII control character
                //              (octets 0 - 31) and DEL (127)>
                // tspecials  = "(" | ")" | "<" | ">" | "@"
                //              | "," | ";" | ":" | "\" | <">
                //              | "/" | "[" | "]" | "?" | "="
                //              | "{" | "}" | SP | HT
                // SP         = <US-ASCII SP, space (32)>
                // HT         = <US-ASCII HT, horizontal-tab (9)>

                return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
            },
            getRaw : function (key) {
                if ($.cookie._isValidKey(key)) {
                    var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
                        result = reg.exec(document.cookie);

                    if (result) {
                        return result[2] || null;
                    }
                }

                return null;
            },
            get : function (key) {
                var value = T.cookie.getRaw(key);
                if ('string' == typeof value) {
                    value = decodeURIComponent(value);
                    return value;
                }
                return null;
            },
            setRaw : function (key, value, options) {
                if (!$.cookie._isValidKey(key)) {
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
            },
            remove : function (key, options) {
                options = options || {};
                options.expires = new Date(0);
                T.cookie.setRaw(key, '', options);
            },
            set : function (key, value, options) {
                T.cookie.setRaw(key, encodeURIComponent(value), options);
            }
        }
    });
    //type
    $.extend({
        "typeof" : (function() {
            var objectType = {},result = {},
                nodeType = [, "HTMLElement", "Attribute", "Text", , , , , "Comment", "Document", , "DocumentFragment", ],
                str = "Array Boolean Date Error Function Number RegExp String",
                retryType = {'object': 1, 'function': '1'},//解决safari对于childNodes算为function的问题
                toString = objectType.toString;

            // 给 objectType 集合赋值，建立映射
            $.each(str.split(" "), function(idx,name) {
                objectType[ "[object " + name + "]" ] = name.toLowerCase();
                result[ "is" + name ] = function ( unknow ) {
                    return $["typeof"](unknow) == name.toLowerCase();
                }
            });
            $.extend(result);
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
        })()
    });
    $.extend({
        string:{
            escapeReg : function (s) {
                return s.replace(new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), '\\\x241');
            },
            widthstr : function(s, count) {
                if (!s) return s;
                var num = count*2, index = 0, i = 0;
                for (var len = s.length; i<len; i++) {
                    var step = (s.charCodeAt(i)>0 && s.charCodeAt(i)<255) ? 1 : 2;
                    if (index+step>num) {
                        break;
                    }
                    index += step;
                }
                return (s.substr(0, i)+((i==len)?'':'..'));
            }
        }
    });
    //url
    $.extend({
        url:{
            getQueryValue : function (url, key) {
                var reg = new RegExp(
                    "(^|&|\\?|#)"
                        + $.string.escapeReg(key)
                        + "=([^&#]*)(&|\x24|#)",
                    "");
                var match = url.match(reg);
                if (match) {
                    return match[2];
                }
                return null;
            },
            jsonToQuery : function (json, replacer_opt) {
                var result = [],
                    itemLen,
                    replacer = replacer_opt || function (value) {
                        return $.url.escapeSymbol(value);
                    };

                $.each(json, function(key,item){
                    // 这里只考虑item为数组、字符串、数字类型，不考虑嵌套的object
                    if ($.isArray(item)) {
                        itemLen = item.length;
                        // value的值需要encodeURIComponent转义吗？
                        // FIXED 优化了escapeSymbol函数
                        while (itemLen--) {
                            result.push(key + '=' + replacer(item[itemLen], key));
                        }
                    } else {
                        result.push(key + '=' + replacer(item, key));
                    }
                });

                return result.join('&');
            },
            queryToJson : function(url){
                var params = url.substr(url.lastIndexOf('?') + 1).split('&'),
                    len = params.length,
                    ret = null, entry, key, val;
                for(var i = 0; i < len; i++){
                    entry = params[i].split('=');
                    if(entry.length < 2){continue;}
                    !ret && (ret = {});
                    key = entry[0];
                    val = entry[1];
                    entry = ret[key];
                    if(!entry){
                        ret[key] = val;
                    }else if($.isArray(entry)){
                        entry.push(val);
                    }else{// 这里只可能是string了
                        ret[key] = [entry, val];
                    }
                }
                return ret;
            },
            escapeSymbol : function(source) {
                //发现在ie下无法匹配中文全角空格和纵向指标符\v，所以改\s为\f\r\n\t\v以及中文全角空格和英文空格
                //但是由于ie本身不支持纵向指标符\v,故去掉对其的匹配，保证各浏览器下效果一致
                return String(source).replace(/[#%&\+=\/\\\s\u3000\f\r\n\t]/g, function(txt){
                    txt = txt.charCodeAt();
                    return txt === 0x3000 ? '%E3%80%80' : '%' + (0x100 + txt).toString(16).substring(1).toUpperCase();
                });
            }
        }
    });
    //log
    $.extend({
        log : function(url) {
            var url = url||'';
            var img = new Image(),
                key = '_log_' + Math.floor(Math.random() *
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
    //format
    $.extend({
        stringFormat : function (src,opts) {
            var source = src,
                data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
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
        },
        dateFormat:function(source,pattern){
            if ('string' != typeof pattern) {
                return source.toString();
            }

            function replacer(patternPart, result) {
                pattern = pattern.replace(patternPart, result);
            }

            var pad     = $.numberPad,
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
        },
        numberPad:function(source,length){
            var pre = "",
                negative = (source < 0),
                string = String(Math.abs(source));

            if (string.length < length) {
                pre = (new Array(length - string.length + 1)).join('0');
            }
            return (negative ?  "-" : "") + pre + string;
        }
    })
	//增加cacheScript方法，getScript会自动加时间戳，不利于缓存
	$.extend({
		cacheScript : function (url, options){
			var options = $.extend(options || {},{
				dataType :	"script",
				cache	 :	true,
				url		 :	url
			});
			return $.ajax(options);
		}
	});
    //设为全局变量
    w.$ = w.jQuery = $;
})(window);
