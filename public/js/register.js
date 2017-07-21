function register() {
    var form = document.getElementById("register-form");
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var cpasswordInput = document.getElementById("cpassword");
    var emailInput = document.getElementById("email");
    var nameInput = document.getElementById("name");

    var success = true;
    [].forEach.call([usernameInput, passwordInput, cpasswordInput, emailInput], function(input) {
        input.onfocus = function(e) {
            input.classList.remove("invalid");
        };
        if (!input.value.trim()) {
            success = false;
            input.classList.add("invalid");
        } else {
            input.classList.remove("invalid");
        }
    });

    if (cpasswordInput.value !== passwordInput.value) {
        passwordInput.focus();
        cpasswordInput.value = "";
        cpasswordInput.classList.add('invalid');
        success = false;
    } else {
        cpasswordInput.classList.remove('invalid');
    }

    if (success) {
        var data = "username=" + usernameInput.value;
        data = data.concat("&password=" + passwordInput.value);
        data = data.concat("&cpassword=" + cpasswordInput.value);
        data = data.concat("&name=" + nameInput.value);
        data = data.concat("&email=" + emailInput.value);

        $.ajax({
            method: 'post',
            url: '/register?' + data,
            success: function(e) {
                if (e.success) {
                    window.location.href = e.url;
                } else {
                    [].forEach.call(e.errors, function(error) {
                        var elem = document.getElementById(error.id);
                        var label = document.querySelector('[for="' + error.id + '"]');
                        if (error.message) {
                            label.setAttribute("data-error", error.message);
                        }
                        elem.classList.add('invalid');
                    });
                }
            }
        });
    }
    return false;
}
window.onload = function (e) {
};