require('common:static/vendor/bootstrap/js/dropdown.js');
/**
 * 根据容器宽度整列表节子节点
 * @param container:容器，一般为ul
 * @param item:子节点，一般为li
 */
exports.list = function(container,item){
    var cont = $(container),
        itm = cont.find(item),
        itmWidth = itm.eq(0).outerWidth(),
        ctnWidth = cont.width();
    if(itmWidth * itm.length >= ctnWidth){
        //理论能容纳个数
        var n =  Math.floor(ctnWidth/itmWidth);
        //目前容纳的个数
        var hideItem = cont.find('.hide');
        if(n == (itm.length - hideItem.length)) return;
        var sib = cont.siblings('.dropdown');
        if(sib.length) {
            hideItem.removeClass('hide');
            sib.remove();
        }
        var wp = $('<span class="dropdown"><a class="dropdown-toggle" href="#" aria-expanded="true" data-toggle="dropdown" aria-haspopup="true" title="更多">更多<span class="caret"></span></a></span>');
        wp.insertAfter(cont);
        itm.each(function(i,elem){
            if(i>=n){
                $(elem).addClass('hide');
            }
        });
        var clone = cont.clone();
        clone.find(item).each(function(i,elem){
            if(!$(elem).hasClass('hide')){
                $(elem).remove();
            }else{
                $(elem).removeClass('hide');
            }
        });
        clone.addClass('dropdown-menu').attr({'role':'menu','style':''}).appendTo(wp);
        wp.find('.dropdown-toggle').eq(0).dropdown();
    }
}
/**
 * 根据容器宽度整carousel节子节点
 */
exports.carousel = function(){

}