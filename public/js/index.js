function safeEncode(str) {
    return btoa(encodeURI(str));
}

function updateUserName() {
    var user_name_listeners = document.querySelectorAll('[user-name-listener]');
    $.ajax({
        url: '/user/getname',
        method: 'get',
        success: function(e) {
            [].forEach.call(user_name_listeners, function(user_name_listener) {
                user_name_listener.innerHTML = e.user_name;
            });
        }
    });
}

function safeDecode(str, toText) {
    var res;
    if (toText) {
        ok = false;
        do {
            try {
                res = atob(str);
                ok = true;
            } catch (e) {
                str = str.substring(0, str.length - 1);
            }
        } while (!ok && str.length);
    } else {
        try {
            res = atob(str);
        } catch (e) {
            res = str;
        }
    }
    try {
        res = decodeURI(res);
    } catch (e) {}
    if (toText) {
        res = res.replace(/<[^>]*>/g, '');
    }
    return res;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function setStatus(value, format) {
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
