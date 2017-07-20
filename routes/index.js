var express = require('express');
var router = express.Router();
var utils = require("../utils/utils.js");
var auth = require('../utils/auth.js');

const INDEX_FILE = "index.html";

/* GET home page. */
router.get('/', function(req, res, next) {
    var params = req.query;
    var username = params.username;
    res.render('index', { ititle: 'ForeverNote', username: username });
    // utils.sendFile(INDEX_FILE, res);
});

router.get('/login', function (req, res) {
    return res.redirect('/');
});

router.get('/register', function(req, res, next) {
    res.render('register', { ititle: 'ForeverNote' });
});

router.post('/register', function(req, res) {
    var params = req.query;
    var user = {
        username: params.username,
        password: params.password,
        email: params.email,
        name: params.name
    };

    auth.register(user, function(success, errors) {
        var response = {success: success, errors: errors};
        if (success) {
            var url = '/verification';
            url = url.concat("?username=").concat(params.username);
            response.url = url;
        }
        res.send(response);
    });
});

router.get('/verification', function(req, res) {
    var url = '/verification';
    var params = req.query;
    res.render('verification', {username: params.username});
});

router.post('/verification', function (req, res) {
    setTimeout(function() {
        var response = {message: "Success!"};
        var code = req.query.code;
        if (code === "123121") {
            response.success = true;
        } else {
            response.message = "Sorry, but this activation code is not correct.";
            response.success = false;
        }
        res.send(response);
    }, 3000);
});

router.get('/password-reset', function(req, res) {
    res.render('forgot-password');
});

router.post('/check-forgot', function(req, res) {
    var params = req.query;
    var response = {success: utils.checkEmail(params.email), code: params.code === "123456"};
    if (params.password) {
        auth.updatePassword(params.email, params.password);
    }
    setTimeout(function() {
        console.log(response);
        res.send(response);
    }, 1000);
});

router.post('/login', function(req, res) {
    // WARNING: this is not a secure way of checking username & password (this is a demo)
    var params = req.query;

    var username = params.one;
    var password = params.two;
    setTimeout(function() {
        res.send({success: auth.login(username, password)});
    }, 500);
});

module.exports = router;
