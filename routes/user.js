'use strict'
var express = require('express');
var base64 = require('base-64');
var authenUser = require('../configfunction').authenUser;
var router = express.Router();
var fs = require('fs');
//form data return to client
var data = { type: '', description: '' };

/* GET signin page. */
router.get('/signin', function (req, res) {
    res.render('signin', { title: "signin"});
});


/*POST handler user sign in*/
router.post('/signin', function (req, res) {
    var users = require('../model/data.json').users;
    //find user
    var userExists = users.find(function (item) {
        return item.email === req.body.email && item.password === req.body.password;
    });
    if (userExists) {
        res.locals.UserAuth = true;
        res.cookie('_UserAuth', base64.encode('{"email":"' + req.body.email +'"}'));
        return res.redirect('/');

    } else {
        //user doesn't exists
        data.type = 'error';
        data.description = 'Email or password invalid';
        return res.render('signin', { title: "signin", data: data });
    }
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
            //add this user
            var db = require('../model/data.json');
            var user = { email: req.body.email, password: req.body.password };
            db.users.push(user);
            fs.writeFile('./model/data.json', JSON.stringify(db), function (err) {
                if (err) {
                    console.log('error');
                    //response error
                    data.type = 'error';
                    data.description = err;
                    return res.render('signup', { title: 'signup', data: data });
                } else {
                    //add user success
                    res.locals.UserAuth = req.app.locals.UserAuth;
                    return res.redirect('/');
                }
            });
        } else {
          //response error
          data.type = 'error';
          data.description = 'Mật khẩu không trùng khớp'
          return res.render('signup', { title: 'signup', data: data });
        }
    } else {
      //response error
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

router.get('/', authenUser,function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
