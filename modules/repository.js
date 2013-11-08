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
    return new mongo.MongoClient(new mongo.Server(host, port, {native_parser: true}));
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
        return makeError('Email is required');
    }
    if (!user['password']) {
        return makeError('Password is required');
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

function makeError(message) {
    return Q.fcall(function () {
        throw message;
    })
}

// add a list to a user
exports.createList = function (userId, name) {
    if (!name) {
        return makeError('Name is required.');
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

// update a list
exports.updateList = function (userId, gcl) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
            .then(function (user) {
                if (!user) {
                    throw "User not found.";
                }
                if (!user.geocacheLists) {
                    throw "User does not have any geocache lists.";
                }
                var found = _.some(user.geocacheLists, function (gc) {
                    if (gc.name === gcl.name) {
                        gc.geocaches = gcl.geocaches;
                        return true;
                    }
                    return false;
                });
                if (!found) {
                    throw "List not found.";
                }
                return Q.ninvoke(collection, 'save', user);
            })
    };
    return withUsers(action);
};


// delete a list
exports.deleteList = function (userId, name) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
            .then(function (user) {
                if (!user) {
                    throw "User not found.";
                }
                if (user.geocacheLists) {
                    user.geocacheLists = _.reject(user.geocacheLists, function (gc) {
                        return (gc.name === name);
                    });
                }
                return Q.ninvoke(collection, 'save', user);
            })
    };
    return withUsers(action);
};



exports.getUserGeocacheLists = function (userId) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
            .then(function (user) {
                var lists;
                if (user.geocacheLists && user.geocacheLists.length > 0) {
                    lists = _.chain(user.geocacheLists)
                        .pluck('name')
                        .sort()
                        .value();
                }
                return Q(lists);
            });
    };
    return withUsers(action);
};


exports.getUserGeocacheList = function (userId, name) {
    var action = function (collection) {
        return Q.ninvoke(collection, 'findOne', { _id: mongo.ObjectID(userId) })
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
                    return Q(data);
                }
                throw "no such list";
            });
    };
    return withUsers(action);
};
