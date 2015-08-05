/********************************************
 *
 * 文件注释，说明文件名称和文件所包含内容
 * @file fastNav.js
 * @author shangwenhe
 * @create time 2015年06月15日16:04
 * @version {版本信息}  v0.0.1
 *
 * ////////////////////////////////////////
 *
 * @require 'common:static/vendor/jquery/jquery.js'
 * @describe  描述文件内容
 * @return  {string|object|function} Object
 * @Modification time
 *
 *********************************************/
/* globals __inline */
var baiduTangram = $;
var client = require('common:static/ui/client/client.js');
require('common:static/vendor/bootstrap/js/modal.js'); // 弹层组件
var loginCheck = require('common:static/ui/loginCheck/loginCheck.js'); // 登录组件

var brower = client.browser.ie
            || client.browser.chrome
            || client.browser.safari
            || client.browser.firefox
            || client.browser.konq
            || client.browser.opera;
var soft = client.system.win || client.system.mac || client.system.x11;
var user = ' ';
loginCheck(function (userinfo) {
    user = document.getElementById('user_name') && document.getElementById('user_name').innerHTML || userinfo.value;
});
var t = new Date();
var dialog;

function showFeedBack(tabindex) {
    var isBaokong = false;
    if (tabindex && tabindex === 5) {
        // 显示暴恐样式
        isBaokong = true;
    }
    if (dialog) {
        dialog.modal('show');
        return;
    }
    else {
        var FeedbackHTML = '<div id="feedback" class="modal fade feedback-modal">\
			<iframe name="postpage" style="height:0;width:0;display:block;border:none;" src="about:blank"></iframe>\
			<div class="modal-dialog">\
            <div class="modal-content">\
                <a href="javascript:void(0)" class="dialog-close" data-dismiss="modal"></a>\
			<form id="feedbackForm" action="http://ufo.baidu.com/listen/api/addfeedback" \
                method="post"  accept-charset="utf-8" target="postpage" >\
				<h2><span>1</span>' + (isBaokong ? '请填写您举报的问题及网址' : '请选择问题分类：') + '</h2>\
				<div id="tab" class="tang-ui tang-tab" tang-param="originalIndex: 0;">\
					<ul class="tang-title" id="tang-title" ' + (isBaokong ? 'style="display:none;"' : '') + '>\
						<li class="tang-title-item tang-title-item-selected"  default_value="8657">\
							<a href="#" onClick="return false;" hidefocus="true">\
								<span>产品问题</span>\
							</a>\
						</li>\
						<li class="tang-title-item" default_value="8658">\
							<a href="#" onClick="return false;" hidefocus="true" >\
								<span>信息错误</span>\
							</a>\
						</li>\
						<li class="tang-title-item" default_value="8659">\
							<a href="#" onClick="return false;" hidefocus="true" >\
								<span>播放不了</span>\
							</a>\
						</li>\
						<li class="tang-title-item" default_value="8660">\
							<a href="#" onClick="return false;" hidefocus="true" >\
								<span>搜索不到</span>\
							</a>\
						</li>\
						<li class="tang-title-item" default_value="8661">\
							<a href="#" onClick="return false;" hidefocus="true" >\
								<span>投诉问题链接</span>\
							</a>\
						</li>' + (isBaokong ? '<li class="tang-title-item" \
                                default_value="暴恐音视举报"><a href="#" \
                                onClick="return false;" hidefocus="true" ><span>暴恐音视举报</span></a></li>' : '') + '\
					</ul>\
					<div class="tang-body" id="tang-body">\
						<div class="tang-body-item tang-body-item-selected">\
							<textarea default-value="对我们的产品有什么建议，欢迎反馈哦~" \
                            maxlength="1000" class="textarea" id="textarea" \
                            value="对我们的产品有什么建议，欢迎反馈哦~">对我们的产品有什么建议，欢迎反馈哦~</textarea>\
						</div>\
					</div>\
				</div>\
				<h2>\
					<span>2</span>\
					请留下联系方式，您将有机会获得精美礼品！\
				</h2>\
				<div class="feedback-contact" id="feedback-contact">\
					<div class="box">\
						<input type="text" value="QQ/邮箱/电话" \
                        default-value="QQ/邮箱/电话" name="contact" maxlength="50" id="qq"/>\
					</div>\
					<div class="des">(可选)</div>\
					<div style="clear:both;"></div>\
				</div>\
				<div class="sub-btn" id="sub-btn"></div>\
				<input type="hidden" name="description" />\
				<input type="hidden" name="feedback_type" />\
				<input type="hidden" name="contact_way" />\
				<input type="hidden" name="product_line" value="90084" />\
				<input type="hidden" name="browser" />\
				<input type="hidden" name="platform" />\
				<input type="hidden" name="username" />\
				<input type="hidden" name="submit_time" />\
				<input type="hidden" name="feedback_url" />\
			</form>\
		</div></div></div>';
        // 插入弹层到页面中
        baiduTangram(document.body).append(FeedbackHTML);
        // 创建Dialog实例
        dialog = baiduTangram('#feedback').modal({
            mask: true
        });
        dialog.modal('show');
    }

    var InputEle = baiduTangram('#qq');
    InputEle.on('focus',
        function (e) {
            var $self = $(this);
            $self.addClass('focus');
            var defvalue = $self.attr('default-value');
            if ($self.val() === defvalue) {
                $self.val('');
            }
        });
    InputEle.on('blur',
        function (e) {
            var $self = $(this);
            var defvalue = $self.attr('default-value');
            if ($self.val() === '') {
                $self.val(defvalue);
                $self.removeClass('focus');
            }
        });

    function getIndex(ele) {
        var n = 0;
        var pre = ele.previousSibling;
        while (pre) {
            if (pre.nodeType === 1) {
                n++;
            }
            pre = pre.previousSibling;
        }
        return n;
    }

    $('#tang-title').find('li').on('click', changes);

    var tips = [
        ['对我们的产品有什么建议，欢迎反馈哦~'],
        ['片名、演员、图片等信息报错，我们会尽快改正'],
        ['视频不能正常播放，可以在这里反馈'],
        ['搜索不到想要的结果或对结果不满意，可以告诉我们'],
        ['如有错误、虚假、盗版、无效链接，请反馈页面地址给我们'],
        ['您的举报信息，会给我们提供巨大的帮助~']
    ];
    var message = '8657';
    var otextarea = $('#textarea');

    function changes() {
        var $self = $(this);
        message = $self.attr('default_value');
        var defaultvalue = otextarea.attr('default-value');
        var nIndex = $self.index();
        $self.addClass('tang-title-item-selected').siblings('li').removeClass('tang-title-item-selected');

        otextarea.attr('default-value', tips[nIndex]);
        if (otextarea.val() === defaultvalue) {
            otextarea.val(tips[nIndex]);
        }
        /*var reg2 = /ie/g;
		if (otextarea.value != otextarea.innerHTML || otextarea.value == otextarea.innerHTML) {
			if (reg2.test(brower)) {
				otextarea.innerHTML == otextarea.value
			} else {
				otextarea.innerHTML = tips[nIndex]
			}
		} else {
			otextarea.innerHTML == otextarea.value
		}*/
    }
    $('#tang-body textarea')
        .on('focus', ofocus)
        .on('blur', oblur);

    function ofocus() {
        var $self = $(this);
        $self.addClass('focus');
        var defvalue = $self.attr('default-value');
        if (this.value === defvalue) {
            this.value = '';
        }
    }

    function oblur() {
        var $self = $(this);
        var defvalue = $self.attr('default-value');
        if (this.value === '') {
            this.value = defvalue;
            $self.removeClass('focus');
        }
    }
    var kong = true;
    var contact = true;
    var valueContact = '';
    $('#sub-btn').on('click',
        function (e) {
            var kong = true;
            var contact = true;
            var ThisValue = otextarea.attr('default-value');
            var ThisValueContact = InputEle.attr('default-value');

            if (otextarea.val() !== ThisValue) {
                kong = false;
            }
            if (InputEle.val() !== ThisValueContact) {
                valueContact = InputEle.val();
                var mail = /^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/;
                var tel = /^\d{5,11}$/;
                // 当输入为纯数字时进行电话判断
                if (/^\d+$/g.test(InputEle.val())) {
                    if (!tel.test(InputEle.val())) {
                        contact = false;
                    }
                }
                else {
                    if (!mail.test(InputEle.val())) {
                        contact = false;
                    }
                }
            }
            if (kong === true) {
                alert('反馈内容不能为空！');
            }
            else if (contact === false) {
                alert('联系方式填写不正确！');
            }
            else {
                var feedForm = $('#feedbackForm')[0];
                feedForm.description.value = otextarea.val();
                feedForm.contact_way.value = valueContact;
                feedForm.browser.value = brower;
                feedForm.platform.value = soft;
                feedForm.username.value = user;
                feedForm.feedback_url.value = document.location.href;
                feedForm.submit_time.value = t;
                feedForm.feedback_type.value = message;
                feedForm.submit();
                alert('提交成功!');
                var tips = document.getElementById('deadlink-feedback-tip');
                if (tips) {
                    tips.innerHTML = '反馈成功,谢谢！';
                    tips.id = 'deadlink-feedback-tip-ok';
                    tips.className = 'feedbackok';
                }
                dialog.modal('hide');
            }
        });
    if (isBaokong) {
        $('#tang-title').find('li').eq(tabindex).trigger('click');
    }
}
module.exports = showFeedBack;
