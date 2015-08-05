/********************************************
 *
 * 文件注释，说明文件名称和文件所包含内容
 * @fileName cutdown.js
 * @author shangwenhe
 * @create time 2015年05月12日09:34
 * @version {版本信息}  v0.0.1
 *
 * ////////////////////////////////////////
 *
 * @require
 * @describe  描述文件内容
 * @describ
 * @return  {string|object|function} Object
 * @Modification time
 *
 *********************************************/

// 引入jquery类
var $ = require("common:static/vendor/jquery/jquery.js");


// cutdown function 构造函数
function cutdown(arg) {

    this.endClock = arg.endClock || new Date(Date.parse('2015/5/13 00:00:00'));
    this.nowClock = arg.nowClock || new Date().getTime();
    this.timeGap = Math.round((this.endClock - this.nowClock) / 1000);
    this.onChangeTime = arg.onChangeTime;
    this.finish = arg.finish || null;
    this.start();
}


// cutdown 原型扩展
cutdown.prototype = {
    constructor: cutdown,
    parseDate: function (sdate) {
        var arr = sdate.split(/[- :\/]/);
        return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
    },
    countOnce: function () {
        var self = this;
        var cur = self.formatTime(self.timeGap);
        self.changeTime(cur);
        self.lastCount = cur;
    },
    start: function () {
        var self = this;
        self.timeout = setTimeout(function () {
            self.start();
        }, 1000);
        if (self.timeGap > 0) {
            self.timeGap--;
            self.countOnce(self.timeGap);
        } else {
            //倒计时结束
            if (typeof self.finish == "function") self.finish(self);
            clearTimeout(self.timeout);
        }
    },
    formatTime: function (time) {
        var arTimey = Math.floor(time / (60 * 60 * 24));
        var hour = Math.floor((time - arTimey * 60 * 60 * 24) / (60 * 60));
        var min = Math.floor((time - arTimey * 60 * 60 * 24 - hour * 60 * 60) / 60);
        var sec = time - arTimey * 60 * 60 * 24 - hour * 60 * 60 - min * 60;
        return [arTimey, hour, min, sec];
    },
    changeTime: function (cur) {
        this.curCount = cur;
        this.onChangeTime && this.onChangeTime(this, cur)
    }

}

module.exports = cutdown
