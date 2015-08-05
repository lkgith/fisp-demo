var baidu = require("./tangram.js");
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

module.exports = magic;