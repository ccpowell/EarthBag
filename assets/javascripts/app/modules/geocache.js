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

    var GeocacheList = Backbone.Model.extend({
        defaults: {
            name: '',
            geocaches: []
        },
        idAttribute: 'name',
        urlRoot: '/api/geocachelist'
    });

    var GeocacheListList = Backbone.Model.extend({
        defaults: {
            geocacheLists: []
        },
        url: function () {
            return '/api/usergeocachelists';
        }
    });


    function padNum(num, len, fix) {
        var fixed = num.toFixed(fix);
        while (fixed.length < len) {
            fixed = '0' + fixed;
        }
        return fixed;
    }
    function formatDirection(dir){
        return dir.direction.toUpperCase() +
            ' ' +
            padNum(dir.degrees, 2, 0) +
            '&deg; ' +
            padNum(dir.minutes, 6, 3) +
            '\'';
    }

    // make a row in a table to represent a geocache in a list
    var GeocacheView = Backbone.View.extend({
        tagName: 'tr',
        className: 'geocache',
        template: templates.geocache,

        render: function () {
            //this.el is what we defined in tagName. use $el to get access to jQuery html() function
            var stuff = this.model.toJSON();
            // TODO: convert lat, lon, size, terrain, difficulty
            stuff.latitude = formatDirection(stuff.latitude);
            stuff.longitude = formatDirection((stuff.longitude));

            this.$el.html(this.template(stuff));
            return this;
        }
    });

    var GeocacheListsView = Backbone.View.extend({
        el: '#listSelect',

        initialize: function () {
            this.model = new GeocacheListList();
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch();
        },

        events: {
            "change": 'onListSelected'
        },

        onListSelected: function () {
            var name = this.$('option:selected').val();
            this.trigger('listSelected', name);
        },

        refresh: function () {
            this.model.fetch();
        },

        selectList: function (name) {
            this.$('option').prop('selected', false);
            this.$('option[value="' + name + '"]').prop('selected', true);
            this.trigger('listSelected', name);
        },

        // render list by rendering each geocache list to an option
        render: function () {
            var tmpl = templates.geocacheListOption,
                self = this;
            console.log("render GeocacheListsView");
            self.$el.html(tmpl({name: 'Open an Existing List', value: ''}));
            $.each(this.model.attributes.geocacheLists, function (index, item) {
                self.$el.append(tmpl({name: item, value: item}));
            });

            this.trigger('change');
            return self;
        }
    });

    // make a table to show geocaches in a GeocacheList
    var GeocacheListView = Backbone.View.extend({
        el: '#geocacheListTable tbody',

        initialize: function () {
            this.model = new GeocacheList();
            this.listenTo(this.model, 'change', this.render);
        },

        setName: function (name) {
            try {
                this.model.clear();
            } catch (e) {
                console.log('clear broken ' + e);
            }
            this.model.set({name: name}, {silent: true});
            this.model.fetch();
        },


        // render library by rendering each geocache
        render: function () {
            var self = this;
            this.$el.empty();
            if (this.model.attributes.geocaches) {
                $.each(this.model.attributes.geocaches, function (index, item) {
                    self.renderGeocache(item);
                });
            }
        },

        // render a list by creating a GeocacheView and appending the
        // element it renders to the list's table body element
        renderGeocache: function (item) {
            var geocacheView = new GeocacheView({
                model: new Geocache(item)
            });
            this.$el.append(geocacheView.render().el);
        }
    });

    return { GeocacheListView: GeocacheListView, GeocacheListsView: GeocacheListsView };
});