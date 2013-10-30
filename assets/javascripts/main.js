/* global require: false */
require(["config"], function () {
    // Kick off the application.
    require(["app", "backbone", "app/modules/mainView", "router"], function (app, Backbone, gmjr, Router) {
        app.mainView = new gmjr.MainView();
        app.router = new Router();
        Backbone.history.start();
    });
});