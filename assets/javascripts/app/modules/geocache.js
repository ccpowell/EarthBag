/* global define: false */
define(['backbone', 'templates', 'jquery', 'jquery-ui', 'app'], function (Backbone, templates, $, ui, app) {
    // only used in getEmptyGeocache
    var Geocache = Backbone.Model.extend({
        defaults: {
            title: '00001',
            latitude: {
                direction: 'N',
                minutes: 0.0,
                degrees: 0.0
            },
            longitude: {
                direction: 'W',
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

    function formatDirection(dir) {
        return dir.direction +
            ' ' +
            padNum(dir.degrees, 2, 0) +
            '&deg; ' +
            padNum(dir.minutes, 6, 3) +
            '\'';
    }

    var GeocacheListsView = Backbone.View.extend({
        el: '#listSelect',

        // when initialized, we haven't logged in, so we cannot fetch
        // the users lists.
        initialize: function () {
            this.model = new GeocacheListList();
            this.listenTo(this.model, 'change', this.render);
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

        events: {
            'click td.command': 'onCommandClicked'
        },

        onCommandClicked: function (event, x, y) {
            // get row index
            var el = $(event.currentTarget),
                command = el.data('command'),
                index = el.closest('tr').data('index');
            // get corresponding geocache?
            // raise event
            this.trigger(command, index);
        },

        refresh: function () {
            if (this.model.get('name')) {
                this.model.fetch({success: $.proxy(this.render, this)});
            } else {
                this.render();
            }
        },

        setName: function (name) {
            try {
                this.model.clear();
            } catch (e) {
                console.log('clear broken ' + e);
            }
            this.model.set({name: name || ''}, {silent: true});
            this.refresh();
        },


        // render library by rendering each geocache
        render: function () {
            var self = this;
            this.$el.empty();
            if (this.model.attributes.geocaches) {
                $.each(this.model.attributes.geocaches, function (index, item) {
                    self.renderGeocache(index, item);
                });
            }
        },

        // render a list by creating a GeocacheView and appending the
        // element it renders to the list's table body element
        renderGeocache: function (index, item) {
            var stuff = {
                    index: index,
                    title: item.title,
                    size: item.size,
                    terrain: item.terrain,
                    difficulty: item.difficulty
                },
                template = templates.geocache;
            // TODO: convert size, terrain, difficulty
            stuff.latitude = formatDirection(item.latitude);
            stuff.longitude = formatDirection((item.longitude));

            this.$el.append(template(stuff));
        }
    });

    // get geocache properties from dialog
    function getDialogGeocache($el) {
        var geocache = {
            title: $('#geocacheTitle', $el).val(),
            latitude: {
                direction: $('#geocacheLatitudeDirection', $el).val(),
                minutes: parseFloat($('#geocacheLatitudeMinutes', $el).val()),
                degrees: parseInt($('#geocacheLatitudeDegrees', $el).val(), 10)
            },
            longitude: {
                direction: $('#geocacheLongitudeDirection', $el).val(),
                minutes: parseFloat($('#geocacheLongitudeMinutes', $el).val()),
                degrees: parseInt($('#geocacheLongitudeDegrees', $el).val(), 10)
            },
            size: parseInt($('#geocacheSize', $el).val(), 10),
            terrain: parseInt($('#geocacheTerrain', $el).val(), 10),
            difficulty: parseInt($('#geocacheDifficulty', $el).val(), 10)
        };
        return geocache;
    }

    // stuff geocache properties into the dialog
    function setDialogGeocache($el, geocache) {
        $('#geocacheTitle', $el).val(geocache.title);
        $('#geocacheLatitudeDirection', $el).val(geocache.latitude.direction);
        $('#geocacheLatitudeDegrees', $el).val(geocache.latitude.degrees);
        $('#geocacheLatitudeMinutes', $el).val(geocache.latitude.minutes);
        $('#geocacheLongitudeDirection', $el).val(geocache.longitude.direction);
        $('#geocacheLongitudeDegrees', $el).val(geocache.longitude.degrees);
        $('#geocacheLongitudeMinutes', $el).val(geocache.longitude.minutes);
        $('#geocacheSize', $el).val(geocache.size);
        $('#geocacheTerrain', $el).val(geocache.terrain);
        $('#geocacheDifficulty', $el).val(geocache.difficulty);
    }

    function getEmptyGeocache() {
        var gc = new Geocache().toJSON();
        return gc;
    }

    return {
        GeocacheListView: GeocacheListView,
        GeocacheListsView: GeocacheListsView,
        getDialogGeocache: getDialogGeocache,
        setDialogGeocache: setDialogGeocache,
        getEmptyGeocache: getEmptyGeocache
    };
});