var repository = require('./modules/repository'),
    _ = require('underscore');
/*
repository.getUserByName('aaa')
    .then(function (user) {
        repository.getUserById(user._id)
            .then(function (byid) {
                if (byid.name !== user.name) {
                    console.log("???");
                } else {
                    console.log(JSON.stringify(byid));
                }
            })
    })
    .done();
*/
repository.getUserById('5276a5d68b8ad9a019000003')
    .then(function (byid) {
        console.log(JSON.stringify(byid));
    })
    .done();


 repository.createList('5276a5d68b8ad9a019000003', 'abc')
 .then(function (updated) {
 console.log(JSON.stringify(updated));
 })
 .done();


