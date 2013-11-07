/* global define: false */
define(["backbone",
    "jquery",
    "app",
    "app/modules/forgotpwView",
    "app/modules/loginView",
    "app/modules/mainView",
    "app/modules/registerView"], function (Backbone,
        $,
        app,
        ForgotpwView,
        LoginView,
        MainView,
        RegisterView) {
        var Router,
            mainView = new MainView(),
            loginView = new LoginView(),
            forgotpwView = new ForgotpwView(),
            registerView = new RegisterView();

        function setPage(id) {
            $('.topPage').hide();
            $('#' + id).show();
        }

        Router = Backbone.Router.extend({
            routes: {
                'login': 'login',
                'register': 'register',
                'forgotpw': 'forgotpw',
                'main': 'main',
                'logout': 'logout',
                '*splat': 'landing'
            },

            login: function () {
                setPage('loginPage');
            },

            register: function () {
                setPage('registerPage');
            },

            forgotpw: function () {
                setPage('forgotpwPage');
            },

            landing: function () {
                setPage('landingPage');
            },

            logout: function() {
                app.clearUser();
                this.navigate("#login")
                window.location.reload(true);
            },

            main: function () {
                if (!app.checkUser()) {
                    setPage('loginPage');
                    this.navigate('#login');
                    return;
                }
                setPage('mainPage');
                mainView.refresh();
            }
        });
        return Router;
    });