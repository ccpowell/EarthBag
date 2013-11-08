/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app'], function (Backbone, templates, $, ui, app) {
    var LoginView = Backbone.View.extend({
        el: '#loginPage',

        initialize: function () {
            this.$('#loginButton').button();
        },

        events: {
            'click #loginButton': 'login'
        },

        login: function (event) {
            var data = {
                name: this.$('#loginUser').val(),
                password: this.$('#loginPassword').val()
            }, self = this;
            app.clearUser();
            self.$('.error').empty();
            app.postJson('/user/validate', data)
                .done(function () {
                    app.router.navigate('#main', { trigger: true });
                })
                .fail(function (error) {
                    self.$('.error').text(error.responseText);
                });
        }
    });

    return LoginView;
});