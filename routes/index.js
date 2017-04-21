var express = require('express');
var router = express.Router();
var base64 = require('base-64');
var authenUser = require('../configfunction').authenUser;

/* GET home page. */
router.get('/', authenUser, function (req, res) {
    //get user's info
    var cookie = req.cookies._UserAuth;
    var email = JSON.parse(base64.decode(cookie));
    return res.render('index', { title: 'Index',userInfo :email});
});

module.exports = router;
