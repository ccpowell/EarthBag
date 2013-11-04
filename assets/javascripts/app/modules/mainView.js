/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app/modules/geocache'], function (Backbone, templates, $, ui, geocache) {
    var MainView = Backbone.View.extend({
        el: '#mainPage',

        data: null,

        $els: null,

        events: {
            'change #listSelect': 'onListSelected',
            'click #createListButton': 'onCreateList'
        },

        onListSelected: function (event) {
            var lname = this.$('#listSelect option:selected').text();
            this.$('#selectedList').text(lname);
        },

        onCreateList: function (event) {
            this.$els.newListDialog.dialog('open');
        },

        doCreateList: function () {
            var name = $('#newListName', this.$els.newListDialog).val();
            console.log("create list " + name);
            this.$els.newListDialog.dialog('close');
        },

        initialize: function () {
            var self = this;
            this.$('#mainPageTabs').tabs();
            this.$('button').button();

            this.$els = {};
            this.$els.newListDialog = this.$('#newListDialog').dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true,
                buttons: {
                    "Create List": $.proxy(this.doCreateList, this),
                    "Cancel": function () {
                        $(this).dialog('close');
                    }
                }
            });
            this.$els.editGeocacheDialog = this.$('#editGeocacheDialog').dialog({
                autoOpen: false,
                height: 300,
                width: 350,
                modal: true
            });
        },

        setUser: function (user) {
            this.data = {
                user: user,
                geocacheListView: null,
                geocacheListsView: new geocache.GeocacheListsView(user)
            };
        },

        render: function () {
        }
    });

    return MainView;
});