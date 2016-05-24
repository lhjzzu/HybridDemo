'use strict';

;(function () {
    // UA
    var ua = navigator.userAgent.toLowerCase(),

    // scrollView
    cmsScrollView = document.querySelector('#cmsScrollView'),
        scrollView = new ctrl.scrollview(cmsScrollView, {
        useFrameAnimation: true
    });
    window.scrollView = scrollView;

    // lazyload
    scrollView.lazyload.enable = true;
    scrollView.lazyload.realtime = false;

    // 下拉刷新
    scrollView.pullRefresh.handler = function (done) {
        if (getQueryString('reload')) {
            window.location.href = window.location.href;
        } else {
            /**
             * URL里面增加字段reload=true
             * 针对在Android下面刷新当前页面因为不会再触发
             * resize事件，从而不会执行初始化方法
             */
            window.location.href = window.location.href + '&reload=true';
        }
        setTimeout(function () {
            scrollView.pullRefresh.enable = true;
        }, 8000);
    };
    scrollView.pullRefresh.enable = true;

    // 页面初始化
    function pageInit() {
        var _domTab = document.querySelector('[data-ctrl-name="tabheader"]');
        if (_domTab) {
            // Tab需要自己追加appKey
            var appKey = '&appKey=' + getQueryString('appKey'),
                aList = _domTab.querySelectorAll('a'),
                aLen = aList.length;
            for (var i = 0; i < aLen; i++) {
                aList[i].setAttribute('href', aList[i].getAttribute('href') + appKey);
            }

            // Tab根据当前页面高亮
            var isHome = aList[0].getAttribute('href').indexOf('isHome') === -1 ? false : true,
                activeTabIndex = parseInt(getQueryString('activeTab')) || 0;
            if (!isHome) {
                activeTabIndex -= 1;
            }
            if (activeTabIndex != -1) {
                _domTab.querySelectorAll('.content a span')[activeTabIndex].classList.add('active');
            }

            // 吸顶
            _domTab.setAttribute('sticky', 'true');
            scrollView.sticky.enable = true;
        }
        // 返回顶部按钮
        var backTopBtn = new BackToTop(),

        // IM入口
        services = new Services();
        // scrollView初始化
        scrollView.init();

        // Tab绑定横向滚动事件
        setTimeout(function () {
            // 原位置的dom已经消失 需要重新获取
            var nav = document.querySelector('.sticky .content');
            if (nav) {
                nav.scrollId = null;
                var scroll = lib.scroll(nav, {
                    direction: 'x'
                });
                scroll.init();
                scroll.refresh();
                var activeTab = document.querySelector('.sticky a span.active');
                if (activeTab) {
                    // 将高亮的tab滚动到视窗内
                    scroll.scrollToElement(activeTab);
                }
            }
            var Carousel = window.Carousel;
            var cDom = document.querySelector('[data-ctrl-name="carousel"]');
            if (cDom) {
                // 轮播初始化
                var carouselDom = new Carousel(cDom);
            }
            /**
             * 需要主动触发一下滚动事件, 来使首屏图片加载
             * 第2个参数为是否触发封装好的滚动相关事件
             * 需要为true
             */
            scrollView.scrollTo(1, true);
        }, 100);
    };

    /**
     * 刷新当前页面的时候直接执行初始化方法
     * tab上的链接都会有一个tab=true的字段,这个是为客户端识别的
     * 如果有这个字段,说明还是在当前的webview里面,Android不会触发
     * resize事件,所以直接执行初始化事件
     */
    if (getQueryString('reload') || getQueryString('tab')) {
        setTimeout(function () {
            pageInit();
        }, 100);
        return false;
    }
    if (/iphone|ipad|ipod/.test(ua) || /windows/.test(ua)) {
        setTimeout(function () {
            pageInit();
        }, 100);
    }

    window.addEventListener('resize', function () {
        setTimeout(function () {
            pageInit();
        }, 100);
    });
})();