'use strict';

var init = false;
function pageInit() {
    var cDom = document.querySelector('[data-ctrl-name="carousel"]');
    var Carousel = window.Carousel;
    var c = new Carousel(cDom);

    var tips = document.querySelector('.tips-layer');
    tips.addEventListener('tap', function () {
        tips.style.display = 'none';
    });
    init = true;
}

var ua = navigator.userAgent.toLowerCase();

if (/iphone|ipad|ipod/.test(ua) || /windows/.test(ua)) {
    setTimeout(function () {
        if (init) {
            return false;
        }
        pageInit();
    }, 100);
} else {
    window.addEventListener('resize', function () {
        setTimeout(function () {
            if (init) {
                return false;
            }
            pageInit();
        }, 100);
    });

    setTimeout(function () {
        if (init) {
            return false;
        }
        pageInit();
    }, 100);
}