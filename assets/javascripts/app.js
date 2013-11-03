/* global define: false */
define(['jquery', 'cookie'], function ($, cookie) {
    "use strict";
    var app = {};

    // The root path to run the application through.
    app.root = "/";

    app.checkUser = function () {
        if (!app.user) {
            app.user = $.cookie('user') || null;
        }
        return !!app.user;
    };

    app.setUser = function (user) {
        if (user) {
            // save user name in cookie
            $.cookie('user', user);
            app.user = user;
        } else {
            $.removeCookie('user');
            app.user = null;
        }
    };

    return app;
});
