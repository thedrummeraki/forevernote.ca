var Settings = (function() {

    var default_settings = {
        "save-auto": true,
        "logout-after": {
            enabled: true,
            time: 60,
        },
        "download-format": "pdf"
    };
    var init = false;
    var settings = {};

    var setSetting = function(key, value) {
        settings[key] = value;
        _save();
        return value;
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

    var getPlural = function(key) {
        if (key == "pdf") {
            return "PDFs";
        } else if (key == "html") {
            return "HTML";
        } else if (key == "text") {
            return "text files";
        }
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
        plural: getPlural
    }
})();
