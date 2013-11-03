/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app'], function (Backbone, templates, $, ui, app) {

    function login() {
        app.setUser('hoover');
        app.router.navigate('main', { trigger: true });
        return false;
    }
    
    var LoginView = Backbone.View.extend({
        el: '#loginPage',

        initialize: function () {
            this.$('#loginButton').button().click(login);
        },

        render: function () {
        }
    });

    return LoginView;
});