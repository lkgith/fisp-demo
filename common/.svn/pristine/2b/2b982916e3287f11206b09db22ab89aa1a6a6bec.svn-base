var T = $,
    cookie = T.cookie,
    log = T.log,
    stringFormat = T.stringFormat,
    // 登录组件
     bdPassPop = require('common:static/ui/bdPassPop/bdPassPop.js');

// 逻辑相关
var bdvTraceCore = require('common:static/ui/bdvTrace/core/core.js'),
    bdvTraceConfig = require('common:static/ui/bdvTrace/config/config.js'),
    ugcRpTrack = require('common:static/ui/bdvTrace/ugcRpTrack/ugcRpTrack.js');

// 组件工具
var eventCenter = require('common:static/ui/eventcenter/eventcenter.js'),
    loginCheck = require('common:static/ui/loginCheck/loginCheck.js'),
    tpl = require('common:static/vendor/underscore/underscore.js').template;

var delay = bdvTraceCore.delay,
    uLogStr = 'http://nsclick.baidu.com/u.gif?pid=104',
    vLogStr = 'http://nsclick.baidu.com/v.gif?pid=104';

/* ------------------------------------------------------------------------------------------------------------------ */
// 登录浮层
function showLoginDialog() {
     bdPassPop.show(function() {
            setTimeout(function() {
                    log(vLogStr + '&stp=new_login');
                    location.reload();
                }, 200);
      });
}

/* ------------------------------------------------------------------------------------------------------------------ */
/**
 * 追剧主 UI
 * @param {Object} model BdvTraceCore 实例
 * @param {Object} options 配置信息
 */
