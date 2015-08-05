<!DOCTYPE html>
{%* 使用html插件替换普通html标签，同时注册JS组件化库 *%}
{%html%}
{%* 使用head插件替换head标签，主要为控制加载同步静态资源使用 *%}
    {%head itemscope itemtype="http://schema.org/WebSite"%}
    <meta charset="utf-8" />
    <title itemprop="name">
        dsffs
    </title>
    <link rel="icon" type="image/x-icon" href="http://bce.baidu.com/img/fi.ico">
    <link rel="canonical" href="http://bce.baidu.com/" itemprop="url">
    <meta content="http://bs.baidu.com/zhanzhang/zzlogo/b2dfda971993c93bbab93a1d736afb55.png" itemprop="image">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
    <meta name="baidu-site-verification" content="5zuPvqPyLk" />
<meta name="keywords" content="对象存储、云存储、视频存储、多媒体存储、图片存储空间" /><meta name="description" content="对象存储（Baidu Object Storage，BOS）提供海量、安全、高可靠、可随时扩展的云存储服务，按需付费，数据可靠性达99.999999999%。提供RESTful API及多语言SDK" />    <meta name="renderer" content="webkit">
<link rel="stylesheet" href="http://bce.baidu.com/css/product/bos/all.css?v=1438258829-0" />
  
    {%script%}
require.config({baseUrl:"/js",urlArgs:"v=1438258829",paths:{"data/doc":"../doc/js/data"},packages:[{name:"jquery",location:"../dep/jquery/1.9.1",main:"jquery"},{name:"jquery.cookie",location:"../dep/jquery.cookie/1.4.0",main:"jquery.cookie"},{name:"parallax",location:"../dep/parallax/2.1.3"},{name:"marked",location:"../dep/marked/0.3.2",main:"marked"},{name:"highlight",location:"../dep/highlight.js/8.4.0/src",main:"highlight"},{name:"lightbox",location:"../dep/lightbox2/2.7.1"},{name:"isMobile",location:"../dep/isMobile/0.3.6/src",main:"isMobile"},{name:"mini-event",location:"../dep/mini-event/1.0.2/src",main:"main"},{name:"webuploader",location:"../dep/webuploader/0.1.5",main:"webuploader"},{name:"babel-runtime",location:"../dep/babel-runtime/0.0.0/src"},{name:"etpl",location:"../dep/etpl/3.0.0/src",main:"main"},{name:"esui",location:"../dep/esui/3.1.0-beta.6/src",main:"main"},{name:"underscore",location:"../dep/underscore/1.6.0/src",main:"underscore"},{name:"moment",location:"../dep/moment/2.7.0/src",main:"moment"},{name:"er",location:"../dep/er/3.1.0-beta.6/src"},{name:"eoo",location:"../dep/eoo/0.1.1/src"},{name:"crypto",location:"../dep/crypto/0.0.0/src",main:"main"},{name:"zeroclipboard",location:"../dep/zeroclipboard/2.2.0/src",main:"ZeroClipboard"},{name:"fastclick",location:"../dep/fastclick/0.0.0/src",main:"main"}]}),function(){var e="https:"==document.location.protocol?" https://":" http://",a=document.createElement("script");a.src=e+"hm.baidu.com/hm.js?28a17f66627d87f1d046eae152a1c93d";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(a,o)}();try{document.execCommand("BackgroundImageCache",!1,!0)}catch(ex){}
   {%/script%}

    <!--[if lt IE 9]>
    <script>for(var i=0,t="abbr, article, aside, audio, canvas, datalist, details, dialog, eventsource, figure, footer, header, hgroup, mark, menu, meter, nav, output, progress, section, time, video, figcaption, main".split(", ");i<t.length;i++){document.createElement(t[i]);}</script>
    <![endif]-->
{%head%}

<!--[if lte IE 9]>
<body class="ie9-lt bos">
<![endif]-->

{%body class="bos"%}
    <header>
 {%widget name="common:widget/video/header/header.tpl"%} 
    </header> 
{%widget name="common:widget/video/nav/nav.tpl"%} 

    <main>
    {%widget name="home:widget/main_1.tpl"%}
    	{%widget name="home:widget/main_2.tpl"%}
    	 {%widget name="home:widget/main_3.tpl"%}	
    	 {%widget name="home:widget/main_4.tpl"%}		
    	 {%widget name="home:widget/main_5.tpl"%}
    	 {%widget name="home:widget/main_6.tpl"%}	 				
    </main> 
    <footer> 
    	{%* {%widget name="common:widget/video/footer/footer.tpl"%} *%}
    	</footer>
 {%script%}
require(['product'], function (page) {
    page.init();
});
 {%/script%}
{%/body%}
<!-- last build time: Thu Jul 30 2015 20:20:39 GMT+0800 (CST) Powered by edp,edp-webserver,edp-build -->
{%/html%}

