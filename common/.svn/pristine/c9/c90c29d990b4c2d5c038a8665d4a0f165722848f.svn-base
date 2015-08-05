/**
 * 事件中心
 */

var T = $;

var ec;
function eventObj(){
    this.callbacks = {};
    this.opts = {};
    this.fired = {};
}
eventObj.prototype = {
    fire:function(type, opts){
        if(type in this.callbacks && this.callbacks[type].length){
            for(var i=0;i<this.callbacks[type].length;i++){
                this.callbacks[type][i](opts);
            }
        }
    },
    on:function(type, callback){
        if(type in this.callbacks){
            this.callbacks[type].push(callback);
        }else{
            this.callbacks[type] = [callback];
        }
    }
}
T.extend(eventObj.prototype,{
    fireOnce: function(type, opts) {
       // if(type in this.callbacks && this.callbacks[type].length){
            this.fire(type, opts);
            this.opts[type + "__opts"] = opts;
            this.fired[type + "__Fired"] = true;
        //}
    },
    isFired: function(type) {
        return this.fired[type + "__Fired"] == true;
    },
    addListener: function(type, callback) {
        // 已经触发过的事件, 回调直接运行
        if (this.isFired(type)) {
            callback && callback.call(this, this.opts[type + "__opts"])
        }else{
            this.on(type, callback);
        }
    }
});
var create = function() {
    return ec ? ec : (ec = new eventObj());
};

exports.attach = function(type, callback) {
    var eventCenter = window.eventCenter = window.eventCenter || create();
    if (type) {
        eventCenter.addListener(type, callback);
    } else {
        callback.call(null);
    }
    return exports;
};

exports.trigger = function(type, opts) {
    var eventCenter = window.eventCenter = window.eventCenter || create();
    opts = opts || {};
    if (type ) {
        if (opts.once) {
            eventCenter.fireOnce(type, opts);
        } else {
            eventCenter.fire(type, opts);
        }
    }
    return exports;
};
