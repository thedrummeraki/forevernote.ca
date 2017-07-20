/**
 * Created by akinyele on 17-07-16.
 */

var inputs = document.querySelectorAll("[data-verify]");
var submitButton = document.getElementById("submit");
var reset = document.getElementById("reset");
var count = 0;
var loader = document.getElementById("loader");

var reset_submit_cont = document.getElementById("reset-submit-cont");
var continue_cont = document.getElementById("continue-cont");

reset.onclick = function(e) {
    [].forEach.call(inputs, function(verify_input) {
        if (!verify_input.hasAttribute("data-verify-value")) {
            return;
        }
        verify_input.value = "";
        verify_input.classList.remove("valid");
        if (verify_input.getAttribute("data-verify-value") === "1") {
            verify_input.focus();
        }
        count = 0;
    });
};

submitButton.onclick = function () {
    loader.classList.remove("hide");
    reset.classList.add("disabled");
    submitButton.classList.add("disabled");
    submitButton.innerHTML = "Waiting...";

    var code = "";
    [].forEach.call(inputs, function(i) {code = code.concat(i.value)});

    $.ajax({
        url: "/verification?code=" + code,
        method: "post",
        data: "code=" + code,
        success: function(e) {
            if (e.success) {
                console.log("cool");
                reset_submit_cont.classList.add("hide");
                continue_cont.classList.remove("hide");
            } else {
                continue_cont.classList.add("hide");
                reset_submit_cont.classList.remove("hide");
                submitButton.classList.remove('disabled');
                submitButton.innerHTML = "Try again";
            }
            loader.classList.add("hide");
        }
    });
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
            submitButton.classList.remove("disabled");
        } else {
            if (count == 0) {
                reset.classList.add('disabled');
            } else {
                reset.classList.remove('disabled');
            }
            submitButton.classList.add("disabled");
        }
        verify_input.onchange = verify_input.onkeyup;
    };
});
