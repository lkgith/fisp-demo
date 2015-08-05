var T = $;
var loginCheck = require('common:static/ui/loginCheck/loginCheck.js');
var preWordData = '';
var searchboxSet = [];
var loading = false;
window.videoPreKeywordMIS = function(data){
    loading = false;
	for(var i=0;i<searchboxSet.length;i++){
		if(!searchboxSet[i].isPrekeyword()){
			searchboxSet[i].dataLoadHandler(data);
		}
	}
}
/*
 首页 indsa
 电影 movie
 电视剧 tvplay
 综艺 tamasha
 动漫 cartoon
 新闻 info
 娱乐 amuse
 体育 sport
 游戏 game
 短视频 square
 八卦 gossip
 音乐 music
 搞笑 amuse
*/
function searchHolder(input){
	this.el = null;
    this.pageTn = '';
	this.input = input || 'kw';
//    apiUrl : 'http://cq01-rdqa-pool112.cq01.baidu.com:8888/videoapi/?page_name=index&block_sign=index_%list_index_search_prekeyword&format=json&callback=videoPreKeywordMIS&v=';
    this.apiUrl = 'http://v.baidu.com/staticapi/api_prekeyword.json?v=';
    this.placeHolderClass = 'place-holder';
	this.keyword = '';
	searchboxSet.push(this);
}
searchHolder.prototype = {
    init : function(pageTn){
        var self = this;
        var el = self.el =  $('#'+self.input)[0];
        var match = location.search.match(/[&?]q=([^&]+)/);
        self.pageTn = T.trim(pageTn);
        if( !!el && !T.trim(el.value) && !match && self.pageTn ){
            T(el).on('focus',function(){self.focusHandler.apply(self)});
            T(el).on('blur',function(){self.blurHandler.apply(self)});

            //增加vip登陆检测
            loginCheck(function(info) {
               var  isvip = info && info.vipinfo && info.vipinfo.isvalid && info.vipinfo.isvip;
                if(isvip) {
                    self.apiUrl = "http://v.baidu.com/staticapi/api_prekeyword_vip.json?v=";
                }
                self.request();
            });
        }
    },
    dataLoadHandler : function(res){
        var self = this;
        var videos = preWordData = !!res && res.length && !!res[0].data && res[0].data.videos || [];
        if(videos.length){
            T.each(videos,function(idx,video){
                var s_intro =  T.trim(video.s_intro);
                if(s_intro == self.pageTn){
                    self.keyword =  T.trim(video.title);
                    return false;
                }
            });
        }
        self.fillIn();
    },
   
    request : function(){
        var self = this;
        T(self.el).addClass(self.placeHolderClass);
		if(!preWordData && !loading){
            loading = true;
			T.ajax(self.apiUrl + self.version(),{
                dataType:'jsonp',
                jsonpCallback:'videoPreKeywordMIS'
            });
		}else{
			window.videoPreKeywordMIS(preWordData);
		}
    },
    version : function(){
        // 增加时间戳 减少缓存
        return +new Date();
    },
    fillIn : function(){
        var self = this;
        var el = self.el;
        if(T(el).hasClass(self.placeHolderClass) && !!self.keyword){
            el.value = self.keyword;
            el.setAttribute('data-prekey', self.keyword);
        }
    },
    focusHandler : function(e){
        var self = this;
        var el = self.el;
        self.value = '';
        if(T(el).hasClass(self.placeHolderClass)){
            T(el).removeClass(self.placeHolderClass);
            el.value = '';
        }
    },
    blurHandler : function(e){
        var self = this;
        var el = self.el;
        var txt = T.trim(el.value);
        if(!txt){
            T(el).addClass(self.placeHolderClass);
            self.fillIn();
        }
    },
    isPrekeyword : function(){
        var self = this;
        var el = self.el;
        return !!el && T(el).hasClass(self.placeHolderClass) && !!el.value && (el.value == self.keyword);
    }
};

module.exports = searchHolder;