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
        7: {text: 'Saving your user profile...', color: 'orange'},
        8: {text: 'Your profile was saved!', color: 'green', timeout: 7000},
        9: {text: 'Sorry, but we couldn\'t save your profile!', color: 'red'},
        10: {text: 'Your note was successfully deleted.', color: 'green'},
        11: {text: 'It seems this was already deleted!', color: 'orange'},
    };

    var allNotes = null;

    const MY_CHUNK_SIZE = 1500;
    var default_settings = {
        "save-auto": false,
        "logout-after": {
            enabled: true,
            time: 60,
        },
        "download-format": "html",
        "theme-color": "blue"
    };

    var init = false;
    var settings = {};

    var hasNote = function(id) {
        var res = false;
        [].forEach.call(allNotes, function(current_note) {
            if (current_note.id == id) {
                res = true;
            }
        });
        return res;
    }

    var saveNotes = function(notes) {
        temp_notes = notes;
        allNotes = [];
        [].forEach.call(temp_notes, function(tmp_note) {
            if (tmp_note.title !== undefined && tmp_note.id && tmp_note.chunks !== undefined) {
                if (!hasNote(tmp_note.id)) {
                    // console.log("caching note id " + tmp_note.id);
                    allNotes.push(tmp_note);
                }
            }
        });
    }

    var getSavedNotes = function() {
        return allNotes;
    }

    var verifyCachedNote = function(chunk) {
        var found_note = null;
        var res = true;
        [].forEach.call(getSavedNotes(), function(cached_note) {
            if (chunk.note_id == cached_note.id) {
                found_note = cached_note;
            }
            if (found_note != null) {
                // If the chunk's position is greater that the posible length of
                // the cached, then this chunk is not at its original place.
                if (chunk.pos >= found_note.chunks.length) {
                    res = true;
                    return;
                }

                var found_chunk = found_note.chunks[chunk.pos];
                res = found_chunk.content != chunk.chunk;
                return;
            }
        });
        if (found_note == null && res) {
            console.log("This note is not cached and may not exist on the server side.");
        }
        return res;
    }

    var createChunks = function(str) {
        return convertStringToArray(str, MY_CHUNK_SIZE);
    }

    function convertStringToArray(str, maxPartSize){
      const chunkArr = [];
      let leftStr = str;
      do {

        chunkArr.push(leftStr.substring(0, maxPartSize));
        leftStr = leftStr.substring(maxPartSize, leftStr.length);

      } while (leftStr.length > 0);

      return chunkArr;
    };

    var getJSON = function() {
        return settings;
    }

    var setSetting = function(key, value) {
        settings[key] = value;
        _save();
        return value;
    }

    var removeSetting = function(key) {
        delete settings[key];
        _save();
    }

    var getDownloadURL = function(format) {
        if (format === undefined) {
            format = getSetting('download-format');
        }
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

    var updateThemeColorFor = function(attribute, required_attr, old_color) {
        var current_theme = getSetting('theme-color');
        [].forEach.call(document.querySelectorAll('[' + required_attr + ']'), function(elem) {
            if (old_color !== undefined && old_color) {
                elem.classList.remove(old_color);
            }
            if (elem.hasAttribute(attribute)) {
                elem.classList.add(current_theme);
            } else {
                elem.classList.remove(current_theme);
            }
            elem.classList.add('lighten-5');
        });
    }

    var setBackground = function(color) {
        if (color === undefined) {
            var current_color = Settings.fetch('theme-color');
            if (current_color) {
                setBackground(current_color);
            }
            return;
        }
        var nav_wrapper = document.getElementById("nav-wrapper");
        var note_mgmt_btn = document.getElementById("note-mgnt-btn");
        var elems = ["nav-wrapper", "note-mgnt-btn"];
        var old_color = null;
        [].forEach.call(elems, function(elem_id) {
            var elem = document.getElementById(elem_id);
            if (elem) {
                old_color = elem.getAttribute("color");
                elem.setAttribute('color', color);
                _updateBackground(elem, old_color);
            } else {
                console.warn("Can't update background of element %s (does not exist).", elem_id);
            }
        });
        updateThemeColorFor('theme-color-listener', 'note-container', old_color);
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
        updateThemeColorFor: updateThemeColorFor,
        toJSON: getJSON,
        initCachedNotes: saveNotes,
        getCachedNotes: getSavedNotes,
        verifyCachedNote: verifyCachedNote,
        chunkify: createChunks,

        STATUS_ERROR: "-1",
        STATUS_INIT: 0,
        STATUS_CREATING: 1,
        STATUS_WRITING: 2,
        STATUS_SETTINGS: 3,
        STATUS_SAVING: 4,
        STATUS_SAVED: 5,
        STATUS_LAST_NOTE_LOADED: 6,
        STATUS_PROFILE_SAVING: 7,
        STATUS_PROFILE_SAVED: 8,
        STATUS_PROFILE_SAVING_ERRORS: 9,
        STATUS_DELETE_SUCCESS: 10,
        STATUS_DELETE_FAILURE: 11,
    }
})();
