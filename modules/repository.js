/*
 * Mongo-based repository
 */
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

// perform an action with the collection of users
function withUsers(action) {
    var mongoclient = newClient();
    //console.log('open');
    return Q.ninvoke(mongoclient, 'open')
        .then(function (client) {
            return Q.ninvoke(client.db('gmjr'), 'open');
        })
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(action)
        .fin(function () {
            mongoclient.close();
            //console.log('close');
        });
}

exports.getUsers = function () {
    var action = function (collection) {
        var cursor = collection.find();
        return Q.ninvoke(cursor, 'toArray');
    };
    return withUsers(action);
};

// get a single user by id
exports.getUserById = function (id) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(id) });
    };
    return withUsers(action);
};

// get a single user by name (i.e. email)
exports.getUserByName = function (name) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { name: name });
    };
    return withUsers(action);
};

exports.createUser = function (user) {
    console.log(user['name']);
    if (!user['name']) {
        return Q.fcall(function () {
            throw 'Email is required';
        });
    }
    if (!user['password']) {
        return Q.fcall(function () {
            throw 'Password is required';
        });
    }
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { name: user.name })
            .then(function (found) {
                if (found) {
                    throw "Email already used.";
                }
                return Q.ninvoke(collection, 'insert', user);
            });
    };
    return withUsers(action);
};


// add a list to a user
exports.createList = function (userId, name) {
    if (!name) {
        return Q.fcall(function () {
            throw 'Name is required.';
        });
    }
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
            .then(function (user) {
                if (!user) {
                    throw "User not found.";
                }
                if (!user.geocacheLists) {
                    user.geocacheLists = [];
                }
                _.each(user.geocacheLists, function (gc) {
                    if (gc.name === name) {
                        throw "There is already a list with this name."
                    }
                });
                user.geocacheLists.push({
                    name: name,
                    geocaches: []
                });
                // TODO: more specific update?
                return Q.ninvoke(collection, 'save', user);
            })
    };
    return withUsers(action);
};


