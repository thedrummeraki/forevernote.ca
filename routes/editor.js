var express = require('express');
var router = express.Router();
var utils = require("../utils/utils.js");
var auth = require("../utils/auth.js");

router.get('/', function(req, res, next) {
    if (!req.query.username) {
        return res.redirect('/');
    }
    var user = auth.getUser(req.query.username);
    console.log(user);
    var name = user.name;
    var email = user.email;
    var username = user.username;
	res.render('editor', {name: name, username: username, email: email});
});

module.exports = router;