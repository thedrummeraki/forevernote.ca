(function() {
    var save_btn = document.getElementById('save-profile');
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var cpasswordInput = document.getElementById("cpassword");
    var emailInput = document.getElementById("email");
    var nameInput = document.getElementById("name");

    save_btn.onclick = function(e) {
        e.preventDefault();
        if (this.getAttribute('state') == 'saving') {
            return;
        }
        console.log("saving profile...");
        setStatus(Settings.STATUS_PROFILE_SAVING);
        setSaving();

        var success = true;
        [].forEach.call([usernameInput, emailInput], function(input) {
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
                method: 'get',
                url: '/user/getid',
                success: function(e) {
                    var id = e.id;
                    if (!id) {
                        console.error('Could not get user id.');
                        setStatus(Settings.STATUS_PROFILE_SAVING_ERRORS);
                        unsetSaving();
                    } else {
                        saveUser(id, data);
                    }
                }
            });
        } else {
            setStatus(Settings.STATUS_PROFILE_SAVING_ERRORS);
            unsetSaving();
        }

        function saveUser(id, data) {
            data = data.concat("&user_id=" + id);
            $.ajax({
                method: 'post',
                url: '/user/update?' + data,
                success: function(e) {
                    if (e.success) {
                        Materialize.toast("User profile saved!", 2000, "success-toast");
                        updateUserName();
                        setStatus(Settings.STATUS_PROFILE_SAVED);
                    } else {
                        [].forEach.call(e.errors, function(error) {
                            var elem = document.getElementById(error.id);
                            var label = document.querySelector('[for="' + error.id + '"]');
                            if (error.message) {
                                label.setAttribute("data-error", error.message);
                            }
                            elem.classList.add('invalid');
                            setStatus(Settings.STATUS_PROFILE_SAVING_ERRORS);
                        });
                    }
                    unsetSaving();
                },
                error: function(e) {
                    unsetSaving();
                }
            });
        }

        function setSaving() {
            save_btn.setAttribute('state', 'saving');
            save_btn.classList.add('disabled');
        }

        function unsetSaving() {
            save_btn.removeAttribute('state');
            save_btn.classList.remove('disabled');
        }
    }
})();
