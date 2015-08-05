/**
* @autor hejie
* @date  2015/01/09
* @description slide滚动组件，以viewpoint元素视窗，每次移动一个视窗，无限循环
*/

function carousel(opt){
    this.el = $(opt.el).eq(0);
    this.viewpoint = this.el.find('.view-point').eq(0);
    this.content = this.el.find('.view-cont').eq(0);
    this.events = {
        'click .prev':this.proxy(this.slide,-1),
        'click .next':this.proxy(this.slide,1)
    }
    this.initEvent();
}
carousel.prototype = {
    proxy : function() {
        var _this = this, _slice = [].slice, func = arguments[0], args = _slice.call(arguments, 1);
        return function() {
            return func.apply(_this, args.concat(_slice.call(arguments)));
        }
    },
    initEvent:function(){
        if(this.events){
            for(var key in this.events){
                var eventMeta = key.match(/^(\S+)\s*(.*)$/);
                    eventName = eventMeta[1];
                    selector = eventMeta[2];
                if (selector === "") {
                    this.el.on(eventName, this.events[key]);
                } else {
                    this.el.on(eventName, selector, this.events[key]);
                }
            }
        }
    },
    slide:function(direction){
        var self = this;
        var onestep = viewwidth = this.viewpoint.width();
        var total = this.content.outerWidth(true);
        var cur = parseInt(this.content.css('left'));
        if(!self.queue) self.queue = [this.content];
        if(self.issliding) return;
        //置换content位置
        if(self.queue.length>1){
            if(direction>0 && total+cur<=viewwidth || direction<0 && cur>0){
                $.each(self.queue,function(index,item){
                    if(item!=self.content){
                        self.content = item;
                        return;
                    }
                });
            }
        }
        //处理边界
        var curNew = parseInt(this.content.css('left'));
        if(direction>0 && (total + curNew - viewwidth >= 0 && total + curNew - viewwidth - onestep <= 0) || (curNew <= 0 && curNew + onestep > 0)){
            var copy = self.content.clone();
            copy.addClass('copy-after');
            copy.insertAfter(self.content);
            copy.css({'left':curNew + direction*total});
            self.queue.push(copy);
        }

        self.issliding = self.queue.length;
        $.each(self.queue,function(index,item){
            item.animate({'left':parseInt(this.css('left'))-direction*onestep},500,function(){
                self.issliding--;
                if(!self.issliding) exchangePos();
            });
        });
        //干掉过渡dom
        function exchangePos(){
            for(var i=0;i<self.queue.length;i++){
                var qleft = parseInt(self.queue[i].css('left'));
                if(qleft <= -1*total || qleft > viewwidth){
                    if(self.queue[i] == self.content) self.content = null;
                    self.queue[i].remove();
                    self.queue.splice(i,1);
                }
            }
            if(!self.content && self.queue.length){
                self.content = self.queue[0];
            }
            
        }
    }
}
exports.init = function (opt){
    new carousel(opt);
}