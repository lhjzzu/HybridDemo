'use strict';

;(function () {
    document.body.addEventListener('tap', function (e) {
        var _dom = e.target;
        var ctrlName = _dom.getAttribute('data-ctrl-name') || _dom.parentNode.getAttribute('data-ctrl-name');
        // back to top
        if (ctrlName === 'top') {
            scrollView.scrollTo(0, true);
            return;
        }

        // services
        if (ctrlName === 'services') {
            return;
        }
    }, false);

    window.bridge = window.WebViewJavascriptBridge;

    function connectWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function () {
                callback(window.WebViewJavascriptBridge);
            }, false);
        }
    };

    connectWebViewJavascriptBridge(bridgeInit);

    function bridgeInit(WVJB) {
        bridge = WVJB;
        bridge.init();
        //设置webview标题
        setTitle(' ');

        /**
         * 注册Js Alert事件
         */
        bridge.registerHandler('BridgeJsAlertHandler', function (data, responseCallback) {
            var text = data ? data : 'hello world';
            alert(text);
            if (responseCallback) {
                responseCallback(responseData);
            }
        });
    }

    /**
     * 调用Native
     */
    function callNative(name, data, callback) {
        if (bridge == undefined) {
            return;
        };
        bridge.callHandler(name, data, function (responseData) {
            callback(responseData);
        });
    };
    window.callNative = callNative;

    /**
     * 调用Native 关闭页面方法
     */
    function closeView() {
        if (typeof callNative === 'undefined') {
            return false;
        }
        callNative('BridgeNativeCloseScreenHandler', {}, function (res) {});
    }

    /**
     * 调用Native 设置title方法
     */
    function setTitle(title) {
        if (typeof callNative === 'undefined') {
            return false;
        }
        callNative('BridgeNativeSetTitleHandler', title, function (res) {});
    }
    window.setTitle = setTitle;

    /**
     * 调用Native 增加menu按钮
     */
    function addMenuBtn(text) {
        if (typeof callNative === 'undefined') {
            return false;
        }
        callNative('BridgeNativeAddMenuTxtHandler', {
            title: text,
            handler: 'BridgeJsAlertHandler'
        }, function (res) {});
    }
})();