/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app'], function (Backbone, templates, $, ui, app) {
    var Geocache = Backbone.Model.extend({
        defaults: {
            title: '00001',
            latitude: {
                direction: 'N',
                minutes: 0.0,
                degrees: 0.0
            },
            longitude: {
                direction: 'N',
                minutes: 0.0,
                degrees: 0.0
            },
            size: 1,
            terrain: 1,
            difficulty: 1
        }
    });

    var GeocacheCollection = Backbone.Collection.extend({
        model: Geocache
    });

    var GeocacheList = Backbone.Model.extend({
        defaults: {
            name: '',
            id: '',
            userId: '',
            geocaches: []
        },
        urlRoot: '/api/geocachelist'
    });


    var GeocacheListCollection = Backbone.Collection.extend({
        model: GeocacheList
    });

    var GeocacheListList = Backbone.Model.extend({
        defaults: {
            _id: '',
            geocacheLists: []
        },
        idAttribute: '_id',
        urlRoot: '/api/usergeocachelists'
    });

    // make a row in a table to represent a geocache in a list
    var GeocacheView = Backbone.View.extend({
        tagName: 'tr',
        className: 'geocache',
        template: templates.geocache,

        render: function () {
            //this.el is what we defined in tagName. use $el to get access to jQuery html() function
            var stuff = this.model.toJSON(),
                latitude = "",
                longitude = "";
            // TODO: convert lat, lon, size, terrain, difficulty

            this.$el.html(this.template(stuff));
            return this;
        }
    });

    var GeocacheListsView = Backbone.View.extend({
        el: '#listSelect',

        initialize: function (user) {
            console.log("create GeocacheListsView for " + user.name);
            this.model = new GeocacheListList({ _id: user._id });
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch();
        },

        refresh: function () {
            this.model.fetch();
        },

        // render list by rendering each geocache list to an option
        render: function () {
            var tmpl = templates.geocacheListOption,
                self = this;
            console.log("render GeocacheListsView");
            self.$el.html(tmpl({name: 'Open an Existing List'}));
            $.each(this.model.attributes.geocacheLists, function (index, item) {
                self.$el.append(tmpl(item));
            });
            return self;
        }
    });

    // make a table to show geocaches in a GeocacheList
    var GeocacheListView = Backbone.View.extend({
        el: '#geocaches',

        initialize: function () {
            this.collection = new GeocacheList();
            this.listenTo(this.collection, 'reset', this.render);
            this.collection.fetch({ reset: true });
        },

        refresh: function () {
            this.collection.fetch({ reset: true });
        },


        // render library by rendering each book in its collection
        render: function () {
            this.collection.each(function (item) {
                this.renderGeocache(item);
            }, this);
        },

        // render a list by creating a GeocacheView and appending the
        // element it renders to the list's table body element
        renderGeocache: function (item) {
            var geocacheView = new GeocacheView({
                model: item
            });
            this.$('tbody').append(geocacheView.render().el);
        }
    });

    return { GeocacheListView: GeocacheListView, GeocacheListsView: GeocacheListsView };
});