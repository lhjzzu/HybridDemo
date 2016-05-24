'use strict';

//'use strict';

;(function (win, ctrl) {

    var incId = 0;
    function Tabheader(element, options) {
        var that = this;
        var id = Date.now() + '-' + ++incId;
        var root = document.createDocumentFragment();

        if (arguments.length === 1 && !(arguments[0] instanceof HTMLElement)) {
            options = arguments[0];
            element = null;
        }

        if (!element) {
            element = document.createElement('div');
        }

        options = options || {};

        element.setAttribute('data-ctrl-name', 'tabheader');
        element.setAttribute('data-ctrl-id', id);
        root.appendChild(element);

        var content = document.createElement("div");
        content.className = 'content';
        element.appendChild(content);

        var selectionIndicator;

        var scroll = lib.scroll(content, {
            direction: 'x'
        });

        this.renderSelected = function () {
            selectionIndicator = document.createElement("div");
            content.appendChild(selectionIndicator);
            selectionIndicator.className = "indicator";
            this.updateSelected();
        };

        this.updateSelected = function (d) {
            var selectedItem = content.childNodes[selected];
            var selectedRect = selectedItem.getBoundingClientRect().width;
            selectionIndicator.style.width = selectedItem.getBoundingClientRect().width + "px";
            selectionIndicator.style.left = selectedItem.offsetLeft + "px";
            selectionIndicator.style.position = "absolute";
            selectionIndicator.style.bottom = "0";
            selectionIndicator.style.webkitTransitionDuration = Math.abs(0.1 * d).toFixed(1) + "s";
            scroll.scrollToElement(selectedItem, true);
        };

        //定义属性，使用一个局部变量和defineProperty
        var selected = 0;
        Object.defineProperty(this, "selected", {
            get: function get() {
                return selected;
            },
            set: function set(v) {
                //自定义属性改变的时候，可以做相应操作使之生效，比如派发事件、更改DOM
                if (selected == v) {
                    return;
                }

                var event = document.createEvent('HTMLEvents');
                event.initEvent("select", true, true);
                event.selected = viewModel[v];
                event.selectIndex = v;
                root.dispatchEvent(event);
                var d = selected - v;
                selected = v;

                this.updateSelected(d);
                return selected;
            }
        });

        //定义数据，名为viewModel
        var viewModel = null;
        Object.defineProperty(this, "viewModel", {
            get: function get() {

                return viewModel;
            },
            set: function set(v) {
                content.innerHTML = "";

                var self = this;

                for (var i = 0; i < v.length; i++) {
                    var item = document.createElement("span");
                    item.innerText = v[i].text ? v[i].text : '';
                    if (v[i].image) {
                        var img = new Image();
                        img.src = v[i].image;
                        item.appendChild(img);
                    }
                    content.appendChild(item);
                    item.addEventListener("click", function (i) {
                        return function () {
                            self.selected = i;
                        };
                    }(i), false);
                }
                this.renderSelected();
                var range = document.createRange();
                range.setStartBefore(content);
                range.setEndAfter(content);
                var contentWidth = range.getBoundingClientRect().width;

                var containerWidth = this.element.getBoundingClientRect().width;

                /*if(contentWidth > containerWidth) {
                    var expandButton = document.createElement('div');
                    expandButton.className = "expand-button";
                    this.element.appendChild(expandButton);
                }*/

                content.style.width = contentWidth + "px";

                scroll.init();
                scroll.refresh();
                return viewModel = v;
            }
        });

        //可以直接把addEventListener转发到root，也可以自己处理。
        this.addEventListener = function addEventListener() {
            root.addEventListener.apply(root, arguments);
        };
        this.removeEventListener = function removeEventListener() {
            root.removeEventListener.apply(root, arguments);
        };

        this.remove = function () {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };

        this.root = root;
        this.element = element;
    }

    ctrl.tabheader = Tabheader;
})(window, window['ctrl'] || (window['ctrl'] = {}));