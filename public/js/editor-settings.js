$(document).ready(function() {

    (function() {
      
    })();

    (function() {
      var settings_listeners = document.querySelectorAll("[settings-listener]");
      [].forEach.call(settings_listeners, function(sl) {
        if (sl.hasAttribute('settings-switch')) {
          sl.checked = Settings.fetch(sl.getAttribute('settings-switch'));
        }
        sl.onchange = function(e) {
          if (sl.hasAttribute('settings-switch')) {
            Settings.save(sl.getAttribute('settings-switch'), sl.checked);
          }
        }
      });
    })();

    var download_formats = document.querySelectorAll('[settings-listener="download-format"]');
    [].forEach.call(download_formats, function(format) {
        if (format.getAttribute("settings-value") === Settings.fetch('download-format')) {
            format.classList.add('active');
        }
        format.onclick = function() {
            var current = format.getAttribute("settings-value");
            [].forEach.call(download_formats, function(f) {
                f.classList.remove('active');
            });
            [].forEach.call(download_formats, function(f) {
                if (f.getAttribute("settings-value") === current) {
                    f.classList.add('active');
                    Settings.save('download-format', current);
                    var format = f.innerHTML;
                    // document.getElementById('download-id').setAttribute('title', 'Download this note in ' + format.toUpperCase());
                    Materialize.toast("Selected download option: " + format, 3000, 'success-toast');
                    return;
                }
            });
        };
    });

    var save_auto = document.querySelector('[settings-listener="notes-saving"]');
    

    var color_pickers = document.querySelectorAll('[settings-listener="theme-color"]');
    [].forEach.call(color_pickers, function(theme_color) {
        var current_color = Settings.fetch('theme-color');
        if (current_color) {
            Settings.background(current_color);
            [].forEach.call(theme_color.options, function(theme_options) {
                if (theme_options.getAttribute('data-color') == current_color) {
                    theme_options.setAttribute('selected', '');
                    theme_options.classList.add('active');
                } else {
                    theme_options.removeAttribute('selected');
                    theme_options.classList.remove('active');
                }
            });
        }
        theme_color.onchange = function(e) {
            var sel_option = theme_color.options[theme_color.selectedIndex];
            if (sel_option.hasAttribute("data-color")) {
                sel_option = sel_option.getAttribute("data-color");
            } else {
                sel_option = "default";
            }
            Settings.save('theme-color', sel_option);
            Settings.background(sel_option);
        }
    });
});
