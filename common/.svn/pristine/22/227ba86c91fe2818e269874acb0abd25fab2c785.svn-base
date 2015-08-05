var pageTn = '';

// 统计逻辑
// @param {string} id 表单id
function statistics(options) {
	// 添加百度一下点击统计
	$('#' + options.id + 'Btn').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
		if($('#header').hasClass('hdmini')) {
			$.log('http://nsclick.baidu.com/v.gif?pid=104&searchpage=' + pageTn + '&s=zdjs&eventtype=click&newheader=1&wd=' + encodeURIComponent($('#' + options.id + 'Input').val()));
		}else {
			$.log('http://nsclick.baidu.com/v.gif?pid=104&searchpage=' + pageTn + '&s=zdjs&eventtype=click&wd=' + encodeURIComponent($('#' + options.id + 'Input').val()));
		}
		setTimeout(function() {
			$('#' + options.id).submit();
		}, 200)
	});
}

// Class: 预置query逻辑
function PreKey(options) {
	this.pageTn = options.pageTn;
	this.$input = $('#' + options.id + 'Input');
	if ( options.ismis ) {
		this._bind();
	} else {
		if ( PreKey.query ) {
			this._fillQuery();
		} else {
			PreKey.instances.push(this);
			PreKey.request();
		}
	}
}

PreKey.prototype = {
	// 填充query
	_fillQuery: function() {
		this.$input.attr('data-prekey', PreKey.query).addClass('place-holder').val(PreKey.query);
		this._bind();
	},

	// 绑定事件
	_bind: function() {
		var $input = this.$input,
			query = $input.attr('data-prekey');
		if ( query ) {
			$input.focus(function() {
				if ( $input.val() === query ) {
					$input.val('').removeClass('place-holder');
				}
			}).blur(function() {
				if ( !$input.val() ) {
					$input.addClass('place-holder').val(query);
				}
			});
		}
	}
};

// 实例回调函数，用于接收数据
PreKey.instances = [];

// 请求数据预置query数据
PreKey.request = function() {
	if (!this.loading) {
		this.loading = true;
		// JSONP回调，接口在CMS中作了静态化，函数名固定
		window.videoPreKeywordMIS = function(result) {
			if ( result && result[0] && result[0].data && result[0].data.videos ) {
				$.each(result[0].data.videos, function(index, item) {
					if ( $.trim(item.s_intro) === pageTn ) {
						PreKey.query = item.title;
						return false; 
					}
				});
			}
			if ( PreKey.query ) {
				$.each(PreKey.instances, function(index, item) {
					item._fillQuery();
				});
			}
		}

		$.getScript('http://v.baidu.com/staticapi/api_prekeyword.json?v=' + Math.ceil(new Date() / 7200000));
	}
}

exports = module.exports = function(options) {
	pageTn = options.pageTn;
	
	// 创建一个预置query实例
	var prekey = new PreKey(options);

	// 添加统计
	statistics(options);
};