var timeout = null,width,height,callbacks = [],inited = false;
var ec = require('common:static/ui/eventcenter/eventcenter.js');
exports.detect = function(callback){
    if($.isFunction(callback)) ec.attach('window.resize',callback);
    if(inited) return;
    $(window).resize(function(){
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            var w = document.documentElement.clientWidth,h = document.documentElement.clientHeight;
            if(!(w == width && h == height)){
                width = w;
                height = h;
                ec.trigger('window.resize',{'height':height,'width':width});
            }
        },100);
    });
    inited = true;
}