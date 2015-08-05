/**
 * tools
 */
//tangram
var T = $;

//用户信息下拉交互
function userInfoInit() {
    var $tag = T('#btn_more'),
        $content = T('#box_more'),
        timer = null;
    if ( !$tag[0] || !$content[0] ) {
        return;
    }
    $tag.on('mouseenter', function() {
        clearTimeout(timer);
        $content.show();
        T("#btn_more").addClass("btn_more_hover");
    });
    $tag.on( 'mouseleave', function() {
        timer = setTimeout(function() {
            $content.hide();
            T("#btn_more").removeClass( "btn_more_hover");
        }, 200);
    });
    $content.on( 'mouseenter', function() {
        clearTimeout(timer);
    });
    $content.on( 'mouseleave', function() {
        timer = setTimeout(function() {
            $content.hide();
            T('#btn_more').removeClass("btn_more_hover");
        }, 200);
    });
}


userInfoInit();

$(function() {
    window.cbMISNav = function(result) {
        var menuMain = result && result[0] && result[0].data && result[0].data.videos;
        if ( menuMain && menuMain.length ) {
            for ( var i = 0, len = menuMain.length, item; i < len; i++ ) {
                item = menuMain[i];
                if ( item.s_intro === 'live' ) {
                    $('#navMainMenu .btn_more').before('<li><a href="' + item.url + '"><span>' + item.title + '</span></a></li>');
                }
            }
        }
        window.cbMISNav = null;
    }
    $.getScript('http://v.baidu.com/staticapi/api_mis_nav_utf8.json?v=' + Math.ceil(new Date() / 7200000));
   
});
