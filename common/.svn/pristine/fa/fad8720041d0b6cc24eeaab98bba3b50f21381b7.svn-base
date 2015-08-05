/**
 * base
 */
var _ = require("common:static/vendor/underscore/underscore.js");
var blankFn = function() {};
/**
 * Events
 */
var Events = exports.Events = function() {};
Events.defaultNS = "__default";
Events._getNameAndNamespane = function(name) {
    var ns;
    name = name.replace(/\s/g, "").split(".");
    if (name.length > 2) {
        name = name.join(".");
    } else {
        ns = name[1];
        name = name[0];
    }
    return [ name, ns ];
};
Events.prototype.on = function(name, callback) {
    if (!callback) throw new Error("callback should be given");
    this.eventsList || (this.eventsList = []);
    name = Events._getNameAndNamespane(name);
    var ns = name[1] || Events.defaultNS;
    name = name[0];
    var list = this.eventsList[name] || (this.eventsList[name] = {});
    list[ns] || (list[ns] = []);
    list[ns].push(callback);
};
Events.prototype.off = function(name, callback) {
    this.eventsList || (this.eventsList = []);
    var lists = this.eventsList;
    if (!name && !callback) {
        for (var evt in lists) {
            delete lists[evt];
        }
        return;
    }
    name = Events._getNameAndNamespane(name);
    var ns = name[1] || Events.defaultNS;
    name = name[0];
    var evts = lists[name];
    if (!evts) return;
    if (!ns) {
        delete lists[name];
        return;
    }
    if (!(evts[ns] && evts[ns].length)) return;
    if (!callback) {
        delete evts[ns];
        return;
    }
    var evtNs = evts[ns];
    for (var i = 0, len = evtNs.length; i < len; i++) {
        if (evtNs[i] === callback) evtNs.splice(i, 1);
    }
};
Events.prototype.emit = function(name) {
    this.eventsList || (this.eventsList = []);
    name = Events._getNameAndNamespane(name);
    var ns = name[1];
    name = name[0];
    var data = [].slice.call(arguments, 1);
    var evts = this.eventsList[name];
    if (!ns) {
        for (var n in evts) {
            for (var i = 0, len = evts[n].length; i < len; i++) {
                var _evt = evts[n][i];
                _evt && _evt.apply(null, data);
            }
        }
        return;
    }
    if (!evts || !(evts[ns] && evts[ns].length)) return;
    var evtNs = evts[ns];
    for (var i = 0, len = evtNs.length; i < len; i++) {
        evtNs[i] && evtNs[i].apply(null, data);
    }
};
Events.prototype.once = function(name, callback) {
    var self = this, fn = function() {
        self.off(name, fn);
        callback.apply(null, arguments);
    };
    this.on(name, fn);
};
Events.prototype.add = Events.prototype.on;
Events.prototype.trigger = Events.prototype.emit;
/**
 * 实例化Observer
 */
exports.Observer = new Events();

