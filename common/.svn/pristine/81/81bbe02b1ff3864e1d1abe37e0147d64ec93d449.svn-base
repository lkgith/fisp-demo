 /**
	* @autor liwei
	* @date   2014/08/05
	* @function bdvTick
	* @des    跑马灯特效，用于公告、新闻等
	* @param  {String|HTMLElement} el 一个包含Tick所需结构的容器对象.
	* @param  {Object} options 选项.
	* @config {Number} originalIndex 默认选项卡的聚焦项，默认0.
	* @config {Boolean}autoScroll 描述是否支持自动滚动，默认true
	* @config {Number} interval  描述两次滚动的时间间隔，默认3000毫秒
	* @config {Number} duration  描述每次滚动花费的时间，默认500毫秒
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
	
	$.fn.bdvTick = function(options) {
		return this.each(function () {
            if ($(this).data("bdvtick-init") === true) {
                return false;
            }
            $(this).data("bdvtick-init", true);
            var tick = Object.create(Tick);
            tick.init(options, this);
            $(this).data("bdvTick", tick);
        });
	};
	$.fn.bdvTick.options = {
		originalIndex : 0,
		autoScroll : true,
		duration : 5000,
		direction : 'right'

	};
	var Tick = {
		// 初始化
		init : function(options, el) {
			var self = this;
			//大容器
			self.$container = $(el);

			//内容容器
			self.$elm = self.$container.find(".bdv-tick-list");
			
			//屏数
			self.num = self.getTotalCount();

			self.options = $.extend({}, $.fn.bdvTick.options, options);
			
			self.preDuration = self.options.duration;
			//回调函数
			self.beforeRender = self.options.beforeRender || self.beforeRender || function() {};

			self.afterRender = self.options.afterRender || self.afterRender || function(){};

			//事件注册
			self.eventHandler();
			
			if(!!self.options.width) {
				self.options.containerWidth = self.$elm.children("li").eq(0).width();
			}
			self.$elm.css("width", self.options.containerWidth * self.num);
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
			var $controlContainer = self.$container.find(".bdv-tick-control");
			if(!$controlContainer) return;
			
			//前进后退按钮
			//设定一个时间间隔，在此间隔内的点击无效
			var prevTime = new Date().getTime();
			self.$container.find(".bdv-tick-prev").on("click", function() {
				var curTime = new Date().getTime();
				if((curTime - prevTime) <  100)return;
				prevTime = curTime;
				self.prev("left");
			})
			self.$container.find(".bdv-tick-next").on("click", function() {
				var curTime = new Date().getTime();
				if((curTime - prevTime) < 100)return;
				prevTime = curTime;
				self.next("right");
			})
		},
		//开始轮播
		start : function() {
			var self = this;
			self.animate(self.options.direction);	
		},
		
		//暂停轮播
		stop  : function() {
			var self = this;
			self.$elm.stop();	
		},
		//以step为单位翻到下一项
		next : function(direction) {
			var self = this;
//			if(self.options.duration == 1000)return;
			self.stop();
			self.preDuration = self.options.duration;
			self.options.duration=1000;
			//手动滚动时先暂停
		 	self.animate(direction);

		},

		//以step为单位翻到上一项
		prev : function(direction) {
			var self = this;
			self.stop();
			self.preDuration = self.options.duration;
			self.options.duration=1000;
			//手动滚动时先暂停
		 	self.animate(direction);
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
		animate : function(direction) {
			var self = this,
				$childrenList = self.$elm.children("li");

				//前滚
				if(direction == "left") {
					var $removeNode = $childrenList.eq[$childrenList.length-1];
					$removeNode.prependTo(self.$elm[0]);
					self.$elm.css("left",-self.options.containerWidth);
					self.$elm.animate({
						left : "0px"
						}, 
						self.options.duration
					);
				}else {
					self.$elm.animate({
						left : -self.options.containerWidth +"px"
						}, 
						self.options.duration, 
						function() {
							self.afterRender();
						}
					);
				}
				
		},
		//动画执行前回调
		beforeRender : function(direction) {
			var self = this,
				$childrenList = self.$elm.children("li");
			if(direction == "left") {
				var $removeNode = $childrenList.eq[$childrenList.length-1];
				$($removeNode).prependTo(self.$elm[0]);
			}else {
				var $removeNode = $childrenList.eq(0).remove();
				$($removeNode).appendTo(self.$elm[0]);
			}
		},
		//动画执行后回调
		afterRender : function() {
			var self = this,
				$childrenList = self.$elm.children("li"),
			    $removeNode = $childrenList.eq(0).remove();

			$removeNode.appendTo(self.$elm[0]);
			self.options.duration = self.preDuration;
			self.$elm.css("left",0);
			self.animate(self.options.direction);
		}
	};
return $;
