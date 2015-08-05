{%function name="bdv_pop"%}
    <div id="index_right_shixiao" static="bl=index_right_qipao"></div>
    <script type="text/template" id="index_right_shixiao_tpl">
        <% if (data && data.is_hd == 1){ %>
            <% var item = data; %>
            <% var isClose = item.hot_week == 1; %>
        <div class="pop-wrap-big<% if (isClose){ %> hide<% } %>">
            <a href="#" class="pop-close" static="stp=close"></a>
            <div class="pop-inner">
                <span class="label">热点：</span>
                <p class="big"><a href="<%=item.url%>" target="_blank" static="stp=pop_content"><%=item.intro%></a></p>
            </div>
        </div>
        <div class="pop-wrap-small<% if (isClose){ %> show<% } %>"><span class="label">· 热点：</span><a href="<%=item.url%>" target="_blank" static="stp=normal_content"><%=item.title%></a></div>
        <% } %>
    </script>
    {%script%}
        var _ = require("common:static/vendor/underscore/underscore.js");
        var tpl = _.template($("#index_right_shixiao_tpl").html());
        $.ajax({
            url: "http://v.baidu.com/staticapi/videoAd.json",
            dataType: "jsonp",
            jsonpCallback: "videoNewAd",
            success: function(ret){
                if (!ret || !ret.length || !ret[0]) return;
                var item = ret[0].data.videos;
                _.each(item, function(adItem){
                    if (adItem.sub_title == "index_right_qipao"){
                        if ($.cookie.getRaw("_bdvqipao") == -1){
                            adItem.hot_week = 1;
                            $.log("http://nsclick.baidu.com/u.gif?pid=104&bl=index_right_qipao&ext=close");
                        } else {
                            $.log("http://nsclick.baidu.com/u.gif?pid=104&bl=index_right_qipao&ext=open");
                        }

                        $("#index_right_shixiao").html(tpl({data: adItem}));

                        $(".pop-wrap-big .pop-close").off("click").on("click", function(e){
                            e.preventDefault();
                            $(this).parent().hide()
                                .next(".pop-wrap-small").show();
                            $.cookie.setRaw("_bdvqipao", "-1", {
                                expires: 3*24*60*60*1000
                            });
                        });

                        return false;
                    }
                });
            }
        });
        
    {%/script%}
{%/function%}