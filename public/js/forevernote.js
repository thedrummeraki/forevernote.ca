var current_note = null;
var currently_loading = null;
var current_note_title = null;
function extractContent(s) {
  var span= document.createElement('span');
  span.innerHTML= s;
  return span.textContent || span.innerText;
};

$(document).ready(function() {
    var progress_bar = document.getElementById('progress');
    var progress_bar_value = document.getElementById('progress-value');
    var progress_bar_value_cont = document.getElementById('progress-value-cont');
    var nav_wrapper = document.getElementById('nav-wrapper');
    var close_note = document.getElementById('close-note');
    var add_note = document.getElementById('add-note');
    var search_input = document.getElementById('search');
    var first_message = document.getElementById('loading-notes');
    var my_editor = $('#editor-container > .ql-editor');
    var total_size = null;
    var editor = null;

    close_note.onclick = hideCurrentNote;
    add_note.onclick = hideCurrentNoteAndNewNote;

    Settings.background();
    setStatus(Settings.STATUS_INIT);
    checkAndSetupSaveAutoSettings();
    setupSearchBar();
    updateUserName();
    setDownloadURLs();

    function focusAtEndQuill() {
        editor.setSelection(0, 1);
    }

    function setProgress(value) {
      return;
      if (value == null) {
        progress_bar_value_cont.classList.add('hide');
        progress_bar_value.classList.add('hide');
        return;
      }
      progress_bar_value_cont.classList.remove('hide');
      progress_bar_value.classList.remove('hide');
      value = parseInt(value || 0);
      progress_bar_value.style.width = value + '%';
    }

    function deleteCurrentNote() {
      if (current_note) {
        if (confirm("Are you sure you want to delete this note? This action is irreversible.")) {
          $.ajax({
            url: '/delete/note?note_id=' + current_note,
            method: 'delete',
            success: function(e) {
              if (e.success) {
                hideCurrentNote();
                getNotes();
                setStatus(Settings.STATUS_DELETE_SUCCESS, null, true);
              } else {
                setStatus(Settings.STATUS_DELETE_FAILURE);
              }
            }
          });
        }
      }
    }

    function setStatus(value, format, toast) {
      var note_statuses = document.querySelectorAll("[note-status]");
      var status = Settings.getStatus(value);
      if (status === undefined || status === null) {
        console.warn("invalid status %d", value);
        return;
      }
      [].forEach.call(note_statuses, function(note_status) {
        var text = status.text;
        if (format !== undefined) {
          text = text.format(format);
        }
        if (toast) {
          Materialize.toast(text, 2000, 'success-toast');
          return;
        }
        note_status.innerHTML = text;
        if (status.color) {
          note_status.style.color = status.color;
        } else {
          note_status.style.color = "";
        }
        if (status.timeout) {
          setTimeout(function() {
            setStatus(Settings.STATUS_INIT);
          }, status.timeout);
        }
      });
    }

    function setDownloadURLs() {
      var direct_downloads = document.querySelectorAll("[direct-download]");
      [].forEach.call(direct_downloads, function(dd) {
        dd.onclick = function(e) {
          console.log("click")
          e.preventDefault();
          saveNote(true, function() {
            var format = dd.getAttribute('direct-download');
            window.open(Settings.getDownloadURL(format).concat('?note_id=' + current_note));
          });
        }
      });
    }

    function downloadNote() {
      if (current_note) {
        window.open(Settings.getDownloadURL().concat('?note_id=' + current_note));
      } else {
        alert("Please create or open a note before attempting to download one.");
      }
    }

    function setLoading(loading, current_elem) {
      var _editor = document.getElementById('editor');
      nav_wrapper.classList.add('loading');
      if (loading) {
        currently_loading = true;
        // progress_bar.classList.remove('hide');
        _editor.classList.add('hide');
        if (current_elem !== undefined) {
          current_elem.classList.add('disabled');
        }
      } else {
        _editor.classList.remove('hide');
        currently_loading = false;
        // progress_bar.classList.add('hide');
        nav_wrapper.classList.remove('loading');
        if (current_elem !== undefined) {
          current_elem.classList.remove('disabled');
        }
      }
    }

    function saveNoteTitle(callback) {
      var note_title = document.getElementById('note-title-value');
      note_title = note_title.value;
      console.log("Title: " + note_title);
      // note_title = btoa(note_title);
      var url = '/save/note/title?title=' + note_title + '&note_id=' + current_note
      $.ajax({
        url: url,
        method: 'patch',
        success: function(e) {
          console.log(e);
          if (e.success && callback) {
            callback();
          }
        }
      });
    }
    function sendNote(chunck, n, size, is_first) {
      var url = '/save/note?chunks=true&i=' + (size-n) + '&content=' + chunck + '&is_first=' + is_first;
      if (current_note && current_note != true) {
        url = url.concat('&note_id=' + current_note);
      }
      // console.log("Chunk (%d bytes):", chunck.length)
      // console.log(chunck);
      // console.log("sending at url: " + url);
      $.ajax({
        url: url,
        method: 'post',
        async: true,
        success: function(e) {
          console.log("Got part response (%d): ", n);
          console.log(e);
          if (e.success) {
            saveNote(n-1);
            if (e.new_id) {
              current_note = e.new_id;
            }
            getNotes();
          }
        },
        error: function(e) {
          setStatus(Settings.STATUS_ERROR);
          return;
        }
      });
    }

    function sendTitle(title_obj) {
      $.ajax({
        url: '/send/chunk?title=true&title=' + title_obj.title + '&note_id=' + title_obj.note_id,
        method: 'post',
        async: false,
        success: function(e) {
          console.log(e.message);
        }
      });
    }
    function sendChunk(chunk_obj, quantity) {
      $.ajax({
        url: '/send/chunk?quantity=' + quantity + '&chunk=' + chunk_obj.chunk + '&pos=' + chunk_obj.pos + '&note_id=' + current_note,
        method: 'post',
        async: false,
        success: function(e) {
          console.log(e.chunk == chunk_obj.chunk);
          if (e.done) {
            console.log("All chunks were sent.");
            setStatus(Settings.STATUS_SAVED);
            updateCurrentNote();
          } else {
            setStatus(Settings.STATUS_SAVING, e.progress_value);
          }
        },
        error: function(a, b, c) {
          console.error("Error for chunk n#%d", chunk_obj.pos);
          console.error(a);
          console.error(b);
          console.error(c);
        }
      });
    }
    function sendChunks(chunks, callback) {
      var note_title = document.getElementById('note-title-value');
      note_title = note_title.value.trim();
      if (note_title) {
        sendTitle({note_id: current_note, title: note_title});
      }
      [].forEach.call(chunks, function(chunk, i) {
        sendChunk({chunk: chunk, pos: i, note_id: current_note}, chunks.length);
      });
      if (callback !== undefined) {
        callback();
      }
    }

    function saveNote(hide_notification, callback) {
      setStatus(Settings.STATUS_SAVING);
      if (!hide_notification) {
       setProgress(0);
      }

      var new_content = $('#editor-container > .ql-editor').html();
      new_content = safeEncode(new_content);
      var length = new_content.length;
      console.log(new_content);
      new_content = convertStringToArray(new_content, Settings.CHUNK_SIZE);
      console.log("Saving note... (" + length + " bytes in chucks of " + new_content.length + ")");

      sendChunks(new_content, callback);
    }
    $(document).keydown(function(e) {
        var key = undefined;
        var possible = [ e.key, e.keyIdentifier, e.keyCode, e.which ];
        while (key === undefined && possible.length > 0) {
            key = possible.pop();
        }
        if (key && (key == '115' || key == '83' ) && (e.ctrlKey || e.metaKey) && !(e.altKey)) {
            e.preventDefault();
            if (current_note) {
              setStatus(Settings.STATUS_SAVING);
              saveNote();
            } else {
              alert("Please create or open a note before attempting to save one.");
            }
            return false;
        }
        return true;
    });

    function saveNoteIfSelected() {
      if (current_note) {
        console.log("Automatically saving the current note...");
        saveNote(undefined, true);
      }
    }

    function setupSearchBar() {
      search_input.onkeyup = function(e) {
        var keyword = this.value;
        var note_containers = [];
        getNotes(keyword, function(note_containers) {
          [].forEach.call(note_containers, function(nc) {
            nc.onclick = showNote;
          });
        });
      }
    }

    function checkAndSetupSaveAutoSettings() {
      var editor_cont = document.getElementById('editor-container');
      var typing_timer;
      var done_typing_timeout = 1000;
      editor_cont.onkeyup = function(e) {
        clearTimeout(typing_timer);
        typing_timer = setTimeout(done_typing, done_typing_timeout);
      }
      editor_cont.onkeydown = function(e) {
        var is_not_typing_key = e.ctrlKey || e.shiftKey || e.altKey || (e.keyCode > 36 && e.keyCode < 41);
        if (!is_not_typing_key) {
          setStatus(Settings.STATUS_WRITING);
        }
        clearTimeout(typing_timer);
      }
      var done_typing = function() {
        setStatus(Settings.STATUS_INIT);
        if (Settings.is('save-auto')) {
          saveNoteIfSelected();
        }
      }
    }

    function hideInitMessage(listeners) {
      [].forEach.call(listeners, function(l) {
        if (l.getAttribute("note-listener") == "init-message") {
          l.classList.add('hide');
        }
      });
    }

    function showInitMessage(listeners) {
      [].forEach.call(listeners, function(l) {
        if (l.getAttribute("note-listener") == "init-message") {
          l.classList.remove('hide');
        }
      });
    }

    function showNoteOptions(listeners) {
      listeners = listeners || document.querySelectorAll("[note-listener]");
      [].forEach.call(listeners, function(l) {
        if (l.hasAttribute("note-listener") && l.hasAttribute("note-option")) {
          l.classList.remove('hide');
          if (l.getAttribute("note-option") == "download") {
            l.onclick = function(e) {
              downloadNote();
            }
          } else if (l.getAttribute('note-option') == 'delete') {
            l.onclick = function(e) {
              e.preventDefault();
              deleteCurrentNote();
            }
          }
        }
      });
    }

    function hideNoteOptions(listeners) {
      listeners = listeners || document.querySelectorAll("[note-listener]");
      [].forEach.call(listeners, function(l) {
        if (l.hasAttribute("note-listener") && l.hasAttribute("note-option")) {
          l.classList.add('hide');
        }
      });
    }

    function checkLastSelectedNote() {
      var last_selected_note = Settings.fetch('last-selected-note');
      if (last_selected_note) {
        // Materialize.toast('Showing last selected note...', 1000, 'success-toast');
        showNote(null, last_selected_note);
        // setStatus(Settings.STATUS_LAST_NOTE_LOADED);
      }
    }

    function setSelectedNote(id) {
      var query = '[note-container="' + id + '"]';
      var note_container = document.querySelector(query);
      var note_containers = document.querySelectorAll('[note-container]');
      if (!note_container) {
        console.warn("No note with id " + id + " exists on this interface.");
        return;
      }
      [].forEach.call(note_containers, function(nc) {
        if (nc.getAttribute('note-container') != id) {
          nc.removeAttribute('theme-color-listener');
        }
      });
      var color = Settings.fetch('theme-color');
      note_container.setAttribute('theme-color-listener', color);
      Settings.updateThemeColorFor('theme-color-listener', 'note-container');
    }

    function showNote(e, by_id) {
        if (currently_loading) {
          console.log("Currenlty loading a note...");
          return;
        }

        var id;
        if (e !== undefined && e !== null) {
          console.warn("Nice way!");
          e.preventDefault();
          var current_elem = this;
          id = current_elem.getAttribute("note-container");
        } else {
          console.warn("not really..");
            if (e == null && by_id) {
                console.warn("...what I wanted...");
            }
          id = by_id;
        }
        if (!id) {
          console.error("Unspecified id.");
          return;
        }
        Settings.save('last-selected-note', id);
        setLoading(true, current_elem);
        $.ajax({
          url: '/get/note?note_id=' + id,
          method: 'get',
          success: function(res) {
            if (res.success) {
              editor_cont.classList.remove("hide");
              $('#editor-container > .ql-editor').html(safeDecode(res.contents));
              hideInitMessage(note_listeners);

              note_mgmt_icon.innerHTML = "save";
              note_mgmt_btn.setAttribute("state", "creating");
              note_mgmt_btn.setAttribute('title', 'Save this note...');
              current_note = id;
              current_note_title = res.title;

              setSelectedNote(id);
              checkCurrentNoteTitle();
              showNoteOptions();
              focusAtEndQuill();
            } else {
              console.warn("This note was probably deleted off the server.");
            }
            setLoading(false, current_elem);
          },
          error: function(e) {
            current_elem = null;
            setLoading(false);
          }
        });
    }

    function hideCurrentNote(e) {
       if (currently_loading) {
          return;
       }
       if (e !== undefined) {
        e.preventDefault();
       }
       current_note = null;
       editor_cont.classList.add("hide");
       showInitMessage(note_listeners);
       $('#editor-container > .ql-editor').html("");
       note_mgmt_icon.innerHTML = "mode_edit";
       note_mgmt_btn.setAttribute("state", "new");
       note_mgmt_btn.setAttribute('title', 'Create a new note');
       hideNoteOptions();
       Settings.clear('last-selected-note');
    }

    function hideCurrentNoteAndNewNote(e) {
      if (confirm('You may not have saved your current note, continue? Doing will result in the loss of unsaved data!')) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        hideCurrentNote(e);
        showNewEditor(showNoteOptions);
      }
    }

    function buildNote(note) {
      id = note.id;
      title = note.title || "- Untitled -";
      note = extractContent(note.contents);
      note = safeDecode(note, true);
      if (note.length > 25) {
        note = note.substring(0, 25) + "<i>[...]</i>";
      } else if (note.trim().length == 0) {
        note = "<i>Empty</i>";
      }
      return [
        '<a note-container="' + id + '" href="#" class="note-container waves-effect waves-light">',
          '<div class="row">',
            '<b>' + title + '</b>',
            '<p style="margin: 0; margin-top: -20px; padding: 0;" class="note-content">' + note + '</p>',
          '</div>',
        '</a>'
      ].join("");
    }

    function updateCurrentNote() {
        updateNote(current_note);
    }

    function updateNote(id) {
        $.ajax({
            url: '/get/note?note_id=' + id,
            method: 'get',
            success: function(res) {
                var container = document.querySelector('[note-container="' + id + '"]');
                if (res.success && container) {
                    var contents = res.contents;
                    contents = extractContent(contents);
                    contents = safeDecode(contents, true);
                    if (contents.length > 25) {
                        contents = contents.substring(0, 25) + "<i>[...]</i>";
                    } else if (contents.trim().length == 0) {
                        contents = "<i>Empty</i>";
                    }
                    var sub_container = container.children[0];
                    var title_sub_cont = sub_container.children[0];
                    var conts_sub_cont = sub_container.children[1];

                    console.log(contents);
                    title_sub_cont.innerHTML = res.title;
                    conts_sub_cont.innerHTML = contents;
                } else if (!container) {
                    console.error("No container for id " + id);
                }
            }
        });
    }

    function getNotes(keyword, callback) {
      var cont = document.getElementById("notes-list-side");
      var url = '/get/notes';
      if (keyword) {
        url = url.concat('?b64=true&uri=true&keyword=' + safeEncode(keyword));
      }
      $.ajax({
        url: url,
        method: 'get',
        success: function(e) {
          if (e.notes) {
            var notes = "";
            [].forEach.call(e.notes, function(note) {
              if (note == null) {
                return;
              }
              notes += buildNote(note);
            });
            cont.innerHTML = notes;
            checkLastSelectedNote();
            if (current_note) {
              setSelectedNote(current_note);
            }
            if (callback) {
              callback(document.querySelectorAll("[note-container]"));
            }
          }
        }
      });
    }

    function checkCurrentNoteTitle() {
      var note_title_input = document.getElementById('note-title-value');
      if (!current_note_title) {
        note_title_input.value = "";
        return;
      }
      note_title_input.value = current_note_title;
      // note_title_input.focus();
      document.getElementById('editor-container').focus();
    }

    function showNewEditor(callback) {
      setLoading(true);
      $.ajax({
        url: '/create/note',
        method: 'post',
        success: function(e) {
          current_note = e.new_id;
          editor_cont.classList.remove("hide");
          hideInitMessage(note_listeners);
          note_mgmt_icon.innerHTML = "save";
          note_mgmt_btn.setAttribute("state", "creating");
          note_mgmt_btn.setAttribute('title', 'Save this new note!');
          setLoading(false);
          Settings.clear('last-selected-note');

          var title_input = document.getElementById('note-title-value');
          title_input.value = "";
          title_input.focus();
          if (callback) {
            callback();
          }
        }
      });
    }

    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

    var options = {
      placeholder: 'Start typing your note here...',
      modules: {
        toolbar: toolbarOptions
      },
      theme: 'snow'
    };
    editor = new Quill('#editor-container', options);

    var editor_cont = document.getElementById("editor");
    var note_containers = [];
    getNotes(null, function(note_containers) {
      first_message.innerHTML = "- Please select a note on the side or click on the button below to create a new note -";
      [].forEach.call(note_containers, function(nc) {
        nc.onclick = showNote;
      });
    });

    var note_listeners = document.querySelectorAll("[note-listener]");

    var note_mgmt_btn = document.getElementById("note-mgnt-btn");
    var note_mgmt_icon = document.getElementById("note-mgnt-icon");
    note_mgmt_btn.onclick = function(e) {
        if (note_mgmt_btn.getAttribute("state") == "new") {
          console.log(editor_cont.classList);
          if (editor_cont.classList.contains("hide")) {
          }
          showNewEditor();
        } else if (note_mgmt_btn.getAttribute("state") == "creating") {
          e.preventDefault();
          saveNote();
        }
    };
    var title_input = document.getElementById('note-title-value');
    var ql_editor = document.getElementsByClassName('ql-editor');

    var titleInputToEditor = function(e) {
      if (e.keyCode == 13 || e.keyCode == 9) {
        e.preventDefault();
        ql_editor[0].focus();
        console.log(e.keyCode);
        console.log("on editor...");
      }
    }
    var editorToTitleInput = function(e) {
      if (e.keyCode == 9 && e.shiftKey) {
        e.preventDefault();
        console.log("shift key + tab")
      }
    }
    title_input.onkeyup = titleInputToEditor;
    title_input.onkeydown = titleInputToEditor;
    ql_editor.onkeyup = editorToTitleInput;
    ql_editor.onkeydown = editorToTitleInput;
});
