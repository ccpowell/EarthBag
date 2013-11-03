/* global require: false */
require.config({
    paths: {
        // Make vendor easier to access.
        //"vendor": "../vendor",

        // Almond is used to lighten the output filesize.
        "almond": "vendor/almond/almond",

        // Opt for Lo-Dash Underscore compatibility build over Underscore.
        "underscore": "vendor/lodash/lodash.compat",

        // Map remaining vendor dependencies.
        "jquery": "vendor/jquery/jquery",
        "jquery-ui": "vendor/jquery-ui/jquery-ui",
        "backbone": "vendor/backbone/backbone",
        "cookie": "vendor/jquery.cookie/jquery.cookie"
    },

    shim: {
        // This is required to ensure Backbone works as expected within the AMD
        // environment.
        "backbone": {
            // These are the two hard dependencies that will be loaded first.
            deps: ["jquery", "underscore"],

            // This maps the global `Backbone` object to `require("backbone")`.
            exports: "Backbone"
        },
        "jquery-ui": "jquery",
        "cookie": "jquery"
    }
});
