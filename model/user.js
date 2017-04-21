'use strict'
var bcrypt = require('bcrypt');
var fs = require('fs');
const path = require('path');
/*
UserSchema {
  email ,
  password
}
*/
function User() {
    this.email = "";
    this.password = "";
}

var save = function (email, password, cb) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            cb({ description: "error generate salt" });
        }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                cb({ description: "error generate hash" });
            }
            try {
                var user = new User();
                user.email = email;
                user.password = hash;

                //add this user
                var db = require('./data.json');
                db.users.push(user);
                fs.writeFile('./model/data.json', JSON.stringify(db), function (err) {
                    if (err) {
                        cb({ description: "error save user" });
                    } else {
                        //add success
                        cb();
                    }
                    delete require.cache[require.resolve('./data.json')];
                });
            } catch (e) {
                cb({ description: e });
            }
        });
    });
};

var compare = function (email, password, cb) {
    try {
        var users = require('./data.json').users;
        for (var i = 0; i < users.length; i++) {
            var flag = bcrypt.compareSync(password, users[i].password);
            if (flag && users[i].email == email) {
                delete require.cache[require.resolve('./data.json')];
                return cb();
            }
        }
        delete require.cache[require.resolve('./data.json')];
        cb({ description: 'User doesn\'t exists' });
    } catch (e) {
        cb({ description: e });
    }
}

var isExitst = function (email, cb) {
    try {
        var users = require('./data.json').users;
        var flags = users.find(function (item) {
            return item.email === email;
        });
        if (flags) {//user exists
            return cb(undefined, true);
        }
        delete require.cache[require.resolve('./data.json')];
        return cb(undefined, false);
    } catch (e) {
        cb({ description: e }, undefined);
    }
};

var entity = {
    save: save,
    compare: compare,
    isExitst: isExitst
}
module.exports = entity;