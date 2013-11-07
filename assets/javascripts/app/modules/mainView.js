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
                'click #createListButton': 'onCreateList',
                'click #deleteListButton': 'onDeleteList',
                'click #addGeocacheButton': 'onAddGeocache'
            },

            onListChanged: function (event) {
                var name = this.data.created;
                if (name) {
                    this.data.created = null;
                    this.data.geocacheListsView.selectList(name);
                }
            },

            // the list has selected a GeocacheList
            onListSelected: function (name) {
                this.$('#selectedList').text(name);
                this.data.geocacheListView.setName(name);
                this.data.geocacheListName = name;
            },

            onCreateList: function () {
                this.$els.newListDialog.dialog('open');
            },

            onAddGeocache: function () {
                this.$els.editGeocacheDialog.dialog('open');
            },

            onDeleteList: function () {
                if (this.data.geocacheListName) {
                    this.$els.deleteListDialog.dialog('open');
                }
            },

            doDeleteList: function () {
                var self = this,
                    url;
                if (this.data.geocacheListName) {
                    url = '/api/geocachelist/' + encodeURIComponent(this.data.geocacheListName);
                    $.ajax(url, {type: 'DELETE'})
                        .done(function() {
                            alert('ok');
                            self.data.geocacheListsView.refresh();
                            self.$els.deleteListDialog.dialog('close');
                        })
                        .fail(function(error){
                            alert(error.toString());
                        });
                }
            },

            doAddGeocache: function () {
                // get data from form
            },

            doCreateList: function () {
                var self = this,
                    name = $('#newListName', this.$els.newListDialog).val(),
                    request = { name: name };

                // post to create list for this user
                app.postJson('/api/creategeocachelist', request)
                    .done(function (result) {
                        if (result.error) {
                            alert("failed " + result.error);
                            return;
                        }
                        // when created, refresh list of lists,
                        // then select newly created list
                        self.data.created = name;
                        self.data.geocacheListsView.refresh();
                        self.$els.newListDialog.dialog('close');
                    })
                    .fail(function (x) {
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
                    height: 600,
                    width: 500,
                    modal: true,
                    buttons: {
                        "Add Geocache": $.proxy(this.doAddGeocache, this),
                        "Cancel": function () {
                            $(this).dialog('close');
                        }
                    }
                });
                this.$els.deleteListDialog = this.$('#deleteListDialog').dialog({
                    autoOpen: false,
                    height: 300,
                    width: 300,
                    modal: true,
                    buttons: {
                        "Delete Geocache List": $.proxy(this.doDeleteList, this),
                        "Cancel": function () {
                            $(this).dialog('close');
                        }
                    }
                });

                this.data = {
                    geocacheListName: null,
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
    })
;