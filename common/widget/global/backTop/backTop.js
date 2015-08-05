var client = require('common:static/ui/client/client.js');

//public static var
var BTN_TO_TOP = '#back-to-top-btn';
var CON_TO_TOP = '#back-to-top';
var CLASS_SHOW = 'back-to-top-show';

var domToTop;
var domBtnToTop;
var $win = $(window);
var docBody = $("body");

var scrolling = require("common:static/ui/scrolling/scrolling.js");
var isIE6 = client.browser.ie === 'ie6' ? true : false;

/********************************************
  * 
  * 此处对backTop样式做优化
  * 图片有截断的时候设置为定位到屏幕右侧
  * 为了保证右侧推广位不被截断，
  * 为了让推广位总是保持完整
  * @Modification time 2014年09月19日 12:43 
  *
*********************************************/

(function(){
    // 当宽度小于1445 时添加
    function adepterAd(){
        if($(document).width() < 1445){
            $("#back-to-top").addClass("narrow-back-top");
            $("#index_right_float").addClass("narrow_right_float");
        }else{
            $("#back-to-top").removeClass("narrow-back-top");
            $("#index_right_float").removeClass("narrow_right_float");
        }
    }


    $(document).on('ready',function(){
        adepterAd();
    });
    $(window).on('resize',function(){
        adepterAd();
    });
}())
//add scroll animate 

function animateScroll() {
    //定义总的滚动时间
    var time = 500;
    //一次滚动时间间隔
    var duration = 20;
    var top = $win.scrollTop();
    //每次滚动距离
    var distance = Math.ceil(top / 25);
    var pid = setInterval(function() {
        var point = (top - distance) > 0 ?(top-distance):0;
        window.scrollTo(0,point);
        top =point;
        if(top == 0)clearInterval(pid);
    },duration);
    
}
function toTopClickHandler(e) {
    e.preventDefault();
    animateScroll();
  //  window.scrollTo(0, 0);
}

function scrollHandler(e) {
    var scrollTop = $win.scrollTop();
    var viewportHeight = $win.height();
    if (scrollTop > viewportHeight) {
        domToTop.addClass(CLASS_SHOW);
    } else {
        domToTop.removeClass(CLASS_SHOW);
    }
    if ( isIE6 ) {
        domToTop[0].style.top = document.documentElement.scrollTop + 200 + 'px';
    }
}

function init(config) {
    domToTop = $(CON_TO_TOP);
    domBtnToTop = $(BTN_TO_TOP);

    domBtnToTop.on('click', toTopClickHandler);
    if ( isIE6 ) {
        domToTop[0].style.position = 'absolute';
    }
    var timer;
    
    scrolling(scrollHandler);

    if ( !config || config.feedback !== false ) {
        var showFeedBack = require('common:static/ui/showFeedBack/showFeedBack.js');
        $("#showFeed").on('click', function(e){
            e.preventDefault();
            
            showFeedBack();
        });
    }
}

    
     

module.exports = init;
