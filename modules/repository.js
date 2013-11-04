/*
 * Mongo-based repository
 */
var mongo = require('mongodb'),
    Q = require('q'),
    host = 'localhost',
    port = mongo.Connection.DEFAULT_PORT,
    server = new mongo.Server(host, port, {}),
    cdb = new mongo.Db('gmjr', server, { journal: true });

function throwit(message) {
    throw message;
}

// get all users
exports.getUsers = function () {
    return Q.ninvoke(cdb, 'open')
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            var cursor = collection.find();
            return Q.ninvoke(cursor, 'toArray');
        })
        .fin(function () {
            cdb.close();
        });
};

// get a single user by id
exports.getUserById = function (id) {
    return Q.ninvoke(cdb, 'open')
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { _id: id });
        })
        .fin(function () {
            console.log("closing db");
            cdb.close();
        });
};

exports.createUser = function (user) {
    console.log(user['name']);
    if (!user['name']) {
        return Q.fcall(function () { throw 'Email is required'; });
    };
    if (!user['password']) {
        return Q.fcall(function () { throw 'Password is required'; });
    };
    return Q.ninvoke(cdb, 'open')
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
            cdb.close();
        });
};

// get a single list by id
exports.getGeocacheListById = function (id) {
    return Q.ninvoke(cdb, 'open')
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'geocachelists');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { _id: id });
        })
        .fin(function () {
            cdb.close();
        });
};

// get a single user by name (i.e. email)
exports.getUserByName = function (name) {
    return Q.ninvoke(cdb, 'open')
        .then(function (db) {
            return Q.ninvoke(db, 'collection', 'users');
        })
        .then(function (collection) {
            return Q.ninvoke(collection, 'findOne', { name: name });
        })
        .fin(function () {
            cdb.close();
        });
};
