/* global require: false */
require(["config"], function () {
    // Kick off the application.
    require(["app", "backbone", "app/modules/mainView"], function (app, Backbone, gmjr) {
        app.mainView = new gmjr.MainView();
    });
});