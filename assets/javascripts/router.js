/* global define: false */
define(["backbone", "jquery"], function (Backbone, $) {
    var Router;
    function setPage(id) {
        $('.topPage').hide();
        $('#' + id).show();
    }

    Router = Backbone.Router.extend({
        routes: {
            'login': 'login',
            'register': 'register',
            'changepw': 'changepw',
            '*splat': 'main'
        },

        login: function () {
            console.log('login');
            setPage('loginPage');
        },


        register: function () {
            setPage('registerPage');
        },


        changepw: function () {
            setPage('changepwPage');
        },


        main: function () {
            console.log('main');
            setPage('mainPage');
        }
    });
    return Router;
});