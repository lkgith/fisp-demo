var searchHandler = {
    showSugs: function (sugs) {
        $(".sug-wrapper").html("<li>" + sugs.join("</li><li>") + "</li>");
        $(".sug-wrapper").show();
    },
    hideSugs: function () {
        $(".sug-wrapper").hide();
    },
    isSugsShow: function () {
        return !($(".sug-wrapper").css("display") == "none");
    },
    setCurrSug: function (sugItem) {
        var sugLisDom = $(".sug-wrapper li");
        sugLisDom.removeClass("curr");
        sugItem.addClass("curr");
    },
    cancelCurrSug: function (sugItem) {
        sugItem.removeClass("curr");
    },
    getCurrIndex: function () {
        var sugLisDom = $(".sug-wrapper li");
        return sugLisDom.index($(".sug-wrapper li.curr"));
    },
    setInputValue: function (val) {
        $(".search-input").val(val);
    },
    getSugLength: function () {
        return $(".sug-wrapper li").length;
    },
    getSugAtIndex: function (idx) {
        return $(".sug-wrapper li").eq(idx);
    },
    openSearchPage: function () {
        var wd = $.trim($(".search-input").val());

        if (wd !== '') {
            window.open(this.createSearchUrl(wd));
        }
    },
    createSearchUrl: function (word) {
        return "http://baoku.baidu.com/search.php?ie=utf8&flag=sug&word=" + encodeURIComponent(word);
    },
    createSugUrl: function (wd) {
        return "http://nssug.baidu.com/su?wd=" + encodeURIComponent(wd) + "&prod=yingyin_browser&ie=utf-8";
    }
};

/**************modules****************/
var dataModule = function () {
    function _getJSON (url, callback) {            
        $.ajax({
            url: url,
            dataType: "jsonp"
        })
        .done(function (rs) {
            
            if (rs.errno === 0) {
                //
                callback && callback(rs.errno, rs.data);
            } else {
                //
                callback && callback(rs.errno, rs.errmsg);
            }
        })
        .fail(function (rs) {
            callback && callback(rs.errno, rs.errmsg);
        });
    }

    return {
        getTagSug: function (wd) {
            $.ajax({
                url: searchHandler.createSugUrl(wd),
                dataType: "jsonp",
                success: function (rs) {}
            });
        }
    };
}();

/*********bind events to document and search form****/
function bindGlobalEvents () {
    window.baidu = {};
    window.baidu.sug = function (rs) {
        if (rs.s.length === 0) {
            searchHandler.hideSugs();
        } else {
            searchHandler.showSugs(rs.s);
        }
    };

    $(document).click(function (e) {
        var target = $(e.target);

        if (!target.is(".search-input")) {
            searchHandler.hideSugs();
        }
    });

    $('#searchSub').on('click', function (e) {
        $("#search").submit();
    });

    $("#search").on("submit", function (e) {
        e.preventDefault();
        searchHandler.openSearchPage();
        searchHandler.hideSugs();
    });     
}

/**********bind events to sugs************/
function bindSugsEvents () {
   $(".sug-wrapper").on("mousemove", "li", function (e) {
        searchHandler.setCurrSug($(this));
    });

    $(".sug-wrapper").on("mouseout", "li", function (e) {
        searchHandler.cancelCurrSug($(this));
    });

    $(".sug-wrapper").on("click", "li", function (e) {
        searchHandler.setInputValue($(this).text());
        searchHandler.setCurrSug($(this));

        $("#search").submit();
    });

    $(".search-input").on("keyup", function (e) {
        if (e.keyCode == 13 || e.keyCode == 40 || e.keyCode == 38) {
            return;
        }
        dataModule.getTagSug(this.value);

    });

    $(".search-input").on("keydown", function (e) {
        var sugLisDom = $(".sug-wrapper li");
        var currSugLiIndex = searchHandler.getCurrIndex();
        var logConf = {
            'bl': 'seEnterKey',
            'wd': this.value
        };
        
        if (e.keyCode == 13) {
            e.preventDefault();
            
            $("#search").submit();

        } else if (e.keyCode == 40) {
            e.preventDefault();

            if (!searchHandler.isSugsShow()) {
                return;
            }
            if (currSugLiIndex < searchHandler.getSugLength() - 1) {
                ++currSugLiIndex;
            } else {
                currSugLiIndex = 0;
            }
            var newCurrItem = searchHandler.getSugAtIndex(currSugLiIndex);
            searchHandler.setInputValue(newCurrItem.text());
            searchHandler.setCurrSug(newCurrItem);
        } else if (e.keyCode == 38) {
            e.preventDefault();

            if (!searchHandler.isSugsShow()) {
                return;
            }
            if (currSugLiIndex > 0) {
                currSugLiIndex--;
            } else {
                currSugLiIndex = sugLisDom.length - 1;
            }
            var newCurrItem = searchHandler.getSugAtIndex(currSugLiIndex);
            searchHandler.setInputValue(newCurrItem.text());
            searchHandler.setCurrSug(newCurrItem);
        }
    });   
}

function bindChannelEvents () {
    $('.normalLi').mouseenter(function (event) {
        var $this = $(this);

        $this.addClass('hover')
        $this.find('.channelTips').show();
    }).mouseleave(function (event) {
        var $this = $(this);

        $this.removeClass('hover');
        $this.find('.channelTips').hide();
    });
}

function init () {
    bindGlobalEvents();
    bindSugsEvents();
    bindChannelEvents();
}

init();