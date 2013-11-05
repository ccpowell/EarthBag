/*
 * Mongo-based repository
 */
var mongo = require('mongodb'),
    Q = require('q'),
    host = 'localhost',
    _ = require('underscore'),
    port = mongo.Connection.DEFAULT_PORT;

function newClient() {
    return mongoclient = new mongo.MongoClient(new mongo.Server(host, port, {native_parser: true}));
}

// get all users
exports.getUsers = function () {
    var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            var cursor = collection.find();
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () {
            mongoclient.close();
        });
};

// get a single user by id
exports.getUserById = function (id) {
    var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(id) });
        })
        .fin(function () {
            mongoclient.close();
        });
};

exports.createUser = function (user) {
    console.log(user['name']);
    if (!user['name']) {
        return Q.fcall(function () { throw 'Email is required'; });
    }
    if (!user['password']) {
        return Q.fcall(function () { throw 'Password is required'; });
    }
    var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { name: user.name })
                .then(function (found) {
                    if (found) {
                        throw "Email already used.";
                    }
                    return Q.ninvoke(collection, 'insert', user);
                });
        })
        .fin(function () {
            mongoclient.close();
        });
};

// add a list to a user
exports.createList = function (userId, name) {
    if (!name) {
        return Q.fcall(function () { throw 'Name is required.'; });
    }
    var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
                .then(function (user) {
                    if (!user) {
                        throw "User not found.";
                    }
                    if (!user.geocaches) {
                        user.geocaches = [];
                    }
                    _.each(user.geocaches, function(gc) {
                        if (gc.name === name) {
                            throw "There is already a list with this name."
                        }
                    });
                    user.geocaches.push({
                        name: name,
                        geocaches: []
                    });
                    return Q.ninvoke(collection, 'save', user);
                })
        })
        .fin(function () {
            mongoclient.close();
        });
};




// get a single list by id
exports.getGeocacheListById = function (id) { var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'geocachelists');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { _id: id });
        })
        .fin(function () {
            mongoclient.close();
        });
};

// get a single user by name (i.e. email)
exports.getUserByName = function (name) {
    var mongoclient = newClient();
    return Q.ninvoke(mongoclient, 'open')
        .then(function(client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { name: name });
        })
        .fin(function () {
            mongoclient.close();
        });
};
