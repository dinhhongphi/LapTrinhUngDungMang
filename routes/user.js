'use strict'
var express = require('express');
var authenUser = require('../configfunction').authenUser;
var router = express.Router();
var db = require('../model/database');
var userEntity = require('../model/user');

//connect to databse 
db.connect(function (err) {
    if (err) {
        throw err;
    }
})

//form data return to client
var data = { type: '', description: '' };

/* GET signin page. */
router.get('/signin', function (req, res) {
    res.render('signin', { title: "signin" });
});

/*POST handler user sign in*/
router.post('/signin', function (req, res) {
    //authenticated user
    userEntity.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            data.type = 'error';
            data.description = err.description;
            return res.render('signin', { title: "signin", data: data });
        }
        if (user == null) {
            data.type = 'error';
            data.description = "user don't exists";
            return res.render('signin', { title: "signin", data: data });
        }
        user.comparePassword(req.body.password, function (err,isMatch) {
            if (err) {
                data.type = 'error';
                data.description = err;
                return res.render('signin', { title: "signin", data: data });
            }
            if (isMatch) {
              res.locals.UserAuth = true;
              res.cookie('_UserAuth', base64.encode('{"email":"' + req.body.email + '"}'));
              return res.redirect('/');
            } else {
                data.type = 'error';
                data.description = "Email or password don't match";
                return res.render('signin', { title: "signin", data: data });
            }
        })
    })
});

/*GET signup page*/
router.get('/signup', function (req, res) {
    res.render('signup', { title: "signup" });
});

/*POST handler user sign up*/
router.post('/signup', function (req, res) {
    //data from client = {email, password,confirmPassword}
    var regex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

    if (regex.test(req.body.email)) {
        if (req.body.password === req.body.confirmPassword) {
            userEntity.findOne({ email: req.body.email }, function (err,user) {
                if (err) {
                    //response server error
                    data.type = 'error';
                    data.description = err.description;
                    return res.render('signup', { title: 'signup', data: data });
                }
                if (user == null) { //user don't exists
                    //add user
                    let newUser = new userEntity({ email: req.body.email, password: req.body.password })
                    newUser.save(function (err) {
                        if (err) {
                            //response server error
                            data.type = 'error';
                            data.description = err.description;
                            return res.render('signup', { title: 'signup', data: data });
                        }
                        res.locals.UserAuth = req.app.locals.UserAuth;
                        return res.redirect('/');
                    })
                } else {
                    data.type = 'error';
                    data.description = 'Email exists';
                    return res.render('signup', { title: 'signup', data: data });
                }
            })
        } else {
            //response password don't match
            data.type = 'error';
            data.description = 'Mật khẩu không trùng khớp'
            return res.render('signup', { title: 'signup', data: data });
        }
    } else {
        //response email don't format
        data.type = 'error';
        data.description = 'Email không đúng định dạng'
        return res.render('signup', { title: 'signup', data: data });
    }
});

router.get('/logout', authenUser, function (req, res) {
    res.locals.UserAuth = false;
    res.clearCookie('_UserAuth');
    return res.redirect('/users/signin');
});

router.get('/', authenUser, function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
