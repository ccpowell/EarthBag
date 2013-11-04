/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app'], function (Backbone, templates, $, ui, app) {
    
    var RegisterView = Backbone.View.extend({
        el: '#registerPage',

        initialize: function () {
            this.$('#registerButton').button();
        },

        events: {
            'click #registerButton': 'register'
        },

        register: function (event) {
            var data = {
                name: this.$('#registerUser').val(),
                password: this.$('#registerPassword').val()
            }, self = this;
            self.$('.error').empty();
            app.postJson('/api/user/register', data)
                .then(function (result) {
                    app.setUser(result.user);
                    if (result.error) {
                        self.$('.error').text(result.error);
                    } else {
                        app.router.navigate('#main', { trigger: true });
                    }
                });
        },

        render: function () {
        }
    });

    return RegisterView;
});