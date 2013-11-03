/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui'], function (Backbone, templates, $, ui) {
    
    var MainView = Backbone.View.extend({
        el: '#mainPage',

        initialize: function () {
            this.$('#mainPageTabs').tabs();
        },

        render: function () {
        }
    });

    return MainView;
});