var T = $;

/**
 * AB Test
 */
// 当前用户在1-100数轴上的位置
var userPosition;
// 设置userPosition的值，取BAIDUID中的最后两个数字
function setUserPosition() {
	var baiduid = T.cookie.get('BAIDUID'), match;
	if (baiduid) {
		match = baiduid.split(':')[0].match(/(\d)[^\d]*(\d)[^\d]*$/);
		if (match) {
			userPosition = Number(match[1] + match[2]);
			return true;
		}
	}
	return false;
}

// Class: ABTest，AB Test的具体实现
function ABTest() {
	// 数轴上已被划分的范围
	this.ranged = 0;
	// 是否已经命中
	this.isHit = false;
	// 如果userPosition未设置，则AB Test无法进行，重写split方法
	if (!userPosition) {
		this.split = function() {};
	}	
}
ABTest.prototype = {
	// 设定数轴上的命中范围
	// @range { Number || Array }，命中比例，如：25 = 25%的用户会命中
	// @callback { Function || Array }，命中时执行的函数
	// 可以同时设置多个区间
	split: function(range, callback) {
		if (!this.isHit) {
			if (typeof range === 'object' && typeof callback === 'object') {
				this._splits(range, callback);
			} else {
				this._hitting(range, callback);
			}
		}
	},
	// 同时设置多个区间时遍历处理
	_splits: function(ranges, callbacks) {
		for (var i = 0, len = ranges.length; i < len; i++) {
			if (this._hitting(ranges[i], callbacks[i])) {
				break;
			}
		}
	},
	// 计算设定的区间是否命中，命中则执行相应函数
	_hitting: function(range, callback) {
		if (typeof range === 'number' && typeof callback === 'function') {
			this.ranged += range;
			if (userPosition < this.ranged) {
				this.isHit = true;
				callback();
			}
		}
		return this.isHit;
	}
};

/*
 * 对外提供的接口
 */
var api = {};

// 创建并返回一个ABTest实例
// @name { String } 可选，传递此参数则实例可以通过api对象引用 api[name]
// @config { Object } 可选，相关选项
// @config.onerror { Function } 可选，如实例未创建成功则执行
// 目前只设定一种实例未创建成功的因素：cookie中无BAIDUID
api.create = function(name, config) {
	if (typeof name === 'object') {
		config = name;
	}
	if (typeof userPosition !== 'number' && !setUserPosition() && config && typeof config.onerror === 'function') {
		config.onerror();
	}
	var abtest = new ABTest();
	if (typeof name === 'string' && !api.hasOwnProperty(name)) {
		api[name] = abtest;
	}
	return abtest;
};

module.exports = api;