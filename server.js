var express = require('express'),
    routes = require('./routes'),
    engines = require('consolidate'),
    repository = require('./modules/repository'),
    _ = require('underscore');

exports.startServer = function (config, callback) {
    var port = process.env.PORT || config.server.port;
    var app = express();
    var server = app.listen(port, function () {
        console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
    });

    app.configure(function () {
        app.set('port', port);
        app.set('views', config.server.views.path);
        app.engine(config.server.views.extension, engines[config.server.views.compileWith]);
        app.set('view engine', config.server.views.extension);
        app.use(express.favicon());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.methodOverride());
        app.use(express.compress());
        app.use(config.server.base, app.router);
        app.use(express.static(config.watch.compiledDir));
    });

    app.configure('development', function () {
        app.use(express.errorHandler());
    });

    app.get('/', routes.index(config));

    app.post('/api/user/register', function (request, response) {
        var user = {
            name: request.body.name,
            password: request.body.password
        };
        repository.createUser(user)
            .then(function (created) {
                var data = {
                    user: created,
                    error: null
                };
                response.cookie('user', {_id: created._id, name: created.name}, {maxAge: 3600000});
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });

    app.post('/api/user/validate', function (request, response) {
        repository.getUserByName(request.body.name)
            .then(function (found) {
                var data = {
                    user: null,
                    error: null
                };
                if (!found) {
                    data.error = "User name not found. Please register to create an account.";
                } else if (found.password !== request.body.password) {
                    data.error = "Password incorrect.";
                } else {
                    data.user = { name: found.name, _id: found._id };
                    response.cookie('user', data.user, {maxAge: 3600000});
                }
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });

    app.post('/api/user/changepw', function (request, response) {
        return response.send('ok');
    });

    app.post('/api/user/forgotpw', function (request, response) {
        return response.send('ok');
    });

    app.post('/api/creategeocachelist', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null;
        if (!userId) {
            return response.send(403, 'not logged in');
        }
        repository.createList(userId, request.body.name)
            .then(function () {
                var data = {
                    error: null
                };
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });

    app.get('/api/usergeocachelists', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null;
        if (!userId) {
            return response.send(403, 'not logged in');
        }
        // just return names of geocacheLists
        repository.getUserById(userId)
            .then(function (user) {
                var data = {
                    geocacheLists: [],
                    error: null
                };
                if (user.geocacheLists && user.geocacheLists.length > 0) {
                    data.geocacheLists = _.chain(user.geocacheLists)
                        .pluck('name')
                        .sort()
                        .value();
                }
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });

    // get geocache list by name
    app.get('/api/geocachelist/:name', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null,
            name = request.params.name;
        if (!userId) {
            return response.send(403, 'not logged in');
        }
        repository.getUserById(userId)
            .then(function (user) {
                var data = {
                        name: name,
                        geocaches: [],
                        error: null
                    },
                    list = null;
                if (user.geocacheLists && user.geocacheLists.length > 0) {
                    list = _.find(user.geocacheLists, function (gcl) {
                        return gcl.name === name;
                    });
                }
                if (list) {
                    data.geocaches = list.geocaches;
                } else {
                    data.error = 'No such list';
                }
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });

    // delete geocache list by name
    app.delete('/api/geocachelist/:name', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null,
            name = request.params.name;
        if (!userId) {
            return response.send(403, 'not logged in');
        }
        repository.deleteList(userId, name)
            .then(function () {
                var data = {
                        error: null
                };
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    error: bummer.toString()
                };
                return response.send(data);
            });
    });


    // okay, fire it up
    callback(server);
};

