var express = require('express'),
    routes = require('./routes'),
    engines = require('consolidate'),
    repository = require('./modules/repository');

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
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    user: null,
                    error: bummer
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
                    data.user = found;
                }
                return response.send(data);
            })
            .fail(function (bummer) {
                var data = {
                    user: null,
                    error: bummer
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

    app.get('/api/usergeocachelists/:id', function (request, response) {
        var data = {
            geocacheLists: [
                { _id: '1f', name: 'alpha' }
            ],
            error: null
        };
        console.log('get usergeocachelists for ' + request.params.id);
        return response.send(data);
    });


    // okay, fire it up
    callback(server);
};

