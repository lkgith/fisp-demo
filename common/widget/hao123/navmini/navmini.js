// 导航渲染、显示、隐藏逻辑
exports = module.exports = function() {
	// 是否已渲染内容
	var isRendered = false;

	$('#navmini').mouseenter(function(e) {
		// 与普通导航内容一致:no
		/*
		if ( !isRendered ) {
			$('#navmini .bd ul').append($('#nav li').clone());
			isRendered = true;
		}*/

		$(this).addClass('show');
	}).mouseleave(function() {
		$(this).removeClass('show');
	});
};