/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app/modules/geocache', 'app'],
    function (Backbone, templates, $, ui, geocache, app) {
    var MainView = Backbone.View.extend({
        el: '#mainPage',

        // contains user and views
        data: null,

        // contains jquery elements for dialogs
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
            var self = this,
                name = $('#newListName', this.$els.newListDialog).val(),
                request = { userId: this.data.user._id, name: name };
            console.log("create list " + name);

            // post to create list for this user
            app.postJson('/api/creategeocachelist', request)
                .done(function(result) {
                    if (result.error){
                        alert(result.error);
                    }
                    // when created, refresh list of lists,
                    // then select newly created list
                    self.data.geocacheListsView.refresh();
                    self.$els.newListDialog.dialog('close');
                })
                .fail(function(x) {
                    alert("failed");
                });
        },

        initialize: function () {
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