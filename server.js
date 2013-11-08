var express = require('express'),
    routes = require('./routes'),
    engines = require('consolidate'),
    repository = require('./modules/repository'),
    _ = require('underscore');

function checkUser(request, response, next) {
    var user = request.cookies.user,
        userId = user ? user._id : null;
    if (!userId) {
        response.send(401, 'not logged in');
    } else {
        request.user = user;
        next();
    }
}

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
        app.use('/api', checkUser);
        app.use(config.server.base, app.router);
        app.use(express.static(config.watch.compiledDir));
    });

    app.configure('development', function () {
        app.use(express.errorHandler());
    });

    app.get('/', routes.index(config));

    app.post('/user/register', function (request, response) {
        var user = {
            name: request.body.name,
            password: request.body.password
        };
        repository.createUser(user)
            .then(function () {
                var u = { name: user.name, _id: user._id };
                response.cookie('user', u, {maxAge: 3600000});
                response.send(200, u);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    app.post('/user/validate', function (request, response) {
        repository.getUserByName(request.body.name)
            .then(function (found) {
                if (!found) {
                    response.send(400, "User name not found. Please register to create an account.");
                } else if (found.password !== request.body.password) {
                    response.send(400, "Password incorrect.");
                } else {
                    var u = { name: found.name, _id: found._id };
                    response.cookie('user', u, {maxAge: 3600000});
                    response.send(200, u);
                }
            })
            .fail(function (bummer) {
                response.send(500, bummer.toString());
            });
    });

    app.post('/user/forgotpw', function (request, response) {
        response.send(501);
    });

    // API calls must be made by a logged in user
    app.post('/api/changepw', function (request, response) {
        response.send(501);
    });

    app.post('/api/creategeocachelist', function (request, response) {
        repository.createList(request.user._id, request.body.name)
            .then(function () {
                response.send(200, {});
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    app.get('/api/usergeocachelists', function (request, response) {
        // just return names of geocacheLists
        repository.getUserGeocacheLists(request.user._id)
            .then(function (lists) {
                var data = {
                    geocacheLists: lists
                };
                response.send(200, data);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // get geocache list by name
    app.get('/api/geocachelist/:name', function (request, response) {
        var name = request.params.name;
        repository.getUserGeocacheList(request.user._id, name)
            .then(function (list) {
                response.send(200, list);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // update a geocache list
    app.put('/api/geocachelist/:name', function (request, response) {
        repository.updateList(request.user._id, request.body)
            .then(function () {
                response.send(200);
            })
            .fail(function (bummer) {
                response.send(400, bummer.toString());
            });
    });

    // delete geocache list by name
    app.delete('/api/geocachelist/:name', function (request, response) {
        var name = request.params.name;
        repository.deleteList(request.user._id, name)
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

