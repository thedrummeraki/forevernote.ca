(function() {
    var PasswordRecovery = (function() {
        var step1_div = document.getElementById('step-1');
        var step2_div = document.getElementById('step-2');
        var step3_div = document.getElementById('step-3');
        function show(step_id) {
            var all_steps = document.querySelectorAll('[step-no]');
            [].forEach.call(all_steps, function(step) {
                if (step.getAttribute('step-no') == step_id) {
                    step.classList.remove('hide');
                } else {
                    step.classList.add('hide');
                }
            });
        }

        var step1 = function() {
            show(1);
            var email_address = document.getElementById('step1-email');
            var label = document.querySelector('[for="step1-email"]');
            var loader = document.getElementById('step1-loader');
            var button = document.getElementById('step1-submit');
            var form = document.getElementById('step1-form');
            form.onsubmit = function(e) {
                e.preventDefault();
                loader.classList.remove('hide');
                button.classList.add('hide');
                var email = email_address.value;
                $.ajax({
                    url: '/password-reset/check-email',
                    data: {email_address: email},
                    success: function(e) {
                        if (e.success) {
                            step2(e.email_address);
                        } else {
                            label.setAttribute("data-error", 'This email does not seem to be associated with anyone! Please try again.');
                            email_address.classList.add("invalid");
                        }
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    },
                    error: function(a, b, c) {
                        label.setAttribute("data-error", 'Uh-oh, something is wrong on our side! Please try again.');
                        email_address.classList.add("invalid");
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    }
                });
            }
        }

        var step2 = function(email_address) {
            show(2);
            var hash_code = document.getElementById('hash-code');
            var label = document.querySelector('[for="hash-code"]');
            var loader = document.getElementById('step2-loader');
            var button = document.getElementById('step2-submit');
            var form = document.getElementById('step2-form');
            form.onsubmit = function(e) {
                e.preventDefault();
                loader.classList.remove('hide');
                button.classList.add('hide');
                var code = hash_code.value;
                $.ajax({
                    url: '/password-reset/check-code',
                    data: {hash_code: code, email_address: email_address},
                    success: function(e) {
                        if (e.success) {
                            step3(email_address);
                        } else {
                            label.setAttribute("data-error", 'This is not the right code! Please try again.');
                            hash_code.classList.add("invalid");
                        }
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    },
                    error: function(a, b, c) {
                        label.setAttribute("data-error", 'Uh-oh, something is wrong on our side! Please try again.');
                        hash_code.classList.add("invalid");
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    }
                });
            }
        }

        var step3 = function(email_address) {
            show(3);
            var password = document.getElementById('password');
            var password_conf = document.getElementById('cpassword');
            var password_label = document.querySelector('[for="password"]');
            var password_conf_label = document.querySelector('[for="cpassword"]');
            var loader = document.getElementById('step3-loader');
            var button = document.getElementById('step3-submit');
            var form = document.getElementById('step3-form');
            form.onsubmit = function(e) {
                e.preventDefault();
                loader.classList.remove('hide');
                button.classList.add('hide');
                var pass = password.value;
                var cpass = cpassword.value;
                $.ajax({
                    url: '/password-reset/check-passwords',
                    data: {password: pass, password_confirmation: cpass, email_address: email_address},
                    success: function(e) {
                        if (e.success) {
                            requestLogin(email_address, pass);
                        } else {
                            label.setAttribute("data-error", 'This is not the right code! Please try again.');
                            hash_code.classList.add("invalid");
                        }
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    },
                    error: function(a, b, c) {
                        label.setAttribute("data-error", 'Uh-oh, something is wrong on our side! Please try again.');
                        hash_code.classList.add("invalid");
                        loader.classList.add('hide');
                        button.classList.remove('hide');
                    }
                });
            }
        }

        var requestLogin = function(email_address, password) {
            $.ajax({
                url: '/login',
                method: 'post',
                data: {email_address: email_address, password: password},
                success: function(e) {
                    window.location.href = '/';
                },
                error: function(e) {
                    alert('There was an issue while logging you in. We will send you back to the login page.');
                    window.location.href = '/';
                }
            })
        }
        return {
            step1: step1
        }
    })();

    PasswordRecovery.step1();
})();
