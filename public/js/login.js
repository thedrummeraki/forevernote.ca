/**
 * Created by akinyele on 17-07-16.
 */

function login() {
    var submit_btn = document.getElementById("submit");
    var loader = document.getElementById("loader");

    submit_btn.classList.add("hide");
    loader.classList.remove("hide");

    var label = document.querySelector('[for="username"]');
    var one = username.value;
    var two = password.value;
    $.ajax({
        url: '/login?one='+ one + '&two=' + two,
        method: 'post',
        success: function (e) {
            loader.classList.add("hide");
            submit_btn.classList.remove("hide");

            if (!e.success) {
                label.setAttribute("data-error", e.message);
                username.classList.add("invalid");
                password.value = "";
                password.classList.remove("valid");
                if (e.password) {
                    password.focus();
                } else {
                    username.focus();
                }
            } else {
                submit_btn.classList.add("disabled");
                window.location.href = "/editor";
            }
        },
        error: function(e, a, b) {
            loader.classList.add("hide");
            submit_btn.classList.remove("hide");

            label.setAttribute("data-error", "Sorry, we coundn't log you in (" + b + "). Please try again.");
            username.classList.add("invalid");
            password.classList.remove("valid");
        }
    });
}
