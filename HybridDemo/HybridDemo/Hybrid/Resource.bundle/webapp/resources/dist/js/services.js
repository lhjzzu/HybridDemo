'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

;(function (factory) {
    if (typeof define === 'function') {
        define(factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        window.Services = factory();
    }
})(function () {
    function Services() {
        var isCategory = window.location.href.indexOf('category');
        if (isCategory !== -1) {
            var html = '\n                <div data-ctrl-name="services" class="services">\n                    <a href="/cms/home?vc=ChatViewController&amp;cls=.ui.activity.ServiceContactActivity&amp;">\n                        <img src="/resources/images/services.png" alt="" />\n                    </a>\n                </div>\n                ';
            var div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);
        }
    };
    return Services;
});