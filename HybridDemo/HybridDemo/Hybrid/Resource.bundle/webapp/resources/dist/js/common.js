'use strict';

// obj to key value 只支持简单的结构
function dataToGetString(obj) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
        return false;
    }
    var str = '';
    for (var i in obj) {
        str += i + '=' + obj[i] + '&';
    }
    str = str.substring(0, str.length - 1);
    return str;
}

// 获取URL
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);return null;
}