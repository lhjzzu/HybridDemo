'use strict';

;(function () {
    var aDom = document.querySelectorAll('a');
    var aLen = aDom.length - 1;
    for (var i = 0; i < aLen; i++) {
        aDom[i].setAttribute('href', 'javascript:;');
    }
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);return null;
    }
    var _dom = document.querySelector('[data-ctrl-pro-input="this"]');
    if (!_dom) {
        return false;
    }
    var _parentDom = _dom.parentNode,
        _source = _dom.getAttribute('data-ctrl-pro-source-type'),
        _type = parseInt(_dom.getAttribute('data-ctrl-pro-style-type')),
        _url = '',
        _urlTemp = _dom.value,
        _data = '',
        _totalPage = 0,
        _host = _dom.getAttribute('data-ctrl-pro-host'),
        _act = _dom.getAttribute('data-ctrl-pro-act');
    window._page = 1;
    var item = {
        id: '',
        name: '',
        imageUrl: '',
        price: '',
        originalPrice: ''
    };
    //判断列表样式
    function getHTML(data) {
        var _html = '';
        var item = data;
        var originalPrice = '';
        if (item.originalPrice) {
            originalPrice = '<span class="price-old">￥' + item.originalPrice + '</span>';
        }
        var activitys = item.activitys;
        var discount, off;

        activitys.forEach(function (a) {
            if (a.type == 2) {
                discount = a;
            }
            if (a.type == 1) {
                off = a;
            }
        });
        var discountText = discount ? '<span class="discount zhe">' + discount.actionDesc + '</span>' : '';

        var offText = off ? '<span class="discount cut">满减</span>' : '';
        if (_type === 1) {
            _html = '\n                    <a href="javascript:;">\n                        <div class="img">\n                            <img lazyload="true" src="../resources/images/pixel.png" data-src=' + item.imgUrl + ' alt="" />\n                        </div>\n                        <p class="info">\n                            <span class="title">' + item.name + '</span>\n                            <span class="price-new">\n                                <i class="yuan">￥</i><span>' + item.discountPrice + '</span>\n                            </span>\n                            ' + discountText + '\n                            ' + offText + '\n                        </p>\n                    </a>\n            ';
        } else {
            _html = '\n                    <a href="javascript:;">\n                        <div class="img">\n                            <img lazyload="true" src="../resources/images/pixel.png" data-src=' + item.imgUrl + ' alt="" />\n                        </div>\n                        <div class="info">\n                            <span class="title">' + item.name + '</span>\n                            <p class="discount-wrap">\n                                <span class="price-wrap">\n                                    <span class="price-new">\n                                    <i class="yuan">￥</i>' + item.discountPrice + '\n                                    </span>\n                                </span>\n                                <span class="fn-right">\n                                ' + discountText + '\n                                ' + offText + '\n                                </span>\n                            </p>\n                        </div>\n                    </a>\n            ';
        }
        return _html;
    }

    function getMore(page, callback) {
        if (typeof callNative === 'undefined') {
            return false;
        };
        //判断数据来源
        if (_source === 'ACTIVITY') {
            _url = _host + _act.split('?')[0];
            _data = dataToGetString({
                'activityId': _urlTemp,
                'page': _page,
                'size': 20,
                'appKey': getQueryString('appKey')
            });
        } else {
            _url = _host + _urlTemp.split('?')[0];
            _data = _urlTemp.split('?')[1] + '&' + dataToGetString({
                'page': _page,
                'size': 20,
                'appKey': getQueryString('appKey')
            });
            getQueryString('appKey');
        }
        $.ajax({
            url: _url + '?' + _data,
            type: 'GET',
            dataType: 'json',
            data: {},
            success: function success(res) {
                var resJson = res;
                if (typeof resJson === 'string') {
                    resJson = JSON.parse(res);
                }
                if (Object.prototype.toString.call(resJson.data.rows) === '[object Array]' || 'rows' in resJson.data) {
                    _totalPage = Math.ceil(parseInt(resJson.data.total / 20));
                    render(resJson.data.rows, callback);
                } else {
                    _totalPage = resJson.data.totalPage;
                    render(resJson.data.productResult.data, callback);
                };
            },
            error: function error(res) {}
        });
    }

    function render(data, callback) {
        if (data === null) {
            return false;
        }
        var len = data.length;
        var fragment = document.createDocumentFragment();
        for (var _i = 0; _i < len; _i++) {
            var li = document.createElement('li');
            li.classList.add('item');
            li.innerHTML = getHTML(data[_i]);
            fragment.appendChild(li);
        }
        _parentDom.appendChild(fragment);
        if (callback) {
            if (callback === 'init') {
                scrollView.refresh();
                scrollView.scrollTo(1, false);
            } else {
                callback();
            }
        }
        window._page++;
    }
    // 下拉加载

    setTimeout(function () {
        getMore(_page, 'init');
        scrollView.pullUpdate.handler = function (done) {
            if (_page <= _totalPage) {
                getMore(_page, done);
            } else {
                scrollView.pullUpdate.enable = false;
            }
        };
        scrollView.pullUpdate.enable = true;
    }, 30);
})();