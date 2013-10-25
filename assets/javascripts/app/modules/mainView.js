/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui'], function (Backbone, templates, $, ui) {
    
    var MainView = Backbone.View.extend({
        el: '#mainContainer',

        initialize: function () {
            this.$el.tabs();
        },

        render: function () {
        },
    });

    return { MainView: MainView };
});