/**
 * sugConf
 */

 /**
  * Suggestion 数据接口
  */
 var APIS = exports.APIS =  {
     //sug接口
     //@param wd，必填，关键字
     //@param prod，必填，产品线，video：旧版数据，video_ala：新版数据，包含query类型信息
     //@param oe，可选，query编码，utf-8
     //@param t，可选，时间戳
     //回调函数名固定为window.baidu.sug
     //@return {Object} 数据对象
     //@return {String} Object.q 检索词
     //@return {Array} Object.s 相关query列表
     //@return {String} Object.s[i] 相关query，新版格式："非诚勿扰{#S+_}{"id":"290","type":"show"}"，{#S+_}为分隔符
     sug: 'http://nssug.baidu.com/su',
     //热搜榜接口
     //@param callback，可选，JSONP回调函数
     hotlist: 'http://v.baidu.com/staticapi/api_hotlist.json',
     // VIP热搜
     hotlistVip: 'http://v.baidu.com/staticapi/api_hotlist_vip.json',
     //作品信息接口
     //@param id，必填，作品id值
     //@param frp，必填，使用环境，sug：旧版，opensug：新版
     //@param site，可选，使用站点
     //@param callback，可选，回调函数名
     videos: {
         //电影
         movie: 'http://v.baidu.com/movie_sug/',
         //电视剧
         tv: 'http://v.baidu.com/tv_sug/',
         //综艺
         show: 'http://v.baidu.com/show_sug/',
         //动漫
         comic: 'http://v.baidu.com/comic_sug/',
         //人物
         person: 'http://v.baidu.com/person_sug/'
     },
     //普通结果数据接口
     //@param word，必填，query
     //@param ct，必填，固定为905969664
     //@param rn，可选，返回视频数量
     //@param jsonFn，可选，JSONP回调函数
     ugc: 'http://v.baidu.com/v?ct=905969664'
 };

 /**
  * 作品数据
  */
 //作品类型
 var videoTypes = exports.videoTypes = {
     movie: '\u7535\u5f71',
     tv: '\u7535\u89c6\u5267',
     show: '\u7efc\u827a',
     comic: '\u52a8\u6f2b',
     person: '\u4eba\u7269'
 };