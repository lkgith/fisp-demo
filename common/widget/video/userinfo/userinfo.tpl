{%function name="userinfo"%}
<div id="userinfo" static="bl=userinfo" monkey="userbar" alog-alias="userinfo">
    <p></p>
</div>
{%script%}
    var initUserTip = require('./userinfo.js');
        loginCheck = require('common:static/ui/loginCheck/loginCheck.js');
        loginCheck(initUserTip);
        loginCheck(function(userinfo) {
            if ( userinfo && userinfo.value ) {
                $(document.body).addClass('global-logged');
            }
        });
{%/script%}
{%/function%}
