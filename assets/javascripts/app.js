/* global define: false */
define(['jquery', 'cookie', 'backbone'], function ($, cookie, Backbone) {
    "use strict";
    var app = {};

    // The root path to run the application through.
    app.root = "/";

    app.checkUser = function () {
        var coo = $.cookie('user');
        return !!coo;
    };

    app.clearUser = function() {
        $.removeCookie('user-name');
        $.removeCookie('user-id');
        $.removeCookie('user');
    };

    app.postJson = function (url, data, options) {
        var stuff = $.extend({}, {
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            url: url,
            data: JSON.stringify(data || {})
        }, options);
        return $.ajax(stuff);
    };

    return app;
});
