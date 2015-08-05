/********************************************
  * 
  * 文件注释，说明文件名称和文件所包含内容 
  * @fileName jCarouselLite.js
  * @author shangwenhe
  * @create time 2014¿?09¿?26¿? 15:51 
  * @version {版本信息}  v0.0.1
  *
  * ////////////////////////////////////////
  *
  * @require
  * @describe  描述文件内容 
  * @describe
  * @return  {string|object|function} Object 
  * @Modification time 2014年09月28日 20:43 
  *
*********************************************/




function jCarouselLite(o) {
	// 添加buffer半个图片缓冲区
	o.buffer && o.buffer !== 0  && (o.step= o.step-Math.ceil(o.buffer));
    this.o = $.extend({
        mouseWheel: false,
        auto: null,

       
		duration:5000,
		speed:800,
        easing: null,

        vertical: false,
        visible: 4,
		firstBig:false,
		originalIndex:0,
        scroll: 1,
		buffer:0,
		focusRange:{min:0,max:o.visible-1||2},

        beforeStart: null,
        afterEnd: null,

		
		itemsTag:".carouse-item",
		itemSize:"auto",
		current:null

    }, o || {});
	this.__data    = {"allItems":[],"displied":[],"willDel":[]};
	this.__animate = false;
	this.GUID      = null;
	this.timmer    = null
}
;jCarouselLite.prototype={
	constructor:jCarouselLite,
	creatGuid:function(){
		var s = [];
		var hexDigits = "0123456789ABCDEF";
		for (var i = 0; i < 5; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		return s.join("");
	},
	// 收集创建 节点并保存到 __data["allItems"]中去
	__collector:function(callback){
		var __this = this;
		var collections   = this.o.items || $(this.o.itemsTag,__this.__stage),
			itemsLength   = this.o.items && this.o.items.length;
			this.GUID     = "bdv_"+this.creatGuid();
			
		__this.__data["allItems"].length < 1 
		&& $.each(collections,function(index,ele){
			if(itemsLength>0){
				var li = document.createElement('li');
				li.className = /.*?[\.#](.*)/.exec(__this.o.itemsTag)[1];
				li.innerHTML = ele.content;
				ele = li ;
			}
			__this.__data["allItems"][index] = ele;
		});
		
		$.each(__this.__data["allItems"],function(index,ele){
			ele.id = __this.GUID+"_"+index;
			ele.style.width = __this.o.itemSize+"px";
			ele.style.float = "left";
		})

		__this.__stage.empty();
		callback && callback({data:__this.__data["allItems"]});
	},
	conversion:function(go){
		var mirror      = {before:{},after:{},beforeWide:null},
			stageDirect = this.o.vertical ? "top":"left",
			dataItemsLen= this.__data.allItems.length,
			dataDisLen  = this.__data.displied.length,
			dataDelLen  = this.__data.willDel.length,
			conversion  = go.action == "append" ?0:(this.o.itemSize*go.step);

		mirror.buffer = (
				this.o.buffer && 
				$.inArray(dataItemsLen-1,this.__data.displied) !== -1
			) ? this.o.buffer*(-this.o.itemSize) : 0;

		mirror.before[stageDirect] = (0 - conversion + mirror.buffer) +"px";
		mirror.after[stageDirect]  = -(this.o.itemSize*go.step-conversion-mirror.buffer) +"px";
		mirror.beforeWide = (dataDisLen+dataDelLen)*this.o.itemSize+"px";
		return mirror;
	},
	fromDataGetNextItems:function(go){
		var getModle={getStep:[],getIndex:[]},
			dataAllItemsLength = this.__data["allItems"].length;
		var startKeyPosition =[];
		if(go.init){
				startKeyPosition= [ go.start, go.start+this.o.visible ];
		
		}else{
			if(go.action == "append"){
				startKeyPosition= [ go.start+this.o.visible/2, go.start+this.o.visible/2 +go.step ];
			}else{
				startKeyPosition= [ go.start-this.o.visible/2-go.step, go.start-this.o.visible/2 ];
			}
		}
		
		// 加上游木长度
		for(var step = startKeyPosition[0];step< startKeyPosition[1] ;step++){
			// 将步长落到模尔值上，当模尔值为负时从后向前取得
			var getArrayIndex = step%dataAllItemsLength;
			if( getArrayIndex <0 ){
				getArrayIndex = dataAllItemsLength + getArrayIndex;
			}
			if( !go.init && this.o.buffer!==0 && (step !== getArrayIndex )  ){
				continue;
			}
			getModle.getStep.push(step);
			getModle.getIndex.push(getArrayIndex);
		}
		return getModle;
	},
	// 组装数组
	assembly:function(go,showDom){
		var	__this=this,
			willShowItems   =  this.fromDataGetNextItems(go) ,
			showDom = showDom||document.createDocumentFragment();
			go.step = willShowItems.getIndex.length;
			if(go.step<1){ return; }

			if(go.action == "append"){
				go.init && (__this.__data["displied"] = __this.__data["displied"].concat(willShowItems.getIndex));
				$.each(willShowItems.getIndex,function(index,ele){
					if(!go.init){
							__this.__data["displied"].push(ele);
							__this.__data["willDel"].push( __this.__data["displied"].shift() );
					}
					showDom.appendChild(__this.__data["allItems"][ele]);
				});
			}else{
				go.init && (__this.__data["displied"] = willShowItems.getIndex.concat(__this.__data["displied"]));
				$.each(willShowItems.getIndex.reverse(),function(index,ele){
					if(!go.init){
							__this.__data["displied"].unshift(ele);
							__this.__data["willDel"].push( __this.__data["displied"].pop() );
					}
					showDom.insertBefore(__this.__data["allItems"][ele],showDom.firstChild);
				});

			}

			if(this.o.firstBig && go.action =="prepend" && this.__data["displied"][0]==1){
				go.start = go.start-go.step;
				arguments.callee.apply(this,[go,showDom]);
			};
			this.__stage[go.action](showDom) ;	
		},
	engine:function(go){
	// go({
	//		start:index,                // 起始值
	//		step:step,                  // 步长
	//		action:"append||prepend"	// 动作
	//      init:false
	//	})
		
		// 设置宽度高度		
		var __this = this;
		if(!go.init){
			if(__this.__animate ){
				return;
			}else{
				__this.__animate = true;
			}
		}
		// 调用回调函数
			__this.o.beforeStart && __this.o.beforeStart(go.start,this);

		var containerAttr  =  (!this.o.vertical) ? "width" : "height";
		// 在assembly 中修改go.step
		var assembly       = this.assembly(go);
			if(go.step<1){ __this.__animate=false; return; }
		var	conversion     = this.conversion(go);
			this.__stage.css(conversion.before);

			if(go.init){
				this.current = go.start+ this.o.visible/2;
			}else{
				this.current = go.action =="append" ? go.start+go.step : go.start-go.step;
			}

			!go.init 
			&& this.__stage.css(containerAttr,conversion.beforeWide)
			&& this.__stage.animate(
					conversion.after,
					this.o.speed,
					this.o.easing,
					function(){
						$.each(__this.__data["willDel"],function(index,ele){
							$("#"+__this.GUID+"_"+ele,__this.__stage).remove();
						});
						__this.__data["willDel"].length=0;
						__this.__stage &&
						__this.__stage.css({left:conversion.buffer+"px",top:"0px"});
						__this.__stage.css(containerAttr,(__this.o.itemSize*__this.o.visible)+"px");	
						__this.__animate = false;
						__this.o.afterEnd 
						&& __this.o.afterEnd(__this.current,__this);

						// 内存回收 
						willShowItems = null;
						conversion    = null
						showDom       = null;
						__this.autoScroll();

					});
			go.init 
			&& __this.o.afterEnd 
			&& __this.o.afterEnd(go.start,__this);
			go.init && this.autoScroll();
	},
	autoScroll:function(){
		var __this =this;
		clearTimeout(this.timmer);
		__this.o.auto && (__this.timmer = setTimeout(function(){
			__this.next();
		},__this.o.duration));
	},
	prev:function(position){
		this.engine({
			start  : position || this.current,
			step   : this.o.step,
			action : "prepend",
			init   : false
		});
	},
	next:function(position){
		this.engine({
			start  : position || this.current,
			step   : this.o.step,
			action : "append",
			init   : false
		});
	},
	go:function(position){
		var pos = (position*this.o.step+this.o.visible/2);
		if( pos>this.current){
			this.next(pos-this.o.step);
		}else if(  pos < this.current ){
			this.prev(pos+this.o.step);
		}else{

		}
	},
	initStyle:function(){
		// 设置初始化样式
		this.o.container.css({position:"relative"});
		this.o.container.css((!this.vertical)?"width":"height",(this.o.itemSize*this.o.visible-this.o.itemSize*this.o.buffer )+"px");
		this.__stage.css({left:"0px",top:"0px",position:"absolute"});
		this.__stage.css((!this.vertical)?"width":"height",(this.o.itemSize*this.o.visible)+"px");
	
	},
	hoverStop:function(container){
		if(!this.loaded){
			this.loaded = true;
			var that = this;
			container.hover(function(){
				clearTimeout(that.timmer);
			},function(){
				that.autoScroll();
			});
			
		}
	},
	render:function(container){
		// 渲染视图
		var __this = this;
		__this.o.container = $(container);
		if( __this.o.items && __this.o.items.length >0 && !__this.o.container.children()[0]  ){
			__this.__stage = $(document.createElement('ul'));
			__this.o.container.append(__this.__stage);
		}else{
			__this.__stage = __this.o.container.children();
		}

		__this.initStyle();
		// 初始化展示数据
		__this.__data.displied.length=0;
		__this.__collector(function(data){
			__this.engine({
				start  : __this.o.originalIndex,
				step   : __this.o.step,
				action : "append",
				init   : true
			});
		});
		this.hoverStop(this.o.container);
	},
	refresh:function(itemSize,visible,step){
			this.o.originalIndex = this.current-this.o.visible/2;

			if(this.buffer!==0){
				var allItems = this.__data.allItems.length-1;
				var showItemLength = allItems -(this.o.originalIndex % allItems) ;
				if( showItemLength < this.o.visible ){
					this.o.originalIndex -= (this.o.visible-showItemLength);
				}
			}

			this.o.itemSize = itemSize || this.o.itemSize;
			this.o.visible  = visible  || this.o.visible;
			this.o.step     = step     || this.o.step;
			this.render(this.o.container);
	}
}



return jCarouselLite;
