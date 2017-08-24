var Settings = (function() {

    var status = {
        "-1": {text: 'Whoops, something went wrong! Please try again.', color: 'red'},
        0: {text: ''},
        1: {text: 'Creating note...'},
        2: {text: 'Writing to note...'},
        3: {text: 'Changing settings...', color: 'brown'},
        4: {text: 'Saving note ({0}%)...', color: 'orange'},
        5: {text: 'Note saved!', color: 'green', timeout: 2000},
        6: {text: 'Last select note loaded!', color: 'green', timeout: 5000},
    };
    var default_settings = {
        "save-auto": false,
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

    var removeSetting = function(key) {
        delete settings[key];
        _save();
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

    var getStatus = function(value) {
        return status[value];
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
        if (color === undefined) {
            console.log("hmm");
            var current_color = Settings.fetch('theme-color');
            if (current_color) {
                setBackground(current_color);
            }
            return;
        }
        console.log("settings background color: " + color)
        var nav_wrapper = document.getElementById("nav-wrapper");
        var note_mgmt_btn = document.getElementById("note-mgnt-btn");
        var elems = ["nav-wrapper", "note-mgnt-btn"];
        [].forEach.call(elems, function(elem_id) {
            var elem = document.getElementById(elem_id);
            if (elem) {
                var old_color = elem.getAttribute("color");
                elem.setAttribute('color', color);
                _updateBackground(elem, old_color);
            } else {
                console.warn("Can't update background of element %s (does not exist).", elem_id);
            }
        });
    }

    var _updateBackground = function(elem, old_color) {
        var current_color = elem.getAttribute('color');
        if (old_color !== undefined) {
            elem.classList.remove(old_color);
        }
        elem.classList.add(current_color);
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
        clear: removeSetting,
        fetch: getSetting,
        plural: getPlural,
        background: setBackground,
        is: checkBool,
        getDownloadURL: getDownloadURL,
        getStatus: getStatus,

        STATUS_ERROR: "-1",
        STATUS_INIT: 0,
        STATUS_CREATING: 1,
        STATUS_WRITING: 2,
        STATUS_SETTINGS: 3,
        STATUS_SAVING: 4,
        STATUS_SAVED: 5,
        STATUS_LAST_NOTE_LOADED: 6
    }
})();
