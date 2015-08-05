 /**
	* @autor liwei
	* @date   2014/08/05
	* @function bdvCarousel
	* @param  {String|HTMLElement} el 一个包含Carousel所需结构的容器对象.
	* @param  {Object} options 选项.
	* @config {Number} originalIndex 默认选项卡的聚焦项，默认0.
	* @config {String} animate    描述滚动的效果，取值{slide2dHorizontal|slide2dVertical|slide3dHorizontal|slide3dVertical|fade}，分别是2d水平（垂直）滑动、3d水平（垂直）滑动与淡入淡出， 默认是slide2dHorizontal
	* @config {Boolean}autoScroll 描述是否支持自动滚动，默认true
	* @config {Number} interval  描述两次滚动的时间间隔，默认3000毫秒
	* @config {Number} duration  描述每次滚动花费的时间，默认500毫秒
	* @config {String} direction 取值{forward|backward}，描述向前滚动还是向后滚动，默认forward
	* @config {Number} containerWidth 描述每一屏的宽度，默认984 
	* @config {Number} containerHeight 描述每一屏的宽度，默认500
	* @config {Boolean} lazyload  是否开启图片懒加载 默认false
	* @config {Function} beforeRender 每次轮播前回调
	* @config {Function}  afterRender  每次轮播后回调
**/
	if (typeof Object.create !== "function") {
	    Object.create = function (obj) {
	        function F() {}
	        F.prototype = obj;
	        return new F();
	    };
	}
	$.fn.bdvCarousel = function(options) {
		return this.each(function () {
            if ($(this).data("bdvcarousel-init") === true) {
                return false;
            }
            $(this).data("bdvcarousel-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $(this).data("bdvCarousel", carousel);
        });
	};
	window.rAF = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                // if all else fails, use setTimeout
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
                };
    })();
    window.cAF = (function () {
        return window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                function (id) {
                    window.clearTimeout(id);
                };
    })();
	$.fn.bdvCarousel.options = {
		originalIndex : 0,
		containerWidth : 984,
		containerHeight : 500,
		animate : 'slide2dHorizontal',
		autoScroll : true,
		interval : 3000,
		duration : 500,
		direction : 'forward',
		lazyload : false,
		fade : true

	};
	var Carousel = {
		// 初始化
		init : function(options, el) {
			var self = this;
			//大容器
			self.$container = $(el);

			//内容容器
			self.$elm = self.$container.find(".bdv-carousel-list");
			

			//控制容器
			self.$dotList = self.$container.find(".bdv-carousel-dot");
			
			//屏数
			self.num = self.getTotalCount();

			self.$elm.ready(function() {
			});

			self.options = $.extend({}, $.fn.bdvCarousel.options, options);

			//回调函数
			self.beforeRender = self.options.beforeRender || function() {};

			self.afterRender = self.options.afterRender || function() {};

			//初始化组件,必须在self.options之后
			self.resetCarousel();

			//事件注册
			self.eventHandler();
			/**
				* @vars   {Number}  pos        定义焦点区所在位置
				* @vars   {String}  direction  定义滚动的方向
				* @vars   {Number}  offsetSize 定义每一屏的大小{宽|高}
				* @vars   {Number}  maxSize    定义容器的整体大小
			**/
			self.axis = {
				slide2dHorizontal : {
					pos : self.options.containerWidth * self.options.originalIndex,
					direction : "left",
					offsetSize : self.options.containerWidth,
					maxSize : self.options.containerWidth * self.num

				},
				slide2dVertical : {
					pos : self.options.containerHeight * self.options.originalIndex,
					direction : "top",
					offsetSize : self.options.containerHeight,
					maxSize : self.options.containerHeight * self.num
				}
			}

			//slide效果
			if(self.options.animate.indexOf("slide") != -1) {

				self.initData = self.axis[self.options.animate];

				if(self.options.animate =="slide2dHorizontal") {
					self.$elm.css("width", self.initData.maxSize);
				}
				if(self.options.animate =="slide2dVertical") {
					self.$elm.css("height", self.initData.maxSize);
				}
			}
			if(self.options.animate == "fade") {
				//淡入淡出效果
				self.$elm.css("width", self.options.containerWidth);
				self.$elm.css("position", "relative");
				self.$elm.children("li").each(function(i,n){
					$(n).css({
						"float" : "none",
						"position" : "absolute",
						"left" : 0,
						"top" : 0,
						"opacity" : 0
					});
					if(i == self.options.originalIndex) {
						$(n).css("opacity",1);
					}
				})
			}
			self.start();
		},
		//事件中心
		eventHandler : function() {
			var self = this;
			self.$elm.on("mouseenter",function() {
				self.stop();
			});
			self.$elm.on("mouseleave",function() {
				self.start();
			});

			var $controlContainer = self.$container.find(".bdv-carousel-control");
			if(!$controlContainer) return;
			
			//注册圆点hover,设置一个时间间隔，停留时间在100ms才触发
			if(self.$dotList) {
				self.$dotList.children("li").each(function(n,item){
				
					$(item).hover(function(event) {
						self.stop();
						self.trigger = setTimeout(function() {							
							self.goTo(self.$dotList.children("li").index(item));

							$(item).addClass("dot-selected").siblings("li").removeClass("dot-selected");
						},100);
					},function(){
						self.start();
						clearTimeout(self.trigger);
					});
				});
			}
			//前进后退按钮
			//设定一个时间间隔，在此间隔内的点击无效
			var prevTime = new Date().getTime();
			self.$container.find(".bdv-carousel-prev").on("click", function() {
				var curTime = new Date().getTime();
				if((curTime - prevTime) < (self.options.duration - 100))return;
				prevTime = curTime;
				self.prev();
			})
			self.$container.find(".bdv-carousel-next").on("click", function() {
				var curTime = new Date().getTime();
				if((curTime - prevTime) < (self.options.duration - 100))return;
				prevTime = curTime;
				self.next();
			})
		},
		//获取首次加载的时候控制点所在的位置
		resetCarousel : function() {
			var self = this;

			if(self.$dotList) {
				self.$dotList.children("li").eq(self.options.originalIndex).addClass("dot-selected");
			}
			self.$elm.children("li").eq(self.options.originalIndex).addClass("item-selected")

		},
		//图片懒加载函数，替换其中的data-src值
		lazyLoadImg : function(index) {
			var self = this;

			var img = self.$elm.children("li").eq(index).children("img")[0];
			if(!$(img).attr("src")) {
				$(img).attr("src", $(img).attr("data-src"));
				$(img).removeAttr("data-src");
			}
		},
		//改为requestAnimateFrame调用 liwei  2014/09/28
		loop : function(callback) {
			var self = this;
			self.startime = self.startime || +new Date();
			if(+new Date() - self.startime > self.options.interval) {
				callback();
				self.startime = null;
			}
			self.pid = window.rAF(function() {
				self.loop(callback);
			});
		},
		//开始轮播
		start : function() {
			var self = this;
			if(self.options.autoScroll) {
				self.loop(function() {
					if(self.options.direction == "forward")
						self.next();
					else 
						self.prev();		
				});
			}
		},
		
		//暂停轮播
		stop  : function() {
			var self = this;
			if(self.options.autoScroll) {
				window.cAF(self.pid);
				self.startime = null;
				self.pid = null;
			}
		},

		//定位到N个元素
		//@param {Number} index  元素的索引值 0,1,2,3....
		goTo : function(index) {
			var self = this;

			var curIndex = self.getCurrentIndex();
			self.$elm.children("li").eq(curIndex).removeClass("item-selected");
			self.$elm.children("li").eq(index).addClass("item-selected");

			if(self.$dotList) {
				self.$dotList.children("li").eq(curIndex).removeClass("dot-selected");
				self.$dotList.children("li").eq(index).addClass("dot-selected");
			}
			if(self.options.lazyload) {

				self.lazyLoadImg(index);
			}
			
			if(self.options.animate == "slide2dHorizontal" || self.options.animate == "slide2dVertical") {

				self.initData.pos = 0 - self.initData.offsetSize * index;
				self.animate();

			}else if(self.options.animate == "fade"){

				self.fadeAnimate(curIndex, index);

			}
		},

		//以step为单位翻到下一项
		next : function() {
			var self = this;
			var curIndex = self.getCurrentIndex(),
				nextIndex = (curIndex + 1) % self.num;
			
			if(self.options.lazyload) {

				self.lazyLoadImg(nextIndex);
			}	

			self.$elm.children("li").eq(curIndex).removeClass("item-selected");
			self.$elm.children("li").eq(nextIndex).addClass("item-selected");

			if(self.$dotList) {
				self.$dotList.children("li").eq(curIndex).removeClass("dot-selected");
				self.$dotList.children("li").eq(nextIndex).addClass("dot-selected");
			}
			//2d水平、垂直滚动
			if(self.options.animate == "slide2dHorizontal" || self.options.animate == "slide2dVertical") {
				self.initData.pos -= self.initData.offsetSize;

				if(Math.abs(self.initData.pos) >= self.initData.maxSize) {
					self.initData.pos = 0;
				}
				self.animate();

		  	}
		  	//淡入淡出
		  	else if(self.options.animate == "fade") {

		  		self.fadeAnimate(curIndex, nextIndex);

		  	}

		},

		//以step为单位翻到上一项
		prev : function() {
			var self = this;
			var curIndex = self.getCurrentIndex(),
				nextIndex = (curIndex + self.num - 1) % self.num;

			//加载前回调
			if(self.options.lazyload) {

				self.lazyLoadImg(nextIndex);
			}

			self.$elm.children("li").eq(curIndex).removeClass("item-selected");
			self.$elm.children("li").eq(nextIndex).addClass("item-selected");

			if(self.$dotList) {
				self.$dotList.children("li").eq(curIndex).removeClass("dot-selected");
				self.$dotList.children("li").eq(nextIndex).addClass("dot-selected");
			}

			//2d水平、垂直滚动
			if(self.options.animate == "slide2dHorizontal" || self.options.animate == "slide2dVertical") {
				
				self.initData.pos += self.initData.offsetSize;

				if(self.initData.pos > 0) {

					self.initData.pos = self.initData.offsetSize - self.initData.maxSize;
				}
				self.animate();
				
			}
			//淡入淡出特效
			else if(self.options.animate == "fade") {

		  		self.fadeAnimate(curIndex, nextIndex);

		  	}
		  
		},

		//取得当前得到焦点项在所有数据项中的索引值
		getCurrentIndex : function() {
			return this.$elm.children("li").index(this.$elm.children(".item-selected"))
		},

		//取得数据项的总数目
		getTotalCount : function(){
			return this.$elm.children().length;
		},

		//2d水平、垂直动画函数
		animate : function() {
			var self = this;

			// @vars {String}    self.direction  {left|top}               根据滚动效果决定方向
			// @vars {String}    self.size       {self.options.containerWidth|
			//									  self.options.containerHeight} 根据滚动方向决定用宽度还是高度值 																							 
			var animateData = {};
			animateData[self.initData.direction] = self.initData.pos + "px";
			self.$elm.animate(animateData, self.options.duration, self.afterRender);
		},

		//淡入淡出函数
		// @param  {Number}  curIndex  当前选中项
		// @param  {Number}  nextIndex  下一选中项
		fadeAnimate : function(curIndex, nextIndex) {
			var self = this;
			if(self.options.fade) {
				self.$elm.children("li").eq(curIndex).animate({
						opacity : 0
					},self.options.duration, self.afterRender);
				self.$elm.children("li").eq(nextIndex).animate({
					opacity :1
				},self.options.duration, self.afterRender);
			}else{
				self.$elm.children("li").eq(curIndex).hide();
				self.$elm.children("li").eq(nextIndex).show();
			}
		}
	};
	return $;
