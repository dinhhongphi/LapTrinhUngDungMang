'use strict'
var express = require('express');
var router = express.Router();

//form data return to client
var data = { type: '', description: '' };

/* GET signin page. */
router.get('/signin', function (req, res) {
    res.render('signin', { title: "signin" });
});


/*POST handler user sign in*/
router.post('/signin', function (req, res) {
    if (false) {//check user exists

    } else {
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
            return res.render('index', { title: "index" });
        }
        //response error
        data.type = 'error';
        data.description = 'Mật khẩu không trùng khớp'
        return res.render('signup', { title: 'signup', data: data });
    }
    //response error
    data.type = 'error';
    data.description = 'Email không đúng định dạng'
    return res.render('signup', { title: 'signup', data: data });
});

router.get('/', function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
