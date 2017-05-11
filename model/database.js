var mongoose = require('mongoose')

var connectionString = "mongodb://127.0.0.1:27017/UserSign"

exports.connect = function (cb) {
    mongoose.connect(connectionString, cb);
}