var BigPipe = function() {

    function ajax(url, cb, data) {
        var xhr = new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
        var timer, isTimeout = false;

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && !isTimeout) {
                cb(xhr.responseText);
                clearTimeout(timer);
            }
        };

        timer = setTimeout(function(){
            try{
                xhr.abort();
            }catch(e){}
            
            isTimeout = true;
            cb("timeout");
        }, 5000);

        xhr.open(data?'POST':'GET', url + '&t=' + ~~(Math.random() * 1e6), true);

        if (data) {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(data);
    }


    function renderPagelet(obj, pageletsMap, rendered) {
        if (obj.id in rendered) {
            return;
        }
        rendered[obj.id] = true;

        if (obj.parent_id) {
            renderPagelet(
                pageletsMap[obj.parent_id], pageletsMap, rendered);
        }

        //
        // 将pagelet填充到对应的DOM里
        //
        var dom = document.getElementById(obj.id);
        if (!dom) {
            dom = document.createElement('div');
            dom.id = obj.id;
            document.body.appendChild(dom);
        }

        dom.innerHTML = obj.html;

        var scriptText = dom.getElementsByTagName('script');
        
        for (var i = 0, len = scriptText.length; i < len; i++) {
            node = scriptText[i];
            if (!node.type || node.type === 'text/javascript') {
                text = node.text || node.textContent || node.innerHTML || "";
                 window[ "eval" ].call( window, text );
            }
        }

    }


    function render(pagelets) {
        var i, n = pagelets.length;
        var pageletsMap = {};
        var rendered = {};

        //
        // 初始化 pagelet.id => pagelet 映射表
        //
        for(i = 0; i < n; i++) {
            var obj = pagelets[i];
            pageletsMap[obj.id] = obj;
        }

        for(i = 0; i < n; i++) {
            renderPagelet(pagelets[i], pageletsMap, rendered);
        }
    }


    function process(data) {
        if (data == "abort" || data == "error"){
            return;
        }

        var rm = data.resource_map;

        if (rm.async) {
            require.resourceMap(rm.async);
        }

        function loadNext() {
            // if (rm.style) {
            //     var dom = document.createElement('style');
            //     dom.innerHTML = rm.style;
            //     document.getElementsByTagName('head')[0].appendChild(dom);
            // }
            render(data.pagelets);
            
            if (rm.js) {
                LazyLoad.js(rm.js, function() {
                    rm.script && window.eval(rm.script);
                });
            }
            else {
                rm.script && window.eval(rm.script);
            }
        }

        rm.css
            ? LazyLoad.css(rm.css, loadNext)
            : loadNext();
    }


    function asyncLoad(arg, baseURI, cb) {
        if (!(arg instanceof Array)) {
            arg = [arg];
        }
        var obj, arr = [];
        for (var i = arg.length - 1; i >= 0; i--) {
            obj = arg[i];
            if (!obj.id) {
                throw new Error('missing pagelet id');
            }
            arr.push('pagelets[]=' + obj.id);
        }

        var url = baseURI || location.href.split('#')[0];
        url = url + (url.indexOf("?")>-1? "&": "?") + arr.join('&') + '&force_mode=1';

        ajax(url, function(res) {
            var data = res == "timeout"? "timeout": "error";
            try{
                data = window.JSON?
                    JSON.parse(res) :
                    eval('(' + res + ')');
            }catch(e){}

            cb? 
                cb(data): 
                process(data);
        });
        $.log('http://nsclick.baidu.com/u.gif?pid=104&fe=bigpipe&page=indsa&pagelets=' + obj.id);
    }

    function lazyAsync(arg, url, callback){
        asyncLoad(arg, url, callback);
    }

    return {
        asyncLoad: asyncLoad,
        lazyAsync: lazyAsync,
        process: process
    }
}();