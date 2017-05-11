'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bcrypt = require('bcrypt');

var UserSchema = new Schema({
    email: String,
    password: String
});

UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err, isMatch);
        cb(null, isMatch);
    })
}

module.exports = mongoose.model('users', UserSchema);