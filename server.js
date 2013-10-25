var express = require('express'),
    routes = require('./routes'),
    engines = require('consolidate'),
    mongoose = require('mongoose');

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

    // Mongo stuff
    // TBD put into repository

    //Connect to database
    mongoose.connect('mongodb://localhost/library_database');

    //Schemas

    var Book = new mongoose.Schema({
        title: String,
        author: String,
        releaseDate: Date,
        keywords: [String]
    });

    //Models
    var BookModel = mongoose.model('Book', Book);

    //Get a list of all books
    app.get('/api/books', function (request, response) {
        console.log('Get books');
        return BookModel.find(function (err, books) {
            if (!err) {
                response.header("Cache-Control", "no-cache, no-store, must-revalidate");
                response.header("Pragma", "no-cache");
                response.header("Expires", 0);
                return response.send(books);
            } else {
                return console.log(err);
            }
        });
    });

    //Insert a new book
    app.post('/api/books', function (request, response) {
        var book = new BookModel({
            title: request.body.title,
            author: request.body.author,
            releaseDate: request.body.releaseDate,
            keywords: request.body.keywords
        });
        book.save(function (err) {
            if (!err) {
                return console.log('created');
            } else {
                return console.log(err);
            }
        });
        return response.send(book);
    });

    //Get a single book by id
    app.get('/api/books/:id', function (request, response) {
        console.log('Get book ' + request.params.id);
        return BookModel.findById(request.params.id, function (err, book) {
            if (!err) {
                return response.send(book);
            } else {
                return console.log(err);
            }
        });
    });

    //Update a book
    app.put('/api/books/:id', function (request, response) {
        console.log('Updating book ' + request.body.title);
        return BookModel.findById(request.params.id, function (err, book) {
            book.title = request.body.title;
            book.author = request.body.author;
            book.releaseDate = request.body.releaseDate;
            book.keywords = request.body.keywords      

            return book.save(function (err) {
                if (!err) {
                    console.log('book updated');
                } else {
                    console.log(err);
                }
                return response.send(book);
            });
        });
    });

    //Delete a book
    app.delete('/api/books/:id', function (request, response) {
        console.log('Deleting book with id: ' + request.params.id);
        return BookModel.findById(request.params.id, function (err, book) {
            return book.remove(function (err) {
                if (!err) {
                    console.log('Book removed');
                    return response.send('');
                } else {
                    console.log(err);
                }
            });
        });
    });

    // okay, fire it up
    callback(server);
};

