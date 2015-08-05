/**	
	* @author liwei
	* @date   2014/08/05
	* @function bdvTabSlider
	* @param  {HTMLElement} el 一个包含Carousel所需结构的容器对象.
	* @param  {Object} options 选项.
	* @config {Number} originalIndex 默认选项卡的聚焦项，默认0.   
	* @config {Boolean} fade  是否开启淡入淡出特效,默认false
	* @config {Boolean} lazyload  是否开启图片懒加载 默认false
	* @config {Function} beforeRender 每次轮播前回调
	* @config {Function}  afterRender  每次轮播后回调
	* @config {Number}  delay    设置两次事件延迟，在该时间段内，不再重复触发同一事件，默认100ms
	* @config {Object}  animte   动画参数
	* @config {Boolean}animte.autoScroll 描述是否支持自动滚动，默认false
	* @config {Number} animte.interval  描述两次滚动的时间间隔，默认3000毫秒
	* @config {Number} animte.duration  描述每次滚动花费的时间，默认500毫秒
	* @config {String} animte.direction 取值{forward|backward}，描述向前滚动还是向后滚动，默认forward
	
**/


	if (typeof Object.create !== "function") {
	    Object.create = function (obj) {
	        function F() {}
	        F.prototype = obj;
	        return new F();
	    };
	}
	$.fn.bdvTabSlider = function(options) {
		return this.each(function () {
            if ($(this).data("bdvTabSlider-init") === true) {
                return false;
            }
            $(this).data("bdvTabSlider-init", true);
            var tab = Object.create(TabSlider);
            tab.init(options, this);
            $(this).data("bdvTabSlider", tab);
        });
	};
	$.fn.bdvTabSlider.options = {
		originalIndex : 0,
		fade : false,
		delay : 100,
		lazyload : false

	};
	var TabSlider = {
		// 初始化
		init : function(options, el) {
			var self = this;
			//大容器
			self.$container = $(el);

			//内容容器
			self.$elm = self.$container.find(".bdv-tabslider-list");
			

			//控制容器
			self.$dotList = self.$container.find(".bdv-tabslider-dot");
			
			//屏数
			self.num = self.getTotalCount();

			self.options = $.extend({}, $.fn.bdvTabSlider.options, options);

			//回调函数
			self.beforeRender = self.options.beforeRender || function() {};

			self.afterRender = self.options.afterRender || function() {};

			//初始化组件,必须在self.options之后
			self.resetCarousel();

			//事件注册
			self.eventHandler();
			if(self.options.lazyload) {
				self.lazyLoad(self.options.originalIndex);
			}
			self.$elm.children("li").eq(self.options.originalIndex).show();

		},
		//事件中心
		eventHandler : function() {
			var self = this;
			var $controlContainer = self.$container.find(".bdv-tabslider-control");
			if(!$controlContainer) return;

			
			//注册tab点击
			//设定一个时间间隔，在此间隔内的点击无效
			var prevTime = +new Date;

			if(self.$dotList) {

				self.$dotList.on("mousemove", function(event) {

					var curTime = +new Date;

					if((curTime - prevTime) < (self.options.delay)) return;

					prevTime = curTime;

					var se = $(event.target);

					if(se.hasClass("bdv-tabslider-dot"))return;

					if(se[0].tagName != "LI") {
						se = se.parents("li");
					}
					if(se.hasClass("dot-selected")) return;
	                //if(se[0].nodeName !="LI")return;
	                
	                self.goTo(self.$dotList.children("li").index(se[0]));

	                se.addClass("dot-selected").siblings("li").removeClass("dot-selected");
				});
			}
			//前进后退按钮
			
			
		},
		//获取首次加载的时候控制点所在的位置
		resetCarousel : function() {
			var self = this;

			if(self.$dotList) {
				self.$dotList.children("li").eq(self.options.originalIndex).addClass("dot-selected");
			}
			self.$elm.children("li").eq(self.options.originalIndex).addClass("item-selected")

		},
		//懒加载函数,替换其中的script标签
		lazyLoad : function(index) {
			var self = this;
			var $liContainer = self.$elm.children("li").eq(index);
			var tplHtml = $liContainer.children("script").html();
			if(!tplHtml)return;
			$liContainer.html(tplHtml);
			if(!self.$elm.children("script")) {
				self.options.lazyload = false;
			}

		},



		//定位到N个元素
		//@param {Number} index  元素的索引值 0,1,2,3....
		goTo : function(index) {
			var self = this;
			if(self.options.lazyload) {
				self.lazyLoad(index);
			}
			var curIndex = self.getCurrentIndex();
			self.$elm.children("li").eq(curIndex).removeClass("item-selected");
			self.$elm.children("li").eq(index).addClass("item-selected");

			if(self.$dotList) {
				self.$dotList.children("li").eq(curIndex).removeClass("dot-selected");
				self.$dotList.children("li").eq(index).addClass("dot-selected");
			}
			if(self.options.fade) {
				self.$elm.children("li").eq(curIndex).fadeOut("fast", function(){
					self.$elm.children("li").eq(curIndex).hide();
				});
				self.$elm.children("li").eq(index).fadeIn("fast",function() {
						self.$elm.children("li").eq(index).show();
				});	
			}else {
				self.$elm.children("li").eq(curIndex).hide();
				self.$elm.children("li").eq(index).show();
			}
		},

		//翻到下一项
		next : function() {
			var self = this;
			var curIndex = self.getCurrentIndex(),
				nextIndex = (curIndex + 1) % self.num;
			self.goTo(nextIndex);

		},

		//翻到上一项
		prev : function() {
			var self = this;
			var curIndex = self.getCurrentIndex(),
				nextIndex = (curIndex + self.num - 1) % self.num;

			self.goTo(nextIndex);
		},

		//取得当前得到焦点项在所有数据项中的索引值
		getCurrentIndex : function() {
			return this.$elm.children("li").index(this.$elm.children(".item-selected"))
		},

		//取得数据项的总数目
		getTotalCount : function(){
			return this.$elm.children().length;
		}
	};
return $;