var BdvTrace = function (model, options) {
    if (!model) {
        throw new Error('Creating BdvTrace with empty model.');
    }
    this.model = model;

    options = options || {};
    this.enableCarousel = typeof options.enableCarousel !== 'undefined' ? options.enableCarousel : true;
    this.isUgcRpTrack = typeof options.isUgcRpTrack !== 'undefined' ? options.isUgcRpTrack : false;
    this.isLogin = this.model.isLogin;
    this.frp = options.frp; // 导入详情页的后缀
    this._hasCreatedCarousel = false;
    this._isVisible = false; // 组件显示状态
    this._isEmpty = false; // 追剧数据是否为空
    this._isUserTrigger = false; // 是否用户触发的操作
    this._initialize();
}
BdvTrace.prototype = {
    _initialize: function () {
        this._bindEl();
        this._isVisible = this.$main.style.display !== 'none';

        this._bindEvent();

        if (this.isLogin) {
            this.$content.innerHTML = '';
        }
    },
    _bindEl: function () {
        this.$el = $('#bdvTrace')[0];
        if (this.isUgcRpTrack) { // 日志标记 track
            this.$el.setAttribute('static', this.$el.getAttribute('static') + '&track=1');
        }

        this.$login = $('.bdv-trace-login', this.$el)[0];
        this.$toggle = $('.bdv-trace-toggle', this.$el)[0];
        this.$notify = $('.bdv-trace-notify', this.$el)[0];

        this.$main = $('.bdv-trace-main', this.$el)[0];
        this.$content = $('.bdv-trace-content', this.$el)[0];

        this.$bdvRecord = $('#bdvRecord'); // 播放记录相关元素
        if (this.$bdvRecord) {
            this.$bdvRecordToggle = $('.bdv-record-toggle', this.$bdvRecord)[0];
            this.$bdvRecordMain = $('.bdv-record-main', this.$bdvRecord)[0];
        }
    },
    _bindEvent: function () {
        var me = this,
            isPlainToggle = me.isUgcRpTrack ? function () {
                return me._isEmpty; // 需要先请求追剧接口，确认有无数据后再赋予变量值
            } : function () {
                return !me.isLogin || me._isEmpty; // 未登录或追剧数据为空
            };

        // 追剧 link
        T(me.$toggle).on('click', function (evt) {
            evt.preventDefault();

            if (isPlainToggle()) {
                me[ me._isVisible ? 'hide' : 'show' ]();
            } else if (!me._isLoading) { // 请求尚在加载中则退出
                if (me._isVisible) {
                    me.hide();
                } else {
                    me._isUserTrigger = true;
                    me.model.list();
                }
            }
        });

        // 记录 link
        me.$bdvRecordToggle && T(me.$bdvRecordToggle).on('click', function (evt) {
            evt.preventDefault();
            me.hide();
        });

        // 关闭 x
        /*event.on(me.$close, 'click', function (evt) {
            event.preventDefault(evt);
            me.hide();
        });*/

        // 登录 link
        me.$login && T(me.$login).on('click', function (evt) {
            evt.preventDefault();
            showLoginDialog();
            me.hide();
        });

        me._bindInnerEvent();
        me._bindOuterEvent();
    },
    _bindInnerEvent: function () {
        var me = this;

        // 渲染
        me.model.on('render', function (evt) {
            T.extend(me, evt.pageMeta); // 分页信息：pageNo、pageSize、pages、size
            if (me._isUserTrigger || me._isVisible) { // 渲染条件：用户触发或者组件已展示
                me._render(evt.pageData);
            }
        });

        // 提示更新
        me.model.on('notify', function () {
            // console.log('on.notify');
            // me.$notify.style.display = 'block'; // TODO: 小红点的规则需要重新梳理
            me.show();
        });

        // 关闭提示更新
        /*me.model.on('clearNotify', function () {
            me.$notify.style.display = 'none';
        }*/
    },
    _bindOuterEvent: function () {
        var me = this;

        // 展示订阅列表
        eventCenter.attach('bdvTrace.list', function (opt) {
            if (me.isLogin) {
                me._isUserTrigger = true;
                me.model.list(opt.params);
            } else {
                me.show();
            }
        });

        // 订阅
        eventCenter.attach('bdvTrace.add', function (opt) {
            if (me.isLogin) {
                me._isUserTrigger = true;
                me.model.add(opt.params, opt.callback);
            } else {
                showLoginDialog();
            }
        });

        // 退订
        eventCenter.attach('bdvTrace.del', function (opt) {
            if (!me.isLogin && me._isEmpty) { // 未登录并且没数据（track-pc 的数据）
                showLoginDialog();
            } else {
                me._isUserTrigger = true;
                me.model.del(opt.params, opt.callback);
            }
        });
    },
    /**
     * 展示
     * @param {Boolean} forcible
     */
    show: function (forcible) {
        if (this._isVisible && forcible !== true) {
            return;
        }

        // this._hideRecord(); // 追剧浮层展开前先关闭播放记录浮层
        this.$toggle.setAttribute('static', 'stp=toggle&toggle=0'); // 取反，0为关闭
        $(this.$el).addClass('bdv-trace-show');

        // 外部 UI：carousel 组件，追剧数据为空时忽略外部组件。
        var isExternal = this.enableCarousel && !this._isEmpty;
        if (!this.isLogin) { // 非登录时检查是否命中 ugcRpTrack
            isExternal = isExternal && this.isUgcRpTrack;
        }

        // console.log('show.isExternal: ', isExternal);
        // UI 相关控制
        if (!isExternal) { // 内部 UI：浮层组件
            this.$main.style.display = 'block';
        }

        this._isVisible = true;

        if (!this.isLogin) { // 未登录时的展现日志
            delay(function () {
                log(uLogStr);
            }, 0);
        }
    },
    hide: function () {
        if (!this._isVisible) {
            return;
        }

        this.$toggle.setAttribute('static', 'stp=toggle&toggle=1'); // 取反，1为展开

        // 隐藏组件时不需要考虑是外部还是内部，统一隐藏即可。
        // 外部 UI carousel 组件
        eventCenter.trigger('bdvTraceCarousel.hide');
        // 内部 UI 浮层组件
        $(this.$el).removeClass('bdv-trace-show');
        this.$main.style.display = 'none';

        this._isVisible = false;
    },
    // 隐藏播放记录浮层
    _hideRecord: function () {
        if (this.$bdvRecordMain && this.$bdvRecordMain.style.display !== 'none') {
            this.$bdvRecordMain.style.display = 'none';
        }
    },
    /**
     * 渲染
     * @param {Array} pageData
     */
    _render: function (pageData) {
        var me = this,
            logParams = [];

        // 无订阅数据
        if (me.pageNo == 1 && (!pageData || pageData.length === 0)) {
            me._isEmpty = true;
            logParams.push('data=0');
            me._renderNone();
        } else if (pageData && pageData.length) { // 有数据
            logParams.push('data=1');
            if (me.enableCarousel) { // 外部 UI
                if (!me._hasCreatedCarousel) { // 是否已创建 bdvTraceCarousel
                    eventCenter.trigger('bdvTraceCarousel.create', {
                        once: true,
                        isUgcRpTrack: me.isUgcRpTrack,
                        model: me.model
                    });
                    me._hasCreatedCarousel = true;
                }

                eventCenter.trigger('bdvTraceCarousel.page', {
                    frp: me.frp,
                    pageData: pageData,
                    pageMeta: { pageNo: me.pageNo, pages: me.pages, size: me.size },
                    recGroups: me.model.recGroups
                });
                me.show();
                logParams.push('fr=carousel');
            } else { // 内部 UI
                if (!me.$bd) { // 未初始化分页或被重置
                    me._initPage();
                } else {
                    me.$bd.innerHTML = ''; // 清空列表
                }

                var tplData = {
                        frp: me.frp,
                        pageData: pageData,
                        func: { getPlayUrl: bdvTraceConfig.getPlayUrl }
                    },
                    htm = '';

                try {
                    htm = tpl(T('#bdvTraceItemTpl').html(), tplData);
                    me.$bd.innerHTML = htm;
                    me._rendered();
                } catch (e) {
                    // console.dir(e);
                }
            }
        }

        // 展现日志
        delay(function () {
            log(uLogStr + '&' + logParams.join('&'));
        }, 0);
    },
    // 初始化分页组件
    _initPage: function () {
        $(this.$content).removeClass('bdv-trace-none');
        this.$content.innerHTML = $('#bdvTraceBdTpl')[0].innerHTML;

        // 元素
        this.$bd = $('.bdv-trace-bd', this.$content)[0];
        this.$ft = $('.bdv-trace-ft', this.$content)[0];
        this.$pager = $('.bdv-trace-pager', this.$content);
        this.$pagerNo = $('.bdv-trace-pager-no', this.$content)[0];

        var me = this;
        // 事件 - 分页
        me.$pager && T.each(me.$pager, function (idx,pager) {
            T(pager).on('click', function (evt) {
                evt.preventDefault();

                var pn = me.pageNo;
                if (pager.getAttribute('data-page') == 'prev') {
                    pn -= 1;
                } else {
                    pn += 1;
                }

                if (pn > 0 && pn <= me.pages) {
                    me._isUserTrigger = true;
                    me.model.list({ pn: pn });
                }
            });
        });

        // 剧集点击事件
        var episodeHandler = function (target) {
            // a > li > ol
            var parent = target.parentNode.parentNode,
                ep = target.getAttribute('data-ep'),
                isNew = target.getAttribute('data-new'),
                id = parent.getAttribute('data-id'),
                type = parent.getAttribute('data-type');

            isNew == 1 && me.model.fire('clearNotify');
            me.hide();

            if (ep && id && type) {
                delay(function () {
                    me.model.update({ type: type, works_id: id, last_view: ep });
                }, 0);
            }
        };

        // 退订点击事件
        var delHandler = function (target) {
            var id = target.getAttribute('data-id'),
                type = target.getAttribute('data-type');

            if (id && type) {
                delay(function () {
                    me.model.del({ type: type, works_id: id });
                }, 0);
            }
        };

        // live click
        T(this.$bd).on('click', function (evt) {
            var target = evt.target;

            if (target.tagName === 'A') {
                if (target.getAttribute('data-ep')) {
                    episodeHandler(target);
                } else if ($(target).hasClass('bdv-trace-item-del')) {
                    evt.preventDefault();
                    delHandler(target);
                }
            } else if (target.tagName === 'SPAN') {
                target = target.parentNode;
                if (target.tagName === 'A' && target.getAttribute('data-ep') != '') {
                    episodeHandler(target);
                }
            }
        });
    },
    // UI 渲染完毕
    _rendered: function () {
        if (this.pages > 1) {
            this.$pagerNo.innerHTML = this.pageNo + '/' + this.pages;
            this.$ft.style.display = 'block';
        } else {
            this.$ft.style.display = 'none';
        }
        this.show();
    },
    // 展示无结果内容
    _renderNone: function () {
        $(this.$content).addClass('bdv-trace-none');
        this.$content.innerHTML = $('#bdvTraceNoneTpl')[0].innerHTML;
        this.$bd = null;
        this.show(true);
    }
};

