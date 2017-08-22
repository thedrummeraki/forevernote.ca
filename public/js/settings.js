var Settings = (function() {

    var default_settings = {
        "save-auto": true,
        "logout-after": {
            enabled: true,
            time: 60,
        },
        "download-format": "html",
        "theme-color": "default"
    };
    var init = false;
    var settings = {};

    var setSetting = function(key, value) {
        settings[key] = value;
        _save();
        return value;
    }

    var getDownloadURL = function() {
        var format = getSetting('download-format');
        console.log(format);
        if (format == "text") {
            return "/note/download/as_text";
        } else if (format == "pdf") {
            return '/note/download/as_pdf';
        } else {
            return '/note/download/as_html'
        }
    }

    var getSetting = function(key, default_value) {
        _init();
        if (default_value === undefined) {
            default_value = null;
        }
        var value = settings[key];
        if (value === undefined) {
            value = default_value;
        }
        return value;
    }

    var checkBool = function(key) {
        return getSetting(key, false) == true
    }

    var getPlural = function(key) {
        if (key == "pdf") {
            return "PDFs";
        } else if (key == "html") {
            return "HTML";
        } else if (key == "text") {
            return "text files";
        }
    }

    var setBackground = function(color) {
        console.log("settings background color: " + color)
        var nav_wrapper = document.getElementById("nav-wrapper");
        if (nav_wrapper) {
            var old_color = nav_wrapper.getAttribute('color');
            nav_wrapper.setAttribute('color', color);
            _updateBackground(nav_wrapper, old_color);
        } else {
            console.error("No nav-wrapper found.")
        }
    }

    var _updateBackground = function(nav_wrapper, old_color) {
        var current_color = nav_wrapper.getAttribute('color');
        if (old_color !== undefined) {
            nav_wrapper.classList.remove(old_color);
        }
        nav_wrapper.classList.add(current_color);
    }

    var _save = function() {
        var to_save = JSON.stringify(settings);
        localStorage.setItem('forever-note-settings', to_save);
    }

    var _init = function() {
        if (init) return;
        var found = localStorage.getItem('forever-note-settings');
        if (!found) {
            settings = default_settings;
            _save();
        } else {
            found = JSON.parse(found);
            settings = found;
        }
    }

    return {
        save: setSetting,
        fetch: getSetting,
        plural: getPlural,
        background: setBackground,
        is: checkBool,
        getDownloadURL: getDownloadURL,
    }
})();
