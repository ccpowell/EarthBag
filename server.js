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
                    user: created
                };
                response.cookie('user', {_id: created._id, name: created.name}, {maxAge: 3600000});
                response.send(data);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    app.post('/api/user/validate', function (request, response) {
        repository.getUserByName(request.body.name)
            .then(function (found) {
                var data = {
                    user: null
                };
                if (!found) {
                    return response.send(400, "User name not found. Please register to create an account.");
                } else if (found.password !== request.body.password) {
                    return response.send(400, "Password incorrect.");
                } else {
                    data.user = { name: found.name, _id: found._id };
                    response.cookie('user', data.user, {maxAge: 3600000});
                    return response.send(200, data);
            }
            })
            .fail(function (bummer) {
                return response.send(500, bummer.toString());
            });
    });

    app.post('/api/user/changepw', function (request, response) {
        return response.send(501);
    });

    app.post('/api/user/forgotpw', function (request, response) {
        return response.send(501);
    });

    app.post('/api/creategeocachelist', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null;
        if (!userId) {
            response.send(401, 'not logged in');
            return;
        }
        repository.createList(userId, request.body.name)
            .then(function () {
                var data = {
                    error: null
                };
                response.send(200, data);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });



    app.get('/api/usergeocachelists', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null;
        if (!userId) {
            response.send(401, 'not logged in');
            return;
        }
        // just return names of geocacheLists
        repository.getUserById(userId)
            .then(function (user) {
                var data = {
                    geocacheLists: []
                };
                if (user.geocacheLists && user.geocacheLists.length > 0) {
                    data.geocacheLists = _.chain(user.geocacheLists)
                        .pluck('name')
                        .sort()
                        .value();
                }
                response.send(data);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // get geocache list by name
    app.get('/api/geocachelist/:name', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null,
            name = request.params.name;
        if (!userId) {
            response.send(401, 'not logged in');
            return;
        }
        repository.getUserById(userId)
            .then(function (user) {
                var data = {
                        name: name,
                        geocaches: []
                    },
                    list = null;
                if (user.geocacheLists && user.geocacheLists.length > 0) {
                    list = _.find(user.geocacheLists, function (gcl) {
                        return gcl.name === name;
                    });
                }
                if (list) {
                    data.geocaches = list.geocaches;
                    response.send(data);
                } else {
                    response.send(404, 'No such list');
                }
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // update a geocache list
    app.put('/api/geocachelist/:name', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null;
        if (!userId) {
            response.send(401, 'not logged in');
            return;
        }
        repository.updateList(userId, request.body)
            .then(function () {
                response.send(200);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });
    // delete geocache list by name
    app.delete('/api/geocachelist/:name', function (request, response) {
        var user = request.cookies.user,
            userId = user ? user._id : null,
            name = request.params.name;
        if (!userId) {
            response.send(401, 'not logged in');
            return;
        }
        repository.deleteList(userId, name)
            .then(function () {
                response.send(200);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // okay, fire it up
    callback(server);
};

