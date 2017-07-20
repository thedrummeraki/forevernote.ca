$(document).ready(function() {
    var step_1 = document.getElementById("step1");
    var step_2 = document.getElementById("step2");
    var step_3 = document.getElementById("step3");

    var submitForm1 = function(e) {
        submit_1.classList.add("disabled");
        submit_1.innerHTML = "Waiting...";
        var email = email_step_1.value.trim();

        $.ajax({
            url: '/check-forgot?email=' + email,
            method: 'post',
            success: function(e) {
                if (e.success) {
                    step_2.classList.remove("hide");
                    step_1.classList.add("hide");
                    inputs[0].focus();
                } else {
                    step_1.classList.remove("hide");
                    step_2.classList.add("hide");
                    email_step_1.classList.add("invalid");
                    submit_1.classList.remove("disabled");
                    submit_1.innerHTML = "Try again";
                }
            }
        });
        return false;
    };

    var submitForm2 = function(e) {
        submit_2.classList.add("disabled");
        submit_2.innerHTML = "Waiting...";
        reset.classList.add("disabled");

        var error_message = document.getElementById("step2-error-message");
        error_message.classList.add("hide");

        var code = "";
        [].forEach.call(inputs, function(i) {i.classList.remove("invalid"); code = code.concat(i.value)});
        $.ajax({
            url: "/check-forgot?code=" + code,
            method: "post",
            success: function(e) {
                if (e.code) {
                    step_3.classList.remove("hide");
                    step_2.classList.add("hide");
                    console.log(document.getElementById("step3"));
                } else {
                    error_message.classList.remove("hide");
                    step_2.classList.remove("hide");
                    step_3.classList.add("hide");
                    [].forEach.call(inputs, function(i) { i.classList.add("invalid"); i.classList.remove("valid"); });
                    submit_2.classList.remove("disabled");
                    reset.classList.remove("disabled");
                    submit_2.innerHTML = "Try again";
                }
            }
        });
        return false;
    };

    var submitForm3 = function(e) {
        submit_3.classList.add("disabled");
        submit_3.innerHTML = "Waiting...";
        $.ajax({
            url: '/check-forgot?password=' + password_step_3.value + "?email=" + email_step_1.value,
            method: 'post',
            success: function(e) {
                submit_3.classList.add('hide');
                success.classList.remove('hide');
            }
        });
        return false;
    };

    var form_1 = document.getElementById("forgot-password-email-form");
    var email_step_1 = document.getElementById("email-step-1");
    var submit_1 = document.getElementById("step-1-sub");

    var form_2 = document.getElementById("forgot-password-code-form");
    var count = 0;
    var inputs = document.querySelectorAll("[data-verify]");
    var reset = document.getElementById("reset");
    var submit_2 = document.getElementById("step-2-sub");

    var form_3 = document.getElementById("forgot-password-password-form");
    var password_step_3 = document.getElementById("password-step-3");
    var c_password_step_3 = document.getElementById("cpassword-step-3");
    var submit_3 = document.getElementById("step-3-sub");
    var success = document.getElementById("success-cont");

    email_step_1.onkeyup = function(e) {
        if (!email_step_1.value.trim()) {
            submit_1.classList.add("disabled");
        } else {
            submit_1.classList.remove("disabled");
        }
    };
    email_step_1.onfucus = function(e) {
        email_step_1.classList.remove("invalid");
    }
    email_step_1.onchange = email_step_1.onkeyup;
    form_1.onsubmit = submitForm1;
    submit_1.onclick = submitForm1;
    form_2.onsubmit = submitForm2;
    submit_2.onclick = submitForm2;

    reset.onclick = function(e) {
        [].forEach.call(inputs, function(i) { i.value = ""; i.classList.remove("valid"); i.classList.remove("invalid"); });
        inputs[0].focus();
        reset.classList.add('disabled');
        submit_2.classList.add('disabled');
    };

    [].forEach.call(inputs, function(verify_input) {
        if (!verify_input.hasAttribute("data-verify-value")) {
            return;
        }
        verify_input.setAttribute("maxlength", "1");
        verify_input.onfocus = function(e) {
            verify_input.select();
        };
        verify_input.onkeyup = function (e) {
            count = 0;
            [].forEach.call(inputs, function(i) { if (i.value.length === 1) {count++;}});
            if (count > 5) {
                submit_2.classList.remove("disabled");
            } else {
                if (count == 0) {
                    reset.classList.add('disabled');
                } else {
                    reset.classList.remove('disabled');
                }
                submit_2.classList.add("disabled");
            }
        };
        verify_input.onchange = verify_input.onkeyup;
    });

    var checkPassword = function(e) {
        if (password_step_3.value.length > 0 && c_password_step_3.value === password_step_3.value) {
            submit_3.classList.remove('disabled');
            c_password_step_3.classList.remove('invalid');
        } else {
            submit_3.classList.add('disabled');
            if (c_password_step_3.value) {
                c_password_step_3.classList.add('invalid');
            } else {
                c_password_step_3.classList.remove('invalid');
            }
        }
    };

    c_password_step_3.onkeyup = checkPassword;
    password_step_3.onkeyup = checkPassword;
    c_password_step_3.onchange = checkPassword;
    password_step_3.onchange = checkPassword;

    form_3.onsubmit = submitForm3;
    submit_3.onclick = submitForm3;

});
