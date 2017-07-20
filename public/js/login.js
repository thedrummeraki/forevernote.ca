/**
 * Created by akinyele on 17-07-16.
 */

function login() {
    var submit_btn = document.getElementById("submit");
    var loader = document.getElementById("loader");

    submit_btn.classList.add("hide");
    loader.classList.remove("hide");

    var one = username.value;
    var two = password.value;
    $.ajax({
        url: '/login?one='+ one + '&two=' + two,
        method: 'post',
        success: function (e) {
            loader.classList.add("hide");
            submit_btn.classList.remove("hide");

            if (!e.success) {
                username.classList.add("invalid");
                password.value = "";
                password.classList.remove("valid");
                username.focus();
            } else {
                submit_btn.classList.add("disabled");
                window.location.replace("/editor?username=" + username.value);
            }
        }
    });
}
