{%*
hunter统计脚本
@param {string} pageId 页面统计ID 'session'前缀只进行session统计 'page'前缀既有session又有monkey统计
@param {array} realtime 实时区块列表，每个区块要有唯一的序号，从11开始
@param {number} mid 当前页面在点击猴子系统中对应记录的ID
*%}
{%function name="hunter" debug=false version="video" realtime=[] mid=0 pageId="" location=""%}
{%if $debug%}
    {%$pages=[
        'page-video-index'=>	'首页',
        'page-video-index-movie'=>	'电影频道I级页',
        'session-video-sub-movie'=>	'电影频道II级页',
        'page-video-index-tvplay'=>	'电视剧I级页',
        'session-video-sub-tvplay'=>	'电视剧II级页',
        'page-video-index-cartoon'=>	'动漫I级页',
        'session-video-sub-cartoon'=>	'动漫II级页',
        'page-video-index-tamasha'=>	'综艺I级页',
        'session-video-sub-tamasha'=>	'综艺II级页',
        'session-video-live'=>	'电视直播页',
        'page-video-jwks'=>	'今晚看啥页',
        'session-video-list'=>	'专题页',
        'session-video-channal-music'=>	'音乐I级页',
        'session-video-channal-sub-music'=>	'音乐II级页',
        'session-video-channal-amuse'=>	'搞笑I级页',
        'session-video-channal-sub-amuse'=>	'搞笑II级页',
        'session-video-channal-woman'=>	'美女I级页',
        'session-video-channal-drama'=>	'相声I级页',
        'session-video-channal-sub-drama'=>	'相声II级页',
        'session-video-channal-info'=>	'资讯I级页',
        'session-video-channal-sub-info'=>	'资讯II级页',
        'session-video-channal-sport'=>	'体育I级页',
        'session-video-channal-sub-sport'=>	'体育II级页',
        'session-video-channal-game'=>	'游戏I级页',
        'session-video-channal-sub-game'=>	'游戏II级页',
        'session-video-top'=>	'排行榜首页',
        'session-video-top-movie'=>	'排行榜热门电影页',
        'session-video-top-tvplay'=>	'排行榜电视剧页',
        'session-video-top-cartoon'=>	'排行榜卡通动漫页',
        'session-video-top-music'=>	'排行榜音乐MV页',
        'session-video-top-tamasha'=>	'排行榜综艺节目页',
        'session-video-top-game'=>	'排行榜游戏天地页',
        'session-video-summary'=>	'带特型的汇总页',
        'session-video-common'=>	'不带特型的汇总页',
        'session-video-customization'=>	'高级定制页',
        'session-video-detail-movie-copyright'=>	'正版电影详情页',
        'session-video-detail-movie-nocopyright'=>	'无正版电影详情页',
        'session-video-detail-tvplay'=>	'电视剧详情页',
        'session-video-detail-cartoon'=>	'动漫详情页',
        'session-video-detail-tamasha'=>	'综艺详情页',
        'session-video-nofocus-movie'=>	'电影无焦点页',
        'session-video-nofocus-tvplay'=>	'电视剧无焦点页',
        'session-video-nofocus-cartoon'=>	'动漫无焦点页',
        'session-video-nofocus-music'=>	'音乐无焦点页',
        'session-video-dna-movie'=>	'电影基因页',
        'session-video-similar-movie'=>	'电影类似XX页',
        'session-video-dna-tvplay'=>	'电视剧基因页',
        'session-video-similar-tvplay'=>	'电视剧类似XX页',
        'session-video-person'=>	'人物页',
        'session-video-dna-person'=>	'基因人物页',
        'session-video-play-kan'=>	'短视频内嵌播放页',
        'session-video-play-movie'=>	'电影播放页',
        'session-video-play-tvplay'=>	'电视剧播放页',
        'session-video-play-tamasha'=>	'综艺播放页',
        'session-video-play-cartoon'=>	'动漫播放页',
        'page-hao123-index-dianying'=>	'hao123电影频道I级页',
        'session-hao123-sub-dianying'=>	'hao123电影频道II级页',
        'page-hao123-index-dianshi'=>	'hao123电视剧I级页',
        'session-hao123-sub-dianshi'=>	'hao123电视剧II级页',
        'page-hao123-index-dongman'=>	'hao123动漫I级页',
        'session-hao123-sub-dongman'=>	'hao123动漫II级页',
        'page-hao123-index-zongyi'=>	'hao123综艺I级页',
        'session-hao123-sub-zongyi'=>	'hao123综艺II级页',
        'session-hao123-detail-dianying-copyright'=>	'hao123正版电影详情页',
        'session-hao123-detail-dianying-nocopyright'=>	'hao123无正版电影详情页',
        'session-hao123-detail-dianshi'=>	'hao123电视剧详情页',
        'session-hao123-detail-dongman'=>	'hao123动漫详情页',
        'session-hao123-detail-zongyi'=>	'hao123综艺详情页',
        'session-hao123-dna-dianying'=>	'hao123电影基因页',
        'session-hao123-similar-dianying'=>	'hao123电影类似XX页',
        'session-hao123-dna-dianshi'=>	'hao123电视剧基因页',
        'session-hao123-similar-dianshi'=>	'hao123电视剧类似XX页',
        'session-hao123-dna-person'=>	'hao123基因人物页'
    ]%}
    {%if isset($pageId) && $pageId%}
        <div style="border: 4px #ffd700 solid;height: 30px;line-height:30px;font-size: 20px;color: #adff2f">
            {%$pageId%} ------ {%$pages[$pageId]%}
        </div>
    {%/if%}
{%/if%}

{%if isset($pageId) && $pageId%}
    <script src="http://img.baidu.com/hunter/alog/alog.min.js"></script>
    <script>
        var pageId='{%$pageId%}{%if isset($pageTn) && $pageTn == "indsa" && isset($location) && $location > 1%}-{%$location%}{%/if%}';
        (function() {
            alog('set', 'alias', {
                monkey: 'http://img.baidu.com/hunter/alog/monkey.min.js',
                element: 'http://img.baidu.com/hunter/alog/element.min.js'
            });
            alog('require', ['monkey', 'element'], function(monkey, element){
                element.an("group", "monkey");
                monkey.create({
                    page: pageId,
                    pid: 241,
                    p: 104,
                    hid: 337,
                    postUrl: 'http://nsclick.baidu.com/u.gif',
                    reports: {
                        refer: 1,
                        staytime: 1
                    }
                });
            });
            alog('monkey.send', 'pageview', {now: +new Date});

            alog('monkey.on', 'send', function(data){
                if ( data.xp && data.xp.indexOf('(searchContent)') > -1 ) {
                    alog("monkey.set", "postUrl", "");
                } else {
                    alog("monkey.set", "postUrl", "http://nsclick.baidu.com/u.gif");
                }
            });

        }());
    </script>
{%/if%}
<script>with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://img.baidu.com/hunter/{%$version%}.js?st='+~(new Date()/864e5)];</script>
{%/function%}
