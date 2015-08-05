/********************************************
  * 
  * 文件注释，说明文件名称和文件所包含内容 
  * @fileName recmdForYou.js
  * @author shangwenhe
  * @create time 2014年10月31日 15:17 
  * @version {版本信息}  v0.0.1
  *
  * ////////////////////////////////////////
  *
  * @describe  为你推荐的
  * @return  {string|object|function} Object 
  * @Modification time
  *
*********************************************/

function recommendForYou(arg){
/*
	// {
	//   channel: __inline("./forMovie.tmpl") ,
	//   UID :""|| $.cookie.get(),
	//   url :"http://cq01-rdqa-dev079.cq01.baidu.com:8280/rec/movierp?",
	//   log : 
	// }
*/
	if(!(arg.UID || $.cookie.get("BAIDUID"))) return;
	this.UID = arg.UID || $.cookie.get("BAIDUID").replace(/^(.*?):fg=\d$/ig,'$1');
	this.ele = $(arg.ele) || "";
	this.url = arg.url || null;
	if(this.url === null){ alert("empty this.url"); return false;}
	
	this.tmpl = arg.tmpl || null;
	if(typeof this.tmpl != "function"){ alert("tmpl is not a function");return false; }
	
	this.log = arg.log || "";

	this.content = arg.content;
	this.callback = arg.callback;	
	this.pageTn = arg.pageTn;
	this.channelrp = arg.channelrp || window.location.href.replace(/.*rec\/(.*?)\?.*/,"$1") ;
	this.getData(this);
}
recommendForYou.prototype={
	// 获取用户行为数据
	getData:function(self){
			$.ajax({  
				url: self.url,
				data:{uid:self.UID},
				dataType:"jsonp",
				success:function(data){
					if(data!="" && data.rec_list && data.rec_list.length > 0){
						var outputHtml = self.tmpl({data:data});
							$(self.content).html(outputHtml);
							self.callback && self.callback(self,data);
							self.ele.show();
							self.log += "&alg="+data.algorithm;
							self.vlog = 'app='+self.channelrp+'_'+data.algorithm+'&scroll=1&pageTn='+self.pageTn;
							
						if(self.getPosition()){
							self.sendLog(data);
						}else{
							$(window).on("scroll.log",function(data){self.scrollOnLog.call(self,data)});
						}

					}

				}
			})
	},
	// 滚动到指定位置发送LOG
	scrollOnLog:function(){
		if(	this.getPosition() ){
			this.sendLog();
			$(window).off("scroll.log");
		}
	},
	// 判断元素是否在当前窗口
	getPosition:function(){
		return	$(window).scrollTop() > ( this.ele.offset().top -$(window).height() -100 );
	},
	// 发送请求日志
	sendLog:function(data){
		$.log("http://nsclick.baidu.com/u.gif?pid=104&"+this.log+'&_='+(new Date()).valueOf());
		this.vlog && $.log("http://log.v.baidu.com/u.gif?"+this.vlog+'&_='+(new Date()).valueOf());
	}

}

exports = module.exports = recommendForYou;
