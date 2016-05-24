'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

;(function (factory) {
    if (typeof define === 'function') {
        define(factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        window.BackToTop = factory();
    }
})(function () {

    function BackToTop(height) {
        var _height = height || 1200;
        var html = '\n            <div data-ctrl-name="top" class="backtotop">\n                <img src="/resources/images/backtotop.png" alt="" />\n            </div>\n            ';
        var div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        if (!scrollView) {
            return false;
        }
        scrollView.addScrollingHandler(function () {
            var scrollHeight = scrollView.getScrollTop();
            if (scrollHeight >= _height) {
                document.querySelector('[data-ctrl-name="top"]').style.display = 'block';
            } else {
                document.querySelector('[data-ctrl-name="top"]').style.display = 'none';
            }
        });
    };
    return BackToTop;
});