(function() {
    // Class
    // -----------------
    // Thanks to:
    // - http://mootools.net/docs/core/Class/Class
    // - http://ejohn.org/blog/simple-javascript-inheritance/
    // - https://github.com/ded/klass
    // - http://documentcloud.github.com/backbone/#Model-extend
    // - https://github.com/joyent/node/blob/master/lib/util.js
    // - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
    // The base Class implementation.
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && isFunction(o)) {
            return classify(o);
        }
    }
    var Klass = Class;
    // Create a new Class.
    //
    // var SuperPig = Class.create({
    // Extends: Animal,
    // Implements: Flyable,
    // initialize: function() {
    // SuperPig.superclass.initialize.apply(this, arguments)
    // },
    // Statics: {
    // COLOR: 'red'
    // }
    // })
    //
    Class.create = function(parent, properties) {
        if (!isFunction(parent)) {
            properties = parent;
            parent = null;
        }
        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;
        // The created class constructor
        function SubClass() {
            // Call the parent constructor.
            parent.apply(this, arguments);
            // Only call initialize in self constructor.
            if (this.constructor === SubClass && this.init) {
                this.init.apply(this, arguments);
            }
        }
        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            mix(SubClass, parent, parent.StaticsWhiteList);
        } else {
            mix(SubClass.prototype, Events.prototype);
        }
        // Add instance properties to the subclass.
        implement.call(SubClass, properties);
        // Make subclass extendable.
        return classify(SubClass);
    };
    function implement(properties) {
        var key, value;
        for (key in properties) {
            value = properties[key];
            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }
    // Create a sub Class based on `Class`.
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;
        return Class.create(properties);
    };
    Class.prototype.proxy = function() {
        var _this = this, _slice = [].slice, func = arguments[0], args = _slice.call(arguments, 1);
        return function() {
            return func.apply(_this, args.concat(_slice.call(arguments)));
        };
    };
    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }
    // Mutators define special properties.
    Class.Mutators = {
        Extends: function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);
            // Keep existed properties.
            mix(proto, existed);
            // Enforce the constructor to be what we expect.
            proto.constructor = this;
            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;
            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.__super__ = parent.prototype;
        },
        Implements: function(items) {
            isArray(items) || (items = [ items ]);
            var proto = this.prototype, item;
            while (item = items.shift()) {
                mix(proto, item.prototype || item);
            }
        },
        Statics: function(staticProperties) {
            mix(this, staticProperties);
        }
    };
    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {}
    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ? function(proto) {
        return {
            __proto__: proto
        };
    } : function(proto) {
        Ctor.prototype = proto;
        return new Ctor();
    };
    // Helpers
    // ------------
    function mix(r, s, wl) {
        // Copy "all" properties including inherited ones.
        for (var p in s) {
            if (s.hasOwnProperty(p)) {
                if (wl && indexOf(wl, p) === -1) continue;
                // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
                if (p !== "prototype") {
                    r[p] = s[p];
                }
            }
        }
    }
    var toString = Object.prototype.toString;
    var isArray = Array.isArray || function(val) {
        return toString.call(val) === "[object Array]";
    };
    var isFunction = function(val) {
        return toString.call(val) === "[object Function]";
    };
    var indexOf = Array.prototype.indexOf ? function(arr, item) {
        return arr.indexOf(item);
    } : function(arr, item) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    };

    var eventSplitter = /^(\S+)\s*(.*)$/;
    CommonController = Klass.create({
        init: function(opt) {
            opt = opt || {};
            this.$ = $;
            this.el = this.$(opt.el || document.body);
            this.delegateEvents();
            this.refreshElements();
        },

        tpls: {},

        getTpl: function(name){
            return this.tpls[name]
        },

        refreshElements: function() {
            var key, value, _ref, _results;
            _ref = this.elements;
            _results = [];
            for (key in _ref) {
                value = _ref[key];
                _results.push(this[value] = this.el.find(key));
            }
            return _results;
        },
        delegateEvents: function(eventName, selector) {
            if (eventName && selector) {
                this.el.on(selector, eventName);
                return;
            }
            var events = this.events;
            var eventName, key, match, method, selector, _this = this;
            for (key in events) {
                method = events[key];
                if (typeof method === "function") {
                    method = this.proxy(method);
                } else {
                    if (!this[method]) {
                        throw new Error("" + method + " doesn't exist");
                    }
                    method = this.proxy(this[method]);
                }
                match = key.match(eventSplitter);
                eventName = match[1];
                selector = match[2];
                if (selector === "") {
                    this.el.on(eventName, method);
                } else {
                    this.el.on(eventName, selector, method);
                }
            }
        },
        undelegateEvents: function(eventName, selector) {
            if (eventName) {
                if (selector) {
                    this.el.off(eventName, selector);
                    return;
                }
                this.el.off(eventName);
                return;
            }
            var events = this.events;
            for (var key in events) {
                var match = key.match(eventSplitter), eventName = match[1], selector = match[2];
                if (!selector) {
                    this.el.off(eventName);
                } else {
                    this.el.off(eventName, selector);
                }
            }
        },

        dispose: function(){
            this.off();
            this.undelegateEvents();
            this.el && this.el.remove();
        }
    });
    CommonController.sub = function(instances, statics) {
        if (instances && isFunction(instances.init)) {
            var _init = instances.init;
            instances.init = function() {
                ret.__super__.init.apply(this, arguments);

                _init.apply(this, arguments);
            };
        }
        var ret = CommonController.extend(instances);
        return ret;
    };
    this.CommonController = CommonController;
    this.CC = CommonController;
    this.Klass = Klass;
}).call(exports);

/*underscore*/

exports._ = _;
