'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

;
(function (factory) {
    if (typeof define === 'function') {
        define(factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        window.Carousel = factory();
    }
})(function () {
    function Carousel(_dom) {
        if (!_dom) {
            return false;
        }
        this.loopEvent = 1;
        this.dom = _dom; // dom节点
        this.w = _dom.offsetWidth; // dom可视宽度
        this.h = _dom.offsetHeight; // dom可视高度
        this.zIndex = 0; // z-index值
        this.length = 0; // 图片个数
        this.current = 0; // 当前图片index
        this.canMove = true; // 可否轮播标示符
        this.interval = 4300; // 轮播间隔
        this.duration = 300; // 轮播速度
        this.autoplay = true; // 是否自动播放
        this.touchXStart = undefined; // touch X 起始坐标
        this.touchXEnd = undefined; // touch X 结束坐标
        this.touchYStart = undefined; // touch Y 起始坐标
        this.touchYEnd = undefined; // touch Y 结束坐标
        this.touchFlag = true; // touch start flag
        this.moveYonly = false; // Y轴touch
        this.customStyle = ''; // cssText
        this.fix = true; // 解决初次动画错位问题
        this.init();
    };

    Carousel.prototype.init = function () {
        var self = this;
        setTimeout(function () {
            self.getConfig();
        }, 300);
    };

    Carousel.prototype.getAllCarousel = function () {
        var allCarousels = document.querySelectorAll('[data-ctrl-name="carousel"]');
        var len = allCarousels.length;
        var cObj = {};
        for (var i = 0; i < len; i++) {
            var str = 'carousel_' + i;
            cObj[str] = new Carousel(allCarousels[i]);
        }
    };

    Carousel.prototype.getConfig = function () {
        var _dom = this.dom,
            picUl = _dom.querySelector('.c-list'),
            navUl = _dom.querySelector('.c-nav-center'),
            pic = _dom.querySelector('.c-item').cloneNode(true),
            nav = _dom.querySelector('.c-nav-item').cloneNode(true);
        this.length = _dom.querySelectorAll('.c-item').length;
        _dom.querySelector('.c-item').classList.add('c-nav-active');
        this.interval = parseInt(_dom.getAttribute('data-carousel-interval'));
        this.duration = parseInt(_dom.getAttribute('data-carousel-duration'));
        //只有图片张数大于1的时候才轮播
        if (this.length > 1) {
            this.autoplay = _dom.getAttribute('data-carousel-autoplay') === 'true' ? true : false;
            this.loop();
            this.touch();
        } else {
            this.length && this.setNavActive(0);
        }
    };

    Carousel.prototype.loop = function (prev) {
        var self = this,
            _dom = self.dom,
            interval = this.interval,
            len = this.length,
            ul = _dom.querySelector('.c-list');
        self.animate(null, prev);
        self.fix = false;
        if (!self.autoplay) {
            if (!self.canMove) {
                return false;
            }
            if (self.current >= len) {
                self.current = 0;
            };
            return false;
        }
        this.loopEvent = setInterval(function () {
            if (!self.canMove) {
                return false;
            }
            self.current++;
            if (self.current >= len) {
                self.current = 0;
            };
            self.animate();
        }, interval);
    };

    Carousel.prototype.animate = function (touch, prev) {
        var self = this,
            len = self.length,
            duration = self.duration,
            _dom = self.dom.querySelectorAll('.c-item'),
            current = self.current,
            w = self.w,
            t = touch || 0,
            dom = void 0;
        self.setNavActive(current);
        if (t !== 0 || self.fix === true) {
            duration = 0;
        };
        var prevDuration = prev ? 0 : duration,
            nextDuration = prev ? duration : 0;

        /**
         * 前一个图片
         */
        //  只有两张图时只有往前的时候处理
        if (prev || len > 2) {
            if (_dom[current - 1] === undefined) {
                //如果没有前一个图片，则最后一张跑到第一位
                dom = _dom[len - 1];
                dom.style.cssText = self.getCssText(-w + t, (len - 1) * w, prevDuration);
            } else {
                dom = _dom[current - 1];
                dom.style.cssText = self.getCssText(-w + t, (current - 1) * w, prevDuration);
            };
        }

        /**
         * 当前图片
         */
        _dom[current].style.cssText = self.getCssText(t, current * w, duration);

        /**
         * 后一个图片
         */
        //只有两张图时只有往后的时候处理
        if (!prev || len > 2) {
            if (_dom[current + 1] === undefined) {
                //如果没有后一张，则第一张补位
                dom = _dom[0];
                dom.style.cssText = self.getCssText(w + t, 0, nextDuration);
            } else {
                dom = _dom[current + 1];
                dom.style.cssText = self.getCssText(w + t, (current + 1) * w, nextDuration);
            };
        }
    };

    Carousel.prototype.touch = function () {
        var self = this,
            _dom = self.dom.querySelector('.c-list'),
            len = self.length,
            navItem = self.dom.querySelectorAll('.c-nav-item'),
            navLen = navItem.length;
        _dom.addEventListener('touchstart', function (e) {
            clearInterval(self.loopEvent);
            self.canMove = false;
            self.touchXStart = e.touches[0].clientX;
            self.touchXEnd = e.touches[0].clientX;
            self.touchYStart = e.touches[0].clientY;
            self.touchYEnd = e.touches[0].clientY;
            self.moveYonly = false;
            self.touchFlag = true;
            //e.preventDefault();
        }, false);
        _dom.addEventListener('touchmove', function (e) {
            self.touchXEnd = e.touches[0].clientX;
            self.touchYEnd = e.touches[0].clientY;
            var distance = self.touchXEnd - self.touchXStart;
            if (self.touchFlag) {
                if (Math.abs(self.touchXEnd - self.touchXStart) >= 10) {
                    self.moveYonly = false;
                    self.touchFlag = false;
                }
                if (Math.abs(self.touchYEnd - self.touchYStart) >= 30) {
                    self.moveYonly = true;
                    self.touchFlag = true;
                    return false;
                }
                return false;
            }
            if (self.moveYonly && !self.autoplay) {
                return false;
            }
            if (distance < 0) {
                self.animate(distance);
            } else if (distance > 0) {
                self.animate(distance, true);
            };
            //e.preventDefault();
        }, false);
        _dom.addEventListener('touchend', function (e) {
            var distance = self.touchXEnd - self.touchXStart;
            self.canMove = true;
            if (self.moveYonly) {
                if (self.autoplay) {
                    self.loop();
                }
                return false;
            }
            if (distance < 0) {
                self.current += 1;
                if (self.current >= len) {
                    self.current = 0;
                };
                self.loop();
            } else if (distance > 0) {
                self.current -= 1;
                if (self.current <= -1) {
                    self.current = len - 1;
                };
                self.loop('prev');
            } else {
                self.canMove = true;
                self.loop();
            };

            //e.preventDefault();
        }, false);
    };

    Carousel.prototype.getCssText = function (distance, left, duration) {
        this.zIndex++;
        if (this.zIndex >= 1000) {
            this.zIndex = 0;
        }
        var l = left,
            r = duration,
            z = this.zIndex + 1,
            d = distance,
            customStyle = 'translate3d(' + d + 'px, 0px, 0px)',
            cssTextBase = '\n            z-index: ' + z + ';\n            left: -' + l + 'px;\n            transition-duration: ' + r + 'ms;\n            -webkit-transition-duration: ' + r + 'ms;\n            transform: ' + customStyle + ';\n            -ms-transform: ' + customStyle + ';\n            -moz-transform: ' + customStyle + ';\n            -webkit-transform: ' + customStyle + ';\n            -o-transform: ' + customStyle + ';';
        return cssTextBase;
    };

    Carousel.prototype.setNavActive = function (current) {
        console.log(current);
        var self = this,
            _dom = self.dom,
            nav = _dom.querySelectorAll('.c-nav-item'),
            navActive = _dom.querySelector('.c-nav-active');
        if (!nav) {
            return false;
        }
        if (navActive) {
            navActive.classList.remove('c-nav-active');
        };
        console.log(nav[current]);
        nav[current] && nav[current].classList.add('c-nav-active');
    };

    Carousel.prototype.pause = function () {
        var self = this;
        clearInterval(self.loopEvent);
    };

    Carousel.prototype.reStart = function () {
        var self = this;
        clearInterval(self.loopEvent);
        self.canMove = true;
        self.loop();
    };

    //Carousel.prototype.getAllCarousel();
    return Carousel;
});