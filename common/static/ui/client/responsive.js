require('common:static/ui/core/core.js');
require('common:static/vendor/bootstrap/js/transition.js');
var dimension = require('common:static/ui/client/dimension.js');
var ec = require('common:static/ui/eventcenter/eventcenter.js');
function init(){
    var size,classname = '',beforechange = '',type;
    dimension.detect(function(obj){
        var w = obj.width,h = obj.height;
        //console.log([w,h]);
        if(w<=1024){
            type = 'small';
        }else if(w<=1280){
            type = 'normal';
        }else if(w<=1400){
            type = 'wide';
        }else{
            type = 'wide';
        }
        classname = 'dimension-' + type;
        var csstxt = document.body.className;
        if(csstxt.indexOf(classname)==-1){
            if(type == 'small'){
                document.documentElement.style.overflowX = 'auto';
            }else{
                document.documentElement.style.overflowX = '';
            }
            if(!csstxt) 
                document.body.className = classname;
            else
                 document.body.className = csstxt.replace(/(dimension-\S*)/g,classname);
            ec.trigger('dimension.change',{'size':type});
        }
    });
    $(window).trigger('resize');
}
exports.start = init;