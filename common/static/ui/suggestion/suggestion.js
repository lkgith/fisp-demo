/**
 * bdvSug
 */

var sugUtils = require("./sugUtils.js"),
    myNewSug = new sugUtils({key: 'newsug'});
var sugConf = require("./sugConf.js");
var baidu = require("./tangram.js");
var magic = require("./magic.js");
var T = $;
var APIS = sugConf.APIS;

var vipInfo = require("common:static/ui/vipInfo/vipInfo.js");

var tpls = {
    sug: __inline("./sug.tmpl"),
    sugHot: __inline("./sugHot.tmpl")
}
// 默认配置
var sugOptions = {};
// 本地缓存作品数据
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
                if($(input_el).hasClass('place-holder')){
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
            sugOptions.num = 4;
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
                    clearPreQuery();
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
                me._objAjax = $.ajax({
                    url: APIS.sug + "?wd="+encodeURIComponent(query)+"&json=1&predict=1&mod=11&istype=1&cb=?&prod=video_ala",
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
                $form.removeProp("target");
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
        //me.hideVideoItem();
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
        //if(!myNewSug.isIE67){
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
                (me.currentData.length > sugOptions.num) && (me.currentData.length = sugOptions.num);
                me.dataCache = me.currentData;
                me.enableIndexs = [];
                for(var i=0;i<me.currentData.length;i++){
                    me.enableIndexs.push(i);
                }
                myNewSug.log('http://nsclick.baidu.com/p.gif?pid=104&tpl=history_sug&searchpage=&wd='+this.currentQuery+'&sug='+this.oldInputValue+'&li='+this.selectedIndex);
            }
        //}

        var tpl = me.getInputValue()? tpls.sug: tpls.sugHot;
        var html = tpl({
            me: me,
            data: me.currentData,
            query: me.currentQuery,
            videoTypes: sugConf.videoTypes,
            domain: sugOptions.domain
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
            // 第5个为广告，广告内容不插入文本框
            if (!returnData.url || (returnData.url && index !=4)){
                me.getElement("input").value = returnData.value;
            }

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
        var me = this;
        $.ajax({
            url: sugConf.APIS.sug + '?wd=' + encodeURIComponent(query) + '&prod=video_ala&oe=utf-8',
            scriptCharset: "gb2312",
            jsonp: "cb",
            dataType: 'jsonp',
            crossDomain: true,
            success: function(data){
                if ( data && data.q && data.s ) {
                    var querys = data.s.length > sugOptions.num?
                                    data.s.splice(0, sugOptions.num): data.s;
                    me.receiveData(data.q, querys);
                }
            }
        });
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
                    'meta': split[1] ? JSON.parse(split[1]) : null
                });
            }
        }
        return _data;
    },

    //向服务器请求热搜榜数据
    getHotData: function () {
        var me = this;

        T.ajax({
            url: APIS.hotlist,
            crossDomain: true,
            dataType: "jsonp",
            jsonpCallback: "videoHotlistMIS",
            success: function(result){
                if (result && result[0] && result[0].data && result[0].data.videos) {
                    me.receiveHotData(result[0].data.videos);
                }
            }
        });

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
sugOptions = {
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
        if(this.currentQuery){
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

            var formParams = $form.serialize();
            if (evt.eventType == "keydown"){
                window._bdvSearchLogType = "enter";
            }
            sug.getElement('input').blur();
            bdvQuickSearch.trigger("search", evt.value, formParams);
        } else {
            if(data.newClass){
                myNewSug.log('http://nsclick.baidu.com/v.gif?pid=104&tpl=history_sug&searchpage=&wd='+this.currentQuery+'&sug='+this.oldInputValue+'&li='+this.selectedIndex);
            }

            if ( sugOptions.delay ) { //在点击后延迟触发时，会引起浏览器广告拦截策略，因此target改为默认
                setTimeout(function() { // 不过在新打开弹窗时也不太需要延迟执行submit，log会正常发出
                    $form.prop("target", "_self");
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
function init(bdvSugConfig) {
    if ( typeof bdvSugConfig === 'object' ) {
        baidu.object.extend(sugOptions, bdvSugConfig);
    }
    if ( baidu('#' + sugOptions.form + ', #' + sugOptions.input).length === 2 ) {
        createSuggestion();
    }
}

module.exports = init;