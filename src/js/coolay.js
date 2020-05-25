layui.define(['jquery', 'element'], (exports) => {
    'use strict';

    const $ = layui.$;
    const bodyE = $('body').addClass('loaded');
    const overlayE = $('#cl-overlay');

    const Coolay = function() {};

    Coolay.prototype.overlay = (op) => {
        op == 'show' ? overlayE.addClass('show') : overlayE.removeClass('show');
    };
    Coolay.prototype.alert = msg => {
        alert('cool + ' + msg)
    };
    Coolay.prototype.dialog = (opts) =>{

    };

    Coolay.prototype.apiGet = (data) =>{
        return '';
    }

    Coolay.prototype.url = (url) => {
        return '';
    }

    const _coolay = new Coolay();
    window.Coolayui = _coolay;

    exports('&coolay', _coolay);
});
