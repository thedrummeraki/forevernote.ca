
var Utils = (function () {
	var auth = require('./auth.js');

	var valid_credentials = {
		"akinyele": "akinyele",
		"francis": "francis"
	};

	var valid_emails = {
		"aakin013@uottawa.ca": "akinyele",
		"bob@benoit.com": "francis"
	}

	var path = require("path");

	var sendFile = function(filename, res) {
		filename = __dirname + "/../public/" + filename;
		filename = path.resolve(filename);
		res.sendFile(filename);
	};

	var login = function(username, password) {
		return auth.login(username, password);
	};

	var email = function(email) {
		return auth.checkEmailExists(email);
	}

	return {
		sendFile: sendFile,
		checkLogin: login,
		checkEmail: email
	}
})();

module.exports = Utils;
