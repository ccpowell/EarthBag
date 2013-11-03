/* global require: false */
require(["config"], function () {
    // Kick off the application.
    require(["app", "backbone", "router"], function (app, Backbone, Router) {
        app.router = new Router();
        Backbone.history.start();
    });
});