var Auth = (function() {
    var users = [];
    var current_user = null;

    var getUser = function(username) {
        var found = null;
        [].forEach.call(users, function(user) {
            if (user.username == username) {
                found = user;
                return;
            }
        });
        return found;
    }

    var checkUsernameExists = function(username) {
        return getUser(username) != null;
    }

    var checkEmailExists = function(email) {
        var found = false;
        [].forEach.call(users, function(user) {
            if (user.email == email) {
                found = true;
                return;
            }
        });
        return found;
    }

    var login = function(username, password) {
        console.log(users);
        if (!checkUsernameExists(username)) {
            return false;
        }
        var user = null;
        [].forEach.call(users, function(u) {
            if (username == u.username) {
                user = u;
                return;
            }
        });
        var success = user.password == password;
        if (success) {
            current_user = user;
        }
        console.log(current_user);
        return success;
    }

    var addUser = function(user, callback) {
        var success = true;
        var errors = [];
        if (checkUsernameExists(user.username)) {
            errors.push({id: "username", message: "This username is already used."});
            success = false;
        }

        if (checkEmailExists(user.email)) {
            errors.push({id: "email", message: "This email is already used."});
            success = false;
        }
        if (success) {
            users.push(user);
        }
        if (callback) {
            callback(success, errors);
        }
    }

    var updatePassword = function(username, password) {
        var user = null;
        [].forEach.call(users, function(u) {
            if (username == u.username || username == u.email) {
                u.password = password;
                return;
            }
        });
    }

    return {
        register: addUser,
        checkEmailExists: checkEmailExists,
        login: login,
        updatePassword: updatePassword,
        getUser: getUser,
        current_user: current_user
    }
})();

module.exports = Auth;
