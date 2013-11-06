/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app/modules/geocache', 'app'],
    function (Backbone, templates, $, ui, geocache, app) {
    var MainView = Backbone.View.extend({
        el: '#mainPage',

        // contains user and views
        data: {},

        // contains jquery elements for dialogs
        $els: null,

        events: {
            'click #createListButton': 'onCreateList'
        },

        displayList: function(name) {
            this.$('#selectedList').text(name);
            this.data.geocacheListView.setName(name);
        },

        onListChanged: function (event) {
            var name = this.data.created;
            if (name) {
                this.data.created = null;
                this.data.geocacheListsView.selectList(name);
            }
        },

        onListSelected: function (name) {
            this.displayList(name);
        },

        onCreateList: function (event) {
            this.$els.newListDialog.dialog('open');
        },

        doCreateList: function () {
            var self = this,
                name = $('#newListName', this.$els.newListDialog).val(),
                request = { name: name };

            // post to create list for this user
            app.postJson('/api/creategeocachelist', request)
                .done(function(result) {
                    if (result.error){
                        alert("failed " + result.error);
                        return;
                    }
                    // when created, refresh list of lists,
                    // then select newly created list
                    self.data.created = name;
                    self.data.geocacheListsView.refresh();
                    self.$els.newListDialog.dialog('close');
                })
                .fail(function(x) {
                    alert("failed " + x.toString());
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

            this.data = {
                geocacheListView: new geocache.GeocacheListView(),
                geocacheListsView: new geocache.GeocacheListsView()
            };
            this.listenTo(this.data.geocacheListsView, 'listSelected', this.onListSelected);
            this.listenTo(this.data.geocacheListsView, 'change', this.onListChanged);
        },

        render: function () {
        }
    });

    return MainView;
});