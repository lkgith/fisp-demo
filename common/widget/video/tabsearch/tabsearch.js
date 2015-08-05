/**
 * @file tabsearch
 * @author fe
 */

// 搜索框标签query拖带
exports = module.exports = function () {
    // 各产品线搜索结果页面URL
    var urls = {
        // 新闻
        news: 'http://news.baidu.com/ns?cl=2&rn=20&tn=news&word={{query}}&ie=utf-8',
        // 大搜索
        ps: 'http://www.baidu.com/s?cl=3&wd={{query}}&ie=utf-8',
        // 贴吧
        tieba: 'http://tieba.baidu.com/f?kw={{query}}&t=1&ie=utf-8',
        // 知道
        zhidao: 'http://zhidao.baidu.com/q?ct=17&pn=0&tn=ikaslist&rn=10&word={{query}}&ie=utf-8',
        // 音乐
        music: 'http://music.baidu.com/search?fr=video&key={{query}}&ie=utf-8',
        // 图片
        image: 'http://image.baidu.com/search/index'
        + '?tn=baiduimage&ct=201326592&cl=2&lm=-1&pv=&word={{query}}&z=0&ie=utf-8',
        // 地图
        map: 'http://map.baidu.com/m?word={{query}}&fr=map004&ie=utf-8',
        // 百科
        baike: 'http://baike.baidu.com/search/word?word={{query}}&pic=1&sug=1'
    };

    // 输入框
    var $input = $('#bdvSearchInput');

    if ($input.length) {
        $('#tabsearch .tabs').delegate('a[data-product]', 'click', function (e) {
            var query = $input.val();
            var url;

            if (query && query !== $input.attr('data-prekey')) {
                url = urls[this.getAttribute('data-product')];

                if (url) {
                    this.href = url.replace('{{query}}', query);
                }
            }
        });
    }

    // ps https判断
    var $psLink = $('#tabsearch .tabs a[data-product=ps]');
    if (/chrome|firefox|safari|msie 10|rsv:11|msie [89]/i.test(navigator.userAgent)) {
        $psLink.prop('href', 'https://www.baidu.com/');
        urls.ps = 'https://www.baidu.com/s?cl=3&wd={{query}}&ie=utf-8';

        $psLink.one('mouseover', function () {
            window.BaiduHttps = window.BaiduHttps || {};
            window.BaiduHttps.callbacks || (window.BaiduHttps.callbacks = function () {});
            $.ajax({
                url: 'https://www.baidu.com/con?from=vbaidu&callback=?',
                dataType: 'jsonp',
                jsonpCallback: 'BaiduHttps.callbacks'
            });
        });
    }
};
