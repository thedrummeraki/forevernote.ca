var isAutosaveTurnedOn = false;

$(document).ready(function() {
    var options = {
      debug: 'info',
      placeholder: 'Start typing your note here...',
      theme: 'snow'
    };
    var editor = new Quill('#editor-container', options);

    // Note title
    // var note_title = document.getElementById("note-title");
    // note_title.onfocus = function(e) {
    //     note_title.select();
    // }

    // jQuery materialize initialization
    $('.collapsible').collapsible();
    $('.modal').modal();
    // This line causes a display issue with the text editor
    // $('select').material_select();

    // Settings
    var save_auto = document.getElementById("save-auto");
    if (Settings.fetch('save-auto') === true) {
        save_auto.checked = true;
    } else {
        save_auto.checked = false;
    }
    save_auto.onchange = function(e) {
        var message;
        var type;
        if (save_auto.checked) {
            message = "Now saving automatically!";
            type = "success";
        } else {
            message = "No longer saving automatically.";
            type = "warning";
        }
        Settings.save("save-auto", save_auto.checked ? true : false);
        Materialize.toast(message, 3000, type + '-toast');
    };

    var logout_after = document.getElementById("logout-after");
    var logout_after_settings = Settings.fetch('logout-after');
    logout_after.checked = logout_after_settings.enabled;
    
    var time_radios = document.querySelectorAll('[name="time"]');
    [].forEach.call(time_radios, function(radio) {
        if (logout_after_settings.enabled) {
            if (logout_after_settings.time == radio.getAttribute("data")) {
                radio.checked = true;
            } else {
                radio.checked = false;
            }
        }
        var current_time = null;
        radio.onchange = function(e) {
            if (radio.checked) {
                current_time = radio.getAttribute("data") + " mins";
                var message = "Choosed to log out after " + current_time + "!";
                Settings.save('logout-after', {enabled: true, time: radio.getAttribute("data")})
                Materialize.toast(message, 3000, 'success-toast');
            }
        }
    });
    logout_after.onchange = function(e) {
        var current_time = null;
        [].forEach.call(time_radios, function(radio) {
            if (logout_after.checked) {
                radio.removeAttribute("disabled");
            } else {
                radio.setAttribute("disabled", "disabled");
            }
            if (radio.checked) {
                current_time = radio.getAttribute("data") + " mins";
            }            
        });
        var message;
        var type;
        if (logout_after.checked) {
            message = "Choosed to log out after " + current_time + "!";
            type = "success";
        } else {
            message = "Not logging after a period of time.";
            type = "warning";
        }
        Materialize.toast(message, 3000, type + '-toast');
    };
    // var language_select = document.getElementById("language-select");
    // language_select.onchange = function(e) {
    //     var option = language_select.options[language_select.selectedIndex];
    //     var sel_value = option.value;
    //     if (sel_value === "1" || sel_value === "2") {
    //         Materialize.toast(option.getAttribute("data"), 3000, 'success-toast');
    //     }
    // };
    var download_formats = document.querySelectorAll('[download-format]');
    [].forEach.call(download_formats, function(format) {
        if (format.getAttribute("download-format") === Settings.fetch('download-format')) {
            format.classList.add('active');
        }
        format.onclick = function() {
            var current = format.getAttribute("download-format");
            [].forEach.call(download_formats, function(f) {
                f.classList.remove('active');
            });
            [].forEach.call(download_formats, function(f) {
                if (f.getAttribute("download-format") === current) {
                    f.classList.add('active');
                    Settings.save('download-format', current);
                    Materialize.toast("Selected download option: " + f.innerHTML, 3000, 'success-toast');
                    return;
                }
            });
        };
    });

    // Fullscreen
    var fullscreen_icon = document.getElementById("fullscreen-icon");
    var is_fullscreen = false;
    fullscreen_icon.onclick = function(e) {
        if (screenfull.enabled) {
            screenfull.toggle();
            if (is_fullscreen) {
                showNavbars();
            } else {
                hideNavbars();
            }
            is_fullscreen = !is_fullscreen;
        }
    };

    $(document).keyup(function(e) {
        if(e.keyCode === 122) {
            e.preventDefault();
            if (is_fullscreen) {
                showNavbars();
            }
            return false;
        }
    });

    function hideNavbars() {
        var navs = [];
        navs.push(document.getElementById("icon-side-nav"));
        navs.push(document.getElementById("course-side-nav"));
        navs.push(document.getElementById("notes-side-nav"));
        [].forEach.call(navs, function(nav_bar) {
            nav_bar.classList.add("hide");
        });
        var editor_cont = document.getElementById("editor");
        editor_cont.style.left = 0;
        editor_cont.style.marginRight = 0;
        document.getElementById("material-fullscreen-icon").classList.add("toggled-icon");
    }

    function showNavbars() {
        var navs = [];
        navs.push(document.getElementById("icon-side-nav"));
        navs.push(document.getElementById("course-side-nav"));
        navs.push(document.getElementById("notes-side-nav"));
        [].forEach.call(navs, function(nav_bar) {
            nav_bar.classList.remove("hide");
        });
        var editor_cont = document.getElementById("editor");
        editor_cont.style.left = "480px";
        editor_cont.style.marginRight = "480px";
	    document.getElementById("material-fullscreen-icon").classList.remove("toggled-icon");
    }

    $('.collection-icon').hover(function(){
        $(this).parent().removeClass("hovered");
        $(this).parent().addClass("not-hovered");
    }, function(){
        $(this).parent().addClass("hovered");
        $(this).parent().removeClass("not-hovered");
    });

    $('.list-item').hover(function(){
        $(this).addClass("hovered");
        $(this).removeClass("not-hovered");
    }, function(){
        $(this).addClass("not-hovered");
        $(this).removeClass("hovered");
    });
});

function shareNoteIfSuccessful(evt){
    if(!document.getElementById("share-email").checkValidity() || !document.getElementById("share-email").value){
	    document.getElementById("share-email").classList.add("invalid");
        return false;
    }
    else{
	    document.getElementById("share-email").classList.remove("invalid");
	    $('#share-dropdown').jqDropdown('hide');
	    Materialize.toast('Note(s) shared successfully!', 4000, 'success-toast');
	    return true;
    }
}

function shareNoteIfSuccessfulTwo(evt){
	if(!document.getElementById("share-email-2").checkValidity() || !document.getElementById("share-email-2").value){
		document.getElementById("share-email-2").classList.add("invalid");
		return false;
	}
	else{
		document.getElementById("share-email-2").classList.remove("invalid");
		$('#share-dropdown').jqDropdown('hide');
		Materialize.toast('Note(s) shared successfully!', 4000, 'success-toast');
		$('#share-course-modal').modal('close');
		return true;
	}
}