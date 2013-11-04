/* global define: false */
define(['jquery', 'cookie', 'backbone'], function ($, cookie, Backbone) {
    "use strict";
    var app = {};

    // The root path to run the application through.
    app.root = "/";

    app.checkUser = function () {
        var coo;
        if (!app.user) {
            coo = {
                name: $.cookie('user-name'),
                _id: $.cookie('user-id')
            };
            if (coo._id) {
                app.user = coo;
            }
        }
        return !!app.user;
    };

    app.setUser = function (user) {
        if (user) {
            // save user name in cookie
            $.cookie('user-name', user.name);
            $.cookie('user-id', user._id);
            app.user = user;
        } else {
            $.removeCookie('user-name');
            $.removeCookie('user-id');
            app.user = null;
        }
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
