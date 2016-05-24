'use strict';

//'use strict';

;(function (win, ctrl) {

    var incId = 0;
    function TabPanel(element, options) {
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

        if (options.header instanceof HTMLElement) {
            var header = new ctrl.tabheader(options.header);
        } else if (options.header instanceof ctrl.tabheader) {
            var header = options.header;
        } else {
            var header = new ctrl.tabheader();
        }

        var content = document.createElement('div');
        element.appendChild(header.root);
        element.appendChild(content);
        element.setAttribute('data-ctrl-name', 'tabpanel');
        element.setAttribute('data-ctrl-id', id);
        root.appendChild(element);

        var viewModel = [];
        Object.defineProperty(this, 'viewModel', {
            get: function get() {
                return viewModel;
            },
            set: function set(v) {
                if (!v) {
                    throw new Error('Non expected value');
                } else {
                    viewModel = v;
                    this.syncViewModel();
                }
            }
        });

        function switchTab(e) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent('switch', true, true);
            event.panel = e.selected.panel;
            event.selected = e.selected;
            event.selectedIndex = e.selectIndex;
            root.dispatchEvent(event);
            Array.prototype.forEach.call(content.querySelectorAll('.panel'), function (panel) {
                panel.style.display = 'none';
            });
            e.selected.panel.style.display = '';
        }
        header.addEventListener('select', switchTab, true);

        this.syncViewModel = function () {
            var vm = viewModel.slice();
            content.innerHTML = '';

            var panelFragment = document.createDocumentFragment();
            for (var i = 0; i < vm.length; i++) {
                var panel = vm[i].panel = document.createElement('div');
                panel.className = 'panel';
                panel.style.display = 'none';
                panel.innerHTML = vm[i].html || '';
                panelFragment.appendChild(vm[i].panel);
            }
            content.appendChild(panelFragment);
            header.viewModel = vm;
            switchTab({ selected: vm[0], selectIndex: 0 });
        };

        this.addEventListener = function () {
            root.addEventListener.apply(root, arguments);
        };

        this.removeEventListener = function () {
            root.removeEventListener.apply(root, arguments);
        };

        this.remove = function () {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };

        this.element = element;
        this.root = root;
    }

    ctrl.tabpanel = TabPanel;
})(window, window['ctrl'] || (window['ctrl'] = {}));