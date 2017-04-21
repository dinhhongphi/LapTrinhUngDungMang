'use strict'

/*check user signed in*/
var authenUser = function (req, res, next) {
    if (req.cookies._UserAuth) {
        //req.app.locals.UserAuth work only on server to auth user
        req.app.locals.UserAuth = true;
        next();
    } else {
        return res.redirect('/users/signin');
    }

};

/*allow function don't need authentication*/
var InitStartupAuthentication = function (req, res, next) {
    req.app.locals.UserAuth = false; //default all route don't authentication
    next();
};

exports.authenUser = authenUser;
exports.initStartupAuthentication = InitStartupAuthentication;
