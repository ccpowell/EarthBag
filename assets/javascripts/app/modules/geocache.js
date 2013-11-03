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

    var GeocacheList = Backbone.Collection.extend({
        model: Geocache,
        url: '/api/geocaches/' + app.user
    });

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

    var GeocacheListView = Backbone.View.extend({
        tagName: 'table',
        className: 'geocacheList',
        initialize: function () {
            this.collection = new GeocacheList();
            this.listenTo(this.collection, 'reset', this.render);
            this.collection.fetch({ reset: true });
        },
        
        // render library by rendering each book in its collection
        render: function () {
            this.collection.each(function (item) {
                this.renderGeocache(item);
            }, this);
        },

        // render a book by creating a BookView and appending the
        // element it renders to the library's element
        renderGeocache: function (item) {
            var geocacheView = new GeocacheView({
                model: item
            });
            this.$('body').append(geocacheView.render().el);
        }
    });

    return { GeocacheListView: GeocacheListView };
});