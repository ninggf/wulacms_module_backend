layui.define(['jquery', 'element'], (exports) => {
    'use strict';

    const $ = layui.$;
    const bodyE = $('body').addClass('loaded');
    const overlayE = $('#cl-overlay');

    const Coolay = function() {};

    Coolay.prototype.overlay = (op) => {
        op == 'show' ? overlayE.addClass('show') : overlayE.removeClass('show');
    };

    const _coolay = new Coolay();
    window.Coolayui = _coolay;

    bodyE.on('click', '#cl-overlay', () => {
        bodyE.removeClass('opened');
        overlayE.removeClass('show');
    }).on('mouseenter', '.cl-sidebar', () => {
        if (bodyE.hasClass('sidebar-folded') && !bodyE.hasClass('opened')) {
            console.log('mouse enter sidebar');
            bodyE.addClass('opened');
        }
    }).on('mouseleave', '.cl-sidebar', () => {
        if (bodyE.hasClass('sidebar-folded')) {
            console.log('mouse leave sidebar');
            bodyE.removeClass('opened');
        }
    });

    exports('&coolay', _coolay);
});
