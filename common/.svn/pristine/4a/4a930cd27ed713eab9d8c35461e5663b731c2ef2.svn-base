{%function name="bdv_record" isWithBdvTrace=false event="click" hao123=false%}
<div id="bdvRecord" class="bdv-record{%if $isWithBdvTrace%} with-bdv-trace{%/if%}{%if $hao123%} bdv-record-hao123{%/if%}">
	<a href="javascript:;" class="bdv-record-toggle" data-event="{%$event%}" hidefocus="true">{%if $isWithBdvTrace%}记录{%else%}观看记录{%/if%}<i></i></a>
	<span class="bdv-record-num" style="display:none"></span>
    {%if $isWithBdvTrace%}
        <div class="bdv-record-arrow"><em>◆</em><i>◆</i></div>
    {%/if%}
	<div class="bdv-record-main"></div>
</div>
<script id="bdvrecord_js" charset="utf-8"></script>
{%script type="text/javascript"%}
	window.bdvRecordConfig = {
		proxy: location.protocol + '//' + location.host + '/browse_static/common/html/proxy_blank.html'
	};

    (function () {
        var loginCheck = require('common:static/ui/loginCheck/loginCheck.js');
        var url = 'http://vs3.bdstatic.com/pc_static/open/record/{%if $hao123%}bdv-record-hao123-new.js{%else%}bdv-record-min.js{%/if%}?bdv=0924';
        $.getScript(url, function () {
            loginCheck(function (uinfo) {
                if (uinfo.uid && uinfo.value) {
                    try {
                        bdvRecordAPI.init({
                            islogin: true
                        });
                    } catch (e) {}
                }
            });
        });
    })();
{%/script%}
{%/function%}
