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
            self.$('.error').empty();
            app.postJson('/api/user/validate', data)
                .then(function (result) {
                    app.setUser(result.user);
                    if (result.error) {
                        self.$('.error').text(result.error);
                    } else {
                        app.router.navigate('#main', { trigger: true });
                    }
                });
        },
    });

    return LoginView;
});