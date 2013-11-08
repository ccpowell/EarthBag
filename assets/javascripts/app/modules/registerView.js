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
            app.postJson('/user/register', data)
                .done(function () {
                    app.router.navigate('#main', { trigger: true });
                })
                .fail(function (error) {
                    self.$('.error').text(error.responseText);
                });
        },

        render: function () {
        }
    });

    return RegisterView;
});