/* ------------------------------------------------------------------------------------------------------------------ */
/**
 * 入口函数
 * @param {String} tn: page tn
 * @param {String|Number} carousel: 是否用 carousel 模式展示
 */
module.exports = function (tn, carousel) {
    var instance = null; // 实例

    var param = stringFormat('&tn=#{0}&tpl=#{0}&bl=bdvTrace', [tn]);
    uLogStr += param;
    vLogStr += param;

    //var config = { tip: true, autoCheck: true, crossDomain: false },
    //调试用
     var config = { tip: true, autoCheck: false, crossDomain: true};
         rules = bdvTraceConfig.rules;
    for (var i = 0, rule; rule = rules[i]; i += 1) {
        if (rule.test()) {
            config = rule.config;
            break;
        }
    }

    var onLoad = function () {
        loginCheck(function (user) { // 获取登录状态
            // config.crossDomain = true; // for test
            // var isLogin = false, // for test
            var isLogin = typeof user === 'object' && user.value,
                isVip = isLogin && user.vipinfo && user.vipinfo.isvalid,
                enableCarousel = carousel == 1,
                options = {
                    crossDomain: config.crossDomain,
                    isLogin: isLogin,
                    pageSize: enableCarousel ? 6 : 2
                };

            // 选择场景 Model
            var ModelClass = bdvTraceCore,
                isUgcRpTrack = !isLogin && ugcRpTrack.isHit(5);
            if (isUgcRpTrack) {
                ModelClass = ugcRpTrack.Klass;
                options.crossDomain = true; // 主动开启跨域请求
            }
            // console.log('ugcRpTrack.isHit: ', isUgcRpTrack);

            // 日志参数拼接
            uLogStr += stringFormat('&login=#{0}&track=#{1}', [ (isLogin ? 1 : 0), (isUgcRpTrack ? 1 : 0) ]);

            // 实例化
            var model = new ModelClass(options);
            instance = instance || new BdvTrace(model, {
                enableCarousel: enableCarousel,
                frp: isVip ? '' : 'bdbrand',
                isUgcRpTrack: isUgcRpTrack
            });

            config.autoCheck && model.check(); // 检查更新
        });
    };

    delay(onLoad, 400); // 不着急，让其它模块先加载
};
