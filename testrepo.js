var repository = require('./modules/repository'),
    _ = require('underscore'),
    aaaid = '52790191e77bcb1827000001';

repository.getUserByName('aaa')
    .then(function (user) {
        if (!user) {
            console.log('user not found');
        }
        else {
            repository.getUserById(user._id)
                .then(function (byid) {
                    if (byid.name !== user.name) {
                        console.log("???");
                    } else {
                        console.log(JSON.stringify(byid));
                    }
                });
        }
    })
    .done();

repository.deleteList(aaaid, 'abc')
    .then(function (updated) {
        return repository.createList(aaaid, 'abc');
    })
    .then(function (updated) {
        console.log(JSON.stringify(updated));
    })
    .done();


